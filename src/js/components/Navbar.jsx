import { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldCheck, LogOut, Sun, Moon } from 'lucide-react';
import { ThemeContext, AuthContext } from '../App';

export default function Navbar() {
  const location = useLocation();
  const { isDarkMode, setIsDarkMode } = useContext(ThemeContext);
  const { isLoggedIn, setIsLoggedIn } = useContext(AuthContext);

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
      isActive(path)
        ? 'text-gray-900 bg-gray-100 dark:text-white dark:bg-white/10'
        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/5'
    }`;

  return (
    <div className="sticky top-0 z-50 pt-4 px-4 sm:px-6 lg:px-8 w-full max-w-5xl mx-auto">
      <nav className="bg-white/80 dark:bg-black/60 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-full shadow-sm dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-colors duration-300">
        <div className="px-6">
          <div className="flex justify-between h-16 items-center">
            
            {/* Left: Logo */}
            <div className="flex items-center w-1/3">
              <Link to="/" className="flex items-center gap-3 group">
                <div className="w-8 h-8 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                  <ShieldCheck className="w-5 h-5 text-white dark:text-black" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                  SentinelText
                </span>
              </Link>
            </div>
            
            {/* Center: Links (if logged in) */}
            <div className="flex-1 flex justify-center overflow-x-auto mx-2">
              {isLoggedIn && (
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <Link to="/" className={navLinkClass('/')}>
                    Analyzer
                  </Link>
                  <Link to="/history" className={navLinkClass('/history')}>
                    History
                  </Link>
                  <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                    Dashboard
                  </Link>
                </div>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end w-1/3 gap-3">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-full text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-1 hidden sm:block"></div>

              {isLoggedIn ? (
                <button
                  onClick={() => {
                    localStorage.removeItem('token');
                    setIsLoggedIn(false);
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-white dark:bg-white/10 dark:hover:bg-white/20 transition-all duration-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log out</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-4 py-2 rounded-full text-sm font-medium text-gray-700 bg-transparent hover:bg-gray-100 dark:text-gray-300 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/login"
                    state={{ isSignup: true }}
                    className="px-4 py-2 rounded-full text-sm font-medium text-white bg-gray-900 hover:bg-black dark:text-black dark:bg-white dark:hover:bg-gray-200 transition-colors shadow-sm"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
            
          </div>
        </div>
      </nav>
    </div>
  );
}
