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
import ImageEdit from './components/ImageEdit';
import Messenger from './components/Messenger';

const App = () => {
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID; 

  const AppContent = (
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
          path="/images/:id/edit" 
          element={
            <ProtectedRoute>
              <ImageEdit />
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
        <Route 
          path="/messages" 
          element={
            <ProtectedRoute>
              <Messenger />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );

  if (GOOGLE_CLIENT_ID) {
    return (
      <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        {AppContent}
      </GoogleOAuthProvider>
    );
  }

  return AppContent;
};

export default App;