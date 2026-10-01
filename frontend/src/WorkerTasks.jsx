import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, Eye, XCircle } from 'lucide-react';

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

const WorkerTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const fetchTasks = () => {
    import('./api').then(({ default: api }) => {
      api.get('/complaints/my')
        .then(res => {
          const formatted = res.data.map(c => ({
            id: `CMP-${c.id}`,
            rawId: c.id,
            type: c.title,
            location: c.resident ? `Flat ${c.resident.wing}-${c.resident.flatNumber} (${c.resident.user.fullName})` : 'Unknown',
            priority: c.priority || 'MEDIUM',
            status: c.status,
            date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : ''
          })).filter(t => t.status !== 'RESOLVED' && t.status !== 'CLOSED');
          setTasks(formatted);
        })
        .catch(err => console.error(err));
    });
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const updateStatus = async (id, newStatus) => {
    const rawId = selectedTask.rawId;
    try {
      const api = (await import('./api')).default;
      await api.put(`/complaints/${rawId}/status`, { status: newStatus, remarks: 'Status updated by worker' });
      fetchTasks();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-label">Assigned Tasks</div>
          <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
            Work Assigned.<br />
            <span className="muted">Update progress.</span>
          </h1>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>
              <Clock size={16} />
              My Pending Tasks
            </h3>
            <span className="data-table-header .status-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {tasks.length} assigned
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Task & Location</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>
                    No pending tasks.
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{t.id}</td>
                  <td>
                    <div>{t.type}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t.location}</div>
                  </td>
                  <td><span className={`badge ${t.priority === 'HIGH' ? 'badge-danger' : 'badge-warning'}`}>{t.priority}</span></td>
                  <td>
                    <span className={`badge ${t.status === 'OPEN' ? 'badge-danger' : t.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-success'}`}>
                      {t.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn-pill-outline" onClick={() => { setSelectedTask(t); setIsModalOpen(true); }} style={{ padding: '0.3rem 0.9rem', fontSize: '0.8rem', gap: '5px' }}>
                      <Eye size={13} /> View & Update
                    </button>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </FadeInSection>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Task Details
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#1a1a1a', marginBottom: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                <span style={{ color: '#666' }}>ID</span>
                <span>{selectedTask?.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                <span style={{ color: '#666' }}>Location</span>
                <span>{selectedTask?.location}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                <span style={{ color: '#666' }}>Task</span>
                <span>{selectedTask?.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                <span style={{ color: '#666' }}>Current Status</span>
                <span style={{ fontWeight: 'bold' }}>{selectedTask?.status}</span>
              </div>
            </div>

            <p style={{ fontWeight: 500, marginBottom: '1rem', fontSize: '0.9rem' }}>Update Status:</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => updateStatus(selectedTask.id, 'IN_PROGRESS')} className="btn-pill-outline" style={{ flex: 1, justifyContent: 'center' }}>
                In Progress
              </button>
              <button onClick={() => updateStatus(selectedTask.id, 'RESOLVED')} className="btn-pill" style={{ flex: 1, justifyContent: 'center', background: '#166534', borderColor: '#166534' }}>
                Mark Resolved
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkerTasks;
