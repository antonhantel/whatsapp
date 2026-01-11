import Link from 'next/link'
import { MessageSquare, Users } from 'lucide-react'

interface GroupCardProps {
  jid: string
  name: string
  message_count_24h?: number
  last_message_time: string | null
  priority?: 'high' | 'medium' | 'low' | 'muted'
}

const priorityColors = {
  high: 'bg-red-100 text-red-800',
  medium: 'bg-yellow-100 text-yellow-800',
  low: 'bg-green-100 text-green-800',
  muted: 'bg-gray-100 text-gray-800',
}

export function GroupCard({
  jid,
  name,
  message_count_24h = 0,
  last_message_time,
  priority = 'medium',
}: GroupCardProps) {
  const lastActive = last_message_time
    ? new Date(last_message_time).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No recent activity'

  return (
    <Link
      href={`/dashboard/groups/${encodeURIComponent(jid)}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <Users className="h-10 w-10 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {name || jid}
            </h3>
            <p className="text-sm text-gray-500">{lastActive}</p>
          </div>
        </div>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority]}`}
        >
          {priority}
        </span>
      </div>

      <div className="mt-4 flex items-center text-sm text-gray-600">
        <MessageSquare className="h-4 w-4 mr-2" />
        <span>{message_count_24h} messages in last 24h</span>
      </div>
    </Link>
  )
}
