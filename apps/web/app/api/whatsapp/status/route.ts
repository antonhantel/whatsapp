import { NextResponse } from 'next/server'

const BRIDGE_URL = process.env.WHATSAPP_BRIDGE_URL || 'http://localhost:8080'

export async function GET() {
  try {
    const response = await fetch(`${BRIDGE_URL}/api/whatsapp/status`, {
      cache: 'no-store',
    })

    if (!response.ok) {
      // Bridge not reachable or endpoint doesn't exist yet
      return NextResponse.json({
        connected: false,
        message: 'WhatsApp bridge not available. Make sure the Go bridge is running.',
      })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch WhatsApp status:', error)
    return NextResponse.json({
      connected: false,
      message: 'Cannot connect to WhatsApp bridge. Please check if it is running.',
    })
  }
}
