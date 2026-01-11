# WhatSummary

AI-powered WhatsApp group message summarizer built on top of the WhatsApp MCP server.

> **Windows Users**: Please see [WINDOWS_SETUP.md](./WINDOWS_SETUP.md) for detailed Windows-specific setup instructions.

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
2. **Python** 3.8+ (for the API server)
3. **Go** 1.20+ (for the WhatsApp bridge)
4. **Supabase** account and project
5. **Anthropic API** key (for Claude Sonnet 4)

## Setup Instructions

### 1. Install Python Dependencies

```bash
cd whatsapp-mcp
pip install -r requirements-api.txt
pip install -e whatsapp-mcp-server
```

### 2. Start the Python API Server

```bash
cd whatsapp-mcp
python api-server.py
```

This starts the database access API on port 3001.

### 3. Start the WhatsApp Go Bridge

```bash
cd whatsapp-mcp/whatsapp-bridge
go run main.go
```

On first run, scan the QR code with your WhatsApp mobile app to authenticate.

### 4. Set Up Supabase Database

1. Create a new Supabase project at https://supabase.com
2. Run the SQL schema from `packages/database/schema.sql` in the Supabase SQL Editor
3. Copy your project URL and keys

### 5. Configure Environment Variables

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
WHATSAPP_API_SERVER_URL=http://localhost:3001
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Install Dependencies and Run

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

The application uses a three-tier architecture to avoid native module compilation issues:

```
┌──────────────────┐
│  Next.js App     │  Port 3000 - Frontend & API orchestration
│  (apps/web)      │
└────────┬─────────┘
         │
         ├─── HTTP ───> Python API Server (port 3001)
         │              └─ Database access via whatsapp.py
         │              └─ Reads messages.db
         │
         └─── HTTP ───> Go WhatsApp Bridge (port 8080)
                        └─ WhatsApp connection & messaging
                        └─ Stores messages in SQLite
```

- **Database**: WhatsApp messages stored in SQLite by the Go bridge at `./whatsapp-mcp/whatsapp-bridge/store/messages.db`
- **Data Access**: HTTP calls to Python API server (no native SQLite bindings in Node.js)
- **User Data**: Stored in Supabase (profiles, settings, summaries)
- **AI Processing**: Claude Sonnet 4 via Anthropic API
- **Messaging**: REST calls to Go bridge for sending messages

## Troubleshooting

### Groups not loading?

1. Ensure Python API server is running: `cd whatsapp-mcp && python api-server.py` (port 3001)
2. Ensure WhatsApp Go bridge is running: `cd whatsapp-mcp/whatsapp-bridge && go run main.go` (port 8080)
3. Check that messages.db exists at `whatsapp-mcp/whatsapp-bridge/store/messages.db`
4. Verify environment variable `WHATSAPP_API_SERVER_URL=http://localhost:3001` is set

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
