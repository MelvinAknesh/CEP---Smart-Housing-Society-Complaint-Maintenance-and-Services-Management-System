import React, { useState, useRef, useEffect } from 'react';
import { Plus, Eye, UserCheck, UserX, ChevronDown, XCircle, Edit2, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';
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

const Members = () => {
  const [members, setMembers] = useState([]);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const fetchMembers = async () => {
    try {
      const [usersRes, approvedRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/approved-members')
      ]);
      
      const registeredUsers = usersRes.data.map(u => ({
        id: u.role === 'RESIDENT' ? `R-${u.id}` : (u.role === 'ADMIN' ? `A-${u.id}` : `W-${u.id}`),
        rawId: u.id,
        name: u.name,
        role: u.role,
        email: u.email,
        status: u.active ? 'ACTIVE' : 'INACTIVE',
        phone: u.phone
      }));

      const pendingUsers = approvedRes.data
        .filter(a => !a.registered)
        .map(a => ({
          id: `P-${a.id}`,
          rawId: a.id,
          name: a.fullName,
          role: a.role,
          email: a.email,
          status: 'PENDING',
          phone: a.phone
        }));

      setMembers([...registeredUsers, ...pendingUsers]);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newMemberRole, setNewMemberRole] = useState('Resident');
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberRoom, setNewMemberRoom] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [editingMember, setEditingMember] = useState(null);





  return (
    <div style={{ width: '100%', maxWidth: '1100px' }}>
      <FadeInSection>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem' }}>
          <div>
            <div className="section-label">Directory</div>
            <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
              Society members.<br />
              <span className="muted">Your community.</span>
            </h1>
          </div>
        </div>
      </FadeInSection>

      <FadeInSection delay={0.15}>
        <div className="data-table-wrapper">
          <div className="data-table-header">
            <h3>All Members</h3>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {members.length} total
            </span>
          </div>

          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Role</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{m.id}</td>
                  <td style={{ fontWeight: 500 }}>{m.name}</td>
                  <td>
                    <span className={`badge-role ${m.role === 'ADMIN' ? 'admin' : ''}`}>
                      {m.role}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{m.email}</td>
                  <td>
                    <span className={`badge ${m.status === 'ACTIVE' ? 'badge-success' : 'badge-neutral'}`}>
                      {m.status === 'ACTIVE' ? <UserCheck size={11} /> : <UserX size={11} />}
                      {m.status}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <button className="btn-pill-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', gap: '5px' }} onClick={() => setSelectedMember(m)}>
                      <Eye size={13} /> Details
                    </button>
                      <button className="btn-pill-outline" style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', gap: '5px' }} onClick={() => setEditingMember(m)}>
                        <Edit2 size={13} /> Edit
                      </button>

                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="data-table-footer">
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', animation: 'pulse-dot 2s ease-in-out infinite' }}></span>
            Directory synced
          </div>
        </div>
      </FadeInSection>
      {isModalOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Add Member
              </h2>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div className="add-member-form">
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  role
                </label>
                <div style={{ position: 'relative' }}>
                  <div 
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', userSelect: 'none', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: newMemberRole ? '#1a1a1a' : '#888' }}
                    onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                  >
                    <span>{newMemberRole}</span>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <ChevronDown size={14} style={{ color: '#1a1a1a', transform: isRoleDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </div>
                  </div>
                  {isRoleDropdownOpen && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '4px', background: '#f5f5f5', border: '1px solid #ccc', borderRadius: '8px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                      {['Resident', 'Worker'].map(r => (
                        <div 
                          key={r}
                          onClick={() => { setNewMemberRole(r); setIsRoleDropdownOpen(false); }}
                          style={{ padding: '0.8rem 1rem', cursor: 'pointer', fontSize: '0.95rem', color: '#1a1a1a', borderBottom: '1px solid #eaeaea' }}
                          onMouseEnter={(e) => e.target.style.background = '#e3e3e3'}
                          onMouseLeave={(e) => e.target.style.background = 'transparent'}
                        >
                          {r}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  full name
                </label>
                <input 
                  type="text"
                  required
                  placeholder="e.g. Melvin Aknesh"
                  value={newMemberName}
                  onChange={e => setNewMemberName(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  email address
                </label>
                <input 
                  type="email"
                  required
                  placeholder="e.g. melvin@society.com"
                  value={newMemberEmail}
                  onChange={e => setNewMemberEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  phone number
                </label>
                <input 
                  type="tel"
                  required
                  placeholder="e.g. +91 9876543210"
                  value={newMemberPhone}
                  onChange={e => setNewMemberPhone(e.target.value)}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              {newMemberRole === 'Resident' && (
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                    room no
                  </label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. R-103"
                    value={newMemberRoom}
                    onChange={e => setNewMemberRoom(e.target.value)}
                    style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                  />
                </div>
              )}
              <div style={{ marginBottom: newMemberRole !== 'Resident' ? '2rem' : '0' }}></div>
              <button 
                type="button" 
                style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', userSelect: 'none' }} 
                onMouseEnter={(e) => e.target.style.background = '#1a1d24'} 
                onClick={async () => {
                  if (!newMemberName || !newMemberEmail || !newMemberPhone) {
                    alert("Please fill in all required fields.");
                    return;
                  }
                  if (newMemberRole === 'Resident' && !newMemberRoom) {
                    alert("Please provide a room number for residents.");
                    return;
                  }

                  let wing = null;
                  let flatNumber = null;
                  if (newMemberRole === 'Resident') {
                    const parts = newMemberRoom.split('-');
                    if (parts.length >= 2) {
                      wing = parts[0];
                      flatNumber = parts[1];
                    } else {
                      flatNumber = newMemberRoom;
                    }
                  }

                  try {
                    await api.post('/admin/approved-members', {
                      fullName: newMemberName,
                      email: newMemberEmail,
                      phone: newMemberPhone,
                      role: newMemberRole.toUpperCase(),
                      wing: wing,
                      flatNumber: flatNumber
                    });
                    
                    showToast('Member pre-approved successfully! They can now sign up using this email.');
                    setIsModalOpen(false);
                    setNewMemberRole('Resident');
                    setNewMemberName('');
                    setNewMemberEmail('');
                    setNewMemberPhone('');
                    setNewMemberRoom('');
                    // Refresh the list immediately so they appear as PENDING
                    await fetchMembers();
                  } catch (err) {
                    console.error(err);
                    showToast(err.response?.data?.error || err.response?.data?.message || 'Failed to add member', 'error');
                  }
                }}
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {selectedMember && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Member Details
              </h2>
              <button onClick={() => setSelectedMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>id</label>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedMember.id}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>name</label>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedMember.name}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>email</label>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedMember.email}</div>
              </div>
              <div>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>phone</label>
                <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedMember.phone || 'N/A'}</div>
              </div>
              {selectedMember.role === 'RESIDENT' && (
                <div>
                  <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>room no</label>
                  <div style={{ fontSize: '1.05rem', fontWeight: 500 }}>{selectedMember.id}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      , document.body)}

      {editingMember && createPortal(
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '450px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', alignItems: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.75rem', fontWeight: 600, margin: 0, letterSpacing: '-0.5px' }}>
                Edit Member
              </h2>
              <button onClick={() => setEditingMember(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' }}>
                <XCircle size={20} strokeWidth={1.5} />
              </button>
            </div>
            
            <form onSubmit={(e) => { 
              e.preventDefault(); 
              setMembers(members.map(m => m.id === editingMember.id ? editingMember : m));
              setEditingMember(null);
            }}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  full name
                </label>
                <input 
                  type="text"
                  required
                  value={editingMember.name}
                  onChange={e => setEditingMember({...editingMember, name: e.target.value})}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  id {editingMember.role === 'RESIDENT' ? '/ room no' : ''}
                </label>
                <input 
                  type="text"
                  required
                  value={editingMember.id}
                  onChange={e => setEditingMember({...editingMember, id: e.target.value})}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#1a1a1a', outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  email address
                </label>
                <input 
                  type="email"
                  readOnly
                  value={editingMember.email}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.05)', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#666', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' }}
                />
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '0.5rem', fontWeight: 500 }}>
                  phone number
                </label>
                <input 
                  type="tel"
                  readOnly
                  value={editingMember.phone}
                  style={{ width: '100%', padding: '0.85rem 1rem', background: 'rgba(0,0,0,0.05)', border: '1px solid #ccc', borderRadius: '4px', fontSize: '0.95rem', color: '#666', outline: 'none', fontFamily: 'inherit', cursor: 'not-allowed' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.9rem', background: '#2c303a', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '1rem', fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s', marginTop: '1rem' }} onMouseEnter={(e) => e.target.style.background = '#1a1d24'} onMouseLeave={(e) => e.target.style.background = '#2c303a'}>
                Save Changes
              </button>
            </form>
          </div>
        </div>
      , document.body)}



      {toast && createPortal(
        <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', background: toast.type === 'error' ? '#ef4444' : '#16a34a', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', zIndex: 999999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '12px', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 500, animation: 'slideInUp 0.3s ease-out' }}>
          {toast.type === 'success' ? <UserCheck size={18} /> : <XCircle size={18} />}
          {toast.message}
        </div>
      , document.body)}
    </div>
  );
};

export default Members;
