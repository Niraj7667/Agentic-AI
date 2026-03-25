import React, { useState, useEffect, useRef } from 'react';
import api from '../axios'; // Use your configured axios instance

// Loading skeleton component
const ChatSkeleton = () => (
  <>
    <div className="message model skeleton">
      <p>Loading...</p>
    </div>
    <div className="message user skeleton">
      <p>Please wait</p>
    </div>
    <div className="message model skeleton">
      <p>while we retrieve your history.</p>
    </div>
  </>
);

const ChatScreen = ({ sessionConfig, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState(null);
  const [userInput, setUserInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const lastMessageCountRef = useRef(0);
  const inputRef = useRef(null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ✅ Improved function to check if user is near bottom
  const isUserAtBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return true;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const threshold = isMobile ? 150 : 100; // Larger threshold on mobile
    return scrollHeight - scrollTop - clientHeight < threshold;
  };

  // ✅ Smooth scroll to bottom function
  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScroll) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  };

  // ✅ Handle scroll events to determine auto-scroll behavior
  const handleScroll = () => {
    const isAtBottom = isUserAtBottom();
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    const loadContext = async () => {
      if (!sessionConfig.sessionId) return;
      setIsHistoryLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/api/ai/chat/${sessionConfig.sessionId}/context`);
        setSummary(data.summary);
        setMessages(data.recentMessages);
        lastMessageCountRef.current = data.recentMessages.length;
      } catch (err) {
        console.error("Context fetch error:", err);
        setError("Could not load chat context.");
      } finally {
        setIsHistoryLoading(false);
      }
    };
    loadContext();
  }, [sessionConfig.sessionId]);

  // ✅ Auto-scroll when messages change
  useEffect(() => {
    const currentMessageCount = messages.length;
    const previousMessageCount = lastMessageCountRef.current;

    if (!isHistoryLoading) {
      if (currentMessageCount > previousMessageCount || shouldAutoScroll) {
        scrollToBottom();
      }
    }

    lastMessageCountRef.current = currentMessageCount;
  }, [messages, isHistoryLoading, shouldAutoScroll]);

  // ✅ Scroll to bottom after history loads
  useEffect(() => {
    if (!isHistoryLoading && messages.length > 0) {
      scrollToBottom(true);
    }
  }, [isHistoryLoading]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || isSending) return;

    const tempId = Date.now();
    const userMessage = { id: tempId, role: 'user', content: userInput };
    
    // ✅ Always auto-scroll when user sends a message
    setShouldAutoScroll(true);
    setMessages((prev) => [...prev, userMessage]);

    const currentInput = userInput;
    setUserInput('');
    setIsSending(true);
    setError(null);

    // Blur input on mobile to hide keyboard
    if (isMobile && inputRef.current) {
      inputRef.current.blur();
    }

    try {
      const { data } = await api.post(`/api/ai/chat/${sessionConfig.sessionId}`, { userInput: currentInput });
      const botMessage = { role: 'model', content: data.text };
      
      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error("Send message error:", err);
      setError("Failed to send message. Please try again.");
      setMessages(prev => prev.filter(m => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  // Handle input focus on mobile
  const handleInputFocus = () => {
    if (isMobile) {
      // Scroll to bottom when input is focused on mobile
      setTimeout(() => {
        scrollToBottom(true);
      }, 300); // Wait for keyboard animation
    }
  };

  const chatContainerStyle = {
    width: '100%',
    maxWidth: isMobile ? '100%' : '800px',
    height: isMobile ? '100vh' : '90vh',
    maxHeight: isMobile ? '100vh' : '850px',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--card-background)',
    borderRadius: isMobile ? '0' : '20px',
    boxShadow: isMobile ? 'none' : '0 10px 40px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    border: isMobile ? 'none' : '1px solid rgba(255, 255, 255, 0.2)',
  };

  const chatHeaderStyle = {
    padding: isMobile ? '1rem 1.25rem' : '1.25rem 1.75rem',
    borderBottom: '1px solid var(--border-color)',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.7)',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    minHeight: isMobile ? '60px' : '80px',
  };

  const backButtonStyle = {
    position: 'absolute',
    left: isMobile ? '1.25rem' : '1.75rem',
    background: 'none',
    border: 'none',
    fontSize: isMobile ? '1.25rem' : '1.5rem',
    cursor: 'pointer',
    color: 'var(--light-text-color)',
    transition: 'color 0.3s ease',
    padding: isMobile ? '0.5rem' : '0.25rem',
    minWidth: isMobile ? '44px' : 'auto', // Minimum touch target size
    minHeight: isMobile ? '44px' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const headerTitleStyle = {
    margin: 0,
    fontSize: isMobile ? '1.2rem' : '1.5rem',
    fontWeight: 600,
    color: 'var(--text-color)',
    maxWidth: isMobile ? 'calc(100% - 100px)' : 'none',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const messagesStyle = {
    flex: 1,
    padding: isMobile ? '1rem' : '1.5rem 2rem',
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    gap: isMobile ? '1rem' : '1.25rem',
    opacity: isHistoryLoading ? 0 : 1,
    transition: 'opacity 0.5s ease-in-out',
    minHeight: 0,
    scrollbarWidth: 'thin',
    scrollbarColor: '#cbd5e0 transparent',
    // Mobile-specific scrolling improvements
    WebkitOverflowScrolling: 'touch',
  };

  const inputFormStyle = {
    display: 'flex',
    padding: isMobile ? '1rem' : '1.25rem 1.75rem',
    borderTop: '1px solid var(--border-color)',
    gap: isMobile ? '0.5rem' : '1rem',
    background: 'rgba(255, 255, 255, 0.7)',
    flexShrink: 0,
    minHeight: isMobile ? '70px' : '80px',
    alignItems: 'center',
    // Prevent zoom on iOS
    fontSize: isMobile ? '16px' : '1rem',
  };

  const inputStyle = {
    flex: 1,
    border: '1px solid var(--border-color)',
    borderRadius: '25px',
    padding: isMobile ? '0.8rem 1rem' : '0.9rem 1.25rem',
    fontSize: isMobile ? '16px' : '1rem', // Prevent zoom on iOS
    transition: 'all 0.3s ease',
    background: '#f8f9fa',
    minHeight: isMobile ? '44px' : 'auto', // Minimum touch target
  };

  const sendButtonStyle = {
    border: 'none',
    background: 'var(--primary-color)',
    color: 'white',
    padding: isMobile ? '0.8rem 1rem' : '0.9rem 1.75rem',
    borderRadius: '25px',
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flexShrink: 0,
    minWidth: isMobile ? '60px' : 'auto',
    minHeight: isMobile ? '44px' : 'auto', // Minimum touch target
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return (
    <div style={{
      ...chatContainerStyle,
      display: 'flex',
      flexDirection: 'column',
      height: isMobile ? '100dvh' : '90vh',
      boxShadow: isMobile ? 'none' : chatContainerStyle.boxShadow,
      borderRadius: isMobile ? '0' : chatContainerStyle.borderRadius,
      border: isMobile ? 'none' : chatContainerStyle.border,
      position: 'relative',
    }}>
      {/* Header */}
      <div style={{
        ...chatHeaderStyle,
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(255,255,255,0.85)',
        borderTopLeftRadius: isMobile ? 0 : 20,
        borderTopRightRadius: isMobile ? 0 : 20,
        boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.04)' : 'none',
      }}>
        <button 
          onClick={onBack} 
          style={backButtonStyle}
          aria-label="Back"
        >
          ←
        </button>
        <h2 style={headerTitleStyle}>Chat with {sessionConfig.botName}</h2>
      </div>

      {/* Chat area */}
      <div
        style={{
          ...messagesStyle,
          flex: 1,
          paddingBottom: isMobile ? '90px' : '1.5rem', // leave space for sticky input
          background: 'transparent',
        }}
        ref={messagesContainerRef}
        className={`chat-messages whatsapp-chat ${!isHistoryLoading ? 'loaded' : ''}`}
      >
        {isHistoryLoading ? (
          <ChatSkeleton />
        ) : (
          <>
            {summary && (
              <div className="summary-message" style={{
                alignSelf: 'center',
                maxWidth: '90%',
                marginBottom: '1rem',
              }}>
                <p style={{
                  background: '#fff3cd',
                  color: '#856404',
                  border: '1px solid #ffeaa7',
                  padding: '0.8rem 1.2rem',
                  borderRadius: '15px',
                  textAlign: 'center',
                  fontStyle: 'italic',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                  margin: 0,
                  fontSize: isMobile ? '0.9rem' : '1rem',
                }}>
                  ✨ {summary}
                </p>
              </div>
            )}
            {messages.map((msg, idx) => (
              <div 
                key={msg.id || idx} 
                className={`message-bubble ${msg.role} whatsapp-bubble`}
                style={{
                  display: 'flex',
                  maxWidth: isMobile ? '85%' : '80%',
                  animation: 'fadeIn 0.5s ease',
                  flexShrink: 0,
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  marginBottom: '0.25rem',
                }}
              >
                <p style={{
                  margin: 0,
                  padding: isMobile ? '0.7rem 1.1rem' : '0.9rem 1.3rem',
                  borderRadius: '18px',
                  lineHeight: '1.7',
                  wordBreak: 'break-word',
                  boxShadow: msg.role === 'user'
                    ? '0 1px 2px rgba(106,130,251,0.10)' : '0 1px 2px rgba(0,0,0,0.06)',
                  fontSize: isMobile ? '1rem' : '1.05rem',
                  background: msg.role === 'user' 
                    ? 'var(--user-bubble-gradient)' 
                    : 'var(--model-bubble-color)',
                  color: msg.role === 'user' ? 'white' : 'var(--model-text-color)',
                  borderBottomLeftRadius: msg.role === 'model' ? '6px' : '18px',
                  borderBottomRightRadius: msg.role === 'user' ? '6px' : '18px',
                  borderTopRightRadius: msg.role === 'user' ? '6px' : '18px',
                  borderTopLeftRadius: msg.role === 'model' ? '6px' : '18px',
                  minWidth: '40px',
                  minHeight: '32px',
                  position: 'relative',
                }}>
                  {msg.content}
                </p>
              </div>
            ))}
          </>
        )}

        {isSending && (
          <div 
            className="message-bubble model typing-indicator whatsapp-bubble"
            style={{
              alignSelf: 'flex-start',
              fontStyle: 'italic',
              color: 'var(--light-text-color)',
              padding: isMobile ? '0.7rem 1.1rem' : '0.9rem 1.3rem',
              fontSize: isMobile ? '0.95rem' : '1.05rem',
              background: 'var(--model-bubble-color)',
              borderRadius: '18px',
              marginBottom: '0.25rem',
            }}
          >
            <p style={{ margin: 0 }}>{sessionConfig.botName} is typing...</p>
          </div>
        )}

        {error && (
          <div 
            className="message-bubble error whatsapp-bubble"
            style={{
              alignSelf: 'center',
              background: '#fee',
              color: '#c33',
              padding: '0.8rem 1.2rem',
              borderRadius: '10px',
              fontSize: isMobile ? '0.95rem' : '1.05rem',
              marginBottom: '0.25rem',
            }}
          >
            <p style={{ margin: 0 }}>{error}</p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sticky input bar */}
      <form 
        onSubmit={handleSendMessage} 
        style={{
          ...inputFormStyle,
          position: isMobile ? 'fixed' : 'sticky',
          bottom: isMobile ? 0 : undefined,
          left: isMobile ? 0 : undefined,
          width: isMobile ? '100vw' : '100%',
          zIndex: 20,
          background: 'rgba(255,255,255,0.95)',
          borderBottomLeftRadius: isMobile ? 0 : 20,
          borderBottomRightRadius: isMobile ? 0 : 20,
          boxShadow: isMobile ? '0 -2px 8px rgba(0,0,0,0.04)' : 'none',
          margin: 0,
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onFocus={handleInputFocus}
          placeholder="Type your message..."
          disabled={isSending}
          style={{
            ...inputStyle,
            fontSize: isMobile ? '1.05rem' : '1rem',
            borderRadius: '25px',
            marginRight: isMobile ? '0.5rem' : '1rem',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = 'var(--primary-color)';
            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
            handleInputFocus();
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'var(--border-color)';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={!userInput.trim() || isSending}
          style={{
            ...sendButtonStyle,
            opacity: (!userInput.trim() || isSending) ? 0.6 : 1,
            cursor: (!userInput.trim() || isSending) ? 'not-allowed' : 'pointer',
            fontSize: isMobile ? '1.05rem' : '1rem',
            borderRadius: '25px',
            minWidth: isMobile ? '60px' : 'auto',
            minHeight: isMobile ? '44px' : 'auto',
          }}
        >
          {isSending ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default ChatScreen;