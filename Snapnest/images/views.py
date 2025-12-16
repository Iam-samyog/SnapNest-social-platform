from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.http import HttpResponse, JsonResponse
from django.shortcuts import get_object_or_404, redirect, render
from django.views.decorators.http import require_POST

from .forms import ImageCreateForm, ImageUploadForm, CommentForm, ImageEditForm

# Edit image view
from django.contrib.auth.decorators import login_required
from django.contrib import messages

@login_required
def image_edit(request, id, slug):
    image = get_object_or_404(Image, id=id, slug=slug)
    if image.user != request.user:
        messages.error(request, 'You can only edit your own images.')
        return redirect(image.get_absolute_url())
    if request.method == 'POST':
        form = ImageEditForm(instance=image, data=request.POST)
        if form.is_valid():
            form.save()
            messages.success(request, 'Image updated successfully!')
            return redirect(image.get_absolute_url())
    else:
        form = ImageEditForm(instance=image)
    return render(request, 'images/image/edit.html', {'form': form, 'image': image})

# Delete image view
@login_required
def image_delete(request, id, slug):
    image = get_object_or_404(Image, id=id, slug=slug)
    if image.user != request.user:
        messages.error(request, 'You can only delete your own images.')
        return redirect(image.get_absolute_url())
    if request.method == 'POST':
        image.delete()
        messages.success(request, 'Image deleted successfully!')
        return redirect('images:list')
    return render(request, 'images/image/delete.html', {'image': image})
from .models import Image, Comment
from actions.utils import create_action
import redis
from django.conf import settings

r = redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB
)

@login_required
def image_create(request):
    if request.method == 'POST':
        # form is sent
        form = ImageCreateForm(data=request.POST)
        if form.is_valid():
            # form data is valid
            cd = form.cleaned_data
            new_image = form.save(commit=False)
            # assign current user to the item
            new_image.user = request.user
            new_image.save()
            create_action(request.user,'bookmarked image',new_image)
            messages.success(request, 'Image added successfully')
            # redirect to new created image detail view
            return redirect(new_image.get_absolute_url())
    else:
        # build form with data provided by the bookmarklet via GET
        form = ImageCreateForm(data=request.GET)
    return render(
        request,
        'images/image/create.html',
        {'section': 'images', 'form': form},
    )


@login_required
def image_upload(request):
    if request.method == 'POST':
        form = ImageUploadForm(data=request.POST, files=request.FILES)
        if form.is_valid():
            new_image = form.save(commit=False)
            new_image.user = request.user
            new_image.save()
            create_action(request.user, 'uploaded image', new_image)
            messages.success(request, 'Image uploaded successfully')
            return redirect(new_image.get_absolute_url())
    else:
        form = ImageUploadForm()
    return render(
        request,
        'images/image/upload.html',
        {'section': 'images', 'form': form},
    )


def image_detail(request, id, slug):
    image = get_object_or_404(Image, id=id, slug=slug)
    total_views=r.incr(f'image:{image.id}:views')
    r.zincrby('image_ranking',1,image.id)
    
    # List of comments
    comments = image.comments.all()
    
    if request.method == 'POST':
        # A comment was posted
        comment_form = CommentForm(data=request.POST)
        if comment_form.is_valid():
            # Create comment object but don't save to database yet
            new_comment = comment_form.save(commit=False)
            # Assign the current user and image to the comment
            new_comment.user = request.user
            new_comment.image = image
            # Save the comment to the database
            new_comment.save()
            return redirect(image.get_absolute_url())
    else:
        comment_form = CommentForm()
    
    return render(
        request,
        'images/image/detail.html',
        {
            'section': 'images', 
            'image': image,
            'total_views': total_views,
            'comments': comments,
            'comment_form': comment_form
        },
    )


@login_required
@require_POST
def image_like(request):
    image_id = request.POST.get('id')
    action = request.POST.get('action')
    if image_id and action:
        try:
            image = Image.objects.get(id=image_id)
            if action == 'like':
                image.users_like.add(request.user)
                create_action(request.user,'likes',image)
            else:
                image.users_like.remove(request.user)
            return JsonResponse({'status': 'ok'})
        except Image.DoesNotExist:
            pass
    return JsonResponse({'status': 'error'})


@login_required
def image_list(request):
    images = Image.objects.all()
    paginator = Paginator(images, 8)
    page = request.GET.get('page')
    images_only = request.GET.get('images_only')
    try:
        images = paginator.page(page)
    except PageNotAnInteger:
        images = paginator.page(1)
    except EmptyPage:
        if images_only:
            return HttpResponse('')
        images = paginator.page(paginator.num_pages)
    if images_only:
        return render(
            request,
            'images/image/list_images.html',
            {'section': 'images', 'images': images},
        )
    return render(
        request,
        'images/image/list.html',
        {'section': 'images', 'images': images},
    )



r=redis.Redis(
    host=settings.REDIS_HOST,
    port=settings.REDIS_PORT,
    db=settings.REDIS_DB
)

@login_required
def image_ranking(request):
    image_ranking=r.zrange(
        'image_ranking',0,-1,
        desc=True
    )[:10]
    image_ranking_ids=[int(id) for id in image_ranking]

    most_viewd=list(
        Image.objects.filter(
            id__in=image_ranking_ids
        )
    )
    most_viewd.sort(key=lambda x:image_ranking_ids.index(x.id))
    return render(
        request,
        'images/image/ranking.html',
        {'section':'images','most_viewed':most_viewd}
    )