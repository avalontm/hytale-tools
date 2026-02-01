import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Home({ tools }) {
  const navigate = useNavigate();
  // Agrupar herramientas por categoría
  const categories = [...new Set(tools.map(t => t.category))];

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        padding: '60px 20px',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, var(--accent-blue) 0.05, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
          opacity: 0.1
        }} />

        <h2 style={{
          fontSize: '56px',
          fontWeight: '800',
          margin: '0 0 20px 0',
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          letterSpacing: '-2px',
          position: 'relative',
          fontFamily: "'Lexend', sans-serif"
        }}>
          Hytale Development Tools
        </h2>

        <p style={{
          fontSize: '20px',
          color: 'var(--text-secondary)',
          maxWidth: '600px',
          margin: '0 auto 40px',
          lineHeight: '1.6',
          position: 'relative'
        }}>
          Powerful tools to accelerate your development in Hytale.
          Create, generate, and optimize content for your server.
        </p>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          position: 'relative'
        }}>
          <button className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '16px' }}>
            Explore Tools
          </button>

          <button
            className="btn btn-secondary"
            style={{ padding: '14px 32px', fontSize: '16px' }}
            onClick={() => navigate('/documentation')}
          >
            Documentation
          </button>
        </div>
      </section>

      {/* Tools Grid */}
      <section style={{ marginTop: '80px' }}>
        {categories.map(category => {
          const categoryTools = tools.filter(t => t.category === category);

          return (
            <div key={category} style={{ marginBottom: '60px' }}>
              <h3 style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '30px',
                color: 'var(--text-highlight)',
                letterSpacing: '-0.5px',
                fontFamily: "'Lexend', sans-serif"
              }}>
                {category} Tools
              </h3>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                gap: '24px'
              }}>
                {categoryTools.map(tool => (
                  <div
                    key={tool.id}
                    onClick={() => navigate(`/tool/${tool.id}`)}
                    className="card fade-in"
                    style={{
                      cursor: 'pointer',
                      padding: '30px',
                    }}
                  >
                    {/* Glow effect */}
                    <div style={{
                      position: 'absolute',
                      top: '-10%',
                      right: '-10%',
                      width: '150px',
                      height: '150px',
                      background: 'radial-gradient(circle, var(--accent-blue) 0.1, transparent 70%)',
                      pointerEvents: 'none',
                      opacity: 0.1
                    }} />

                    <div style={{
                      fontSize: '48px',
                      marginBottom: '20px'
                    }}>
                      {tool.icon}
                    </div>

                    <h4 style={{
                      fontSize: '22px',
                      fontWeight: '700',
                      margin: '0 0 10px 0',
                      color: 'var(--text-highlight)',
                      fontFamily: "'Lexend', sans-serif"
                    }}>
                      {tool.name}
                    </h4>

                    <p style={{
                      fontSize: '14px',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.6',
                      margin: 0
                    }}>
                      {tool.description}
                    </p>

                    <div style={{
                      marginTop: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--accent-blue)',
                      fontSize: '14px',
                      fontWeight: '600'
                    }}>
                      Open Tool →
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </section>

      {/* Features Section */}
      <section style={{
        marginTop: '100px',
        padding: '60px',
        background: 'var(--bg-secondary)',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        <h3 style={{
          fontSize: '32px',
          fontWeight: '700',
          textAlign: 'center',
          marginBottom: '50px',
          color: 'var(--text-highlight)',
          fontFamily: "'Lexend', sans-serif"
        }}>
          Why use Hytale Tools?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px'
        }}>
          {[
            {
              icon: null,
              title: 'Fast and Efficient',
              desc: 'Automate repetitive tasks and save hours of work'
            },
            {
              icon: null,
              title: 'Easy to Use',
              desc: 'Intuitive interfaces designed for developers'
            },
            {
              icon: null,
              title: 'Open Source',
              desc: 'Open source and constantly improved by the community'
            },
            {
              icon: null,
              title: 'Browser Based',
              desc: 'Everything runs in your browser, your data stays private'
            }
          ].map((feature, idx) => (
            <div key={idx} style={{ textAlign: 'center' }}>
              <h4 style={{
                fontSize: '18px',
                fontWeight: '600',
                margin: '0 0 10px 0',
                color: 'var(--text-highlight)',
                fontFamily: "'Lexend', sans-serif"
              }}>
                {feature.title}
              </h4>
              <p style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
                margin: 0,
                lineHeight: '1.6'
              }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
