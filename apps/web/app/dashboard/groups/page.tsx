'use client'

import { useEffect, useState } from 'react'
import { GroupCard } from '@/components/groups/group-card'

interface Group {
  jid: string
  name: string
  is_group: boolean
  last_message_time: string | null
  message_count_24h?: number
  priority?: 'high' | 'medium' | 'low' | 'muted'
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchGroups() {
      try {
        const response = await fetch('/api/whatsapp/groups')
        if (!response.ok) {
          throw new Error('Failed to fetch groups')
        }
        const data = await response.json()
        setGroups(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchGroups()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
          <p className="mt-2 text-gray-600">Loading your groups...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-10 bg-gray-200 rounded w-3/4"></div>
              <div className="mt-4 h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900">Error</h3>
          <p className="mt-2 text-red-700">{error}</p>
          <p className="mt-2 text-sm text-red-600">
            Make sure the WhatsApp MCP bridge is running and accessible.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Groups</h1>
        <p className="mt-2 text-gray-600">
          {groups.length} group{groups.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900">No groups found</h3>
          <p className="mt-2 text-gray-600">
            Make sure the WhatsApp MCP bridge is running and has synced your messages.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {groups.map((group) => (
            <GroupCard key={group.jid} {...group} />
          ))}
        </div>
      )}
    </div>
  )
}
