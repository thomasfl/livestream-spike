import { NextRequest } from 'next/server'

// Helper function to get client IP address (same as main API)
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const cfConnectingIP = request.headers.get('cf-connecting-ip')
  const xClientIP = request.headers.get('x-client-ip')
  const xForwarded = request.headers.get('x-forwarded')
  const forwardedFor = request.headers.get('forwarded-for')
  const forwardedProto = request.headers.get('forwarded')
  
  const cleanIP = (ip: string): string | null => {
    const trimmed = ip.trim()
    
    if (trimmed === '::1' || trimmed === '127.0.0.1' || trimmed === 'localhost') {
      return null
    }
    
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$|^(?:[0-9a-fA-F]{1,4}:)*::[0-9a-fA-F]{1,4}(?::[0-9a-fA-F]{1,4})*$/
    
    if (ipv4Regex.test(trimmed) || ipv6Regex.test(trimmed)) {
      return trimmed
    }
    
    return null
  }
  
  const headers = [forwarded, xClientIP, realIP, cfConnectingIP, xForwarded, forwardedFor, forwardedProto]
  
  for (const header of headers) {
    if (header) {
      const ips = header.split(',')
      for (const ip of ips) {
        const cleanedIP = cleanIP(ip)
        if (cleanedIP) {
          return cleanedIP
        }
      }
    }
  }
  
  const isLocalhost = forwarded === '::1' || realIP === '::1' || 
                     forwarded === '127.0.0.1' || realIP === '127.0.0.1'
  
  if (isLocalhost || process.env.NODE_ENV === 'development') {
    return 'localhost (dev)'
  }
  
  return 'unknown'
}

// GET /api/debug-ip - Debug endpoint to see IP detection
export async function GET(request: NextRequest) {
  const allHeaders: Record<string, string | null> = {}
  
  // Collect all relevant headers
  const headerNames = [
    'x-forwarded-for',
    'x-real-ip', 
    'cf-connecting-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded',
    'user-agent',
    'host',
    'referer'
  ]
  
  headerNames.forEach(name => {
    allHeaders[name] = request.headers.get(name)
  })
  
  const detectedIP = getClientIP(request)
  
  return Response.json({
    detectedIP,
    allHeaders,
    environment: process.env.NODE_ENV,
    url: request.url,
    method: request.method
  })
}
