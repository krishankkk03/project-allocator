import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
          <Navbar />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/teacher/*" element={
                <ProtectedRoute role="teacher">
                  <TeacherDashboard />
                </ProtectedRoute>
              } />
              <Route path="/student/*" element={
                <ProtectedRoute role="student">
                  <StudentDashboard />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </main>
          <footer className="bg-white border-t py-6 text-center text-slate-500 text-sm mt-auto">
            &copy; {new Date().getFullYear()} Project Allocator. Academic Project.
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
