import React, { useState } from 'react';
import api from '../axios'; // Use your configured axios instance
import { useAuth } from '../context/AuthContext';

const PartnerSelectionScreen = ({ onSessionStarted }) => {
  // Get user and logout function from your AuthContext
  const { user, logout } = useAuth();

  const [config, setConfig] = useState({
    botName: '',
    botType: 'girlfriend',
    relationshipStage: 'dating',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleLogout = async () => {
    await logout();
    // The App component will handle the view change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config.botName) {
      setError('Please give your partner a name.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // The user ID is sent via the session cookie, so we don't need to pass it
      const { data } = await api.post('/api/ai/session/start', config);
      onSessionStarted(data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start chat.');
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>
          {/* Display the user's name from the context */}
          Hi, {user?.name || 'User'}!
          <button 
            onClick={handleLogout} 
            style={{ fontSize: '0.8rem', marginLeft: '1rem', padding: '4px 8px', cursor: 'pointer' }}
          >
            Logout
          </button>
        </h1>
        <p>Start a new relationship or continue an existing one.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Partner's Name</label>
            <input type="text" name="botName" value={config.botName} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Partner Type</label>
            <select name="botType" value={config.botType} onChange={handleChange}>
              <option value="girlfriend">Girlfriend</option>
              <option value="boyfriend">Boyfriend</option>
            </select>
          </div>
          <div className="form-group">
            <label>Relationship Stage</label>
            <select name="relationshipStage" value={config.relationshipStage} onChange={handleChange}>
              <option value="dating">Dating</option>
              <option value="committed">Committed</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Start Chatting'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PartnerSelectionScreen;
