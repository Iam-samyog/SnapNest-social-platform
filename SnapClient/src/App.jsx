import MainPage from './MainPage';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import AuthPages from "./components/AuthPages";
import Dashboard from './Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import ImageList from './components/ImageList';
import ImageDetail from './components/ImageDetail';
import ImageUpload from './components/ImageUpload';
import UserDetail from './components/UserDetail';
import UserList from './components/UserList';
import EditProfile from './components/EditProfile';
import ImageRanking from './components/ImageRanking';
import ResetPassword from './components/ResetPassword';
import GitHubCallback from './components/GitHubCallback';

const App = () => {
  // Replace with your Google Client ID or use environment variable
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/auth" element={<AuthPages />} />
          <Route path="/auth/callback/github" element={<GitHubCallback />} />
          <Route path="/password-reset/:uid/:token" element={<ResetPassword />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/images" 
            element={
              <ProtectedRoute>
                <ImageList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/images/:id" 
            element={
              <ProtectedRoute>
                <ImageDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/images/upload" 
            element={
              <ProtectedRoute>
                <ImageUpload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/images/ranking" 
            element={
              <ProtectedRoute>
                <ImageRanking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users" 
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/users/:username" 
            element={
              <ProtectedRoute>
                <UserDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile/edit" 
            element={
              <ProtectedRoute>
                <EditProfile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
};

export default App;