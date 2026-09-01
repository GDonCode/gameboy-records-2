'use client';

import { useState } from 'react';

export default function PostCreationWidget() {
  const [text, setText] = useState('');

  return (
    <div className="post-composer">
      <div className="post-composer-row">
        <div className="post-composer-avatar" aria-hidden="true" />
        <textarea
          className="post-composer-input"
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={2}
        />
      </div>

      <div className="post-composer-footer">
        <div className="post-composer-icons">
          <button type="button" className="post-composer-icon-btn" aria-label="Add image">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="8.5" cy="10" r="1.5" />
              <path d="M21 15l-5-5-4 4-3-3-6 6" />
            </svg>
          </button>
          <button type="button" className="post-composer-icon-btn" aria-label="Add GIF">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <text x="6" y="15" fontSize="7" fill="currentColor" stroke="none" fontFamily="monospace">GIF</text>
            </svg>
          </button>
        </div>

        <button
          type="button"
          className="post-composer-submit"
          disabled={text.trim().length === 0}
        >
          Post
        </button>
      </div>
    </div>
  );
}