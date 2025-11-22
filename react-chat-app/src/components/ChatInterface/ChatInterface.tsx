import React, { useState } from 'react';
import MessageBubble from '../MessageBubble/MessageBubble';
import InputBox from '../InputBox/InputBox';
import { useChat } from '../../hooks/useChat';
import styles from './ChatInterface.module.css';

const ChatInterface: React.FC = () => {
  const { messages, sendMessage, loading, error, messagesEndRef } = useChat();
  const [inputValue, setInputValue] = useState('');

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      sendMessage(inputValue);
      setInputValue('');
    }
  };

  return (
    <div className={styles.chatInterface}>
      {/* Área de mensajes */}
      <div className={styles.messageDisplay}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
            <h2 className={styles.emptyTitle}>¡Hola! Soy tu Asistente IA</h2>
            <p className={styles.emptyText}>
              Pregunta cosas relacionadas con el inventario y los proyectos de la empresa.
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble 
            key={msg.id} 
            content={msg.content} 
            sender={msg.sender}
            timestamp={msg.timestamp}
          />
        ))}

        {loading && (
          <div className={styles.typingIndicator}>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
            <div className={styles.typingDot}></div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error message */}
      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Input Box */}
      <InputBox 
        value={inputValue} 
        onChange={setInputValue} 
        onSend={handleSendMessage}
        disabled={loading}
      />
    </div>
  );
};

export default ChatInterface;