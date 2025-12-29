import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth.models import User
from .models import Message

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.user=self.scope['user']
        self.other_user_id=self.scope['url_route']['kwargs']['user_id']
        
        ids = sorted([self.user.id, int(self.other_user_id)])
        self.room_name = f'chat_{ids[0]}_{ids[1]}'
       
        await self.channel_layer.group_add(self.room_name,self.channel_name)

        await self.accept()

    async def disconnect(self,close_code):
        await self.channel_layer.group_discard(self.room_name,self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_type = data.get('type', 'chat_message')

        if message_type == 'chat_message':
            message_content = data['message']
            await self.save_message(message_content)
            await self.channel_layer.group_send(
                self.room_name,
                {
                    'type': 'chat_message',
                    'message': message_content,
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
            'message': event['message'],
            'sender_id': event['sender_id']
        }))

    async def signal_message(self, event):
        # Only relay signal to the OTHER person
        if self.user.id != event['sender_id']:
            await self.send(text_data=json.dumps(event['data']))


    @database_sync_to_async
    def save_message(self,content):
        receiver=User.objects.get(id=self.other_user_id)
        return Message.objects.create(sender=self.user,receiver=receiver,content=content)
    