import React, { useEffect, useRef } from 'react';
import './DocumentsPanel.css';

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
    return new Date(date).toLocaleString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

export function DocumentsPanel({ documents, onClose, onUpload, onRemove }) {
    const panelRef = useRef(null);
    const fileInputRef = useRef(null);

    // Close on outside click or Escape
    useEffect(() => {
        const handleClick = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('#documents-toggle')) {
                onClose();
            }
        };
        const handleKey = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    const totalSize = documents.reduce((sum, d) => sum + d.size, 0);

    return (
        <div className="documents-panel" ref={panelRef} role="dialog" aria-label="Uploaded documents">
            <div className="documents-panel-header">
                <div>
                    <h2>Uploaded Documents</h2>
                    <span className="documents-panel-sub">
                        {documents.length
                            ? `${documents.length} file${documents.length > 1 ? 's' : ''} • ${formatSize(totalSize)}`
                            : 'No files yet'}
                    </span>
                </div>
                <button className="documents-close" onClick={onClose} aria-label="Close documents panel">×</button>
            </div>

            {documents.length === 0 ? (
                <div className="documents-empty">
                    <span className="documents-empty-icon">🍃</span>
                    <p>The pond is empty. Upload a document so I can read it!</p>
                </div>
            ) : (
                <ul className="documents-list">
                    {documents.map(doc => (
                        <li key={doc.id} className="document-item">
                            <div className="document-icon">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                </svg>
                            </div>
                            <div className="document-info">
                                <span className="document-name" title={doc.name}>{doc.name}</span>
                                <span className="document-meta">
                                    {formatDate(doc.uploadedAt)} • {formatSize(doc.size)}
                                </span>
                            </div>
                            <button
                                className="document-remove"
                                onClick={() => onRemove(doc.id)}
                                aria-label={`Remove ${doc.name}`}
                                title="Remove document"
                            >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <input
                ref={fileInputRef}
                id="documents-panel-upload-input"
                type="file"
                multiple
                accept=".txt,.md,.markdown,.csv,.json,text/plain"
                onChange={(e) => { onUpload(e.target.files); e.target.value = ''; }}
                hidden
            />
            <button
                id="documents-panel-upload-btn"
                className="documents-upload-btn"
                onClick={() => fileInputRef.current?.click()}
            >
                + Upload {documents.length ? 'more' : 'a document'}
            </button>
        </div>
    );
}

export default DocumentsPanel;
