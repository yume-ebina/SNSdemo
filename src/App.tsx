import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Timeline from './components/Timeline';
import Login from './pages/Login';
import List from './pages/List';
import Profile from './pages/Profile';
import { saveAuth, getAuth, saveUser, getUser, getAllUsers, updateUserInPosts } from './services/storage';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(getAuth());
  const [currentUser, setCurrentUser] = useState(getUser());

  useEffect(() => {
    if (isLoggedIn && currentUser) {
      saveUser(currentUser);
    }
  }, [isLoggedIn, currentUser]);

  const handleLogin = (email: string, password: string) => {
    const users = getAllUsers();
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      setIsLoggedIn(true);
      saveAuth(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    saveAuth(false);
  };

  const handleUpdateUser = (updatedUser: typeof currentUser) => {
    setCurrentUser(updatedUser);
    saveUser(updatedUser);
    updateUserInPosts(updatedUser);
  };

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Header user={currentUser} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Timeline currentUser={currentUser} />} />
          <Route path="/list" element={<List />} />
          <Route path="/profile" element={
            <Profile 
              currentUser={currentUser} 
              onUpdateUser={handleUpdateUser}
            />
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}