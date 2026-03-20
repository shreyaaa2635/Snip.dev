import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';
import SnippetCard from '../components/SnippetCard';
import SnippetEditor from '../components/SnippetEditor';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const [snippets, setSnippets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingSnippet, setEditingSnippet] = useState(null);
  const [filterTag, setFilterTag] = useState('');
  const [error, setError] = useState(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [semanticSearchQuery, setSemanticSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSemanticResult, setIsSemanticResult] = useState(false);

  const fetchSnippets = async () => {
    try {
      setIsSemanticResult(false);
      const res = await axios.get('/api/snippets');
      setSnippets(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch snippets');
      setLoading(false);
    }
  };

  const handleSemanticSearch = async (e) => {
    e.preventDefault();
    if (!semanticSearchQuery.trim()) {
      fetchSnippets();
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`/api/snippets/semantic-search?q=${encodeURIComponent(semanticSearchQuery)}`);
      setSnippets(res.data);
      setIsSemanticResult(true);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.msg || 'Error performing semantic search');
    }
    setIsSearching(false);
  };

  useEffect(() => {
    fetchSnippets();
  }, []);

  const handleSave = async (snippetData) => {
    try {
      if (editingSnippet) {
        await axios.put(`/api/snippets/${editingSnippet._id}`, snippetData);
      } else {
        await axios.post('/api/snippets', snippetData);
      }
      setShowEditor(false);
      setEditingSnippet(null);
      fetchSnippets();
    } catch (err) {
      console.error(err);
      alert('Error saving snippet');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this snippet?')) {
      try {
        await axios.delete(`/api/snippets/${id}`);
        setSnippets(snippets.filter(s => s._id !== id));
      } catch (err) {
        console.error(err);
        alert('Error deleting snippet');
      }
    }
  };

  const handleToggleFavorite = async (snippet) => {
    try {
      await axios.put(`/api/snippets/${snippet._id}`, { isFavorite: !snippet.isFavorite });
      setSnippets(snippets.map(s => s._id === snippet._id ? { ...s, isFavorite: !s.isFavorite } : s));
    } catch (err) {
      console.error(err);
      alert('Error toggling favorite status');
    }
  };

  const openNewEditor = () => {
    setEditingSnippet(null);
    setShowEditor(true);
  };

  const openEditEditor = (snippet) => {
    setEditingSnippet(snippet);
    setShowEditor(true);
  };

  const filteredSnippets = filterTag 
    ? snippets.filter(s => s.tags?.some(tag => tag.toLowerCase().includes(filterTag.toLowerCase())) || s.language.includes(filterTag.toLowerCase()))
    : snippets;

  const displaySnippets = showFavoritesOnly 
    ? filteredSnippets.filter(s => s.isFavorite) 
    : filteredSnippets;

  const sortedSnippets = isSemanticResult 
    ? displaySnippets 
    : [...displaySnippets].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (loading) return <div style={{textAlign: 'center', marginTop: '4rem'}}>Loading...</div>;

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
        <div>
          <h1 style={{fontSize: '2rem', fontWeight: 700, margin: 0}}>Your Snippets</h1>
          <p className="text-muted" style={{marginTop: '0.5rem'}}>Manage and organize your essential code blocks</p>
        </div>
        <div style={{display: 'flex', gap: '1rem'}}>
          <button 
            className="btn-secondary" 
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            style={{ 
              color: '#fbbf24',
              borderColor: showFavoritesOnly ? '#fbbf24' : 'rgba(251, 191, 36, 0.4)'
            }}
          >
            {showFavoritesOnly ? 'Show All' : 'Favorites Only'}
          </button>
          <button className="btn-primary" onClick={openNewEditor}>
            <Plus size={20} /> New Snippet
          </button>
        </div>
      </div>

      <div style={{display: 'flex', gap: '1rem', marginBottom: '2rem'}}>
        <input 
          type="text" 
          placeholder="Filter by language or tag..." 
          value={filterTag} 
          onChange={e => setFilterTag(e.target.value)}
          style={{ flex: 1 }}
        />
        <form onSubmit={handleSemanticSearch} style={{ display: 'flex', flex: 2, gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="Semantic Search (e.g. 'fast sorting algo')..." 
            value={semanticSearchQuery}
            onChange={e => setSemanticSearchQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={isSearching}>
            {isSearching ? '...' : 'Search'}
          </button>
        </form>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {sortedSnippets.length === 0 ? (
        <div className="glass-panel" style={{textAlign: 'center', padding: '4rem', marginTop: '2rem'}}>
          <h3 style={{color: 'var(--text-secondary)', fontWeight: 400}}>No snippets found. Start by creating one!</h3>
        </div>
      ) : (
        <div className="snippet-grid">
          {sortedSnippets.map(snippet => (
            <SnippetCard 
              key={snippet._id} 
              snippet={snippet} 
              onEdit={openEditEditor}
              onDelete={handleDelete}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </div>
      )}

      {showEditor && (
        <SnippetEditor 
          snippet={editingSnippet} 
          onSave={handleSave} 
          onClose={() => {setShowEditor(false); setEditingSnippet(null);}} 
        />
      )}
    </div>
  );
};

export default Dashboard;
