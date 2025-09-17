// WebSocket connection manager for livestream viewer tracking
export interface ViewerConnection {
  userId: string
  userEmail: string
  sessionId: string // Unique identifier for each browser tab/window
  timestamp: number
}

export interface LivestreamViewers {
  [livestreamId: string]: ViewerConnection[]
}

export interface UserWindowCount {
  userId: string
  userEmail: string
  windowCount: number
}

// In-memory storage for active viewers (in production, use Redis or similar)
const activeViewers: LivestreamViewers = {}

export class ViewerManager {
  static addViewer(livestreamId: string, userId: string, userEmail: string, sessionId: string) {
    if (!activeViewers[livestreamId]) {
      activeViewers[livestreamId] = []
    }

    // Remove existing connection for this specific session if any
    activeViewers[livestreamId] = activeViewers[livestreamId].filter(
      viewer => !(viewer.userId === userId && viewer.sessionId === sessionId)
    )

    // Add new connection
    activeViewers[livestreamId].push({
      userId,
      userEmail,
      sessionId,
      timestamp: Date.now()
    })

    return this.getViewers(livestreamId)
  }

  static removeViewer(livestreamId: string, userId: string, sessionId: string) {
    if (!activeViewers[livestreamId]) return []

    activeViewers[livestreamId] = activeViewers[livestreamId].filter(
      viewer => !(viewer.userId === userId && viewer.sessionId === sessionId)
    )

    // Clean up empty livestream entries
    if (activeViewers[livestreamId].length === 0) {
      delete activeViewers[livestreamId]
    }

    return this.getViewers(livestreamId)
  }

  static getViewers(livestreamId: string): ViewerConnection[] {
    return activeViewers[livestreamId] || []
  }

  static getAllViewers(): LivestreamViewers {
    return activeViewers
  }

  static getViewerCount(livestreamId: string): number {
    return activeViewers[livestreamId]?.length || 0
  }

  static getUserWindowCounts(livestreamId: string): UserWindowCount[] {
    const viewers = activeViewers[livestreamId] || []
    const userCounts = new Map<string, UserWindowCount>()

    viewers.forEach(viewer => {
      const existing = userCounts.get(viewer.userId)
      if (existing) {
        existing.windowCount++
      } else {
        userCounts.set(viewer.userId, {
          userId: viewer.userId,
          userEmail: viewer.userEmail,
          windowCount: 1
        })
      }
    })

    return Array.from(userCounts.values())
  }

  static getAllUserWindowCounts(): { [livestreamId: string]: UserWindowCount[] } {
    const result: { [livestreamId: string]: UserWindowCount[] } = {}
    
    Object.keys(activeViewers).forEach(livestreamId => {
      result[livestreamId] = this.getUserWindowCounts(livestreamId)
    })

    return result
  }

  static cleanupStaleConnections() {
    const now = Date.now()
    const STALE_THRESHOLD = 30000 // 30 seconds

    Object.keys(activeViewers).forEach(livestreamId => {
      activeViewers[livestreamId] = activeViewers[livestreamId].filter(
        viewer => now - viewer.timestamp < STALE_THRESHOLD
      )

      if (activeViewers[livestreamId].length === 0) {
        delete activeViewers[livestreamId]
      }
    })
  }
}

// Clean up stale connections every 10 seconds
setInterval(() => {
  ViewerManager.cleanupStaleConnections()
}, 10000)
