import React from 'react';
import styles from './InputBox.module.css';

interface InputBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
}

const InputBox: React.FC<InputBoxProps> = ({ value, onChange, onSend, disabled = false }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (value.trim() && !disabled) {
      onSend();
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (value.trim() && !disabled) {
        onSend();
      }
    }
  };

  return (
    <form className={styles.inputBox} onSubmit={handleSubmit}>
      <div className={styles.inputWrapper}>
        <input
          type="text"
          value={value}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Escribe un mensaje..."
          className={styles.inputField}
          disabled={disabled}
          autoFocus
        />
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={disabled || !value.trim()}
          aria-label="Enviar mensaje"
        >
          <span className={styles.sendIcon}>➤</span>
        </button>
      </div>
    </form>
  );
};

export default InputBox;