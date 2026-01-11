import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { listChats } from '@/lib/mcp-client'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all chats from WhatsApp MCP
    const chats = await listChats()

    // Filter only groups
    const groups = chats.filter(chat => chat.is_group)

    // Get user's group settings from Supabase
    const { data: groupSettings } = await supabase
      .from('group_settings')
      .select('*')
      .eq('user_id', user.id)

    // Merge settings with groups
    const groupsWithSettings = groups.map(group => {
      const settings = groupSettings?.find(s => s.whatsapp_group_jid === group.jid)
      return {
        ...group,
        priority: settings?.priority || 'medium',
        include_in_digest: settings?.include_in_digest ?? true,
      }
    })

    return NextResponse.json(groupsWithSettings)
  } catch (error) {
    console.error('Error fetching groups:', error)
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    )
  }
}
