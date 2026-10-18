import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import AppLayout from './components/layout/AppLayout';

import DirectoryPage from './pages/DirectoryPage';
import ProfilePage from './pages/ProfilePage';
import BookingsPage from './pages/BookingsPage';
import TechTalksPage from './pages/TechTalksPage';

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppLayout>
          <Routes>
            <Route path="/" element={<DirectoryPage />} />
            <Route path="/my-profile" element={<ProfilePage />} />
            <Route path="/bookings" element={<BookingsPage />} />
            <Route path="/talks" element={<TechTalksPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </ToastProvider>
    </BrowserRouter>
  );
}
