'use client'

import { useState } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { Case, EvidenceItem } from '@/types/case'

interface CaseUploadProps {
  onUpload: (caseData: Case) => void
  onClose: () => void
}

export default function CaseUpload({ onUpload, onClose }: CaseUploadProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    description: '',
    evidence: '',
    jurisdiction: '',
    caseNumber: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const evidenceItems: EvidenceItem[] = formData.evidence
      .split('\n')
      .filter(e => e.trim())
      .map((desc, idx) => ({
        id: `ev-${Date.now()}-${idx}`,
        type: 'other' as const,
        description: desc.trim(),
      }))
    
    const newCase: Case = {
      id: Date.now().toString(),
      title: formData.title,
      date: formData.date,
      status: 'open',
      description: formData.description,
      evidence: evidenceItems,
      tags: [],
      priority: 'medium',
      jurisdiction: formData.jurisdiction || undefined,
      caseNumber: formData.caseNumber || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      privacyFlags: {
        anonymized: false,
        publicDataOnly: true,
        requiresVerification: false,
      },
    }

    onUpload(newCase)
    setFormData({ title: '', date: '', description: '', evidence: '', jurisdiction: '', caseNumber: '' })
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-detective-secondary border-b border-detective-light p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-detective-accent" />
            <h2 className="text-2xl font-bold text-white">Upload New Case</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-detective-light rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Case Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
              placeholder="e.g., Missing Person - Jane Doe, 1995"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Case Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white focus:outline-none focus:border-detective-accent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Case Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent min-h-[120px]"
              placeholder="Provide a detailed description of the case..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Evidence (one per line)
            </label>
            <textarea
              value={formData.evidence}
              onChange={(e) => setFormData({ ...formData, evidence: e.target.value })}
              className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent min-h-[150px]"
              placeholder="List each piece of evidence on a new line..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Jurisdiction (Optional)
              </label>
              <input
                type="text"
                value={formData.jurisdiction}
                onChange={(e) => setFormData({ ...formData, jurisdiction: e.target.value })}
                className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
                placeholder="e.g., Los Angeles, CA"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Case Number (Optional)
              </label>
              <input
                type="text"
                value={formData.caseNumber}
                onChange={(e) => setFormData({ ...formData, caseNumber: e.target.value })}
                className="w-full px-4 py-3 bg-detective-darker border border-detective-light rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-detective-accent"
                placeholder="e.g., 95-12345"
              />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-detective-light hover:bg-detective-light/80 text-white rounded-lg font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="w-5 h-5" />
              Upload Case
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
