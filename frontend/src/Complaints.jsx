import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Eye, AlertCircle, Clock, CheckCircle, XCircle, ChevronDown, ClipboardList } from 'lucide-react';
import api from './api';

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

const statusConfig = {
  'CREATED': { badge: 'badge-danger', icon: AlertCircle, label: 'Open' },
  'OPEN': { badge: 'badge-danger', icon: AlertCircle, label: 'Open' },
  'ASSIGNED': { badge: 'badge-warning', icon: Clock, label: 'Assigned' },
  'IN_PROGRESS': { badge: 'badge-warning', icon: Clock, label: 'In Progress' },
  'RESOLVED': { badge: 'badge-success', icon: CheckCircle, label: 'Resolved' },
  'CLOSED': { badge: 'badge-neutral', icon: CheckCircle, label: 'Closed' },
};

const priorityConfig = {
  'EMERGENCY': { badge: 'badge-danger' },
  'HIGH': { badge: 'badge-warning' },
  'MEDIUM': { badge: 'badge-info' },
  'LOW': { badge: 'badge-neutral' },
};

const Complaints = ({ filter, onClearFilter }) => {
  const [complaints, setComplaints] = useState([]);
  const role = localStorage.getItem('role');

  const fetchComplaints = async () => {
    try {
      const endpoint = role === 'ADMIN' ? '/admin/complaints' : '/complaints/my';
      const res = await api.get(endpoint);
      const data = res.data.map(c => ({
        id: `CMP-${c.id}`,
        rawId: c.id,
        type: c.title,
        priority: c.priority || 'MEDIUM',
        status: c.status,
        date: c.createdAt ? new Date(c.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
        worker: c.worker ? (c.worker.user?.fullName || c.worker.user?.name) : null,
        workerId: c.worker?.id || null
      }));
      setComplaints(data);
    } catch (err) {
      console.error('Error fetching complaints:', err);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);
  const filteredComplaints = filter ? complaints.filter(c => filter === 'ACTIVE' ? (c.status === 'OPEN' || c.status === 'CREATED' || c.status === 'ASSIGNED' || c.status === 'IN_PROGRESS') : c.status === filter) : complaints;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('new');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [issueType, setIssueType] = useState('');
  const [description, setDescription] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [suggestedWorkers, setSuggestedWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');
  const [isWorkerDropdownOpen, setIsWorkerDropdownOpen] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const issueTypes = [
    { value: 'GAS LEAKAGE', label: 'Gas Leakage' },
    { value: 'ELECTRICAL SHORT CIRCUIT', label: 'Electrical Short Circuit' },
    { value: 'MAJOR WATER LEAKAGE', label: 'Major Water Leakage' },
    { value: 'LIFT MALFUNCTION', label: 'Lift Malfunction' },
    { value: 'NORMAL PLUMBING ISSUE', label: 'Normal Plumbing Issue' },
    { value: 'CLEANING REQUEST', label: 'Cleaning Request' },
    { value: 'MINOR MAINTENANCE', label: 'Minor Maintenance' },
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div className="section-label">Complaints</div>
            <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
              Track issues.<br />
              <span className="muted">Resolve faster.</span>
            </h1>
          </div>
          <button className="btn-pill" onClick={() => { setModalType('new'); setIsModalOpen(true); }} style={{ gap: '8px' }}>
            <Plus size={16} /> New complaint
          </button>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>
              <AlertCircle size={16} />
              {localStorage.getItem('role') === 'RESIDENT' ? 'My Complaints' : localStorage.getItem('role') === 'WORKER' ? 'Assigned Tasks' : 'All Complaints'}
            </h3>
            <span className="data-table-header .status-indicator" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {filteredComplaints.length} records
              {filter && (
                <button onClick={onClearFilter} style={{ background: 'none', border: 'none', padding: 0, marginLeft: '8px', color: 'var(--text-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <XCircle size={12} /> Clear Filter
                </button>
              )}
            </span>
          </div>

          {filteredComplaints.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#e3e3e3', borderRadius: '16px', border: '1px dashed #aaa', marginTop: '1rem' }}>
              <ClipboardList size={48} color="#999" style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a' }}>No complaints found</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>There are no complaints matching your current filters.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Issue</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.map((c, i) => {
                  const st = statusConfig[c.status] || {};
                  const pr = priorityConfig[c.priority] || { badge: 'badge-neutral' };
                  const Icon = st.icon || AlertCircle;
                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 500, fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>{c.id}</td>
                      <td>{c.type}</td>
                      <td><span className={`badge ${pr.badge}`}>{c.priority}</span></td>
                      <td><span className={`badge ${st.badge}`}><Icon size={11} /> {st.label || c.status}</span></td>
                      <td style={{ color: 'var(--text-secondary)' }}>{c.date}</td>
                      <td>
                        <button className="btn-pill-outline" onClick={() => { 
                          setSelectedComplaint(c); 
                          setModalType('view'); 
                          setIsModalOpen(true);
                          if (localStorage.getItem('role') === 'ADMIN') {
                            api.get('/admin/workers')
                               .then(res => setSuggestedWorkers(res.data))
                               .catch(err => console.error(err));
                          }
                        }} style={{ padding: '0.3rem 0.9rem', fontSize: '0.8rem', gap: '5px' }}>
                          <Eye size={13} /> View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          <div className="data-table-footer">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
            Live
          </div>
        </div>
      </FadeInSection>
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                {modalType === 'new' ? 'New Complaint' : `Details: ${selectedComplaint?.id}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            {modalType === 'new' ? (
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                if (!issueType || !description) return;
                try {
                  await api.post('/complaints', {
                    title: issueTypes.find(t => t.value === issueType)?.label || issueType,
                    description: description,
                    category: issueType
                  });
                  setIsModalOpen(false);
                  setIssueType('');
                  setDescription('');
                  fetchComplaints();
                } catch (err) {
                  console.error('Failed to submit complaint:', err);
                  alert(err.response?.data?.message || 'Failed to submit complaint');
                }
              }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    issue type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: issueType ? '#1a1a1a' : '#888' }}
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    >
                      <span>
                        {issueType ? issueTypes.find(t => t.value === issueType)?.label : 'Select an issue type...'}
                      </span>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                    {isDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        {issueTypes.map(type => (
                          <div 
                            key={type.value}
                            onClick={() => { setIssueType(type.value); setIsDropdownOpen(false); }}
                            style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                            onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            {type.label}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    description
                  </label>
                  <textarea 
                    rows={4} 
                    placeholder="Describe the issue..." 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                  ></textarea>
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={(e) => e.target.style.background = '#1a1d24'} onMouseLeave={(e) => e.target.style.background = '#2c303a'}>
                  Submit Complaint
                </button>
              </form>
            ) : (
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#1a1a1a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                  <span style={{ color: '#666' }}>Status</span>
                  <span>{selectedComplaint?.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                  <span style={{ color: '#666' }}>Priority</span>
                  <span>{selectedComplaint?.priority}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                  <span style={{ color: '#666' }}>Date</span>
                  <span>{selectedComplaint?.date}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.8rem', borderBottom: '1px solid #ccc' }}>
                  <span style={{ color: '#666' }}>Issue</span>
                  <span>{selectedComplaint?.type}</span>
                </div>
                {localStorage.getItem('role') === 'ADMIN' && selectedComplaint?.status !== 'RESOLVED' && selectedComplaint?.status !== 'CLOSED' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>{selectedComplaint?.worker ? 'Assigned to' : 'Assign Worker'}</span>
                      {selectedComplaint?.worker && <span style={{ fontWeight: 500 }}>{selectedComplaint.worker}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: '0.2rem' }}>
                      <div style={{ position: 'relative', flex: 1 }}>
                        <div 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: selectedWorker ? '#1a1a1a' : '#888', outline: 'none' }}
                          onClick={() => setIsWorkerDropdownOpen(!isWorkerDropdownOpen)}
                        >
                          <span>
                            {selectedWorker ? (() => {
                              const w = suggestedWorkers.find(worker => worker.id.toString() === selectedWorker.toString());
                              return w ? (w.user?.fullName || w.user?.name) : (selectedComplaint?.worker ? 'Reassign...' : 'Select a worker');
                            })() : (selectedComplaint?.worker ? 'Reassign...' : 'Select a worker')}
                          </span>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isWorkerDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {isWorkerDropdownOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
                            {suggestedWorkers.map(w => (
                              <div 
                                key={w.id}
                                onClick={() => { setSelectedWorker(w.id); setIsWorkerDropdownOpen(false); }}
                                style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                                onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {w.user?.fullName || w.user?.name}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button 
                        onClick={async () => {
                          if (!selectedWorker) return;
                          setAssigning(true);
                          try {
                            await api.put(`/admin/complaints/${selectedComplaint.rawId}/assign`, { workerId: parseInt(selectedWorker) });
                            fetchComplaints();
                            setIsModalOpen(false);
                            setSelectedWorker('');
                          } catch (err) {
                            console.error(err);
                            alert('Failed to assign worker');
                          } finally {
                            setAssigning(false);
                          }
                        }}
                        disabled={!selectedWorker || assigning}
                        style={{ padding: '0.85rem 1.5rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 500, cursor: (!selectedWorker || assigning) ? 'not-allowed' : 'pointer', transition: 'all 0.2s', opacity: (!selectedWorker || assigning) ? 0.6 : 1, whiteSpace: 'nowrap' }}
                      >
                        {assigning ? 'Assigning...' : (selectedComplaint?.worker ? 'Reassign' : 'Assign Task')}
                      </button>
                    </div>
                  </div>
                )}
                <div style={{ marginTop: '1.5rem' }}>
                  <button onClick={() => setIsModalOpen(false)} style={{ width: '100%', padding: '0.9rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer' }}>Close</button>
                </div>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Complaints;
