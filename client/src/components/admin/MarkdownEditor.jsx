import { useState, useEffect } from 'react'
import MDEditor from '@uiw/react-md-editor'
import ContentRenderer from '../blog/ContentRenderer'

export default function MarkdownEditor({ value, onChange, height = 480 }) {
  const [previewMode, setPreviewMode] = useState('edit') // 'edit' | 'live' | 'preview'

  return (
    <div data-color-mode="dark" style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{`
        .w-md-editor {
          background: rgba(255,255,255,0.04) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 12px !important;
        }
        .w-md-editor-toolbar {
          background: rgba(255,255,255,0.03) !important;
          border-bottom: 1px solid rgba(255,255,255,0.06) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        .w-md-editor-toolbar li button {
          color: rgba(255,255,255,0.5) !important;
        }
        .w-md-editor-toolbar li button:hover {
          color: #a78bfa !important;
          background: rgba(167,139,250,0.1) !important;
        }
        .w-md-editor-toolbar-divider {
          background: rgba(255,255,255,0.08) !important;
        }
        .w-md-editor-text-pre, .w-md-editor-text-input, .w-md-editor-text {
          font-size: 15px !important;
          font-family: 'Inter', sans-serif !important;
          color: rgba(255,255,255,0.8) !important;
        }
        .w-md-editor-text-input {
          -webkit-text-fill-color: rgba(255,255,255,0.8) !important;
        }
        .wmde-markdown-color, .wmde-markdown {
          background: transparent !important;
          color: rgba(255,255,255,0.7) !important;
        }
      `}</style>

      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={previewMode}
        visibleDragbar={false}
        textareaProps={{
          placeholder: 'Start writing your story...'
        }}
      />
    </div>
  )
}