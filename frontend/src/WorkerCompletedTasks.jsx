import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, History } from 'lucide-react';

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

const WorkerCompletedTasks = () => {
  const [completedTasks, setCompletedTasks] = useState([]);

  useEffect(() => {
    import('./api').then(({ default: api }) => {
      api.get('/complaints/my')
        .then(res => {
          const formatted = res.data.map(c => ({
            id: `CMP-${c.id}`,
            rawId: c.id,
            type: c.title,
            location: c.resident ? `Flat ${c.resident.wing}-${c.resident.flatNumber} (${c.resident.user.fullName})` : 'Unknown',
            status: c.status,
            completedDate: c.completedAt ? new Date(c.completedAt).toLocaleDateString() : (c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''),
            rating: 'N/A' // Ratings aren't currently part of the complaint model, but we can display N/A for now
          })).filter(t => t.status === 'RESOLVED' || t.status === 'CLOSED');
          setCompletedTasks(formatted);
        })
        .catch(err => console.error(err));
    });
  }, []);

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-label">History</div>
          <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
            Completed Tasks.<br />
            <span className="muted">Your achievements.</span>
          </h1>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>
              <History size={16} />
              Task History
            </h3>
            <span className="data-table-header .status-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {completedTasks.length} completed
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task & Location</th>
                <th>Completion Date</th>
                <th>Status</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {completedTasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{t.id}</td>
                  <td>
                    <div>{t.type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.location}</div>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{t.completedDate}</td>
                  <td>
                    <span className="badge badge-success">
                      RESOLVED
                    </span>
                  </td>
                  <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                    {t.rating}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </FadeInSection>
    </div>
  );
};

export default WorkerCompletedTasks;
