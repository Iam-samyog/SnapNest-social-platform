#!/bin/bash

# SnapNest Deployment Helper Script
# This script helps with common deployment tasks

set -e

echo "🚀 SnapNest Deployment Helper"
echo "=============================="
echo ""

# Function to generate Django secret key
generate_secret_key() {
    echo "📝 Generating Django SECRET_KEY..."
    python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())'
    echo ""
    echo "✅ Copy the above key and add it to your Render environment variables as SECRET_KEY"
    echo ""
}

# Function to test backend
test_backend() {
    local BACKEND_URL="https://snapnest-backend-sbse.onrender.com"
    
    echo "🔍 Testing Backend at $BACKEND_URL"
    echo "-----------------------------------"
    echo ""
    
    echo "1. Testing API root..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" "$BACKEND_URL/api/" || echo "❌ Failed to connect"
    echo ""
    
    echo "2. Testing registration endpoint (should return 400, not 500)..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "$BACKEND_URL/api/auth/register/" \
        -H "Content-Type: application/json" \
        -d '{}' || echo "❌ Failed to connect"
    echo ""
    
    echo "3. Testing token endpoint (should return 400, not 500)..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" -X POST "$BACKEND_URL/api/auth/token/" \
        -H "Content-Type: application/json" \
        -d '{}' || echo "❌ Failed to connect"
    echo ""
    
    echo "✅ Backend tests complete"
    echo "   - 200/201 = Success"
    echo "   - 400/401 = Expected validation errors (backend is working)"
    echo "   - 500 = Server error (needs fixing)"
    echo ""
}

# Function to test frontend
test_frontend() {
    local FRONTEND_URL="https://snap-nest-social-platform-oo5n.vercel.app"
    
    echo "🔍 Testing Frontend at $FRONTEND_URL"
    echo "------------------------------------"
    echo ""
    
    echo "Testing homepage..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" "$FRONTEND_URL/" || echo "❌ Failed to connect"
    echo ""
    
    echo "Testing auth page..."
    curl -s -o /dev/null -w "Status: %{http_code}\n" "$FRONTEND_URL/auth" || echo "❌ Failed to connect"
    echo ""
    
    echo "✅ Frontend tests complete"
    echo ""
}

# Function to show deployment checklist
show_checklist() {
    echo "📋 Deployment Checklist"
    echo "----------------------"
    echo ""
    echo "Backend (Render):"
    echo "  [ ] Set SECRET_KEY environment variable"
    echo "  [ ] Set DEBUG=False"
    echo "  [ ] Set ALLOWED_HOSTS=snapnest-backend-sbse.onrender.com"
    echo "  [ ] Set CORS_ALLOWED_ORIGINS=https://snap-nest-social-platform-oo5n.vercel.app"
    echo "  [ ] Set DATABASE_URL (auto-provided)"
    echo "  [ ] Set CLOUDINARY_URL"
    echo "  [ ] Set REDIS_URL"
    echo "  [ ] Run migrations: python manage.py migrate"
    echo ""
    echo "Frontend (Vercel):"
    echo "  [ ] Set VITE_API_URL=https://snapnest-backend-sbse.onrender.com/api/"
    echo "  [ ] Redeploy after setting environment variable"
    echo ""
    echo "Testing:"
    echo "  [ ] Registration works (no 500 error)"
    echo "  [ ] Login works (returns JWT tokens)"
    echo "  [ ] Dashboard loads after login"
    echo ""
}

# Main menu
echo "What would you like to do?"
echo ""
echo "1. Generate Django SECRET_KEY"
echo "2. Test Backend"
echo "3. Test Frontend"
echo "4. Show Deployment Checklist"
echo "5. Run All Tests"
echo "6. Exit"
echo ""
read -p "Enter your choice (1-6): " choice

case $choice in
    1)
        generate_secret_key
        ;;
    2)
        test_backend
        ;;
    3)
        test_frontend
        ;;
    4)
        show_checklist
        ;;
    5)
        test_backend
        test_frontend
        ;;
    6)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
