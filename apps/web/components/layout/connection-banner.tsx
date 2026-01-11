'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertCircle, X } from 'lucide-react'

export function ConnectionBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function checkConnection() {
      try {
        const response = await fetch('/api/whatsapp/status')
        if (response.ok) {
          const data = await response.json()
          setIsConnected(data.connected)
        }
      } catch (error) {
        setIsConnected(false)
      }
    }

    checkConnection()
  }, [])

  if (isConnected === null || isConnected || dismissed) {
    return null
  }

  return (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="h-5 w-5 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800">
            WhatsApp not connected
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>
              Connect your WhatsApp account to view groups and generate summaries.{' '}
              <Link
                href="/dashboard/settings"
                className="font-medium underline hover:text-yellow-600"
              >
                Go to Settings to scan QR code
              </Link>
            </p>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setDismissed(true)}
            className="inline-flex rounded-md p-1.5 text-yellow-500 hover:bg-yellow-100 focus:outline-none"
          >
            <span className="sr-only">Dismiss</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
