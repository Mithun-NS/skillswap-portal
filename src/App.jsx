import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import AppLayout from './components/layout/AppLayout';

import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import TechTalksPage from './pages/TechTalksPage';
import LoginPage from './pages/LoginPage';
import ProtectedRoute from './components/auth/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppLayout>
            <Routes>
              {/* Public Route */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Corporate Portal Routes */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <DirectoryPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/my-profile" 
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/bookings" 
                element={
                  <ProtectedRoute>
                    <BookingsPage />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/talks" 
                element={
                  <ProtectedRoute>
                    <TechTalksPage />
                  </ProtectedRoute>
                } 
              />

              {/* Catch-all fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}
