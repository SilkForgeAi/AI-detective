'use client'

import { useState } from 'react'
import { FileText, Brain, Upload, TrendingUp, Download, Bell, Keyboard, BarChart3 } from 'lucide-react'
import CaseUpload from '@/components/CaseUpload'
import EnhancedCaseAnalysis from '@/components/EnhancedCaseAnalysis'
import CaseList from '@/components/CaseList'
import LearningDashboard from '@/components/LearningDashboard'
import FetchPublicCase from '@/components/FetchPublicCase'
import { Case, EvidenceItem } from '@/types/case'
import AuthModal from '@/components/AuthModal'
import ChatBox from '@/components/ChatBox'
import { useEffect } from 'react'

export default function Home() {
  const [cases, setCases] = useState<Case[]>([])
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [showLearning, setShowLearning] = useState(false)
  const [showFetchPublic, setShowFetchPublic] = useState(false)
  const [user, setUser] = useState<{ id: string; email: string; name: string; role: string } | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMinimized, setChatMinimized] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showDashboard, setShowDashboard] = useState(true)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showPasswordReset, setShowPasswordReset] = useState(false)
  const [showCaseShare, setShowCaseShare] = useState(false)

  const handleCaseUpload = (newCase: Case) => {
    setCases([...cases, newCase])
    setSelectedCase(newCase)
    setShowUpload(false)
  }

  const handlePublicCaseFetched = async (caseData: Case) => {
    // Save to database via API
    try {
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caseData),
      })
      
      if (response.ok) {
        const { case: savedCase } = await response.json()
        setCases([...cases, savedCase])
        setSelectedCase(savedCase)
        setShowFetchPublic(false)
      } else {
        // Fallback to local state if API fails
        setCases([...cases, caseData])
        setSelectedCase(caseData)
        setShowFetchPublic(false)
      }
    } catch (error) {
      // Fallback to local state
      setCases([...cases, caseData])
      setSelectedCase(caseData)
      setShowFetchPublic(false)
    }
  }

  const handleAnalyze = async (caseId: string) => {
    const caseToAnalyze = cases.find(c => c.id === caseId)
    if (!caseToAnalyze) return

    // Update status to analyzing
    const updatedCases = cases.map(c => 
      c.id === caseId ? { ...c, status: 'analyzing' as const } : c
    )
    setCases(updatedCases)
    
    if (selectedCase?.id === caseId) {
      setSelectedCase({ ...caseToAnalyze, status: 'analyzing' })
    }

    try {
      // Call AI analysis API with all cases for pattern matching
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseData: caseToAnalyze, allCases: cases }),
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const { analysis, error, reasoningChain } = await response.json()
      
      if (error) {
        throw new Error(error)
      }
      
      // Store reasoning chain in analysis metadata
      const analysisWithReasoning = reasoningChain 
        ? { ...analysis, _reasoningChain: reasoningChain }
        : analysis
      
      // Update cases with comprehensive analysis
      const finalCases = cases.map(c => 
        c.id === caseId 
          ? { 
              ...c, 
              status: 'open' as const, 
              insights: analysis?.insights || [],
              analysis: analysisWithReasoning
            } 
          : c
      )
      setCases(finalCases)
      
      if (selectedCase?.id === caseId) {
        setSelectedCase({ 
          ...caseToAnalyze, 
          insights: analysis?.insights || [],
          analysis: analysisWithReasoning,
          status: 'open' 
        })
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      // Revert to open status on error
      const errorCases = cases.map(c => 
        c.id === caseId ? { ...c, status: 'open' as const } : c
      )
      setCases(errorCases)
      
      if (selectedCase?.id === caseId) {
        setSelectedCase({ ...caseToAnalyze, status: 'open' })
      }
    }
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <header className="border-b border-detective-secondary bg-detective-darker/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-detective-accent/20 rounded-lg">
                <Brain className="w-8 h-8 text-detective-accent" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">AI Detective</h1>
                <p className="text-sm text-gray-400">Cold Case Investigation System</p>
              </div>
              {!selectedCase && (
                <button
                  onClick={() => setShowDashboard(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-detective-secondary hover:bg-detective-secondary/80 rounded-lg transition-colors"
                >
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-400">Dashboard</span>
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowChat(!showChat)
                  if (!showChat) setChatMinimized(false)
                }}
                className="flex items-center gap-2 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Brain className="w-5 h-5" />
                Chat
              </button>
              <button
                onClick={() => setShowLearning(!showLearning)}
                className="flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors"
              >
                <TrendingUp className="w-5 h-5" />
                Learning
              </button>
              <button
                onClick={() => setShowFetchPublic(true)}
                className="flex items-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                <Download className="w-5 h-5" />
                Fetch Public
              </button>
              {user ? (
                <>
                  <UserMenu
                    user={user}
                    onLogout={() => {
                      setUser(null)
                      setCases([])
                      setSelectedCase(null)
                      setShowAuth(true)
                    }}
                    onSettings={() => setShowSettings(true)}
                  />
                  <button
                    onClick={() => setShowUpload(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-detective-accent/20"
                  >
                    <Upload className="w-5 h-5" />
                    New Case
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowUpload(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-detective-accent/20"
                >
                  <Upload className="w-5 h-5" />
                  New Case
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {showLearning ? (
          <LearningDashboard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case List Sidebar */}
            <div className="lg:col-span-1">
              <CaseList
                cases={cases}
                selectedCase={selectedCase}
                onSelectCase={setSelectedCase}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-2">
            {selectedCase ? (
              <EnhancedCaseAnalysis
                caseData={selectedCase}
                onAnalyze={handleAnalyze}
              />
            ) : (
              <div className="bg-detective-secondary/50 rounded-xl p-12 border border-detective-secondary text-center">
                <FileText className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-white mb-2">
                  No Case Selected
                </h2>
                <p className="text-gray-400 mb-6">
                  Select a case from the list or upload a new one to begin analysis
                </p>
                <button
                  onClick={() => setShowUpload(true)}
                  className="px-6 py-3 bg-detective-accent hover:bg-detective-accent/90 text-white rounded-lg font-semibold transition-colors"
                >
                  Upload New Case
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <CaseUpload
          onUpload={handleCaseUpload}
          onClose={() => setShowUpload(false)}
        />
      )}

      {/* Fetch Public Case Modal */}
      {showFetchPublic && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <FetchPublicCase
              onCaseFetched={handlePublicCaseFetched}
              onClose={() => setShowFetchPublic(false)}
            />
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-detective-secondary rounded-xl border border-detective-light max-w-md w-full">
            <AuthModal
              onClose={() => setShowAuth(false)}
              onSuccess={(userData) => {
                setUser(userData)
                setShowAuth(false)
              }}
            />
          </div>
        </div>
      )}

      {/* Chat Box */}
      {showChat && (
        <ChatBox
          currentCase={selectedCase}
          allCases={cases}
          minimized={chatMinimized}
          onMinimize={() => setChatMinimized(!chatMinimized)}
          onClose={() => {
            setShowChat(false)
            setChatMinimized(false)
          }}
        />
      )}
    </main>
  )
}
