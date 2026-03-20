import React, { useState } from 'react';
import { Terminal, Copy, Trash2, Edit, Star, Sparkles } from 'lucide-react';
import axios from 'axios';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

const SnippetCard = ({ snippet, onEdit, onDelete, onToggleFavorite }) => {
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(snippet.code);
  };

  const handleExplain = async () => {
    if (explanation) {
      setExplanation(null); 
      return;
    }
    setIsExplaining(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/snippets/${snippet._id}/explain`, {
        headers: { 'x-auth-token': token }
      });
      setExplanation(res.data.explanation);
    } catch (err) {
      alert(err.response?.data?.msg || 'Error connecting to Groq API. Did you put GROQ_API_KEY in backend/.env?');
    } finally {
      setIsExplaining(false);
    }
  };

  return (
    <div className="glass-panel snippet-card">
      <div className="snippet-header">
        <div>
          <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
            <h3 style={{margin: 0, fontWeight: 600}}>{snippet.title}</h3>
          </div>
          <p className="text-muted" style={{marginTop: '0.2rem'}}>{snippet.description}</p>
        </div>
        <div style={{display: 'flex', gap: '0.4rem'}}>
          <button onClick={handleExplain} className="btn-secondary" title="Explain Code" disabled={isExplaining} style={{padding: '0.4rem', color: 'var(--accent)'}}>
            {isExplaining ? <span style={{fontSize: '12px'}}>...</span> : <Sparkles size={16} />}
          </button>
          <button onClick={() => onToggleFavorite(snippet)} className="btn-secondary" title="Favorite" style={{padding: '0.4rem', color: snippet.isFavorite ? '#fbbf24' : 'var(--text-secondary)'}}>
            <Star size={16} fill={snippet.isFavorite ? '#fbbf24' : 'none'} />
          </button>
          <button onClick={handleCopy} className="btn-secondary" title="Copy Code" style={{padding: '0.4rem'}}>
            <Copy size={16} />
          </button>
          <button onClick={() => onEdit(snippet)} className="btn-secondary" title="Edit" style={{padding: '0.4rem'}}>
            <Edit size={16} />
          </button>
          <button onClick={() => onDelete(snippet._id)} className="btn-secondary" title="Delete" style={{padding: '0.4rem', color: 'var(--danger)', borderColor: 'rgba(239,68,68,0.3)'}}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
      
      <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
        <Terminal size={14} color="var(--accent)" />
        <span style={{fontSize: '0.85rem', color: 'var(--accent)', fontWeight: 500, textTransform: 'uppercase'}}>{snippet.language}</span>
      </div>

      <div style={{ flexGrow: 1, textShadow: 'none', maxHeight: '250px', overflowY: 'auto', borderRadius: '8px', border: '1px solid var(--border-light)', backgroundColor: 'rgba(0,0,0,0.4)', marginTop: '0.5rem', marginBottom: '1rem' }}>
        <SyntaxHighlighter 
          language={snippet.language || 'javascript'} 
          style={vscDarkPlus} 
          customStyle={{ margin: 0, padding: '1rem', background: 'transparent', fontSize: '0.9rem' }}
          wrapLongLines={false}
        >
          {snippet.code}
        </SyntaxHighlighter>
      </div>

      {explanation && (
        <div style={{
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: 'rgba(99, 102, 241, 0.1)', 
          borderLeft: '3px solid var(--accent)',
          borderRadius: '4px',
          fontSize: '0.9rem',
          lineHeight: '1.5',
          color: 'var(--text-primary)'
        }}>
          <strong style={{display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)'}}><Sparkles size={14} /> AI Explanation</strong>
          <p style={{marginTop: '0.5rem', whiteSpace: 'pre-wrap'}}>{explanation}</p>
        </div>
      )}

      <div className="tags">
        {snippet.tags && snippet.tags.map(tag => (
          <span key={tag} className="tag">{tag}</span>
        ))}
      </div>
    </div>
  );
};

export default SnippetCard;
