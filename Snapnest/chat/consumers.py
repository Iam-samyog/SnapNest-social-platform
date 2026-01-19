import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message
from django.conf import settings

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return

        self.other_user_id = self.scope['url_route']['kwargs']['user_id']
        
        ids = sorted([self.user.id, int(self.other_user_id)])
        self.room_name = f'chat_{ids[0]}_{ids[1]}'
       
        await self.channel_layer.group_add(self.room_name, self.channel_name)
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
        
        # In a real InMemory setup without Redis, we can't easily query 'all online users'
        # across different group scopes without a shared state. 
        # However, for 1-on-1 chat, both users are in the same room.
        # When we connect, we broadcast. If the other person is there, they will receive it.
        # To get the other person's status immediately, we can send a 'ping'
        await self.channel_layer.group_send(
            self.room_name,
            {
                'type': 'status_request',
                'requester_id': self.user.id
            }
        )

    async def disconnect(self, close_code):
        # Broadcast that user is offline
        if hasattr(self, 'room_name'):
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'user_status',
                    'user_id': self.user.id,
                    'status': 'offline'
                }
            )
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
        elif message_type == 'typing':
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'typing_indicator',
                    'sender_id': self.user.id,
                    'is_typing': data.get('is_typing', False)
                }
            )
        else:
            # Relay signal to the room (for ChatBox/WebRTC)
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'signal_message',
                    'data': data,
                    'sender_id': self.user.id
                }
            )
            
            # Forward call signals to the personal notification channel
            if data.get('type') == 'call_user':
                user_to_call = data.get('userToCall') 
                if user_to_call:
                    await self.channel_layer.group_send(
                        f'notify_{user_to_call}',
                        {
                            'type': 'notification_message',
                            'data': {
                                'type': 'incoming_call',
                                'from': self.user.id,
                                'from_username': self.user.username,
                                'signalData': data.get('signalData')
                            }
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
        await self.send(text_data=json.dumps({
            'type': 'user_status',
            'user_id': event['user_id'],
            'status': event['status']
        }))

    async def status_request(self, event):
        # If someone asks for status, and I am not the requester, I respond
        if event['requester_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'user_status',
                'user_id': self.user.id,
                'status': 'online'
            }))

    async def typing_indicator(self, event):
        if event['sender_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing',
                'user_id': event['sender_id'],
                'is_typing': event['is_typing']
            }))

    async def signal_message(self, event):
        if self.user.id != event['sender_id']:
            await self.send(text_data=json.dumps(event['data']))

    @database_sync_to_async
    def save_message(self, content):
        receiver = User.objects.get(id=int(self.other_user_id))
        return Message.objects.create(sender=self.user, receiver=receiver, content=content)


class NotificationConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user = self.scope['user']
        if not self.user.is_authenticated:
            await self.close()
            return
            
        self.group_name = f'notify_{self.user.id}'
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def notification_message(self, event):
        await self.send(text_data=json.dumps(event['data']))