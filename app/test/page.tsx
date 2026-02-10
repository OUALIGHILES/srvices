'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestPage() {
  const [status, setStatus] = useState<{
    status: string
    message?: string
    serviceCount?: number
    error?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const response = await fetch('/api/debug')
        const data = await response.json()
        setStatus(data)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        setStatus({
          status: 'error',
          message: 'Failed to test connection',
          error: message,
        })
      } finally {
        setLoading(false)
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">ServiceHailing Diagnostic</h1>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-blue-600 animate-spin" />
            </div>
            <p className="mt-4 text-gray-600">Testing connection...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Status Card */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold mb-4">Connection Status</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      status?.status === 'success' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  />
                  <span className="font-medium">
                    {status?.status === 'success' ? 'Connected' : 'Failed'}
                  </span>
                </div>

                {status?.message && (
                  <p className="text-gray-600">{status.message}</p>
                )}

                {status?.error && (
                  <p className="text-red-600 text-sm">Error: {status.error}</p>
                )}

                {status?.serviceCount !== undefined && (
                  <p className="text-gray-700">
                    Services in database: <span className="font-semibold">{status.serviceCount}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => (window.location.href = '/')}
                className="bg-blue-600 text-white hover:bg-blue-700"
              >
                Go to Home
              </Button>
              <Button
                onClick={() => (window.location.href = '/api/seed')}
                variant="outline"
              >
                Trigger Seed
              </Button>
            </div>

            {/* Debug Info */}
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h3 className="font-semibold mb-3">Debug Info</h3>
              <pre className="text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-48">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
