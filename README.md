# SnapNest 📸

> A modern, full-stack social image sharing platform built with Django REST Framework and React

<p> <em>SnapNest is a high-performance social image platform that lets you discover, share, and save images from anywhere on the web. With a unique browser bookmarklet, you can curate content with a single click. Built with Django and React, it showcases enterprise-level performance optimizations including 90% fewer database queries, intelligent search debouncing, and seamless infinite scrolling. Whether you're a photographer showcasing your work or a curator building collections, SnapNest delivers a fast, beautiful, and intuitive experience.</em></p>


## 🌟 Features

### Core Functionality
- **📤 Image Upload & Sharing** - Upload images directly or via URL with drag-and-drop support
- **📷 Camera Integration** - Take photos directly from your device with front/back camera toggle
- **🔖 Bookmarklet** - Save images from any website with a single click using the browser bookmarklet
- **♾️ Infinite Scroll** - Smooth, optimized infinite scrolling with Intersection Observer API
- **🔍 Real-time Search** - Debounced search with request cancellation for users and images
- **❤️ Social Interactions** - Like, comment, and follow other users
- **👥 User Profiles** - Customizable profiles with follower/following lists
- **📊 Activity Feed** - Track user activities and engagement
- **🏆 Image Ranking** - Redis-powered view tracking and trending images

### Performance Optimizations
- **⚡ Backend Optimizations**
  - N+1 query elimination with `select_related` and `prefetch_related`
  - Pagination (20 items per page) for all list endpoints
  - Singleton Redis connection for efficient caching
  - Optimized serializers with prefetched data
  
- **🚀 Frontend Optimizations**
  - Debounced search (300ms) with AbortController
  - Lazy loading for all images
  - Intersection Observer for infinite scroll
  - Code splitting and chunking for faster load times
  - React.memo for component optimization

### Authentication
- **🔐 Multiple Auth Methods**
  - Email/Password authentication
  - Google OAuth integration
  - GitHub OAuth integration
  - JWT token-based authentication


## 📸 Screenshots

### Home Page
<img width="2868" height="1534" alt="image" src="https://github.com/user-attachments/assets/c9e3d25c-9522-47e9-8b49-7f98753949e3" />


### Auth Page 
<img width="2826" height="1642" alt="image" src="https://github.com/user-attachments/assets/dbac22bb-f50f-424e-a624-75fda91c07bb" />


### Dashboard
<img width="3004" height="1662" alt="image" src="https://github.com/user-attachments/assets/35ea60d0-0b85-4c25-8618-409cade3b1da" />


### Image Upload
<img width="2904" height="1486" alt="image" src="https://github.com/user-attachments/assets/f36328a5-fd34-4132-aa0e-97d381488986" />

### Bookmark Image 
<img width="3024" height="1790" alt="image" src="https://github.com/user-attachments/assets/7524cc08-9d44-44fb-8905-c49f6f19fd7e" />

### User Profile
<img width="2966" height="1604" alt="image" src="https://github.com/user-attachments/assets/1a1de0b5-d72b-4d8d-9dbe-762c86cbafa0" />


### Discover People
<img width="2992" height="1242" alt="image" src="https://github.com/user-attachments/assets/60d87fad-7953-4e65-a12a-86b19de1d0c9" />

### Explore Section
<img width="2942" height="1588" alt="image" src="https://github.com/user-attachments/assets/89484c11-3789-483d-a410-923125d309bd" />

### Rankings
<img width="2926" height="1548" alt="image" src="https://github.com/user-attachments/assets/cda83d17-ddcf-45bc-a004-a2e94e219a9d" />




### Mobile View

<div style="display:flex; gap:10px;">
  <img width="220" height="500" src="https://github.com/user-attachments/assets/bd84d394-ff2f-490e-a121-91b4457a3e5f" />
  <img width="220" height="500" alt="image" src="https://github.com/user-attachments/assets/b56b6103-edfa-4766-9504-314c8938c149" />
  <img width="220" height="500" alt="image" src="https://github.com/user-attachments/assets/873678cd-5160-4594-a74c-dfcca130ea68" />

</div>


## 🛠️ Tech Stack

### Backend
- **Django 5.1.4** - Python web framework
- **Django REST Framework** - RESTful API
- **PostgreSQL** - Primary database
- **Redis** - Caching and view tracking
- **Cloudinary** - Image storage and CDN
- **dj-database-url** - Database configuration
- **python-decouple** - Environment management

### Frontend
- **React 19.2.0** - UI library
- **React Router 7.11.0** - Client-side routing
- **Axios 1.13.2** - HTTP client
- **TailwindCSS 4.1.18** - Utility-first CSS
- **Vite 7.2.4** - Build tool and dev server
- **Lucide React** - Icon library
- **FontAwesome** - Additional icons

## 📁 Project Structure

```
SnapNest/
├── Snapnest/                 # Django Backend
│   ├── account/              # User authentication & profiles
│   ├── actions/              # Activity tracking
│   ├── images/               # Image management
│   ├── Snapnest/             # Project settings
│   ├── manage.py
│   └── requirements.txt
│
└── SnapClient/               # React Frontend
    ├── src/
    │   ├── components/       # React components
    │   ├── hooks/            # Custom hooks (useDebounce)
    │   ├── utils/            # Utilities (axios, services)
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🚀 Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- PostgreSQL
- Redis
- Cloudinary account (for image storage)

### Backend Setup

1. **Clone the repository**
```bash
git clone https://github.com/Iam-samyog/SnapNest-social-platform.git
cd SnapNest/Snapnest
```

2. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Configure environment variables**
Create a `.env` file in the `Snapnest` directory:
```env
SECRET_KEY=your-secret-key
DEBUG=True
DATABASE_URL=postgresql://user:password@localhost:5432/snapnest
REDIS_URL=redis://localhost:6379/0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

5. **Run migrations**
```bash
python manage.py migrate
```

6. **Create superuser**
```bash
python manage.py createsuperuser
```

7. **Start development server**
```bash
python manage.py runserver
```

Backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**
```bash
cd ../SnapClient
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

4. **Start development server**
```bash
npm run dev
```

Frontend will be available at `http://localhost:5173`

## 📦 Deployment

### Backend (Render)
1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set build command: `pip install -r requirements.txt`
4. Set start command: `gunicorn Snapnest.wsgi:application`
5. Add environment variables from `.env`
6. Deploy!

### Frontend (Vercel)
1. Import project from GitHub
2. Framework preset: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Add environment variables
6. Deploy!

## 🎯 Key Features Explained

### Bookmarklet
Drag the "SnapNest Bookmark" button from your dashboard to your browser's bookmark bar. Click it on any website to save images directly to SnapNest!

### Infinite Scroll
Uses Intersection Observer API for efficient, smooth infinite scrolling. Automatically loads more content as you scroll.

### Search Optimization
- Debounced search (300ms delay)
- Request cancellation with AbortController
- Parallel API calls for users and images
- ~80-90% reduction in API calls

### Performance
- Backend: ~90% reduction in database queries
- Frontend: Lazy loading, code splitting, optimized rendering
- Redis caching for view counts and rankings

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/token/refresh/` - Refresh JWT token

### Images
- `GET /api/images/` - List images (paginated)
- `POST /api/images/` - Upload image
- `GET /api/images/{id}/` - Image detail
- `POST /api/images/{id}/like/` - Like/unlike image
- `POST /api/images/{id}/comment/` - Add comment

### Users
- `GET /api/users/` - List users (paginated)
- `GET /api/users/{username}/` - User profile
- `POST /api/users/{username}/follow/` - Follow user
- `GET /api/users/{username}/followers/` - User followers
- `GET /api/users/{username}/following/` - User following

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Samyog**
- GitHub: [@Iam-samyog](https://github.com/Iam-samyog)
- Project Link: [SnapNest](https://github.com/Iam-samyog/SnapNest-social-platform)

## 🙏 Acknowledgments

- Django REST Framework for the excellent API framework
- React team for the amazing frontend library
- Cloudinary for image hosting
- Render and Vercel for deployment platforms
- <strong> <em> Django 5 by Example by Antonio Melé  https://github.com/PacktPublishing/Django-5-By-Example </em> </strong> 


---

⭐ **Star this repo if you find it helpful!**
