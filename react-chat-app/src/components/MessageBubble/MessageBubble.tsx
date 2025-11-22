import React from 'react';
import styles from './MessageBubble.module.css';

interface MessageBubbleProps {
  content: string;
  sender: 'user' | 'ai';
  timestamp?: Date;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ content, sender, timestamp }) => {
  const formatTime = (date?: Date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Si es menos de 1 minuto
    if (diff < 60000) return 'Ahora';
    
    // Si es el mismo día
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    }
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Detectar y formatear JSON
  const renderContent = () => {
    // Intentar detectar si hay JSON en el contenido
    const jsonRegex = /\{[\s\S]*?\}/g;
    const matches = content.match(jsonRegex);
    
    if (matches && matches.length > 0 && sender === 'ai') {
      const parts: JSX.Element[] = [];
      let lastIndex = 0;
      let jsonCount = 0;
      
      // Detectar si hay texto introductorio al inicio
      const firstJsonIndex = content.indexOf(matches[0]);
      if (firstJsonIndex > 0) {
        const intro = content.substring(0, firstJsonIndex).trim();
        if (intro) {
          parts.push(
            <div key="intro" className={styles.introText}>
              {intro}
            </div>
          );
        }
      }
      
      matches.forEach((jsonStr, index) => {
        try {
          const parsed = JSON.parse(jsonStr);
          const startIndex = content.indexOf(jsonStr, lastIndex);
          
          jsonCount++;
          
          // Agregar JSON formateado con título
          parts.push(
            <div key={`json-${index}`} className={styles.jsonBlock}>
              {matches.length > 1 && (
                <div className={styles.jsonTitle}>
                  📋 Proyecto {jsonCount}
                </div>
              )}
              {Object.entries(parsed).map(([key, value]) => {
                if (key === '_id' || key === '__v') return null;
                return (
                  <div key={key} className={styles.jsonRow}>
                    <span className={styles.jsonKey}>{formatKey(key)}:</span>
                    <span className={styles.jsonValue}>{formatValue(value)}</span>
                  </div>
                );
              })}
            </div>
          );
          
          lastIndex = startIndex + jsonStr.length;
        } catch (e) {
          // Si no es JSON válido, ignorar
        }
      });
      
      // Agregar texto después del último JSON
      if (lastIndex < content.length) {
        const textAfter = content.substring(lastIndex).trim();
        if (textAfter && !textAfter.match(/^[\[\],\s]*$/)) {
          parts.push(
            <div key="outro" className={styles.outroText}>
              {textAfter}
            </div>
          );
        }
      }
      
      return parts.length > 0 ? <>{parts}</> : content;
    }
    
    return content;
  };

  // Formatear nombres de claves
  const formatKey = (key: string): string => {
    const keyMap: { [key: string]: string } = {
      name: 'Nombre',
      description: 'Descripción',
      clientName: 'Cliente',
      isActive: 'Estado',
      createdAt: 'Creado',
      updatedAt: 'Actualizado',
      userId: 'Usuario',
    };
    return keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Formatear valores
  const formatValue = (value: any): string => {
    if (typeof value === 'boolean') {
      return value ? '✓ Activo' : '✗ Inactivo';
    }
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
      // Es una fecha ISO
      const date = new Date(value);
      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
    return String(value);
  };

  return (
    <div className={`${styles.messageWrapper} ${sender === 'user' ? styles.userWrapper : styles.aiWrapper}`}>
      {sender === 'ai' && (
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>IA</span>
        </div>
      )}
      
      <div className={styles.messageContent}>
        <div className={`${styles.bubble} ${sender === 'user' ? styles.user : styles.ai}`}>
          {renderContent()}
        </div>
        {timestamp && (
          <div className={styles.timestamp}>
            {formatTime(timestamp)}
          </div>
        )}
      </div>
      
      {sender === 'user' && (
        <div className={styles.avatar}>
          <span className={styles.avatarIcon}>DR</span>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;