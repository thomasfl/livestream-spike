'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Suspense, useState, useEffect } from 'react'
import { Email } from '@/types/email'
import { useViewerTracking } from '@/hooks/useViewerTracking'

function LivestreamContent() {
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const [email, setEmail] = useState<Email | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Initialize viewer tracking with default values, will update when email is loaded
  const { viewers, windowCounts, isConnected, viewerCount } = useViewerTracking(
    id || 'unknown', 
    email?.id || 'anonymous', 
    email?.email || 'anonymous@example.com'
  )

  useEffect(() => {
    const fetchEmail = async () => {
      if (!id) {
        setError('No email ID provided')
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/emails')
        const data = await response.json()
        
        if (response.ok) {
          const foundEmail = data.data.find((e: Email) => e.id === id)
          if (foundEmail) {
            setEmail(foundEmail)
            
            // Update IP address when user views livestream
            try {
              await fetch(`/api/emails/${id}/ip`, {
                method: 'PUT',
              })
            } catch (ipError) {
              console.error('Failed to update IP address:', ipError)
              // Don't fail the whole page if IP update fails
            }
          } else {
            setError('Email not found')
          }
        } else {
          setError('Failed to fetch email data')
        }
      } catch {
        setError('An error occurred while fetching email data')
      } finally {
        setLoading(false)
      }
    }

    fetchEmail()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200 mb-4"
          >
            <ArrowLeftOutlined className="mr-2" />
            Back to Email List
          </Link>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Livestream View
            </h1>
            {loading && (
              <p className="text-xl text-gray-600">Loading user data...</p>
            )}
            {error && (
              <p className="text-xl text-red-600">Error: {error}</p>
            )}
            {email && (
              <p className="text-xl text-gray-600">
                Viewing as: <span className="font-semibold text-blue-600">{email.email}</span>
              </p>
            )}
          </div>
        </div>

        {/* Livestream Content Area */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-12 mb-6">
              <div className="text-6xl text-gray-400 mb-4">📹</div>
              <h2 className="text-2xl font-semibold text-gray-700 mb-2">
                Livestream Player
              </h2>
              <p className="text-gray-500">
                Livestream content would be displayed here
              </p>
            </div>
            
            {loading && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-gray-600">
                  Loading user data...
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  <strong>Error:</strong> {error}
                </p>
              </div>
            )}
            
            {email && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800">
                  <strong>User Context:</strong> This livestream is being viewed as {email.email}
                </p>
                <p className="text-blue-600 text-sm mt-1">
                  User ID: {email.id} | Registered: {new Date(email.created_at).toLocaleDateString()}
                </p>
              </div>
            )}

            {email && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-green-800">
                    Live Viewers ({viewerCount})
                  </h3>
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className={`text-sm ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                </div>
                
                {viewers.length > 0 ? (
                  <div className="space-y-2">
                    {viewers.map((viewer) => (
                      <div key={viewer.userId} className="flex items-center justify-between bg-white rounded-lg p-3 border border-green-100">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              {viewer.userEmail}
                              {viewer.userId === email.id && ' (You)'}
                            </p>
                            <p className="text-xs text-green-600">
                              Joined: {new Date(viewer.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-green-600 text-sm">No active viewers</p>
                    <p className="text-green-500 text-xs mt-1">Share this livestream to see viewers here</p>
                  </div>
                )}
              </div>
            )}

            {email && windowCounts.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">
                  Browser Windows by User
                </h3>
                
                <div className="space-y-2">
                  {windowCounts.map((userWindow) => (
                    <div key={userWindow.userId} className="flex items-center justify-between bg-white rounded-lg p-3 border border-blue-100">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            {userWindow.userEmail}
                            {userWindow.userId === email.id && ' (You)'}
                          </p>
                          <p className="text-xs text-blue-600">
                            User ID: {userWindow.userId}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <span className="text-blue-600 font-semibold mr-1">
                          {userWindow.windowCount}
                        </span>
                        <span className="text-blue-500 text-sm">
                          {userWindow.windowCount === 1 ? 'window' : 'windows'}
                        </span>
                        {userWindow.windowCount > 1 && (
                          <span className="ml-1 text-blue-500">🪟</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LivestreamPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <LivestreamContent />
    </Suspense>
  )
}
