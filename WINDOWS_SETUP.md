# WhatSummary - Windows Setup Guide

This guide will help you set up WhatSummary on Windows without running into native module compilation issues.

## Prerequisites

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Go** (v1.20+) - [Download](https://golang.org/dl/) (for WhatsApp bridge)
- **Git** - [Download](https://git-scm.com/download/win)

## Setup Steps

### 1. Clone the Repository

```powershell
cd C:\
git clone https://github.com/YOUR_USERNAME/whatsapp.git
cd whatsapp
git submodule update --init --recursive
```

### 2. Fix SSL Certificate Issues (If Needed)

If you encounter SSL certificate errors during npm install:

```powershell
cd apps\web
echo strict-ssl=false > .npmrc
```

> **Note**: Only use this in development. For production, configure proper SSL certificates.

### 3. Install Next.js Dependencies

```powershell
cd apps\web
npm install
```

> The dependencies have been updated to remove `better-sqlite3` which caused compilation errors on Windows.

### 4. Set Up Python API Server

The Python API server provides database access without needing native SQLite bindings in Node.js.

```powershell
# Navigate to the whatsapp-mcp directory
cd ..\..\whatsapp-mcp

# Install Python dependencies
pip install -r requirements-api.txt

# Also install the MCP server dependencies
cd whatsapp-mcp-server
pip install -e .
cd ..
```

### 5. Configure Environment Variables

Create `.env.local` in `apps/web/`:

```powershell
cd ..\apps\web
copy .env.example .env.local
```

Edit `.env.local` and add:

```env
# Supabase (create project at https://supabase.com)
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# WhatsApp Services
WHATSAPP_BRIDGE_URL=http://localhost:8080
WHATSAPP_API_SERVER_URL=http://localhost:3001

# Anthropic API
ANTHROPIC_API_KEY=sk-ant-...

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Set Up Supabase Database

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once created, go to the SQL Editor
3. Copy and paste the entire contents of `packages/database/schema.sql`
4. Run the SQL to create the tables

### 7. Start the Services

You'll need **3 terminal windows**:

#### Terminal 1: Python API Server

```powershell
cd C:\whatsapp\whatsapp-mcp
python api-server.py
```

This should start on port 3001 and show: `Starting WhatsApp API Server on port 3001...`

#### Terminal 2: WhatsApp Go Bridge

```powershell
cd C:\whatsapp\whatsapp-mcp\whatsapp-bridge
go run main.go
```

This will:
1. Start the WhatsApp client
2. Show a QR code for linking your WhatsApp account (first time only)
3. Start listening on port 8080

#### Terminal 3: Next.js Development Server

```powershell
cd C:\whatsapp\apps\web
npm run dev
```

This starts the Next.js app on port 3000.

## Accessing the Application

1. Open your browser to **http://localhost:3000**
2. Create an account (signup)
3. Navigate to the Groups page to see your WhatsApp groups

## Architecture Overview

```
┌──────────────────┐
│  Next.js App     │  Port 3000
│  (apps/web)      │
└────────┬─────────┘
         │
         ├─── HTTP ───> Python API Server (port 3001)
         │              └─ SQLite database access
         │
         └─── HTTP ───> Go WhatsApp Bridge (port 8080)
                        └─ WhatsApp messaging
```

### Why This Architecture?

- **Python API Server**: Provides database access without requiring `better-sqlite3` native compilation in Node.js
- **Go Bridge**: Handles WhatsApp connection using the whatsmeow library
- **Next.js App**: Frontend and API orchestration

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### Python Module Not Found

Make sure you're in the correct directory and Python packages are installed:

```powershell
cd C:\whatsapp\whatsapp-mcp
pip install -r requirements-api.txt
pip install -e whatsapp-mcp-server
```

### WhatsApp Bridge Not Connecting

1. Make sure you scanned the QR code
2. Check that your phone has internet connection
3. Look for error messages in the Go bridge terminal

### "Failed to fetch groups" Error

This means the Python API server isn't running:

1. Check that `python api-server.py` is running in Terminal 1
2. Verify it's listening on port 3001
3. Check for any Python errors in that terminal

### Go Build Errors

If Go packages are missing:

```powershell
cd C:\whatsapp\whatsapp-mcp\whatsapp-bridge
go mod download
go mod tidy
```

## Next Steps

Once everything is running:

1. **Configure Group Priorities**: Go to Groups page and set priorities
2. **Generate Summaries**: Click on a group to generate AI summaries (Phase 2 feature)
3. **Set Up Daily Digest**: Go to Settings to configure automatic summaries (Phase 3 feature)

## Development Tips

### Hot Reload

- Next.js automatically reloads when you edit files in `apps/web/`
- Python API server needs manual restart after code changes
- Go bridge needs manual restart after code changes

### Logs

- Next.js logs: Terminal 3
- Python API logs: Terminal 1
- WhatsApp bridge logs: Terminal 2

### Database Access

To view the WhatsApp messages database directly:

```powershell
# Install SQLite if needed
# Then:
cd C:\whatsapp\whatsapp-mcp\whatsapp-bridge\store
sqlite3 messages.db
```

## Support

If you encounter issues not covered here:

1. Check that all 3 services are running
2. Verify all environment variables are set
3. Check the logs in each terminal for specific error messages
4. Make sure you're using compatible versions of Node.js, Python, and Go

## Production Deployment

For production deployment:

1. Set proper SSL certificates (remove `strict-ssl=false`)
2. Use environment-specific URLs (not localhost)
3. Set up proper authentication and CORS policies
4. Consider using PM2 or similar for process management
5. Deploy each service separately (Next.js, Python API, Go bridge)
