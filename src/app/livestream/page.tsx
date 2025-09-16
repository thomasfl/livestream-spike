'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftOutlined } from '@ant-design/icons'

export default function LivestreamPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

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
            {email && (
              <p className="text-xl text-gray-600">
                Viewing as: <span className="font-semibold text-blue-600">{email}</span>
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
            
            {email ? (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-blue-800">
                  <strong>User Context:</strong> This livestream is being viewed as {email}
                </p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">
                  <strong>Error:</strong> No user email provided
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
