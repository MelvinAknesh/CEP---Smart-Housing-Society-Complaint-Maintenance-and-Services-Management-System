import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2 } from 'lucide-react';

const Layout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const rafRef = useRef(null);
  const lastScrolled = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const shouldBeScrolled = window.scrollY > 40;
        if (shouldBeScrolled !== lastScrolled.current) {
          lastScrolled.current = shouldBeScrolled;
          setScrolled(shouldBeScrolled);
        }
        rafRef.current = null;
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Complaints', path: '/complaints' },
    { name: 'Services', path: '/services' },
    { name: 'Bills', path: '/bills' },
    { name: 'Members', path: '/members' },
  ];

  return (
    <div className="grid-container">
      {/* Floating Navbar — small, centered, no flicker */}
      <header className={`heron-navbar ${scrolled ? 'scrolled' : ''}`}>
        <Link to="/dashboard" className="heron-logo-cell" style={{ textDecoration: 'none' }}>
          <span className="logo-text">Society</span>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21h18"></path>
            <path d="M9 8h1"></path>
            <path d="M9 12h1"></path>
            <path d="M9 16h1"></path>
            <path d="M14 8h1"></path>
            <path d="M14 12h1"></path>
            <path d="M14 16h1"></path>
            <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"></path>
          </svg>
        </Link>

        <div className="heron-nav-links">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`heron-nav-item ${isActive ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="heron-nav-right">
          <Link to="/" className="heron-nav-item" style={{ fontSize: '0.8rem' }}>
            Sign in
          </Link>
          <button
            className="btn-pill"
            onClick={() => navigate('/dashboard')}
            style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}
          >
            Get started
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="heron-main">
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
