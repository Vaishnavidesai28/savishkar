import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User, LayoutDashboard, ChevronDown, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DesktopNavbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`hidden md:block fixed w-full z-50 transition-all duration-500 border-0 ${
        scrolled 
          ? 'navbar-glass shadow-2xl' 
          : 'bg-transparent'
      }`}
      style={scrolled ? { border: 'none', borderBottom: '2px solid rgba(250, 129, 47, 0.3)', paddingTop: 'env(safe-area-inset-top)' } : { paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="w-full px-6 lg:px-8">
        <div className="flex justify-between items-center h-20 py-2">
          {/* Logo Section - Combined College and Savishkar */}
          <Link to="/" className="flex items-center space-x-6 flex-shrink min-w-0 mr-4">
            {/* College Logo and Name */}
            <div className="flex items-center space-x-3 group min-w-0">
              <img 
                src="/jcerlogo.png" 
                alt="JCER Logo" 
                className="h-14 w-auto object-contain transition-transform duration-300 ease-in-out group-hover:scale-110 flex-shrink-0"
                style={{ filter: 'drop-shadow(0 2px 6px rgba(250, 129, 47, 0.3))' }}
              />
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold leading-tight truncate" style={{ color: '#1a365d', fontFamily: 'Georgia, serif' }}>
                  Jain College of Engineering & Research
                </span>
                <span className="text-xs font-bold truncate" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                  Udyambag, Belagavi
                </span>
              </div>
            </div>
            
            {/* Divider */}
            <div className="h-12 w-px flex-shrink-0" style={{ backgroundColor: 'rgba(250, 129, 47, 0.3)' }}></div>
            
            {/* Savishkar Logo */}
            <div className="flex items-center space-x-2 group flex-shrink-0">
              <img 
                src="/glow.png" 
                alt="Savishkar 2025" 
                className="h-10 w-auto object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(250, 129, 47, 0.4))' }}
              />
              <div className="flex flex-col">
                <span className="text-base font-bold leading-tight whitespace-nowrap" style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}>
                  SAVISHKAR
                </span>
                <span className="text-xs font-semibold -mt-1" style={{ color: '#a0522d', fontFamily: 'Georgia, serif' }}>2025</span>
              </div>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="flex items-center space-x-8">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/events">Events</NavLink>
            <a
              href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/uploads/rulebook.pdf`}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-all duration-300 relative group font-bold text-sm tracking-wide flex items-center gap-1"
              style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}
            >
              <BookOpen className="w-4 h-4" />
              Rulebook
              <span className="absolute -bottom-2 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#FA812F' }} />
            </a>
            
            {user ? (
              <>
                {isAdmin && (
                  <NavLink to="/admin">
                    <LayoutDashboard className="w-4 h-4 inline mr-1" />
                    Admin
                  </NavLink>
                )}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <button
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center space-x-2 glass-effect px-4 py-2 rounded-lg transition-colors hover:bg-opacity-80"
                      style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}
                    >
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border-2 border-gray-600"
                          onError={(e) => {
                            console.error('Navbar image failed to load:', user.avatar);
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <User className="w-5 h-5" style={{ color: '#FA812F' }} />
                      )}
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-semibold" style={{ color: '#2C1810' }}>{user.name}</span>
                        {user.college && (
                          <span className="text-xs truncate max-w-[200px]" style={{ color: '#8b4513' }}>{user.college}</span>
                        )}
                      </div>
                      <ChevronDown className="w-4 h-4" style={{ color: '#FA812F' }} />
                    </button>
                    
                    <AnimatePresence>
                      {showProfileMenu && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl overflow-hidden z-50"
                          style={{ background: 'rgba(255, 255, 255, 0.95)', border: '2px solid rgba(250, 129, 47, 0.3)' }}
                        >
                          <Link
                            to="/dashboard"
                            onClick={() => setShowProfileMenu(false)}
                            className="block px-4 py-3 transition-colors hover:bg-orange-50"
                            style={{ color: '#FA812F' }}
                          >
                            <LayoutDashboard className="w-4 h-4 inline mr-2" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              setShowProfileMenu(false);
                            }}
                            className="w-full text-left px-4 py-3 transition-colors hover:bg-orange-50"
                            style={{ color: '#FA812F', borderTop: '1px solid rgba(250, 129, 47, 0.3)' }}
                          >
                            <LogOut className="w-4 h-4 inline mr-2" />
                            Logout
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="transition-all duration-300 relative group font-bold text-sm tracking-wide"
    style={{ color: '#8b4513', fontFamily: 'Georgia, serif' }}
  >
    {children}
    <span className="absolute -bottom-2 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300 rounded-full" style={{ backgroundColor: '#8b4513' }} />
  </Link>
);

export default DesktopNavbar;
