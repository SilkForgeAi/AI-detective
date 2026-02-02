'use client'

import { useEffect } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

interface KeyboardShortcutsProps {
  onSearch?: () => void
  onNewCase?: () => void
  onDashboard?: () => void
  onChat?: () => void
  onSettings?: () => void
}

export default function KeyboardShortcuts({
  onSearch,
  onNewCase,
  onDashboard,
  onChat,
  onSettings,
}: KeyboardShortcutsProps) {
  useHotkeys('ctrl+k, cmd+k', (e) => {
    e.preventDefault()
    onSearch?.()
  })

  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault()
    onNewCase?.()
  })

  useHotkeys('ctrl+d, cmd+d', (e) => {
    e.preventDefault()
    onDashboard?.()
  })

  useHotkeys('ctrl+/', (e) => {
    e.preventDefault()
    onChat?.()
  })

  useHotkeys('ctrl+,', (e) => {
    e.preventDefault()
    onSettings?.()
  })

  return null
}
