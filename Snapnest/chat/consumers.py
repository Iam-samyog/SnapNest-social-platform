import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message
import redis
from django.conf import settings

# Initialize redis connection
r = redis.from_url(settings.REDIS_URL)

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return

        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        
        ids = sorted([self.user.id, int(self.other_user_id)])
        self.room_name = f'chat_{ids[0]}_{ids[1]}'
        self.user_presence_key = f'user_online_{self.user.id}'
       
        await self.channel_layer.group_add(self.room_name, self.channel_name)
        
        # Track user online status in Redis
        # Use a set for all online users and a specific key for this user
        r.sadd('online_users', self.user.id)
        
        await self.accept()

        # Broadcast that user is online to the room
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online'
            }
        )
        
        # Also check if the other user is online and send to the current user
        is_other_online = r.sismember('online_users', self.other_user_id)
        if is_other_online:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': int(self.other_user_id),
                'status': 'online'
            }))

    async def disconnect(self, close_code):
        # Remove user from online status
        if hasattr(self, 'user') and self.user.is_authenticated:
            r.srem('online_users', self.user.id)
            
            # Broadcast that user is offline
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline'
                }
            )
        
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_discard(self.room_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'chat_message')

        if message_type == 'chat_message':
            message_content = data['message']
            saved_msg = await self.save_message(message_content)
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'chat_message',
                    'id': saved_msg.id,
                    'message': message_content,
                    'sender_id': self.user.id,
                    'sender_username': self.user.username,
                    'timestamp': saved_msg.timestamp.isoformat()
                }
            )
        elif message_type == 'message_reaction':
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'chat_reaction',
                    'message_id': data.get('message_id'),
                    'emoji': data.get('emoji'),
                    'sender_id': self.user.id
                }
            )
        else:
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'signal_message',
                    'data': data,
                    'sender_id': self.user.id
                }
            )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'id': event.get('id'),
            'message': event['message'],
            'sender_id': event['sender_id'],
            'sender_username': event.get('sender_username'),
            'timestamp': event.get('timestamp')
        }))

    async def chat_reaction(self, event):
        await self.send(text_data=json.dumps({
            'type': 'chat_reaction',
            'message_id': event['message_id'],
            'emoji': event['emoji'],
            'sender_id': event['sender_id']
        }))

    async def user_status(self, event):
        # Notify frontend about user status change
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    async def signal_message(self, event):
        # Only relay signal to the OTHER person
        if self.user.id != event['sender_id']:
            await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def save_message(self, content):
        receiver = User.objects.get(id=int(self.other_user_id))
        return Message.objects.create(sender=self.user, receiver=receiver, content=content)