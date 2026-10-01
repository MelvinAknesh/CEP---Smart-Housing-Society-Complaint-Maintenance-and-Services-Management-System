import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Building2, Hexagon, Star, ArrowLeft } from 'lucide-react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import WorkerDashboard from './WorkerDashboard';
import WorkerTasks from './WorkerTasks';
import WorkerCompletedTasks from './WorkerCompletedTasks';
import Feedback from './Feedback';

const sections = [
  { id: 'dashboard', name: 'Dashboard' },
  { id: 'tasks', name: 'Assigned Tasks' },
  { id: 'completed', name: 'Completed Tasks' },
  { id: 'feedback', name: 'Feedback' }
];

const WorkerPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [filters, setFilters] = useState({ complaints: null, services: null, bills: null });
  const [scrolled, setScrolled] = useState(false);
  const sectionRefs = useRef({});
  const rafRef = useRef(null);
  const lastScrolled = useRef(false);
  const isClickScrolling = useRef(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Animated Background Transforms
  const bg1Y = useTransform(scrollYProgress, [0, 1], ['0%', '200%']);
  const bg2Y = useTransform(scrollYProgress, [0, 1], ['0%', '-150%']);
  const bgRotate = useTransform(scrollYProgress, [0, 1], [0, 360]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1, 1.5]);
  
  // Logo Scroll Effect (spins as you scroll like huyml.co)
  const logoRotate = useTransform(scrollYProgress, [0, 1], [0, 1080]);

  // Scroll-based navbar background
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

  // IntersectionObserver to detect which section is in view
  useEffect(() => {
    const observers = [];

    sections.forEach(({ id }) => {
      const el = sectionRefs.current[id];
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && !isClickScrolling.current) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: '-35% 0px -55% 0px', // triggers when section is roughly centered
          threshold: 0,
        }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Smooth scroll to section on nav click
  const scrollToSection = useCallback((id, filter = null) => {
    const el = sectionRefs.current[id];
    if (!el) return;

    if (filter) {
      setFilters(prev => ({ ...prev, [id]: filter }));
    }
    isClickScrolling.current = true;
    setActiveSection(id);

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Wait for scroll to finish before re-enabling observer updates
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  }, []);

  return (
    <div className="grid-container">
      {/* Animated Background Blobs */}
      <div className="animated-bg-container">
        <motion.div
          className="bg-blob bg-blob-1"
          style={{ y: bg1Y, rotate: bgRotate, scale: bgScale }}
        />
        <motion.div
          className="bg-blob bg-blob-2"
          style={{ y: bg2Y, rotate: bgRotate }}
        />

      </div>

      <motion.div className="scroll-progress-bar" style={{ scaleX }} />
      {/* Floating Navbar */}
      <header className={`heron-navbar ${scrolled ? 'scrolled' : ''}`}>
        {activeSection !== 'dashboard' && (
          <button onClick={() => { setFilters({ complaints: null, services: null, bills: null }); scrollToSection('dashboard'); }} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: 'var(--text-primary)', marginRight: '1rem' }} aria-label="Go Back to Dashboard">
            <ArrowLeft size={20} />
          </button>
        )}
        <div onClick={() => { setFilters({ complaints: null, services: null, bills: null }); scrollToSection('dashboard'); }} className="heron-logo-cell" style={{ cursor: 'pointer' }}>
          <span className="logo-text">Society</span>
          <motion.div style={{ rotate: logoRotate, display: 'inline-flex' }}>
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
          </motion.div>
        </div>

        <div className="heron-nav-links">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => scrollToSection(section.id)}
              className={`heron-nav-item ${activeSection === section.id ? 'active' : ''}`}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {section.name}
            </button>
          ))}
        </div>

        <div className="heron-nav-right">
          {localStorage.getItem('token') ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {localStorage.getItem('name') || 'User'}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {localStorage.getItem('role') || 'Role'}
                </span>
              </div>
              <button
                className="btn-pill"
                onClick={() => {
                  localStorage.clear();
                  window.location.href = '/';
                }}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link to="/" className="heron-nav-item">
              Sign in
            </Link>
          )}
        </div>
      </header>

      {/* Scrollable Sections */}
      <main className="scroll-main">
        {/* Dashboard Section */}
        <section
          id="dashboard"
          ref={(el) => (sectionRefs.current['dashboard'] = el)}
          className="scroll-section"
        >
          <WorkerDashboard onNavigate={scrollToSection} />
        </section>

        {/* Divider */}
        <div className="section-divider" />

        

        <div className="section-divider" />

        {/* Services Section */}
        <section
          id="tasks"
          ref={(el) => (sectionRefs.current['tasks'] = el)}
          className="scroll-section"
        >
          <WorkerTasks />
        </section>
        <div className="section-divider" />

        {/* Completed Section */}
        <section
          id="completed"
          ref={(el) => (sectionRefs.current['completed'] = el)}
          className="scroll-section"
        >
          <WorkerCompletedTasks />
        </section>


        <div className="section-divider" />

        

        <div className="section-divider" />

        {/* Members Section */}
        <section
          id="feedback"
          ref={(el) => (sectionRefs.current['feedback'] = el)}
          className="scroll-section"
        >
          <Feedback />
        </section>

        {/* Footer */}
        <footer className="scroll-footer">
          <div className="scroll-footer-inner">
            <div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Society</span>
              
            </div>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              © 2026 Housing Society Complaint System. Copyright of this website is on Melvin Aknesh and website build by Melvin Aknesh.
            </span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default WorkerPage;

