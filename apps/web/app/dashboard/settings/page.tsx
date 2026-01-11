export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">
          Configure your WhatSummary preferences
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600">
          Settings page will be implemented in Phase 3, including:
        </p>
        <ul className="mt-4 list-disc list-inside space-y-2 text-gray-700">
          <li>WhatsApp phone number for self-messaging</li>
          <li>Timezone configuration</li>
          <li>Daily digest time preferences</li>
          <li>Digest enable/disable toggle</li>
          <li>Per-group digest settings</li>
        </ul>
      </div>
    </div>
  )
}
