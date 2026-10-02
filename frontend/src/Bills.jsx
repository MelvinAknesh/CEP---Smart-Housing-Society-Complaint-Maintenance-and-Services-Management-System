import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowRight, Check, XCircle, Plus, ChevronDown, Calendar, ChevronLeft, ChevronRight, Trash2, FileText } from 'lucide-react';

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

const Bills = ({ filter, onClearFilter }) => {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    import('./api').then(({ default: api }) => {
      const role = localStorage.getItem('role');
      const endpoint = role === 'RESIDENT' ? '/bills/my' : '/admin/bills';
      api.get(endpoint)
        .then(res => {
          const fetchedBills = res.data.map(b => {
            const resName = b.resident && b.resident.user ? `${b.resident.user.name} (${b.resident.wing}-${b.resident.flatNumber})` : 'Unknown Resident';
            return {
              id: `INV-${String(b.id).padStart(4, '0')}`,
              month: `${b.billingMonth} ${b.billingYear}`,
              type: b.billingMonth.includes('Penalty') ? 'Penalty' : (b.billingMonth.includes('Event') ? 'Event Fee' : 'Maintenance'),
              amount: `₹${b.amount}`,
              status: b.status === 'PENDING' ? 'UNPAID' : b.status,
              dueDate: b.dueDate,
              assignedTo: resName,
              description: ''
            };
          });
          setBills(fetchedBills);
        })
        .catch(err => console.error('Error fetching bills:', err));
    });
  }, []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localStatusFilter, setLocalStatusFilter] = useState('ALL');
  const [localTypeFilter, setLocalTypeFilter] = useState('ALL');
  const [billType, setBillType] = useState('Maintenance');
  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [billAmount, setBillAmount] = useState('');
  const [billMonth, setBillMonth] = useState('');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [billDescription, setBillDescription] = useState('');
  const [selectedMember, setSelectedMember] = useState('');
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [residents, setResidents] = useState([]);

  useEffect(() => {
    if (localStorage.getItem('role') === 'ADMIN') {
      import('./api').then(({ default: api }) => {
        api.get('/admin/residents')
          .then(res => setResidents(res.data))
          .catch(err => console.error(err));
      });
    }
  }, []);
  const [actualMembers, setActualMembers] = useState([]);
  
  useEffect(() => {
    if (localStorage.getItem('role') === 'ADMIN') {
      import('./api').then(({ default: api }) => {
        api.get('/admin/approved-members')
           .then(res => {
             const membersList = res.data
               .filter(m => m.role === 'RESIDENT')
               .map(m => `${m.fullName} (${m.wing}-${m.flatNumber})`);
             setActualMembers(membersList.length > 0 ? membersList : ['No residents found']);
           })
           .catch(err => console.error('Error fetching members:', err));
      });
    }
  }, []);

  const mockMembers = actualMembers.length > 0 ? actualMembers : ['Loading...'];
  const [selectedBillToPay, setSelectedBillToPay] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [billToDelete, setBillToDelete] = useState(null);

  const confirmDeleteBill = async () => {
    if (!billToDelete) return;
    try {
      const rawId = billToDelete.replace('INV-', '');
      const api = (await import('./api')).default;
      await api.delete(`/admin/bills/${parseInt(rawId, 10)}`);
      setBills(bills.filter(b => b.id !== billToDelete));
      setBillToDelete(null);
    } catch (err) {
      console.error(err);
      alert('Failed to delete bill');
    }
  };

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
  const activeStatusFilter = filter || localStatusFilter;
  
  const filteredBills = bills.filter(b => {
    if (activeStatusFilter !== 'ALL' && activeStatusFilter !== '') {
      if (b.status !== activeStatusFilter) return false;
    }
    if (localTypeFilter !== 'ALL') {
      if (b.type !== localTypeFilter) return false;
    }
    return true;
  });

  const totalDue = filteredBills.filter(b => b.status === 'UNPAID').reduce((sum, b) => sum + parseInt(b.amount.replace(/[₹,]/g, '')), 0);

  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div className="section-label">Billing</div>
            <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
              Bills & payments.<br />
              <span className="muted">Stay on track.</span>
            </h1>
          </div>
          <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Total due</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3rem', lineHeight: 1 }}>₹{totalDue.toLocaleString()}</div>
            </div>
            {localStorage.getItem('role') !== 'RESIDENT' && <button onClick={() => setIsModalOpen(true)} className="btn-pill" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', gap: '6px', userSelect: 'none' }}>
              <Plus size={14} /> Create Bill
            </button>}
          </div>
        </div>
      </FadeInSection>
      {filter && (
        <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
          <button onClick={onClearFilter} className="btn-pill-outline" style={{ padding: '0.3rem 0.8rem', fontSize: '0.75rem', gap: '4px' }}>
            <XCircle size={14} /> Clear Filter
          </button>
        </div>
      )}

      {localStorage.getItem('role') === 'ADMIN' && !filter && (
        <FadeInSection delay={0.1}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.3)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(10px)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Status:</span>
              {['ALL', 'PAID', 'UNPAID'].map(s => (
                <button key={s} onClick={() => setLocalStatusFilter(s)} style={{ background: localStatusFilter === s ? 'var(--text-primary)' : 'transparent', color: localStatusFilter === s ? '#fff' : 'var(--text-primary)', border: '1px solid ' + (localStatusFilter === s ? 'transparent' : '#ccc'), padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {s.charAt(0) + s.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div style={{ width: '1px', background: 'rgba(0,0,0,0.1)', display: 'block' }}></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>Type:</span>
              {['ALL', 'Maintenance', 'Penalty', 'Event Fee'].map(t => (
                <button key={t} onClick={() => setLocalTypeFilter(t)} style={{ background: localTypeFilter === t ? 'var(--text-primary)' : 'transparent', color: localTypeFilter === t ? '#fff' : 'var(--text-primary)', border: '1px solid ' + (localTypeFilter === t ? 'transparent' : '#ccc'), padding: '0.3rem 0.8rem', borderRadius: '99px', fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {t === 'ALL' ? 'All' : t}
                </button>
              ))}
            </div>
          </div>
        </FadeInSection>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', background: 'transparent' }}>
        {filteredBills.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#e3e3e3', borderRadius: '24px', border: '1px dashed #aaa' }}>
            <FileText size={48} color="#999" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a' }}>All clear!</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>No bills found matching your current filters.</p>
          </div>
        ) : (
          filteredBills.map((b, i) => (
          <FadeInSection key={b.id} delay={0.1 * (i + 1)}>
            <div className={`bill-card ${b.status === 'UNPAID' ? 'unpaid' : ''}`}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flex: 1 }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '80px' }}>{b.id}</span>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '1.05rem', marginBottom: '2px' }}>
                    {b.month} · {b.type}
                  </div>
                  {b.description && (
                    <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '2px' }}>
                      {b.description}
                    </div>
                  )}
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    Due {b.dueDate} {localStorage.getItem('role') === 'ADMIN' && b.assignedTo && `· Member: ${b.assignedTo}`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', lineHeight: 1, minWidth: '80px', textAlign: 'right' }}>
                  {b.amount}
                </div>

                {b.status === 'UNPAID' ? (
                  <button className="btn-pill" style={{ gap: '6px' }} onClick={() => { setSelectedBillToPay(b); setIsPaymentModalOpen(true); }}>
                    Pay now <ArrowRight size={14} />
                  </button>
                ) : (
                  <span className="badge badge-success" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                    <Check size={12} /> Paid
                  </span>
                )}
                {localStorage.getItem('role') === 'ADMIN' && (
                  <button onClick={() => setBillToDelete(b.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', transition: 'background 0.2s', marginLeft: '0.5rem' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 77, 79, 0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'none'} title="Delete Bill">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          </FadeInSection>
        )))}
      </div>

      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                New Bill
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={async (e) => { 
              e.preventDefault(); 
              if (!billType || !billAmount || !billMonth) return;
              
              if (billType === 'Penalty' && !selectedMember) {
                alert('Please select a member to penalize.');
                return;
              }

              const m = billMonth ? new Date(billMonth) : new Date();
              const billingMonthStr = billType === 'Penalty' ? `${m.toLocaleString('default', { month: 'long' })} - Penalty` : (billType === 'Event Fee' ? `${m.toLocaleString('default', { month: 'long' })} - Event Fee` : m.toLocaleString('default', { month: 'long' }));
              
              try {
                const api = (await import('./api')).default;
                
                if (billType === 'Penalty') {
                  const req = {
                    residentId: parseInt(selectedMember),
                    billingMonth: billingMonthStr,
                    billingYear: m.getFullYear(),
                    amount: parseFloat(billAmount),
                    dueDate: m.toISOString().split('T')[0]
                  };
                  await api.post('/admin/bills', req);
                } else {
                  const requests = residents.map(res => api.post('/admin/bills', {
                    residentId: res.id,
                    billingMonth: billingMonthStr,
                    billingYear: m.getFullYear(),
                    amount: parseFloat(billAmount),
                    dueDate: m.toISOString().split('T')[0]
                  }));
                  await Promise.all(requests);
                }
                
                // Re-fetch bills
                const endpoint = localStorage.getItem('role') === 'RESIDENT' ? '/bills/my' : '/admin/bills';
                const res = await api.get(endpoint);
                const fetchedBills = res.data.map(b => {
                  const resName = b.resident && b.resident.user ? `${b.resident.user.name} (${b.resident.wing}-${b.resident.flatNumber})` : 'Unknown Resident';
                  return {
                    id: `INV-${String(b.id).padStart(4, '0')}`,
                    month: `${b.billingMonth} ${b.billingYear}`,
                    type: b.billingMonth.includes('Penalty') ? 'Penalty' : (b.billingMonth.includes('Event') ? 'Event Fee' : 'Maintenance'),
                    amount: `₹${b.amount}`,
                    status: b.status === 'PENDING' ? 'UNPAID' : b.status,
                    dueDate: b.dueDate,
                    assignedTo: resName,
                    description: billDescription // Temporarily store in frontend, real system might need a description field in DB
                  };
                });
                setBills(fetchedBills);
                
                setIsModalOpen(false);
                setBillType('Maintenance');
                setBillAmount('');
                setBillMonth('');
                setBillDescription('');
                setSelectedMember('');
              } catch (err) {
                console.error(err);
                alert('Failed to create bill');
              }
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  bill type
                </label>
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: billType ? '#1a1a1a' : '#888' }}
                    onClick={() => { setIsTypeDropdownOpen(!isTypeDropdownOpen); setIsCalendarOpen(false); setIsMemberDropdownOpen(false); }}
                  >
                    <span>{billType || 'Select a type...'}</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isTypeDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {isTypeDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {['Maintenance', 'Penalty', 'Event Fee'].map(type => (
                        <div 
                          key={type}
                          onClick={() => { setBillType(type); setIsTypeDropdownOpen(false); setBillDescription(''); }}
                          style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                          onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {billType === 'Penalty' && (
                <>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                      member to penalize
                    </label>
                      <div style={{ position: 'relative' }}>
                        <div 
                          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: selectedMember ? '#1a1a1a' : '#888' }}
                          onClick={() => { setIsMemberDropdownOpen(!isMemberDropdownOpen); setIsTypeDropdownOpen(false); setIsCalendarOpen(false); }}
                        >
                          <span>
                            {selectedMember ? (() => {
                              const r = residents.find(res => res.id.toString() === selectedMember.toString());
                              return r ? `${r.user?.name} (${r.wing}-${r.flatNumber})` : 'Select a member...';
                            })() : 'Select a member...'}
                          </span>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isMemberDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                          </div>
                        </div>
                        {isMemberDropdownOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden', maxHeight: '250px', overflowY: 'auto' }}>
                            {residents.map(member => (
                              <div 
                                key={member.id}
                                onClick={() => { setSelectedMember(member.id); setIsMemberDropdownOpen(false); }}
                                style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                                onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                              >
                                {member.user?.name} ({member.wing}-{member.flatNumber})
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                  </div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                      penalty description (why)
                    </label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Late payment fee"
                      value={billDescription}
                      onChange={e => setBillDescription(e.target.value)}
                      style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                    />
                  </div>
                </>
              )}

              {billType === 'Event Fee' && (
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    event description
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Diwali Celebration 2023"
                    value={billDescription}
                    onChange={e => setBillDescription(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              )}

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  due date
                </label>
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: billMonth ? '#1a1a1a' : '#888' }}
                    onClick={() => { setIsCalendarOpen(!isCalendarOpen); setIsTypeDropdownOpen(false); }}
                  >
                    <span>{billMonth || 'dd-mm-yyyy'}</span>
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
                          const dateStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                          const isSelected = billMonth === dateStr;
                          return (
                            <button 
                              key={d} 
                              type="button"
                              onClick={() => { setBillMonth(dateStr); setIsCalendarOpen(false); }}
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
              <div style={{ marginBottom: '2rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  amount (₹)
                </label>
                <input 
                  type="number"
                  required
                  min="0"
                  placeholder="e.g. 2500"
                  value={billAmount}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || Number(val) >= 0) setBillAmount(val);
                  }}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={(e) => e.target.style.background = '#1a1d24'} onMouseLeave={(e) => e.target.style.background = '#2c303a'}>
                Generate Bill
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {isPaymentModalOpen && selectedBillToPay && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Payment
              </h2>
              <button onClick={() => { setIsPaymentModalOpen(false); setPaymentMethod(''); setCardNumber(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={async (e) => { 
              e.preventDefault();
              if (!paymentMethod) return;
              if ((paymentMethod === 'creditcard' || paymentMethod === 'debitcard') && !cardNumber) return;
              
              try {
                const api = (await import('./api')).default;
                const rawId = selectedBillToPay.id.replace('INV-', '');
                await api.put(`/bills/${parseInt(rawId)}/pay`);
                
                // Re-fetch bills after payment
                const endpoint = localStorage.getItem('role') === 'RESIDENT' ? '/bills/my' : '/admin/bills';
                const res = await api.get(endpoint);
                const fetchedBills = res.data.map(b => {
                  const resName = b.resident && b.resident.user ? `${b.resident.user.name} (${b.resident.wing}-${b.resident.flatNumber})` : 'Unknown Resident';
                  return {
                    id: `INV-${String(b.id).padStart(4, '0')}`,
                    month: `${b.billingMonth} ${b.billingYear}`,
                    type: 'Maintenance/Penalty',
                    amount: `₹${b.amount}`,
                    status: b.status === 'PENDING' ? 'UNPAID' : b.status,
                    dueDate: b.dueDate,
                    assignedTo: resName,
                    description: ''
                  };
                });
                setBills(fetchedBills);
              } catch(err) {
                console.error('Error paying bill:', err);
                alert('Payment failed');
              }
              
              setIsPaymentModalOpen(false);
              setPaymentMethod('');
              setCardNumber('');
              setSelectedBillToPay(null);
            }}>
              <div style={{ marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 1rem 0', fontWeight: 500 }}>Select Payment Method:</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  {['UPI', 'PhonePe', 'PayPal', 'Credit Card', 'Debit Card', 'Netbanking'].map(method => {
                    const value = method.toLowerCase().replace(' ', '');
                    return (
                      <label key={value} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '0.5rem', background: 'rgba(255,255,255,0.5)', borderRadius: '8px', border: paymentMethod === value ? '1px solid #2c303a' : '1px solid transparent' }}>
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value={value} 
                          checked={paymentMethod === value} 
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: '0.9rem' }}>{method}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {(paymentMethod === 'creditcard' || paymentMethod === 'debitcard') && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    card number
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="Enter 16-digit card number"
                    value={cardNumber}
                    onChange={e => setCardNumber(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              )}

              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} disabled={!paymentMethod}>
                Pay {selectedBillToPay.amount}
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {billToDelete && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Delete Bill
              </h2>
              <button onClick={() => setBillToDelete(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <p style={{ margin: '0 0 2rem 0', fontSize: '0.95rem', color: '#444', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete this bill? This action cannot be undone and will remove the bill for the assigned resident as well.
            </p>
            
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => setBillToDelete(null)} style={{ flex: 1, padding: '0.9rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={e => e.target.style.background = '#d1d1d1'} onMouseLeave={e => e.target.style.background = 'transparent'}>
                Cancel
              </button>
              <button onClick={confirmDeleteBill} style={{ flex: 1, padding: '0.9rem', background: '#ff4d4f', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} onMouseEnter={e => e.target.style.background = '#ff7875'} onMouseLeave={e => e.target.style.background = '#ff4d4f'}>
                Delete
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default Bills;
