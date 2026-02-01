import React from 'react';

const Documentation = () => {
    return (
        <div className="fade-in" style={{
            maxWidth: '1000px',
            margin: '0 auto',
            padding: '40px 20px'
        }}>
            <h2 style={{
                fontSize: '48px',
                fontWeight: '800',
                marginBottom: '40px',
                background: 'var(--primary-gradient)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Lexend', sans-serif",
                letterSpacing: '-1px'
            }}>
                Documentation
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: '250px 1fr',
                gap: '60px'
            }}>
                {/* Sidebar */}
                <aside style={{
                    position: 'sticky',
                    top: '120px',
                    height: 'fit-content'
                }}>
                    <h3 style={{
                        fontSize: '14px',
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        color: 'var(--text-muted)',
                        marginBottom: '20px'
                    }}>
                        Categories
                    </h3>
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <a href="#npc-structure" style={{
                            color: 'var(--accent-blue)',
                            textDecoration: 'none',
                            fontWeight: '600',
                            fontSize: '15px'
                        }}>
                            NPC Structure
                        </a>
                        <a href="#blockbench" style={{
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '15px',
                            transition: 'color 0.3s'
                        }}>
                            Using Blockbench
                        </a>
                        <a href="#best-practices" style={{
                            color: 'var(--text-secondary)',
                            textDecoration: 'none',
                            fontSize: '15px',
                            transition: 'color 0.3s'
                        }}>
                            Best Practices
                        </a>
                    </nav>
                </aside>

                {/* Content */}
                <div style={{ lineHeight: '1.7', color: 'var(--text-secondary)' }}>
                    <section id="npc-structure" style={{ marginBottom: '60px' }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'var(--text-highlight)',
                            marginBottom: '20px',
                            fontFamily: "'Lexend', sans-serif"
                        }}>
                            Hytale NPC Structure
                        </h3>
                        <p>
                            Hytale organizes NPC assets by category within the <code>Assets/Common/NPC/</code> directory.
                            Following this official hierarchy is essential for game compatibility.
                        </p>

                        <h4 style={{ color: 'var(--text-highlight)', marginTop: '20px', marginBottom: '10px' }}>Root Categories</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                            {['Beast', 'Boss', 'Human', 'Intelligent', 'Livestock', 'Undead', 'Wildlife', 'Void'].map(cat => (
                                <span key={cat} style={{
                                    padding: '4px 12px',
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    border: '1px solid rgba(102, 126, 234, 0.2)',
                                    borderRadius: '20px',
                                    fontSize: '12px',
                                    color: 'var(--accent-blue)'
                                }}>{cat}</span>
                            ))}
                        </div>

                        <h4 style={{ color: 'var(--text-highlight)', marginBottom: '10px' }}>Technical Directory Layout</h4>
                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '25px',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            margin: '10px 0 30px',
                            fontFamily: 'monospace',
                            fontSize: '13px'
                        }}>
                            <div style={{ marginBottom: '5px', color: 'var(--text-highlight)' }}>NPC_Name/</div>
                            <div style={{ paddingLeft: '20px' }}>├── Animations/ <span style={{ color: 'var(--text-muted)' }}>- Animation .JSON or .SEQ files</span></div>
                            <div style={{ paddingLeft: '20px' }}>└── Models/</div>
                            <div style={{ paddingLeft: '40px' }}>├── Model.blockymodel <span style={{ color: 'var(--accent-blue)' }}>- Master Blockbench file</span></div>
                            <div style={{ paddingLeft: '40px' }}>├── Model_Textures/ <span style={{ color: 'var(--text-muted)' }}>- Folder for all .PNG textures</span></div>
                            <div style={{ paddingLeft: '40px', color: 'var(--text-highlight)' }}>├── Attachments/</div>
                            <div style={{ paddingLeft: '60px' }}>├── Haircuts/ <span style={{ color: 'var(--text-muted)' }}>- Modular hairstyles</span></div>
                            <div style={{ paddingLeft: '60px' }}>├── Beards/ <span style={{ color: 'var(--text-muted)' }}>- Facial hair variations</span></div>
                            <div style={{ paddingLeft: '60px' }}>└── Cosmetics/ <span style={{ color: 'var(--text-muted)' }}>- Clothing and props</span></div>
                            <div style={{ paddingLeft: '40px' }}>└── Weapons/ <span style={{ color: 'var(--text-muted)' }}>- Item models</span></div>
                        </div>

                        <div style={{
                            background: 'rgba(102, 126, 234, 0.05)',
                            border: '1px solid rgba(102, 126, 234, 0.2)',
                            borderRadius: '12px',
                            padding: '20px',
                            marginTop: '20px'
                        }}>
                            <h4 style={{
                                color: 'var(--accent-blue)',
                                margin: '0 0 10px 0',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}>
                                <span style={{ fontSize: '18px' }}>⚠️</span> Naming Convention (Required)
                            </h4>
                            <p style={{ fontSize: '14px', margin: 0 }}>
                                To ensure the <strong>NPC Generator</strong> correctly links assets, the <code>.blockymodel</code> file
                                and its main <code>.png</code> texture must share the <strong>exact same name</strong>.
                            </p>
                            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-muted)' }}>
                                Example: <code>Orc_Top.blockymodel</code> + <code>Model_Textures/Orc_Top.png</code>
                            </div>
                        </div>
                    </section>

                    <section id="blockbench" style={{ marginBottom: '60px' }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'var(--text-highlight)',
                            marginBottom: '20px',
                            fontFamily: "'Lexend', sans-serif"
                        }}>
                            Building with Blockbench
                        </h3>
                        <p>
                            Blockbench is the industry-standard tool for creating Hytale-style models.
                            Always use the official Hytale plugin within Blockbench to ensure your models use the correct format.
                        </p>
                        <ul style={{ paddingLeft: '20px', marginTop: '20px' }}>
                            <li style={{ marginBottom: '10px' }}>
                                <strong style={{ color: 'var(--text-highlight)' }}>Export Format:</strong> Always export as <code style={{ color: 'var(--accent-blue)' }}>.blockymodel</code>.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <strong style={{ color: 'var(--text-highlight)' }}>Pivot Points:</strong> Ensure pivot points align with Hytale's bone structure for fluid animations.
                            </li>
                            <li style={{ marginBottom: '10px' }}>
                                <strong style={{ color: 'var(--text-highlight)' }}>Naming:</strong> Keep model and group names technical and clear (e.g., <code style={{ color: 'var(--text-muted)' }}>head</code>, <code style={{ color: 'var(--text-muted)' }}>arm_left</code>).
                            </li>
                        </ul>
                    </section>

                    <section id="best-practices" style={{
                        padding: '40px',
                        background: 'linear-gradient(135deg, rgba(66, 153, 225, 0.1), rgba(0,0,0,0))',
                        borderRadius: '24px',
                        border: '1px solid rgba(66, 153, 225, 0.2)'
                    }}>
                        <h3 style={{
                            fontSize: '28px',
                            fontWeight: '700',
                            color: 'var(--text-highlight)',
                            marginBottom: '20px',
                            fontFamily: "'Lexend', sans-serif"
                        }}>
                            Best Practices
                        </h3>
                        <div style={{ display: 'grid', gap: '15px' }}>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-blue)', fontSize: '20px' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-highlight)' }}>Optimized Textures</h4>
                                    <p style={{ fontSize: '14px', margin: 0 }}>Use small power-of-two textures (e.g., 32x32) to keep CPU/GPU usage low.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-blue)', fontSize: '20px' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-highlight)' }}>Clean Outliner</h4>
                                    <p style={{ fontSize: '14px', margin: 0 }}>Keep your folders clean in Blockbench; delete unused groups or hidden cubes before exporting.</p>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '15px' }}>
                                <div style={{ color: 'var(--accent-blue)', fontSize: '20px' }}>✓</div>
                                <div>
                                    <h4 style={{ margin: '0 0 5px 0', color: 'var(--text-highlight)' }}>Consistent Files</h4>
                                    <p style={{ fontSize: '14px', margin: 0 }}>Ensure the texture path in your model matches the actual location in your server assets.</p>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
};

export default Documentation;
