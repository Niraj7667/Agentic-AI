import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './chat.css';

// --- Configuration ---
const API_BASE_URL = 'http://localhost:3001/api';

// --- Main Home Component ---
function Home() {
  const [appState, setAppState] = useState('setup'); // 'setup' or 'chatting'
  const [sessionId, setSessionId] = useState(null);
  const [chatConfig, setChatConfig] = useState(null);
  const [initialMessage, setInitialMessage] = useState(null);

  const handleChatInitialized = (config, newSessionId, message) => {
    setChatConfig(config);
    setSessionId(newSessionId);
    setInitialMessage(message);
    setAppState('chatting');
  };

  return (
    <div className="app-container">
      {appState === 'setup' && <SetupScreen onInitialized={handleChatInitialized} />}
      {appState === 'chatting' && (
        <ChatScreen
          sessionId={sessionId}
          config={chatConfig}
          initialMessage={initialMessage}
        />
      )}
    </div>
  );
}

// --- Setup Screen Component ---
const SetupScreen = ({ onInitialized }) => {
  const [config, setConfig] = useState({
    userName: '',
    botName: '',
    botType: 'girlfriend',
    relationshipStage: 'dating',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!config.userName || !config.botName) {
      setError('Please fill in your name and your partner\'s name.');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_BASE_URL}/initialize`, config);
      onInitialized(config, data.sessionId, data.initialMessage);
    } catch (err) {
      console.error(err);
      setError('Failed to start the chat. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-card">
        <h1>Create Your AI Partner</h1>
        <p>Let's set up the perfect partner for you.</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="userName">Your Name</label>
            <input type="text" id="userName" name="userName" value={config.userName} onChange={handleChange} placeholder="e.g., Alex" required />
          </div>
          <div className="form-group">
            <label htmlFor="botName">Your Partner's Name</label>
            <input type="text" id="botName" name="botName" value={config.botName} onChange={handleChange} placeholder="e.g., Chloe" required />
          </div>
          <div className="form-group">
            <label htmlFor="botType">Partner Type</label>
            <select id="botType" name="botType" value={config.botType} onChange={handleChange}>
              <option value="girlfriend">Girlfriend</option>
              <option value="boyfriend">Boyfriend</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="relationshipStage">Relationship Stage</label>
            <select id="relationshipStage" name="relationshipStage" value={config.relationshipStage} onChange={handleChange}>
              <option value="dating">Dating</option>
              <option value="committed">Committed</option>
              <option value="engaged">Engaged</option>
              <option value="married">Married</option>
            </select>
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Initializing...' : 'Start Chatting'}
          </button>
        </form>
      </div>
    </div>
  );
};


// --- Chat Screen Component ---
const ChatScreen = ({ sessionId, config, initialMessage }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Function to scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effect to load initial history and set up the chat
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/chat/${sessionId}/history`);
        // The last message in history is the initial greeting, so we don't need to add it again.
        if (data.length > 1) {
          setMessages(data.slice(0, -1)); // Load all but the last message
        }
        setMessages(prev => [...prev, initialMessage]); // Add the fresh initial message
      } catch (err) {
        console.error(err);
        setError('Could not load our chat history. 😔');
        setMessages([initialMessage]); // At least show the greeting
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [sessionId, initialMessage]);

  // Effect to scroll when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage = { role: 'user', content: userInput, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMessage]);
    setUserInput('');
    setIsLoading(true);
    setError(null);

    try {
      const { data } = await axios.post(`${API_BASE_URL}/chat/${sessionId}`, {
        userInput,
      });
      const botMessage = { role: 'model', content: data.text, timestamp: new Date().toISOString() };
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setError('Oh no, something went wrong! 😔 Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>💬 Chat with {config.botName}</h2>
        <p>Session ID: {sessionId}</p>
      </div>
      <div className="chat-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role === 'user' ? 'user' : 'model'}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && (
          <div className="message model typing-indicator">
            <p>{config.botName} is typing...</p>
          </div>
        )}
        {error && <div className="message error"><p>{error}</p></div>}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input-form" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Say something..."
          aria-label="Your message"
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
};

export default Home;
