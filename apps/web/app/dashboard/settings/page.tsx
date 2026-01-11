'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { CheckCircle, Loader2, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
  connected: boolean
  qrCode?: string
  message?: string
}

export default function SettingsPage() {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
  })
  const [loading, setLoading] = useState(true)
  const [polling, setPolling] = useState(false)

  const fetchStatus = async () => {
    try {
      const response = await fetch('/api/whatsapp/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)

        // If connected, stop polling
        if (data.connected) {
          setPolling(false)
        }
      }
    } catch (error) {
      console.error('Failed to fetch WhatsApp status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchStatus()

    // Start polling if not connected
    if (!status.connected) {
      setPolling(true)
    }
  }, [])

  useEffect(() => {
    if (!polling) return

    const interval = setInterval(fetchStatus, 2000) // Poll every 2 seconds

    return () => clearInterval(interval)
  }, [polling])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure WhatsApp connection and preferences
        </p>
      </div>

      {/* WhatsApp Connection Card */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          WhatsApp Connection
        </h2>
        <p className="text-gray-600 mb-6">
          Connect your WhatsApp account to start receiving summaries
        </p>

        {status.connected ? (
          // Connected State
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-12 w-12" />
              <span className="text-2xl font-semibold">Connected!</span>
            </div>
            <p className="text-gray-600 text-center max-w-md">
              Your WhatsApp account is successfully connected. You can now view your groups and generate summaries.
            </p>
            <button
              onClick={() => window.location.href = '/dashboard/groups'}
              className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              View Groups
            </button>
          </div>
        ) : status.qrCode ? (
          // QR Code Display
          <div className="flex flex-col items-center justify-center py-8 space-y-6">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold text-gray-900">
                Scan QR Code with WhatsApp
              </h3>
              <p className="text-gray-600 max-w-md">
                Open WhatsApp on your phone, go to Settings → Linked Devices → Link a Device, and scan this QR code
              </p>
            </div>

            <div className="p-6 bg-white border-4 border-gray-200 rounded-xl shadow-sm">
              <QRCodeSVG
                value={status.qrCode}
                size={280}
                level="M"
                includeMargin={false}
              />
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Waiting for scan...</span>
            </div>

            <button
              onClick={fetchStatus}
              className="mt-2 flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>
        ) : (
          // Loading or Error State
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
            <p className="text-gray-600">
              {status.message || 'Connecting to WhatsApp bridge...'}
            </p>
            <button
              onClick={fetchStatus}
              className="mt-4 px-4 py-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            >
              Retry Connection
            </button>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">ℹ️ How it works</h3>
        <ul className="space-y-2 text-blue-800 text-sm">
          <li>• The QR code connects this app to your WhatsApp account</li>
          <li>• Your messages are stored locally and never shared</li>
          <li>• You can disconnect anytime from your phone's WhatsApp settings</li>
          <li>• Summaries are generated using AI (Claude) based on your messages</li>
        </ul>
      </div>
    </div>
  )
}
