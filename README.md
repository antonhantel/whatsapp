# WhatSummary

AI-powered WhatsApp group message summarizer built on top of the WhatsApp MCP server.

## Project Structure

```
whatsummary/
├── whatsapp-mcp/              # WhatsApp MCP server (submodule - DO NOT MODIFY)
├── apps/
│   └── web/                   # Next.js 14 application
└── packages/
    └── database/              # Database schema and types
```

## Prerequisites

1. **Node.js** 18+ and npm
2. **WhatsApp MCP Bridge** running on port 8080
3. **Supabase** account and project
4. **Anthropic API** key (for Claude Sonnet 4)

## Setup Instructions

### 1. Start the WhatsApp MCP Bridge

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

On first run, scan the QR code with your WhatsApp mobile app to authenticate.

### 2. Set Up Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `packages/database/schema.sql` in the Supabase SQL Editor
3. Copy your project URL and keys

### 3. Configure Environment Variables

```bash
cd apps/web
cp .env.example .env.local
```

Edit `.env.local` with your actual values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
WHATSAPP_BRIDGE_URL=http://localhost:8080
ANTHROPIC_API_KEY=sk-ant-...
```

### 4. Install Dependencies and Run

```bash
cd apps/web
npm install
npm run dev
```

The application will be available at http://localhost:3000

## Current Status: Phase 1 Complete ✅

### Implemented Features

- ✅ Next.js 14 with App Router and TypeScript
- ✅ Tailwind CSS styling
- ✅ Supabase authentication (email/password)
- ✅ MCP client library for WhatsApp data access
- ✅ Dashboard layout with sidebar navigation
- ✅ Groups list page showing all WhatsApp groups
- ✅ Message count tracking (24h window)
- ✅ Authentication flow (login/signup)

### What Works Now

1. **User Authentication**: Sign up and log in with email/password
2. **View Groups**: See all your WhatsApp groups with message counts
3. **Basic Dashboard**: Overview page with stats (placeholders)
4. **Responsive Layout**: Mobile-friendly sidebar and navigation

## Next Phases

### Phase 2: Summarization Engine (Next)

- [ ] Claude Summarizer integration
- [ ] Summary generation API
- [ ] Group detail page with summary timeline
- [ ] Summary cards with expandable sections
- [ ] Action items extraction

### Phase 3: Daily Digest & Self-Messaging

- [ ] Settings page for digest configuration
- [ ] Daily digest generator
- [ ] Self-messaging via WhatsApp
- [ ] Scheduled digest delivery
- [ ] Per-group digest preferences

### Phase 4: Real-time & Polish

- [ ] Real-time updates with Supabase Realtime
- [ ] On-demand "Catch me up" feature
- [ ] Enhanced mobile UI
- [ ] PWA support

## Architecture Notes

- **Database**: WhatsApp messages stored in SQLite by the MCP bridge at `./whatsapp-mcp/whatsapp-bridge/store/messages.db`
- **Data Access**: Direct SQLite reads for messages, REST API calls to bridge for sending
- **User Data**: Stored in Supabase (profiles, settings, summaries)
- **AI Processing**: Claude Sonnet 4 via Anthropic API

## Troubleshooting

### Groups not loading?

1. Ensure WhatsApp MCP bridge is running: `cd whatsapp-mcp/whatsapp-bridge && go run main.go`
2. Check that the bridge is accessible at http://localhost:8080
3. Verify messages.db exists at `whatsapp-mcp/whatsapp-bridge/store/messages.db`

### Authentication errors?

1. Verify Supabase credentials in `.env.local`
2. Check that the database schema has been applied
3. Ensure RLS policies are enabled

### Build errors?

1. Delete `node_modules` and `.next`: `rm -rf node_modules .next`
2. Reinstall: `npm install`
3. Run: `npm run dev`

## Development

```bash
# Start development server
cd apps/web
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## License

ISC
