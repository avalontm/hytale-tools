import React, { useState } from 'react';

// Importar tools (puedes agregar más aquí)
import NPCGenerator from './tools/NPCGenerator';
import Home from './pages/Home';
import Documentation from './pages/Documentation';
import About from './pages/About';
import { DialogProvider } from './contexts/DialogContext';
import { BrowserRouter, Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import { AUTHOR_INFO } from './constants';

// Simulación de React Router (puedes usar react-router-dom si prefieres)
function App() {
  const tools = [
    {
      id: 'npc-generator',
      name: 'NPC Generator',
      description: 'Generate JSON appearance and role files for NPCs using Blockbench models',
      icon: null,
      category: 'Character',
      component: NPCGenerator
    }
  ];

  return (
    <BrowserRouter>
      <DialogProvider>
        <AppContent tools={tools} />
      </DialogProvider>
    </BrowserRouter>
  );
}

function AppContent({ tools }) {
  const location = useLocation();

  return (
    <div className="app-container" style={{
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      backgroundImage: 'linear-gradient(rgba(11, 18, 29, 0.9), rgba(11, 18, 29, 0.9)), url("https://hytale.com/static/images/backgrounds/content-lower-1920.jpg")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      color: 'var(--text-primary)',
      fontFamily: "'Nunito Sans', sans-serif"
    }}>
      {/* Header */}
      <header style={{
        borderBottom: '1px solid var(--border-color)',
        backdropFilter: 'blur(10px)',
        background: 'var(--bg-secondary)',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link
            to="/"
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img src="/static/images/logo-h.png" alt="Logo" style={{ width: '100%', height: 'auto', filter: 'drop-shadow(0 0 8px rgba(0, 150, 255, 0.4))' }} />
            </div>
            <div>
              <h1 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                letterSpacing: '-0.5px'
              }}>
                Hytale Tools
              </h1>
              <p style={{
                margin: 0,
                fontSize: '12px',
                color: 'var(--text-secondary)',
                fontWeight: '400'
              }}>
                Developer Utilities
              </p>
            </div>
          </Link>

          <nav style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <NavLink
              to="/"
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'color 0.3s'
              })}
            >
              Home
            </NavLink>
            <NavLink
              to="/documentation"
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'color 0.3s'
              })}
            >
              Documentation
            </NavLink>
            <NavLink
              to="/about"
              style={({ isActive }) => ({
                color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '14px',
                transition: 'color 0.3s'
              })}
            >
              About
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '40px'
      }}>
        <Routes>
          <Route path="/" element={<Home tools={tools} />} />
          <Route path="/documentation" element={
            <div>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                className="card-hover"
              >
                ← Back to Home
              </Link>
              <Documentation />
            </div>
          } />
          <Route path="/about" element={
            <div>
              <Link
                to="/"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '20px',
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  backdropFilter: 'blur(10px)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  transition: 'all 0.3s'
                }}
                className="card-hover"
              >
                ← Back to Home
              </Link>
              <About />
            </div>
          } />
          {tools.map(tool => (
            <Route
              key={tool.id}
              path={`/tool/${tool.id}`}
              element={
                <div>
                  <Link
                    to="/"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '20px',
                      padding: '10px 20px',
                      background: 'rgba(255,255,255,0.1)',
                      border: '1px solid var(--border-color)',
                      color: 'white',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'all 0.3s'
                    }}
                    className="card-hover"
                  >
                    ← Back to Home
                  </Link>
                  <tool.component />
                </div>
              }
            />
          ))}
        </Routes>
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(0,0,0,0.2)',
        marginTop: '80px'
      }}>
        <div style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '30px 40px',
          textAlign: 'center'
        }}>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.5)',
            fontSize: '14px'
          }}>
            {AUTHOR_INFO.project} - Created by <a href={AUTHOR_INFO.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none' }}>{AUTHOR_INFO.name}</a> for the community
          </p>
          <p style={{
            margin: '10px 0 0 0',
            color: 'rgba(255,255,255,0.3)',
            fontSize: '12px'
          }}>
            Not officially affiliated with Hypixel Studios
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
