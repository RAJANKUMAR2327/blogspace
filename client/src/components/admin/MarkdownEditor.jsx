import { useState, useEffect, useRef } from 'react'
import MDEditor, { commands } from '@uiw/react-md-editor'
import ContentRenderer from '../blog/ContentRenderer'
import { uploadAPI } from '../../services/api'
import { compressImage } from '../../utils/compressImage'
import toast from 'react-hot-toast'

export default function MarkdownEditor({ value, onChange, height = 480 }) {
  const [previewMode, setPreviewMode] = useState('edit') // 'edit' | 'live' | 'preview'
  const fileInputRef = useRef(null)
  const apiRef = useRef(null) // stashes the editor's api between file-picker open and file selection

  const handleFileSelected = async (e) => {
    const file = e.target.files[0]
    e.target.value = '' // allow selecting the same file again later
    if (!file || !apiRef.current) return

    const toastId = toast.loading('Uploading image...')
    try {
      const compressed = await compressImage(file)
      const fd = new FormData()
      fd.append('image', compressed, file.name)
      const res = await uploadAPI.blogImage(fd)

      // Insert at cursor, with blank lines so it renders as its own block
      // rather than getting glued onto the surrounding paragraph text.
      apiRef.current.replaceSelection(`\n\n![Image description](${res.data.url})\n\n`)
      toast.success('Image inserted', { id: toastId })
    } catch (err) {
      toast.error('Image upload failed', { id: toastId })
    }
  }

  // Custom toolbar command — replaces the default "image" command (which just
  // asks you to paste a URL) with a real file-picker + Cloudinary upload,
  // matching how the cover image upload already works elsewhere.
  const uploadImageCommand = {
    name: 'upload-image',
    keyCommand: 'upload-image',
    buttonProps: { 'aria-label': 'Insert image', title: 'Insert image' },
    icon: (
      <svg width="13" height="13" viewBox="0 0 20 20">
        <path fill="currentColor" d="M15 9c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm4-7H1c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h18c.55 0 1-.45 1-1V3c0-.55-.45-1-1-1zm-1 13l-6-5-2 2-4-5-4 8V4h16v11z" />
      </svg>
    ),
    execute: (state, api) => {
      apiRef.current = api
      fileInputRef.current?.click()
    }
  }

  return (
    <div data-color-mode="dark" style={{ fontFamily: "'Inter',sans-serif" }}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelected}
        style={{ display: 'none' }}
      />
      <style>{`
        .w-md-editor {
          background: var(--bg-surface-2) !important;
          border: 1px solid var(--border-soft) !important;
          border-radius: 12px !important;
        }
        .w-md-editor-toolbar {
          background: var(--bg-surface-2) !important;
          border-bottom: 1px solid var(--border-soft) !important;
          border-radius: 12px 12px 0 0 !important;
        }
        .w-md-editor-toolbar li button {
          color: var(--text-secondary) !important;
        }
        .w-md-editor-toolbar li button:hover {
          color: #a78bfa !important;
          background: rgba(167,139,250,0.1) !important;
        }
        .w-md-editor-toolbar-divider {
          background: var(--border-soft) !important;
        }
        .w-md-editor-text-pre, .w-md-editor-text-input, .w-md-editor-text {
          font-size: 15px !important;
          font-family: 'Inter', sans-serif !important;
          color: var(--text-secondary) !important;
        }
        .w-md-editor-text-input {
          -webkit-text-fill-color: var(--text-secondary) !important;
        }
        .wmde-markdown-color, .wmde-markdown {
          background: transparent !important;
          color: var(--text-secondary) !important;
        }
      `}</style>

      <MDEditor
        value={value}
        onChange={onChange}
        height={height}
        preview={previewMode}
        visibleDragbar={false}
        commands={[
          commands.bold, commands.italic, commands.strikethrough, commands.hr,
          commands.divider,
          commands.title, commands.link, commands.quote, commands.code, commands.codeBlock,
          commands.divider,
          commands.unorderedListCommand, commands.orderedListCommand, commands.checkedListCommand,
          commands.divider,
          uploadImageCommand,
          commands.divider,
          commands.help
        ]}
        textareaProps={{
          placeholder: 'Start writing your story...'
        }}
      />
    </div>
  )
}