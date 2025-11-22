import React, { useState } from 'react';
import styles from './Header.module.css';
import { NavigationRoute } from '../../types';

interface HeaderProps {
  onNavigate?: (route: NavigationRoute) => void;
  currentRoute?: NavigationRoute;
}

const Header: React.FC<HeaderProps> = ({ onNavigate, currentRoute = 'chat' }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleNavigation = (route: NavigationRoute) => {
    if (onNavigate) {
      onNavigate(route);
    }
    setMenuOpen(false);
  };

  const menuItems: { route: NavigationRoute; label: string }[] = [
    { route: 'admin', label: 'Admin' },
    { route: 'proyectos', label: 'Proyectos' },
    { route: 'inventario', label: 'Inventario' },
    { route: 'usuarios', label: 'Usuarios' },
    { route: 'perfil', label: 'Perfil' },
    { route: 'chat', label: 'IA' },
  ];

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <h1 className={styles.title}>Gestión Empresarial</h1>
        
        <button 
          className={styles.menuButton}
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
          <span className={styles.menuIcon}></span>
        </button>
      </div>

      {/* Menu Dropdown */}
      <nav className={`${styles.menu} ${menuOpen ? styles.menuOpen : ''}`}>
        {menuItems.map((item) => (
          <button
            key={item.route}
            className={`${styles.menuItem} ${currentRoute === item.route ? styles.active : ''}`}
            onClick={() => handleNavigation(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Overlay */}
      {menuOpen && (
        <div 
          className={styles.overlay}
          onClick={() => setMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default Header;
