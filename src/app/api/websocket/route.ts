import { NextRequest } from 'next/server'
import { ViewerManager } from '@/lib/websocket'

// GET /api/websocket - Get all current viewers and window counts
export async function GET() {
  try {
    const viewers = ViewerManager.getAllViewers()
    const windowCounts = ViewerManager.getAllUserWindowCounts()
    return Response.json({ 
      success: true,
      viewers,
      windowCounts
    })
  } catch (error) {
    console.error('WebSocket GET error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/websocket - Handle viewer actions (join, leave, heartbeat)
export async function POST(request: NextRequest) {
  try {
    // Check if request has content
    const contentLength = request.headers.get('content-length')
    const contentType = request.headers.get('content-type')
    
    if (!contentType || !contentType.includes('application/json')) {
      return Response.json({ 
        error: 'Content-Type must be application/json' 
      }, { status: 400 })
    }
    
    if (contentLength === '0' || contentLength === null) {
      return Response.json({ 
        error: 'Request body is empty' 
      }, { status: 400 })
    }

    let body
    try {
      body = await request.json()
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return Response.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    // Validate that body is an object
    if (!body || typeof body !== 'object') {
      return Response.json({ 
        error: 'Request body must be a valid JSON object' 
      }, { status: 400 })
    }

    const { action, livestreamId, userId, userEmail, sessionId } = body

    // Validate required fields
    if (!action || !livestreamId || !userId || !sessionId) {
      return Response.json({ 
        error: 'Missing required fields: action, livestreamId, userId, sessionId' 
      }, { status: 400 })
    }

    let viewers
    
    switch (action) {
      case 'join':
        if (!userEmail) {
          return Response.json({ 
            error: 'userEmail is required for join action' 
          }, { status: 400 })
        }
        viewers = ViewerManager.addViewer(livestreamId, userId, userEmail, sessionId)
        break
        
      case 'leave':
        viewers = ViewerManager.removeViewer(livestreamId, userId, sessionId)
        break
        
      case 'heartbeat':
        if (!userEmail) {
          return Response.json({ 
            error: 'userEmail is required for heartbeat action' 
          }, { status: 400 })
        }
        viewers = ViewerManager.addViewer(livestreamId, userId, userEmail, sessionId)
        break
        
      default:
        return Response.json({ 
          error: 'Invalid action. Must be: join, leave, or heartbeat' 
        }, { status: 400 })
    }

    const windowCounts = ViewerManager.getUserWindowCounts(livestreamId)
    
    return Response.json({ 
      success: true, 
      viewers,
      totalViewers: viewers.length,
      windowCounts,
      action: action,
      livestreamId: livestreamId
    })
  } catch (error) {
    console.error('WebSocket POST error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}

