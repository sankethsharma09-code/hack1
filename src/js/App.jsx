import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, createContext, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Analyzer from './pages/Analyzer';
import History from './pages/History';
import Dashboard from './pages/Dashboard';

export const ThemeContext = createContext();
export const AuthContext = createContext();

function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
      <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col font-sans bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
            <Routes>
              <Route path="/login" element={<><Navbar /><Login /></>} />
              <Route path="/" element={<><Navbar /><Analyzer /></>} />
              <Route path="/history" element={<><Navbar /><History /></>} />
              <Route path="/dashboard" element={<><Navbar /><Dashboard /></>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </BrowserRouter>
      </ThemeContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;

