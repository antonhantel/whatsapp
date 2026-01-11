import { NextRequest, NextResponse } from 'next/server'

const API_SERVER_URL = process.env.WHATSAPP_API_SERVER_URL || 'http://localhost:3001'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ jid: string }> }
) {
  try {
    const { jid } = await params

    const url = `${API_SERVER_URL}/api/groups/${encodeURIComponent(jid)}`

    const response = await fetch(url)

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 })
      }
      throw new Error(`API server returned ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching group from API server:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch group info',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
