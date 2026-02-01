import React from 'react';
import { AUTHOR_INFO } from '../constants';
import { Heart, Github, Star, Shield, Cpu, Users } from 'lucide-react';

const About = () => {
    return (
        <div className="fade-in" style={{
            maxWidth: '900px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            {/* Hero Section */}
            <div style={{ textAlign: 'center', marginBottom: '80px' }}>
                <h2 style={{
                    fontSize: '48px',
                    fontWeight: '800',
                    marginBottom: '20px',
                    background: 'var(--primary-gradient)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontFamily: "'Lexend', sans-serif",
                    letterSpacing: '-1px'
                }}>
                    About Hytale Tools
                </h2>
                <p style={{
                    fontSize: '18px',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                    maxWidth: '700px',
                    margin: '0 auto'
                }}>
                    An open-source suite of dev-utilities designed to empower the Hytale community.
                    Built for creators, by creators, with a focus on speed, precision, and elegance.
                </p>
            </div>

            {/* Passion Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '30px',
                marginBottom: '100px'
            }}>
                {[
                    {
                        icon: <Shield />,
                        title: 'Privacy First',
                        desc: 'All processing happens locally in your browser. Your assets never leave your machine.'
                    },
                    {
                        icon: <Cpu />,
                        title: 'Performant',
                        desc: 'Optimized for speed. Generate assets in seconds, not minutes.'
                    },
                    {
                        icon: <Users />,
                        title: 'Community Driven',
                        desc: "Designed to lower the entry barrier for Hytale modding and creation."
                    }
                ].map((item, idx) => (
                    <div key={idx} className="card" style={{ padding: '30px', textAlign: 'center' }}>
                        <div style={{ color: 'var(--accent-blue)', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
                            {React.cloneElement(item.icon, { size: 40 })}
                        </div>
                        <h4 style={{ color: 'var(--text-highlight)', fontSize: '20px', marginBottom: '10px' }}>{item.title}</h4>
                        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* The Creator Section */}
            <section style={{
                background: 'var(--bg-secondary)',
                padding: '60px',
                borderRadius: '32px',
                border: '1px solid var(--border-color)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                {/* Glow */}
                <div style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-10%',
                    width: '300px',
                    height: '300px',
                    background: 'radial-gradient(circle, var(--accent-blue) 0.1, transparent 70%)',
                    pointerEvents: 'none',
                    opacity: 0.15
                }} />

                <div style={{ display: 'flex', gap: '40px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{
                        width: '120px',
                        height: '120px',
                        borderRadius: '50%',
                        background: 'var(--primary-gradient)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '40px',
                        fontWeight: '800',
                        color: 'white',
                        boxShadow: '0 0 20px rgba(102, 126, 234, 0.4)'
                    }}>
                        {AUTHOR_INFO.name.charAt(0)}
                    </div>

                    <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: '28px', color: 'var(--text-highlight)', margin: '0 0 5px 0' }}>The Developer</h3>
                        <p style={{ fontSize: '18px', color: 'var(--accent-blue)', fontWeight: '600', margin: '0 0 15px 0' }}>
                            {AUTHOR_INFO.name}
                        </p>
                        <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', margin: '0 0 25px 0' }}>
                            Passionate developer dedicated to creating high-quality tools for the Hytale sandbox.
                            Always looking for ways to improve the workflow of creators and server owners.
                        </p>

                        <a
                            href={AUTHOR_INFO.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', padding: '12px 24px' }}
                        >
                            <Github size={20} />
                            Visit GitHub Profile
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer support */}
            <div style={{ textAlign: 'center', marginTop: '60px', color: 'var(--text-muted)' }}>
                <p style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    Built with <Heart size={16} color="#e53e3e" fill="#e53e3e" /> for the Hytale Community
                </p>
            </div>
        </div>
    );
};

export default About;
