import { useState, useEffect, useRef, useCallback } from 'react'
import { ViewerConnection, UserWindowCount } from '@/lib/websocket'

// Generate unique session ID for this browser tab/window
const generateSessionId = () => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function useViewerTracking(livestreamId: string, userId: string, userEmail: string) {
  const [viewers, setViewers] = useState<ViewerConnection[]>([])
  const [windowCounts, setWindowCounts] = useState<UserWindowCount[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const heartbeatRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const isActiveRef = useRef(true)
  const sessionIdRef = useRef<string>(generateSessionId())

  const sendAction = useCallback(async (action: 'join' | 'leave' | 'heartbeat') => {
    try {
      const payload = { 
        action, 
        livestreamId, 
        userId, 
        userEmail, 
        sessionId: sessionIdRef.current 
      }
      
      // Debug logging in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Sending WebSocket action:', payload)
      }
      
      // Validate payload before sending
      if (!payload.action || !payload.livestreamId || !payload.userId || !payload.sessionId) {
        console.error('Invalid payload - missing required fields:', payload)
        return false
      }
      
      const response = await fetch('/api/websocket', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      let data
      try {
        data = await response.json()
      } catch (parseError) {
        console.error('Failed to parse WebSocket response:', parseError)
        setIsConnected(false)
        return false
      }
      
      if (data.success) {
        setViewers(data.viewers || [])
        setWindowCounts(data.windowCounts || [])
        setIsConnected(true)
        return true
      } else {
        console.error('WebSocket action failed:', {
          status: response.status,
          statusText: response.statusText,
          error: data.error || 'Unknown error'
        })
        setIsConnected(false)
        return false
      }
    } catch (error) {
      console.error('WebSocket action failed:', error)
      setIsConnected(false)
      return false
    }
  }, [livestreamId, userId, userEmail])

  const joinLivestream = useCallback(async () => {
    if (!isActiveRef.current) return

    const success = await sendAction('join')
    if (success) {
      // Send heartbeat every 15 seconds
      if (heartbeatRef.current) {
        clearInterval(heartbeatRef.current)
      }
      
      heartbeatRef.current = setInterval(() => {
        if (isActiveRef.current) {
          sendAction('heartbeat')
        }
      }, 15000)
    }
  }, [sendAction])

  const leaveLivestream = useCallback(async () => {
    isActiveRef.current = false
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current)
      heartbeatRef.current = undefined
    }
    
    await sendAction('leave')
    setIsConnected(false)
  }, [sendAction])

  useEffect(() => {
    if (livestreamId && userId && userEmail) {
      isActiveRef.current = true
      joinLivestream()
    }

    // Cleanup on unmount
    return () => {
      leaveLivestream()
    }
  }, [livestreamId, userId, userEmail, joinLivestream, leaveLivestream])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        leaveLivestream()
      } else if (livestreamId && userId && userEmail) {
        isActiveRef.current = true
        joinLivestream()
      }
    }

    const handleBeforeUnload = () => {
      leaveLivestream()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [livestreamId, userId, userEmail, joinLivestream, leaveLivestream])

  return { 
    viewers, 
    windowCounts,
    isConnected, 
    viewerCount: viewers.length,
    joinLivestream,
    leaveLivestream
  }
}

// Hook for fetching all viewer data (for the main page)
export function useAllViewers() {
  const [allViewers, setAllViewers] = useState<{[key: string]: ViewerConnection[]}>({})
  const [allWindowCounts, setAllWindowCounts] = useState<{[key: string]: UserWindowCount[]}>({})
  const [loading, setLoading] = useState(true)

  const fetchViewers = async () => {
    try {
      const response = await fetch('/api/websocket')
      const data = await response.json()
      
      if (data.success) {
        setAllViewers(data.viewers || {})
        setAllWindowCounts(data.windowCounts || {})
      }
    } catch (error) {
      console.error('Failed to fetch viewers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchViewers()
    
    // Update viewer data every 5 seconds
    const interval = setInterval(fetchViewers, 5000)
    return () => clearInterval(interval)
  }, [])

  return { allViewers, allWindowCounts, loading, refetch: fetchViewers }
}
