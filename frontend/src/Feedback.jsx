import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { MessageSquare, Send, CheckCircle, Quote, User, Trash2, AlertCircle } from 'lucide-react';

const Feedback = () => {
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const role = localStorage.getItem('role');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);

  React.useEffect(() => {
    if (role === 'ADMIN') {
      import('./api').then(({ default: api }) => {
        api.get('/society-feedback')
           .then(res => setFeedbacks(res.data))
           .catch(err => console.error(err));
      });
    }
  }, [role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    try {
      const api = (await import('./api')).default;
      await api.post('/society-feedback', { text: feedback });
      setSubmitted(true);
      setTimeout(() => {
        setFeedback('');
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      alert('Failed to submit feedback');
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
    setDeleteConfirmStep(1);
  };

  if (role === 'ADMIN') {
    return (
      <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <div className="section-label">Feedback</div>
          <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
            Society Voices.<br />
            <span className="muted">What people are saying.</span>
          </h1>
        </div>

        {feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 2rem', background: '#e3e3e3', borderRadius: '24px', border: '1px dashed #aaa' }}>
            <MessageSquare size={48} color="#999" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a' }}>No feedback yet</h3>
            <p style={{ color: '#666', margin: 0, fontSize: '0.95rem' }}>When users submit feedback, it will appear here.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1.5rem' }}>
            {feedbacks.map(fb => (
              <div key={fb.id} style={{ background: '#e3e3e3', padding: '1.5rem 2rem', borderRadius: '16px', border: '1px solid #d1d1d1' }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Quote size={24} color="#666" style={{ marginTop: '0.25rem', opacity: 0.5 }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '1.1rem', color: '#1a1a1a', lineHeight: 1.6, marginBottom: '1rem', fontStyle: 'italic' }}>
                      "{fb.text}"
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#666' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><User size={14} /> {fb.author}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span>{new Date(fb.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        <button onClick={() => handleDelete(fb.id)} style={{ background: 'none', border: 'none', color: '#ff4d4f', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'opacity 0.2s' }} onMouseEnter={e => e.currentTarget.style.opacity = '0.7'} onMouseLeave={e => e.currentTarget.style.opacity = '1'} title="Delete Feedback">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {deleteConfirmStep > 0 && createPortal(
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99900, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', maxWidth: '400px', padding: '2rem', background: '#e3e3e3', border: '1px solid #d1d1d1', borderRadius: '24px', color: '#1a1a1a', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'Georgia, serif', fontSize: '1.5rem', fontWeight: 600, margin: '0 0 1rem 0', letterSpacing: '-0.5px' }}>
                {deleteConfirmStep === 1 ? 'Delete Feedback?' : 'Are you absolutely sure?'}
              </h2>
              <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
                {deleteConfirmStep === 1 
                  ? 'Are you sure you want to remove this feedback from the society voices?' 
                  : 'This action cannot be undone. This feedback will be permanently lost.'}
              </p>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button 
                  onClick={() => { setDeleteConfirmStep(0); setDeleteConfirmId(null); }} 
                  style={{ flex: 1, padding: '0.8rem', background: 'transparent', color: '#1a1a1a', border: '1px solid #ccc', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button 
                  onClick={async () => {
                    if (deleteConfirmStep === 1) {
                      setDeleteConfirmStep(2);
                    } else {
                      try {
                        const api = (await import('./api')).default;
                        await api.delete(`/society-feedback/${deleteConfirmId}`);
                        setFeedbacks(feedbacks.filter(f => f.id !== deleteConfirmId));
                      } catch (err) {
                        console.error('Failed to delete feedback', err);
                        alert('Failed to delete feedback');
                      }
                      setDeleteConfirmStep(0);
                      setDeleteConfirmId(null);
                    }
                  }} 
                  style={{ flex: 1, padding: '0.8rem', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '99px', fontSize: '0.95rem', fontWeight: 500, cursor: 'pointer' }}
                >
                  {deleteConfirmStep === 1 ? 'Yes, Delete' : 'Confirm Deletion'}
                </button>
              </div>
            </div>
          </div>
        , document.body)}

      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <div className="section-label">Feedback</div>
        <h1 className="display-heading" style={{ marginBottom: '0.5rem' }}>
          We value your voice.<br />
          <span className="muted">Help us improve.</span>
        </h1>
      </div>

      <div style={{ background: '#e3e3e3', padding: '2rem', borderRadius: '24px', border: '1px solid #d1d1d1' }}>
        {submitted ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', color: '#16a34a' }}>
            <CheckCircle size={48} style={{ marginBottom: '1rem' }} />
            <h3 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: '1.5rem', color: '#1a1a1a' }}>Thank you!</h3>
            <p style={{ color: '#666', marginTop: '0.5rem' }}>Your feedback has been submitted successfully.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'monospace', fontSize: '0.85rem', color: '#666', marginBottom: '1rem', fontWeight: 500 }}>
                <MessageSquare size={16} /> Share your thoughts, suggestions, or issues
              </label>
              <textarea
                rows={6}
                placeholder="What's on your mind?..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                style={{ width: '100%', padding: '1rem', background: 'transparent', border: '1px solid #ccc', borderRadius: '12px', fontSize: '1rem', color: '#1a1a1a', resize: 'vertical', fontFamily: 'inherit', outline: 'none' }}
                required
              />
            </div>
            <button type="submit" className="btn-pill" style={{ padding: '0.8rem 2rem', gap: '8px' }}>
              Submit Feedback <Send size={16} />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Feedback;
