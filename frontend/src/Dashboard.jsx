import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import api from './api';
import { AlertCircle, Wrench, CreditCard, Activity, ArrowRight, CheckCircle, Clock } from 'lucide-react';

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
    <div
      ref={ref}
      style={{
        ...style,
        opacity: inView ? 1 : 0,
        transform: inView ? 'translateY(0)' : 'translateY(24px)',
        transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${delay}s`,
      }}
    >
      {children}
    </div>
  );
};

const Dashboard = ({ onNavigate }) => {
  const [stats, setStats] = useState({
    activeComplaints: 0,
    pendingServices: 0,
    unpaidBills: 0
  });
  const [activities, setActivities] = useState([]);
  const [bottomStats, setBottomStats] = useState({
    resolutionRate: '0%',
    avgResponse: '24h',
    activeResidents: '0',
    pendingDues: '₹0'
  });
  const role = localStorage.getItem('role');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const compEndpoint = role === 'ADMIN' ? '/admin/complaints' : '/complaints/my';
        const servEndpoint = role === 'ADMIN' ? '/admin/services' : '/services/my';
        const billEndpoint = role === 'ADMIN' ? '/admin/bills' : '/bills/my';

        const [compRes, servRes, billRes] = await Promise.all([
          api.get(compEndpoint).catch(() => ({ data: [] })),
          api.get(servEndpoint).catch(() => ({ data: [] })),
          api.get(billEndpoint).catch(() => ({ data: [] }))
        ]);

        const complaints = compRes.data || [];
        const services = servRes.data || [];
        const bills = billRes.data || [];

        const activeC = complaints.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length;
        const pendingS = services.filter(s => s.status !== 'COMPLETED').length;
        const unpaidB = bills.filter(b => b.status === 'UNPAID').length;

        setStats({
          activeComplaints: activeC,
          pendingServices: pendingS,
          unpaidBills: unpaidB
        });

        // Compute bottom stats
        const resolved = complaints.filter(c => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
        const resRate = complaints.length > 0 ? Math.round((resolved / complaints.length) * 100) : 0;
        
        let residentsCount = '150+';
        if (role === 'ADMIN') {
          try {
            const membersRes = await api.get('/admin/approved-members');
            residentsCount = membersRes.data.filter(m => m.role === 'RESIDENT').length.toString();
          } catch(e) {}
        } else {
          residentsCount = '-';
        }

        const dues = bills.filter(b => b.status === 'UNPAID').reduce((acc, curr) => acc + (curr.amount || 0), 0);

        setBottomStats({
          resolutionRate: `${resRate}%`,
          avgResponse: '24h',
          activeResidents: residentsCount,
          pendingDues: `₹${dues}`
        });

        // Merge recent activities
        const cMap = complaints.map(c => ({
          id: `CMP-${c.id}`,
          type: c.title || 'Complaint',
          status: c.status,
          statusType: c.status === 'RESOLVED' ? 'success' : c.status === 'PENDING' ? 'danger' : 'warning',
          date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          rawDate: c.createdAt ? new Date(c.createdAt) : new Date(0)
        }));
        const sMap = services.map(s => ({
          id: `SRV-${s.id}`,
          type: s.title || 'Service',
          status: s.status,
          statusType: s.status === 'COMPLETED' ? 'success' : s.status === 'PENDING' ? 'danger' : 'warning',
          date: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          rawDate: s.createdAt ? new Date(s.createdAt) : new Date(0)
        }));

        let combined = [...cMap, ...sMap].sort((a, b) => b.rawDate - a.rawDate).slice(0, 4);
        if (combined.length === 0) {
          combined = [
            { id: '-', type: 'No recent activity', status: 'N/A', statusType: 'neutral', date: '-' }
          ];
        }
        setActivities(combined);

      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };
    
    fetchDashboardData();
  }, [role]);

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      {/* Hero Section */}
      <FadeInSection>
        <div className="section-label">Overview</div>
        <h1 className="display-heading" style={{ marginBottom: '0.75rem' }}>
          Everything at a glance.<br />
          <span className="muted">Nothing you'll miss.</span>
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.15rem', maxWidth: '550px', lineHeight: 1.6, marginBottom: '3rem' }}>
          Here's what's happening in your society today. Track complaints, services, and pending bills.
        </p>
      </FadeInSection>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '4rem' }}>
        <FadeInSection delay={0.1}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('complaints', 'ACTIVE')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Active Complaints
              <div className="stat-card-icon"><AlertCircle size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.activeComplaints}</div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.2}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('services', 'PENDING')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Pending Services
              <div className="stat-card-icon"><Wrench size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.pendingServices}</div>
          </div>
        </FadeInSection>

        <FadeInSection delay={0.3}>
          <div className="stat-card" onClick={() => onNavigate && onNavigate('bills', 'UNPAID')} style={{ cursor: 'pointer' }}>
            <div className="stat-card-label">
              Unpaid Bills
              <div className="stat-card-icon"><CreditCard size={18} /></div>
            </div>
            <div className="stat-card-value">{stats.unpaidBills}</div>
          </div>
        </FadeInSection>
      </div>

      {/* Activity Table */}
      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>
              <Activity size={16} />
              Recent Activity
            </h3>
            <button className="btn-pill-outline" onClick={() => onNavigate && onNavigate('complaints')} style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', gap: '6px' }}>
              View all <ArrowRight size={14} />
            </button>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((a, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 500 }}>{a.id}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{a.type}</td>
                  <td>
                    <span className={`badge badge-${a.statusType}`}>
                      {a.statusType === 'warning' && <Clock size={11} />}
                      {a.statusType === 'success' && <CheckCircle size={11} />}
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

      {/* Bottom Stats — Marquee-like */}
      <FadeInSection delay={0.2} style={{ marginTop: '4rem' }}>
        <div className="stat-row" style={{ justifyContent: 'space-between' }}>
          <div className="stat-item">
            <div className="stat-value">{bottomStats.resolutionRate}</div>
            <div className="stat-label">Resolution rate</div>
            <div className="stat-source">This quarter</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{bottomStats.avgResponse}</div>
            <div className="stat-label">Avg. response time</div>
            <div className="stat-source">All complaints</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{bottomStats.activeResidents}</div>
            <div className="stat-label">Active residents</div>
            <div className="stat-source">Society wide</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{bottomStats.pendingDues}</div>
            <div className="stat-label">Pending dues</div>
            <div className="stat-source">{role === 'ADMIN' ? 'Society total' : 'Your account'}</div>
          </div>
        </div>
      </FadeInSection>
    </div>
  );
};

export default Dashboard;
