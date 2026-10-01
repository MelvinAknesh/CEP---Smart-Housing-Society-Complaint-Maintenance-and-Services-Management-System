import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Settings, Clock, CheckCircle, Loader, XCircle, ChevronDown, Calendar, ChevronLeft, ChevronRight, Wrench } from 'lucide-react';

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
  'COMPLETED': { badge: 'badge-success', icon: CheckCircle, label: 'Completed' },
  'PENDING': { badge: 'badge-warning', icon: Clock, label: 'Pending' },
  'IN_PROGRESS': { badge: 'badge-info', icon: Loader, label: 'In Progress' },
};

const Services = ({ filter, onClearFilter }) => {
  const [services, setServices] = useState([
    { id: 'SRV-001', title: 'Plumbing Repair', status: 'COMPLETED', date: '2023-10-15', provider: 'John Doe' },
    { id: 'SRV-002', title: 'House Cleaning', status: 'PENDING', date: '2023-10-25', provider: 'Unassigned' },
    { id: 'SRV-003', title: 'Electrical Wiring', status: 'IN_PROGRESS', date: '2023-10-22', provider: 'Jane Smith' },
  ]);
  const filteredServices = filter ? services.filter(s => s.status === filter) : services;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('new');
  const [selectedService, setSelectedService] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [serviceType, setServiceType] = useState('');
  const [preferredDate, setPreferredDate] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isManageStatusOpen, setIsManageStatusOpen] = useState(false);
  const [isManageProviderOpen, setIsManageProviderOpen] = useState(false);
  const [workers, setWorkers] = useState([]);
  
  const role = localStorage.getItem('role');

  const fetchServices = async () => {
    try {
      const api = (await import('./api')).default;
      const endpoint = role === 'ADMIN' ? '/admin/service-requests' : '/service-requests/my';
      const res = await api.get(endpoint);
      setServices(res.data.map(s => ({
        id: `SRV-${String(s.id).padStart(3, '0')}`,
        _rawId: s.id,
        title: s.serviceType,
        status: s.status,
        date: s.requestedDate,
        provider: s.worker ? s.worker.user.name : 'Unassigned',
        _workerId: s.worker?.id
      })));
      
      if (role === 'ADMIN') {
        const wRes = await api.get('/admin/workers');
        setWorkers(wRes.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [role]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const serviceTypes = [
    { value: 'Plumbing Repair', label: 'Plumbing Repair (24h SLA)' },
    { value: 'Electrical Work', label: 'Electrical Work (24h SLA)' },
    { value: 'House Cleaning', label: 'House Cleaning (48h SLA)' },
    { value: 'Carpentry', label: 'Carpentry (48h SLA)' },
    { value: 'Lift Maintenance', label: 'Lift Maintenance (12h SLA)' },
    { value: 'Pest Control', label: 'Pest Control (72h SLA)' }
  ];

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div className="section-label">Services</div>
            <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
              Request services.<br />
              <span className="muted">We handle the rest.</span>
            </h1>
          </div>
          <button className="btn-pill" onClick={() => { setModalType('new'); setIsModalOpen(true); }} style={{ gap: '8px' }}>
            <Plus size={16} /> New service
          </button>
        </div>
      </FadeInSection>
      {filter && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClearFilter} className="btn-pill-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', gap: '4px' }}>
            <XCircle size={14} /> Clear Filter
          </button>
        </div>
      )}

      {/* Feature rows — Optimus style */}
      <FadeInSection delay={0.1}>
        {filteredServices.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#e3e3e3', borderRadius: '16px', border: '1px dashed #aaa', marginTop: '1rem' }}>
            <Wrench size={48} color="#999" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a' }}>No services found</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>There are no service requests matching your criteria.</p>
          </div>
        ) : (
          filteredServices.map((s, i) => {
          const st = statusConfig[s.status] || {};
          const Icon = st.icon || Clock;
          return (
            <div className="feature-row" key={s.id}>
              <span className="feature-num">{String(i + 1).padStart(2, '0')}</span>
              <div style={{ flex: 1 }}>
                <div className="feature-title">{s.title}</div>
                <div className="feature-desc">{s.provider !== 'Unassigned' ? `Assigned to ${s.provider}` : 'Awaiting assignment'} · Due {s.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                <span className={`badge ${st.badge}`}><Icon size={11} /> {st.label || s.status}</span>
                <button className="btn-pill-outline" onClick={() => { setSelectedService(s); setModalType('manage'); setIsModalOpen(true); }} style={{ padding: '0.35rem 1rem', fontSize: '0.8rem', gap: '5px' }}>
                  <Settings size={13} /> Manage
                </button>
              </div>
            </div>
          );
        }) )}
      </FadeInSection>
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                {modalType === 'new' ? 'New Service Request' : `Manage: ${selectedService?.id}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            {modalType === 'new' ? (
              <form onSubmit={async (e) => { 
                e.preventDefault(); 
                if (!serviceType || !preferredDate) return;
                
                try {
                  const api = (await import('./api')).default;
                  const [dd, mm, yyyy] = preferredDate.split('-');
                  await api.post('/service-requests', {
                    serviceType: serviceTypes.find(t => t.value === serviceType)?.value || serviceType,
                    description: 'Requested from dashboard',
                    requestedDate: `${yyyy}-${mm}-${dd}`
                  });
                  await fetchServices();
                  setIsModalOpen(false);
                  setServiceType('');
                  setPreferredDate('');
                } catch(err) {
                  console.error(err);
                  alert('Failed to request service');
                }
              }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    service type
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: serviceType ? '#1a1a1a' : '#888' }}
                      onClick={() => { setIsDropdownOpen(!isDropdownOpen); setIsCalendarOpen(false); }}
                    >
                      <span>
                        {serviceType ? serviceTypes.find(t => t.value === serviceType)?.label : 'Select a service...'}
                      </span>
                      <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>
                    </div>
                    {isDropdownOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
                        {serviceTypes.map(type => (
                          <div 
                            key={type.value}
                            onClick={() => { setServiceType(type.value); setIsDropdownOpen(false); }}
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
                    preferred date
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div 
                      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: preferredDate ? '#1a1a1a' : '#888' }}
                      onClick={() => { setIsCalendarOpen(!isCalendarOpen); setIsDropdownOpen(false); }}
                    >
                      <span>{preferredDate || 'dd-mm-yyyy'}</span>
                      <Calendar size={18} style={{ color: '#1a1a1a' }} />
                    </div>
                    {isCalendarOpen && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '16px', zIndex: 10, boxShadow: '0 10px 25px rgba(0,0,0,0.15)', padding: '1rem', width: '280px', userSelect: 'none' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#1a1a1a' }}><ChevronLeft size={20} /></button>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem', color: '#1a1a1a' }}>
                            {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                          </span>
                          <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', color: '#1a1a1a' }}><ChevronRight size={20} /></button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px', textAlign: 'center', marginBottom: '0.5rem' }}>
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} style={{ fontSize: '0.75rem', fontWeight: 600, color: '#888' }}>{d}</span>
                          ))}
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                          {blanks.map(b => <div key={`blank-${b}`} />)}
                          {days.map(d => {
                            const dateStr = `${String(d).padStart(2, '0')}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${currentMonth.getFullYear()}`;
                            const isSelected = preferredDate === dateStr;
                            return (
                              <button 
                                key={d} 
                                type="button"
                                onClick={() => { setPreferredDate(dateStr); setIsCalendarOpen(false); }}
                                style={{ 
                                  background: isSelected ? '#1a1a1a' : 'transparent', 
                                  color: isSelected ? '#fff' : '#1a1a1a', 
                                  border: 'none', 
                                  borderRadius: '8px', 
                                  width: '32px', 
                                  height: '32px', 
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center', 
                                  cursor: 'pointer',
                                  fontSize: '0.85rem'
                                }}
                                onMouseEnter={(e) => { if(!isSelected) e.target.style.background = '#e3e3e3' }}
                                onMouseLeave={(e) => { if(!isSelected) e.target.style.background = 'transparent' }}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={(e) => e.target.style.background = '#1a1d24'} onMouseLeave={(e) => e.target.style.background = '#2c303a'}>
                  Request Service
                </button>
              </form>
            ) : (
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const api = (await import('./api')).default;
                  if (selectedService._workerId) {
                    await api.put(`/admin/service-requests/${selectedService._rawId}/assign`, { workerId: selectedService._workerId });
                  }
                  await fetchServices();
                  setIsModalOpen(false);
                } catch(err) {
                  console.error(err);
                  alert('Failed to assign worker');
                }
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#1a1a1a' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                    <label style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>status</label>
                    <div style={{ position: 'relative', width: '160px' }}>
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.5rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', color: '#1a1a1a' }}
                        onClick={() => { setIsManageStatusOpen(!isManageStatusOpen); setIsManageProviderOpen(false); }}
                      >
                        <span>{selectedService?.status === 'IN_PROGRESS' ? 'In Progress' : selectedService?.status ? selectedService.status.charAt(0) + selectedService.status.slice(1).toLowerCase() : ''}</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronDown size={12} style={{ color: '#1a1a1a', transform: isManageStatusOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>
                      {isManageStatusOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                          {['PENDING', 'IN_PROGRESS', 'COMPLETED'].map(s => (
                            <div 
                              key={s}
                              onClick={() => { setSelectedService({...selectedService, status: s}); setIsManageStatusOpen(false); }}
                              style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                              onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              {s === 'IN_PROGRESS' ? 'In Progress' : s.charAt(0) + s.slice(1).toLowerCase()}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 9 }}>
                    <label style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>provider</label>
                    <div style={{ position: 'relative', width: '160px' }}>
                      <div 
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.5rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.9rem', color: '#1a1a1a' }}
                        onClick={() => { setIsManageProviderOpen(!isManageProviderOpen); setIsManageStatusOpen(false); }}
                      >
                        <span>{selectedService?._workerId ? workers.find(w => w.id === selectedService._workerId)?.user?.name || 'Assigned' : 'Unassigned'}</span>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ChevronDown size={12} style={{ color: '#1a1a1a', transform: isManageProviderOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>
                      {isManageProviderOpen && (
                        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
                          <div 
                            onClick={() => { setSelectedService({...selectedService, provider: 'Unassigned', _workerId: null}); setIsManageProviderOpen(false); }}
                            style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                            onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                            onMouseLeave={(e) => e.target.style.background = 'transparent'}
                          >
                            Unassigned
                          </div>
                          {workers.map(w => (
                            <div 
                              key={w.id}
                              onClick={() => { setSelectedService({...selectedService, provider: w.user.name, _workerId: w.id}); setIsManageProviderOpen(false); }}
                              style={{ padding: '0.6rem 0.8rem', cursor: 'pointer', fontSize: '0.9rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                              onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                              onMouseLeave={(e) => e.target.style.background = 'transparent'}
                            >
                              {w.user.name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #ccc', marginTop: '0.5rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>date</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedService?.date}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid #ccc' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: '#666' }}>service</span>
                    <span style={{ fontSize: '0.9rem' }}>{selectedService?.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                    <button type="button" onClick={() => setIsModalOpen(false)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>Cancel</button>
                    <button type="submit" style={{ flex: 1, padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', userSelect: 'none' }}>Save</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Services;
