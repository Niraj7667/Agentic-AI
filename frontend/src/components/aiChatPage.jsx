import React, { useState } from 'react';
import PartnerSelectionScreen from './partnerSelect';
import ChatScreen from './chatScreen';

// This component acts as the main container for the AI Chat feature.
// It decides whether to show the partner selection or the active chat.
const AiChatPage = () => {
  const [sessionConfig, setSessionConfig] = useState(null);

  // This function is called when a user starts a new chat session
  // or resumes an existing one from the selection screen.
  const handleSessionStarted = (config) => {
    setSessionConfig(config);
  };

  // This allows the user to go back from the chat screen to the selection screen.
  const handleBackToSelection = () => {
    setSessionConfig(null);
  };

  return (
    <>
      {sessionConfig ? (
        <ChatScreen sessionConfig={sessionConfig} onBack={handleBackToSelection} />
      ) : (
        <PartnerSelectionScreen onSessionStarted={handleSessionStarted} />
      )}
    </>
  );
};

export default AiChatPage;
