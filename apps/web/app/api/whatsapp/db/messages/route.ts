import { NextRequest, NextResponse } from 'next/server'

const API_SERVER_URL = process.env.WHATSAPP_API_SERVER_URL || 'http://localhost:3001'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const queryString = searchParams.toString()

    const url = `${API_SERVER_URL}/api/messages${queryString ? `?${queryString}` : ''}`

    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`API server returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching messages from API server:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch messages. Make sure the Python API server is running',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
