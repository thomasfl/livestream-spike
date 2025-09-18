'use client'

import { useState, useEffect } from 'react'
import { Email } from '@/types/email'
import { Tooltip, Modal } from 'antd'
import { VideoCameraOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { useRouter } from 'next/navigation'
import { useAllViewers } from '@/hooks/useViewerTracking'

export default function Home() {
  const [emails, setEmails] = useState<Email[]>([])
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
  const [emailToDelete, setEmailToDelete] = useState<Email | null>(null)
  const router = useRouter()
  const { allViewers } = useAllViewers()

  // Fetch emails on component mount
  useEffect(() => {
    fetchEmails()
  }, [])

  const fetchEmails = async () => {
    try {
      const response = await fetch('/api/emails')
      const data = await response.json()
      if (response.ok) {
        setEmails(data.data)
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage('Email added successfully!')
        setEmail('')
        fetchEmails() // Refresh the list
      } else {
        setMessage(data.error || 'An error occurred')
      }
    } catch {
      setMessage('An error occurred while adding the email')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const showDeleteModal = (email: Email) => {
    setEmailToDelete(email)
    setIsDeleteModalVisible(true)
  }

  const handleDeleteConfirm = async () => {
    if (!emailToDelete) return

    try {
      const response = await fetch(`/api/emails?id=${emailToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setMessage('Email deleted successfully!')
        fetchEmails() // Refresh the list
      } else {
        const data = await response.json()
        setMessage(data.error || 'Failed to delete email')
      }
    } catch {
      setMessage('An error occurred while deleting the email')
    } finally {
      setIsDeleteModalVisible(false)
      setEmailToDelete(null)
    }
  }

  const handleDeleteCancel = () => {
    setIsDeleteModalVisible(false)
    setEmailToDelete(null)
  }

  const handleViewLivestream = (emailId: string) => {
    router.push(`/livestream?id=${encodeURIComponent(emailId)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Agora Streaming Spike
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Add users that are allowed to view the livestream. 
          </p>
        </div>

        {/* Email Form */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Add livestream user
              </label>
              <div className="flex flex-col sm:flex-row sm:space-x-3 space-y-3 sm:space-y-0">
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter users email address"
                  required
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:w-auto w-full bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {loading ? 'Adding...' : 'Add user'}
                </button>
              </div>
            </div>
          </form>

          {message && (
            <div className={`mt-4 p-3 rounded-md ${
              message.includes('successfully') 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Email List - Responsive Design */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Emails ({emails.length})
            </h2>
          </div>
          
          {emails.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No emails registered yet. Add your first email above!
            </div>
          ) : (
            <>
              {/* Desktop Table View - Hidden on mobile */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Added
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Live Viewers
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {emails.map((email) => (
                      <tr key={email.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                          {email.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {email.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {email.ip_address ? (
                              <>
                                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                                <span className="font-mono text-xs">{email.ip_address}</span>
                                {email.last_viewed_at && (
                                  <div className="ml-2 text-xs text-gray-400">
                                    Last: {formatDate(email.last_viewed_at)}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                <div className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
                                <span className="text-gray-400 text-xs">Not viewed</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(email.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              allViewers[email.id]?.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                            }`} />
                            <span className={allViewers[email.id]?.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                              {allViewers[email.id]?.length || 0}
                            </span>
                            {allViewers[email.id]?.length > 0 && (
                              <Tooltip 
                                title={
                                  <div>
                                    <div className="font-semibold mb-1">Active Viewers:</div>
                                    {allViewers[email.id].map((viewer) => (
                                      <div key={viewer.userId} className="text-xs">
                                        {viewer.userEmail}
                                      </div>
                                    ))}
                                  </div>
                                }
                              >
                                <span className="ml-1 text-green-500 cursor-help">ⓘ</span>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center space-x-2">
                            <Tooltip title="delete user">
                              <button
                                onClick={() => showDeleteModal(email)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                              </button>
                            </Tooltip>
                            <Tooltip title="view livestream as user">
                              <button 
                                onClick={() => handleViewLivestream(email.id)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                              >
                                <VideoCameraOutlined className="text-lg" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View - Shown only on mobile */}
              <div className="md:hidden divide-y divide-gray-200">
                {emails.map((email) => (
                  <div key={email.id} className="p-4 hover:bg-gray-50">
                    {/* Email Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {email.email}
                        </h3>
                        <p className="text-xs font-mono text-gray-500 mt-1">
                          ID: {email.id}
                        </p>
                      </div>
                      <div className="flex items-center ml-3">
                        <Tooltip title="delete user">
                          <button
                            onClick={() => showDeleteModal(email)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </Tooltip>
                      </div>
                    </div>

                    {/* Mobile Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {/* IP Address */}
                      <div>
                        <span className="text-gray-500 font-medium">IP Address:</span>
                        <div className="flex items-center mt-1">
                          {email.ip_address ? (
                            <>
                              <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                              <span className="font-mono text-xs text-gray-900">
                                {email.ip_address}
                              </span>
                            </>
                          ) : (
                            <>
                              <div className="w-2 h-2 bg-gray-300 rounded-full mr-2" />
                              <span className="text-gray-400">Not viewed</span>
                            </>
                          )}
                        </div>
                        {email.last_viewed_at && (
                          <div className="text-xs text-gray-400 mt-1">
                            Last: {formatDate(email.last_viewed_at)}
                          </div>
                        )}
                      </div>

                      {/* Live Viewers */}
                      <div>
                        <span className="text-gray-500 font-medium">Live Viewers:</span>
                        <div className="flex items-center mt-1">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            allViewers[email.id]?.length > 0 ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <span className={allViewers[email.id]?.length > 0 ? 'text-green-600 font-medium' : 'text-gray-400'}>
                            {allViewers[email.id]?.length || 0}
                          </span>
                          {allViewers[email.id]?.length > 0 && (
                            <Tooltip 
                              title={
                                <div>
                                  <div className="font-semibold mb-1">Active Viewers:</div>
                                  {allViewers[email.id].map((viewer) => (
                                    <div key={viewer.userId} className="text-xs">
                                      {viewer.userEmail}
                                    </div>
                                  ))}
                                </div>
                              }
                            >
                              <span className="ml-1 text-green-500 cursor-help">ⓘ</span>
                            </Tooltip>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date Added */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <span className="text-gray-500 font-medium text-xs">Added:</span>
                      <span className="text-gray-600 text-xs ml-2">
                        {formatDate(email.created_at)}
                      </span>
                    </div>

                    {/* Livestream Button - Bottom of card */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex justify-center">
                      <Tooltip title="view livestream as user">
                        <button 
                          onClick={() => handleViewLivestream(email.id)}
                          className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                        >
                          <VideoCameraOutlined className="text-2xl" />
                        </button>
                      </Tooltip>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        title={
          <div className="flex items-center">
            <ExclamationCircleOutlined className="text-orange-500 mr-2" />
            Confirm Delete
          </div>
        }
        open={isDeleteModalVisible}
        onOk={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        {emailToDelete && (
          <p>
            Are you sure you want to delete the email{' '}
            <span className="font-semibold text-blue-600">
              {emailToDelete.email}
            </span>
            ? This action cannot be undone.
          </p>
        )}
      </Modal>
    </div>
  )
}