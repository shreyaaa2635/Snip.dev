import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand" style={{textDecoration: 'none'}}>
        <Code2 size={28} color="#8b5cf6" />
        Snip.dev
      </Link>
      <div className="nav-links">
        {user ? (
          <>
            <span className="text-muted">Hey, {user.username}!!</span>
            <button className="btn-secondary" onClick={handleLogout} style={{padding: '0.4rem 1rem'}}>
              <LogOut size={16} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/signup" className="btn-primary" style={{textDecoration: 'none'}}>Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
