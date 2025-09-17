import { NextRequest } from 'next/server'
import { createServerClient } from '@/lib/supabase'

// Helper function to get client IP address
function getClientIP(request: NextRequest): string {
  // Check various headers for the real IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  const xClientIP = request.headers.get('x-client-ip')
  const xForwarded = request.headers.get('x-forwarded')
  const forwardedFor = request.headers.get('forwarded-for')
  const forwardedProto = request.headers.get('forwarded')
  
  // Helper function to validate and clean IP address
  const cleanIP = (ip: string): string | null => {
    const trimmed = ip.trim()
    
    // Skip local/private addresses in production
    if (trimmed === '::1' || trimmed === '127.0.0.1' || trimmed === 'localhost') {
      return null
    }
    
    // Basic IP validation (IPv4 and IPv6)
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4})*$/
    
    if (ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed)) {
      return trimmed
    }
    
    return null
  }
  
  // Check forwarded headers in order of preference
  const headers = [
    forwarded,
    xClientIP,
    realIP,
    cfConnectingIP,
    xForwarded,
    forwardedFor,
    forwardedProto
  ]
  
  for (const header of headers) {
    if (header) {
      // Handle comma-separated IPs (take the first valid one)
      const ips = header.split(',')
      for (const ip of ips) {
        const cleanedIP = cleanIP(ip)
        if (cleanedIP) {
          return cleanedIP
        }
      }
    }
  }
  
  // If we're in development and only have localhost, return a more descriptive value
  const isLocalhost = forwarded === '::1' || realIP === '::1' || 
                     forwarded === '127.0.0.1' || realIP === '127.0.0.1'
  
  if (isLocalhost || process.env.NODE_ENV === 'development') {
    return 'localhost (dev)'
  }
  
  return 'unknown'
}

// PUT /api/emails/[id]/ip - Update IP address for a specific email
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    if (!id) {
      return Response.json({ 
        error: 'Email ID is required' 
      }, { status: 400 })
    }

    const supabase = createServerClient()
    
    // Get the client's IP address
    const clientIP = getClientIP(request)
    
    // Debug logging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('IP Detection Debug:', {
        'x-forwarded-for': request.headers.get('x-forwarded-for'),
        'x-real-ip': request.headers.get('x-real-ip'),
        'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
        'x-client-ip': request.headers.get('x-client-ip'),
        'detected-ip': clientIP,
        'user-agent': request.headers.get('user-agent')
      })
    }
    
    // Update the email record with IP address and last viewed timestamp
    const { data, error } = await supabase
      .from('emails')
      .update({
        ip_address: clientIP,
        last_viewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return Response.json({ 
          error: 'Email not found' 
        }, { status: 404 })
      }
      
      console.error('Database error:', error)
      return Response.json({ 
        error: error.message 
      }, { status: 500 })
    }

    return Response.json({ 
      success: true,
      data: data,
      ip_address: clientIP
    })
  } catch (error) {
    console.error('Unexpected error in PUT /api/emails/[id]/ip:', error)
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
