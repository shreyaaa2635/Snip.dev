import React, { useState, useEffect, useRef } from 'react';
import { X, Save, ChevronDown } from 'lucide-react';

const SnippetEditor = ({ snippet, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    language: 'javascript',
    code: '',
    tags: ''
  });
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const languages = [
    { id: 'javascript', label: 'JavaScript' },
    { id: 'python', label: 'Python' },
    { id: 'css', label: 'CSS' },
    { id: 'html', label: 'HTML' },
    { id: 'go', label: 'Go' },
    { id: 'rust', label: 'Rust' },
    { id: 'java', label: 'Java' },
    { id: 'csharp', label: 'C#' },
    { id: 'sql', label: 'SQL' },
    { id: 'bash', label: 'Bash' }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (snippet) {
      setFormData({
        title: snippet.title,
        description: snippet.description || '',
        language: snippet.language,
        code: snippet.code,
        tags: snippet.tags ? snippet.tags.join(', ') : ''
      });
    }
  }, [snippet]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 100,
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem'}}>
          <h2 style={{margin: 0}}>{snippet ? 'Edit Snippet' : 'Create Snippet'}</h2>
          <button onClick={onClose} className="btn-secondary" style={{padding: '0.5rem', border: 'none'}}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem'}}>
            <div>
              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Title</label>
              <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g., Fetch Data" />
            </div>
            <div ref={dropdownRef} style={{ position: 'relative' }}>
              <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Language</label>
              
              <div 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                style={{
                  width: '100%', padding: '0.75rem 1rem', backgroundColor: 'rgba(0,0,0,0.3)',
                  border: '1px solid var(--border-light)', borderRadius: '8px',
                  color: 'var(--text-primary)', cursor: 'pointer', display: 'flex', 
                  justifyContent: 'space-between', alignItems: 'center', userSelect: 'none'
                }}
              >
                <span>{languages.find(l => l.id === formData.language)?.label || 'Select'}</span>
                <ChevronDown size={16} color="var(--text-secondary)" style={{ transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
              </div>

              {isDropdownOpen && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '0.5rem',
                  backgroundColor: '#18181b', border: '1px solid var(--border-light)', 
                  borderRadius: '8px', zIndex: 110, maxHeight: '200px', overflowY: 'auto',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
                }}>
                  {languages.map(lang => (
                    <div 
                      key={lang.id}
                      onClick={() => {
                        setFormData({...formData, language: lang.id});
                        setIsDropdownOpen(false);
                      }}
                      style={{
                        padding: '0.75rem 1rem', cursor: 'pointer', fontSize: '0.95rem',
                        backgroundColor: formData.language === lang.id ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
                        color: formData.language === lang.id ? '#c4b5fd' : 'var(--text-primary)',
                        transition: 'background 0.1s'
                      }}
                      onMouseEnter={e => {
                        if (formData.language !== lang.id) e.target.style.backgroundColor = 'rgba(255,255,255,0.05)';
                      }}
                      onMouseLeave={e => {
                        if (formData.language !== lang.id) e.target.style.backgroundColor = 'transparent';
                      }}
                    >
                      {lang.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Description (Optional)</label>
            <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} placeholder="Brief description of the snippet" />
          </div>

          <div style={{marginBottom: '1rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Code</label>
            <textarea 
              required 
              rows={12} 
              value={formData.code} 
              onChange={e => setFormData({...formData, code: e.target.value})} 
              placeholder="Paste your code here..."
              style={{fontFamily: 'monospace', resize: 'vertical'}}
            />
          </div>

          <div style={{marginBottom: '1.5rem'}}>
            <label style={{display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Tags (Comma separated)</label>
            <input type="text" value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="react, hooks, api" />
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', gap: '1rem'}}>
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">
              <Save size={18} /> Save Snippet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SnippetEditor;
