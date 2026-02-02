import React, { useRef, useEffect } from 'react';
import { X } from 'lucide-react';

function Dialog({ isOpen, title, message, type = 'info', onConfirm, onCancel, inputPlaceholder, inputValue, onInputChange, isDestructive, confirmText }) {
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && type === 'prompt' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen, type]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget && type !== 'alert') {
            onCancel();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            onConfirm();
        } else if (e.key === 'Escape' && type !== 'alert') {
            onCancel();
        }
    };

    return (
        <div
            className="dialog-overlay fade-in"
            onClick={handleBackdropClick}
            style={{
                position: 'fixed', inset: 0, zIndex: 2000,
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(4px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
        >
            <div
                className="dialog-card"
                style={{
                    width: '100%', maxWidth: '400px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-lg)',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    transform: 'translateY(0)',
                    animation: 'slideUp 0.3s ease-out'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '16px 20px',
                    background: type === 'alert' && title === 'Error' ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-tertiary)',
                    borderBottom: '1px solid var(--border-color)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <h3 style={{
                        margin: 0,
                        fontSize: '16px',
                        color: type === 'alert' && title === 'Error' ? 'var(--accent-red)' : 'var(--text-highlight)',
                        fontFamily: "'Lexend', sans-serif"
                    }}>
                        {title}
                    </h3>
                    {type !== 'alert' && (
                        <button
                            onClick={onCancel}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                            <X size={20} />
                        </button>
                    )}
                </div>

                {/* Body */}
                <div style={{ padding: '20px' }}>
                    <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.5, fontFamily: "'Nunito Sans', sans-serif" }}>
                        {message}
                    </p>

                    {type === 'prompt' && (
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => onInputChange(e.target.value)}
                            placeholder={inputPlaceholder}
                            onKeyDown={handleKeyDown}
                            style={{ marginTop: '16px' }}
                        />
                    )}
                </div>

                {/* Footer */}
                <div style={{
                    padding: '16px 20px',
                    background: 'var(--bg-primary)',
                    display: 'flex', justifyContent: 'flex-end', gap: '10px'
                }}>
                    {type !== 'alert' && (
                        <button className="btn btn-secondary" onClick={onCancel}>
                            Cancel
                        </button>
                    )}
                    <button
                        className={`btn ${isDestructive || (type === 'alert' && title === 'Error') ? 'btn-danger' : 'btn-primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText || (type === 'confirm' ? 'Confirm' : 'OK')}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Dialog;
