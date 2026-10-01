import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle, Wrench, CheckCircle, Activity, ArrowRight, Clock } from 'lucide-react';

const useInView = (ref) => {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    if (!ref.current) return;
    const obs = new IntersectionObserver(([entry]) => { setInView(entry.isIntersecting); }, { threshold: 0.1 });
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref]);
  return inView;
};

const FadeInSection = ({ children, delay = 0, style = {} }) => {
  const ref = useRef(null);
  const inView = useInView(ref);
  return (
    <div ref={ref} style={{ ...style, opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(24px)', transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s` }}>
      {children}
    </div>
  );
};

const WorkerDashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({ assignedComplaints: 2, pendingServices: 1, completedTasks: 15 });

  const activities = [
    { id: '#CMP-001', type: 'Plumbing Issue - Flat A-101', status: 'In Progress', statusType: 'warning', date: 'Oct 24, 2023' },
    { id: '#SRV-002', type: 'Deep Cleaning - Flat B-202', status: 'Assigned', statusType: 'danger', date: 'Oct 26, 2023' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div className="section-label">Worker Dashboard</div>
        <h1 className="display-heading" style={{ marginBottom: '0.75rem' }}>
          Your assigned tasks.<br />
          <span className="muted">Get things done.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '550px', lineHeight: 1.6, marginBottom: '3rem' }}>
          Track and manage complaints and service requests assigned to you by the society admin.
        </p>
      </FadeInSection>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <FadeInSection delay={0.1}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('tasks')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Assigned Complaints
              <div className="stat-card-icon"><AlertCircle size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.assignedComplaints}</div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('tasks')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Pending Services
              <div className="stat-card-icon"><Wrench size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.pendingServices}</div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('completed')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Completed Tasks
              <div className="stat-card-icon"><CheckCircle size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.completedTasks}</div>
          </div>
        </FadeInSection>
      </div>

      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>
              <Activity size={16} />
              Recent Assignments
            </h3>
            <button className="btn-pill-outline" onClick={() => onNavigate && onNavigate('tasks')} style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', gap: '6px' }}>
              View all tasks <ArrowRight size={14} />
            </button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Task ID</th>
                <th>Task Details</th>
                <th>Status</th>
                <th>Assigned Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontWeight: 500 }}>{a.id}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.type}</td>
                  <td>
                    <span className={`badge badge-${a.statusType}`}>
                      {a.statusType === 'warning' && <Clock size={11} />}
                      {a.statusType === 'danger' && <AlertCircle size={11} />}
                      {a.status}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="data-table-footer">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
            Live — Last updated just now
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default WorkerDashboard;
