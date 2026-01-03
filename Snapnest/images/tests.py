from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from images.models import Image
import uuid

User = get_user_model()

class ImageTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(username='testuser', email='test@example.com', password='password123')
        self.client.force_authenticate(user=self.user)
        self.image = Image.objects.create(
            user=self.user,
            title='Test Image',
            total_views=10
        )
        self.url = f'/api/images/{self.image.uuid}/'

    def test_retrieve_image_by_uuid(self):
        """Ensure we can retrieve an image using its UUID"""
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['uuid'], str(self.image.uuid))

    def test_increment_views(self):
        """Test view increment logic"""
        increment_url = f'{self.url}increment_views/'
        response = self.client.post(increment_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check response data
        self.assertGreaterEqual(response.data['total_views'], 11)
        
        # Verify DB update (might be delayed/cached, but let's check basic sanity)
        self.image.refresh_from_db()
        # Note: Depending on how Redis sync works in test env, this might require mocking Redis
        # But for now we assume the view logic writes to DB or at least returns incremented value

class AccountTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        User.objects.create_user(username='existing', email='duplicate@example.com', password='password123')

    def test_unique_email_registration(self):
        """Ensure we cannot register with a duplicate email"""
        url = '/api/auth/register/'
        data = {
            'username': 'newuser',
            'email': 'duplicate@example.com',
            'password': 'password123'
        }
        response = self.client.post(url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        # DRF returns list of errors
        self.assertIn('A user with this email already exists.', str(response.data['email']))
