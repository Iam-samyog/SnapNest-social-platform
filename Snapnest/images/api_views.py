from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Image, Comment
from .serializers import ImageSerializer, CommentSerializer
from actions.utils import create_action
import redis
from django.conf import settings

# Singleton Redis connection - reuse across all requests
_redis_connection = None

def get_redis_connection():
    """Get or create a singleton Redis connection"""
    global _redis_connection
    if _redis_connection is None:
        _redis_connection = redis.Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            db=settings.REDIS_DB,
            decode_responses=True  # Automatically decode responses to strings
        )
    return _redis_connection

r = get_redis_connection()


class ImageViewSet(viewsets.ModelViewSet):
    serializer_class = ImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'uuid'
    
    def get_queryset(self):
        # Optimize queries with select_related and prefetch_related
        queryset = Image.objects.select_related('user', 'user__profile').prefetch_related(
            'users_like',
            'comments__user__profile'
        )
        username = self.request.query_params.get('user', None)
        if username is not None:
            queryset = queryset.filter(user__username=username)
        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            # Batch fetch view counts for paged results
            image_ids = [img.id for img in page]
            if image_ids:
                keys = [f'image:{img_id}:views' for img_id in image_ids]
                view_counts = r.mget(keys)
                # Store in a temporary attribute for the serializer
                for img, count in zip(page, view_counts):
                    img._redis_views = int(count) if count else img.total_views
            
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        # Non-paginated results
        # Batch fetch view counts for non-paginated results too
        image_ids = [img.id for img in queryset]
        if image_ids:
            keys = [f'image:{img_id}:views' for img_id in image_ids]
            view_counts = r.mget(keys)
            # Store in a temporary attribute for the serializer
            for img, count in zip(queryset, view_counts):
                img._redis_views = int(count) if count else (getattr(img, 'total_views', 0))
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        if 'url' in self.request.data and not self.request.data.get('image'):
            # Download image from URL with optimizations
            import requests
            import ipaddress
            from urllib.parse import urlparse
            from django.core.files.base import ContentFile
            from django.utils.text import slugify
            from rest_framework.exceptions import ValidationError
            from io import BytesIO
            from PIL import Image as PILImage
            
            image_url = self.request.data['url']
            
            # SSRF Mitigation: Validate the URL
            try:
                parsed_url = urlparse(image_url)
                if parsed_url.scheme not in ['http', 'https']:
                    raise ValidationError({"url": "Only HTTP and HTTPS URLs are allowed."})
                
                # Check for internal/private IP ranges
                hostname = parsed_url.hostname
                if not hostname:
                    raise ValidationError({"url": "Invalid URL."})
                
                try:
                    ip = ipaddress.ip_address(hostname)
                    if ip.is_private or ip.is_loopback or ip.is_link_local:
                        raise ValidationError({"url": "Internal or private URLs are not allowed."})
                except ValueError:
                    # Hostname is not an IP, it's a domain name. 
                    if hostname.lower() in ['localhost', '127.0.0.1', '::1', '0.0.0.0']:
                         raise ValidationError({"url": "Internal or private URLs are not allowed."})
            except ValidationError:
                raise
            except Exception as e:
                raise ValidationError({"url": f"Invalid URL: {str(e)}"})

            try:
                # Optimized download with streaming and size limits
                MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB limit
                CHUNK_SIZE = 8192  # 8KB chunks
                
                response = requests.get(
                    image_url, 
                    headers={
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                        'Accept': 'image/*'
                    },
                    timeout=(5, 30),  # (connect timeout, read timeout)
                    allow_redirects=True,
                    stream=True  # Stream download for better performance
                )
                response.raise_for_status()
                
                # Check content type
                content_type = response.headers.get('content-type', '').lower()
                if 'image/' not in content_type:
                    raise ValidationError({"url": "URL does not point to a valid image."})
                
                # Download in chunks with size limit
                content = BytesIO()
                downloaded = 0
                for chunk in response.iter_content(chunk_size=CHUNK_SIZE):
                    if chunk:
                        downloaded += len(chunk)
                        if downloaded > MAX_FILE_SIZE:
                            raise ValidationError({"url": "Image is too large. Maximum size is 20MB."})
                        content.write(chunk)
                
                content.seek(0)
                
                # Optimize image using Pillow
                try:
                    img = PILImage.open(content)
                    
                    # Convert RGBA/LA/P to RGB if needed (for JPEG compatibility)
                    if img.mode in ('RGBA', 'LA'):
                        # Create white background
                        background = PILImage.new('RGB', img.size, (255, 255, 255))
                        if img.mode == 'RGBA':
                            background.paste(img, mask=img.split()[3])  # Use alpha channel as mask
                        else:  # LA mode
                            background.paste(img, mask=img.split()[1])  # Use alpha channel
                        img = background
                    elif img.mode == 'P':
                        # Palette mode - convert to RGBA first, then RGB
                        img = img.convert('RGBA')
                        background = PILImage.new('RGB', img.size, (255, 255, 255))
                        background.paste(img, mask=img.split()[3])
                        img = background
                    elif img.mode not in ('RGB', 'L'):
                        # Convert other modes to RGB
                        img = img.convert('RGB')
                    elif img.mode == 'L':
                        # Grayscale - convert to RGB
                        img = img.convert('RGB')
                    
                    # Resize if too large (max 2048px on longest side, maintain aspect ratio)
                    max_dimension = 2048
                    if max(img.size) > max_dimension:
                        img.thumbnail((max_dimension, max_dimension), PILImage.Resampling.LANCZOS)
                    
                    # Save optimized image
                    optimized = BytesIO()
                    img.save(optimized, format='JPEG', quality=85, optimize=True)
                    optimized.seek(0)
                    
                    title = self.request.data.get('title', 'image')
                    file_name = f"{slugify(title)}.jpg"
                    
                    serializer.save(
                        user=self.request.user, 
                        image=ContentFile(optimized.read(), name=file_name)
                    )
                except PILImage.UnidentifiedImageError:
                    raise ValidationError({"url": "The URL does not point to a valid image file."})
                except Exception as img_error:
                    raise ValidationError({"url": f"Failed to process image: {str(img_error)}"})
                    
            except requests.exceptions.Timeout:
                raise ValidationError({"url": "Request timed out. The image server is taking too long to respond."})
            except requests.exceptions.RequestException as e:
                raise ValidationError({"url": f"Failed to download image: {str(e)}"})
            except ValidationError:
                raise
            except Exception as e:
                print(f"Error downloading image from {image_url}: {str(e)}")
                raise ValidationError({"url": "Failed to bookmark image. Please try again or use a different image URL."})
        else:
            serializer.save(user=self.request.user)
            
        # Initialize view count in Redis to 1 when image is created (user views it after upload)
        image = serializer.instance
        view_key = f'image:{image.id}:views'
        if not r.exists(view_key):
            r.set(view_key, 1)  # Start at 1 since user views it after upload
            # Also initialize in ranking
            r.zadd('image_ranking', {image.id: 1})
            # Sync to DB
            image.total_views = 1
            image.save(update_fields=['total_views'])
            
        create_action(self.request.user, 'uploaded image', image)

    def perform_destroy(self, instance):
        if instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own images")
        instance.delete()

    @action(detail=True, methods=['post'])
    def like(self, request, uuid=None):
        image = self.get_object()
        if request.user in image.users_like.all():
            # Already liked, so unlike
            image.users_like.remove(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            return Response({'status': 'unliked', 'liked': False, 'total_likes': image.total_likes})
        else:
            # Not liked, so like
            image.users_like.add(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            create_action(request.user, 'likes', image)
            return Response({'status': 'liked', 'liked': True, 'total_likes': image.total_likes})

    @action(detail=True, methods=['post'])
    def unlike(self, request, uuid=None):
        image = self.get_object()
        if request.user in image.users_like.all():
            image.users_like.remove(request.user)
            image.total_likes = image.users_like.count()
            image.save()
            return Response({'status': 'unliked', 'liked': False, 'total_likes': image.total_likes})
        return Response({'status': 'already_unliked', 'liked': False, 'total_likes': image.total_likes})

    @action(detail=True, methods=['post'])
    def comment(self, request, uuid=None):
        image = self.get_object()
        serializer = CommentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user, image=image)
        create_action(request.user, 'commented on', image)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def views(self, request, uuid=None):
        """Get view count from Redis"""
        image = self.get_object()
        total_views = r.get(f'image:{image.id}:views')
        if total_views is None:
            # Fallback to DB if not in Redis
            total_views = image.total_views
        else:
            total_views = int(total_views)  # Already decoded with decode_responses=True
        return Response({'total_views': total_views})

    @action(detail=True, methods=['post'])
    def increment_views(self, request, uuid=None):
        """Increment view count in Redis and sync to DB"""
        image = self.get_object()
        
        # Check if key exists in Redis
        view_key = f'image:{image.id}:views'
        if not r.exists(view_key):
             # Initialize Redis with DB value if missing
             r.set(view_key, image.total_views)
             
        total_views = r.incr(view_key)
        r.zincrby('image_ranking', 1, image.id)
        
        # Sync back to DB so it persists and is visible in admin
        image.total_views = total_views
        image.save(update_fields=['total_views'])
        
        return Response({'total_views': int(total_views)})

    @action(detail=False, methods=['get'])
    def ranking(self, request):
        """Get top 10 images from Redis sorted set"""
        # Get all image IDs from Redis
        image_ranking = r.zrange('image_ranking', 0, -1, desc=True)
        image_ranking_ids = [int(id) for id in image_ranking]
        
        # Fetch actual image objects from DB in one query
        most_viewed = list(Image.objects.filter(id__in=image_ranking_ids))
        # Sort them in the exact order Redis gave us
        most_viewed.sort(key=lambda x: image_ranking_ids.index(x.id))
        
        # Attach view counts safely using a dictionary
        if image_ranking_ids:
            keys = [f'image:{img_id}:views' for img_id in image_ranking_ids]
            view_counts = r.mget(keys)
            
            # Map ID -> View Count
            views_map = {}
            for img_id, count in zip(image_ranking_ids, view_counts):
                views_map[img_id] = int(count) if count else None
            
            for img in most_viewed:
                redis_val = views_map.get(img.id)
                img._redis_views = redis_val if redis_val is not None else img.total_views

        serializer = self.get_serializer(most_viewed, many=True)
        return Response(serializer.data)
