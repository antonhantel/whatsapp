# Go WhatsApp Bridge - QR Code Integration

This guide explains how to modify the Go WhatsApp bridge to expose QR code and connection status endpoints for the Settings page.

## Overview

The bridge needs to provide two HTTP endpoints:
1. `GET /api/whatsapp/status` - Returns connection status and QR code
2. Modify existing pairing flow to store QR code

## Implementation Steps

### Step 1: Add Global Variables (Top of main.go)

Add these variables near the top of the file, after imports:

```go
var (
    // Connection state
    isConnected bool
    currentQRCode string
    qrMutex sync.RWMutex
)
```

### Step 2: Modify QR Event Handler

Find the QR code event handler in `main.go` (around line 850-900). It should look like:

```go
if evt.Event == "code" {
    qrcode.WriteFile(evt.Code, qrcode.Medium, 256, "qr.png")
    // ... more code
}
```

Replace it with:

```go
if evt.Event == "code" {
    // Store QR code for API endpoint
    qrMutex.Lock()
    currentQRCode = evt.Code
    isConnected = false
    qrMutex.Unlock()

    // Still create the file for terminal display
    qrcode.WriteFile(evt.Code, qrcode.Medium, 256, "qr.png")

    // Terminal display code stays the same...
}
```

### Step 3: Add Connection Success Handler

Find where the client connects successfully (look for "Successfully paired"). Add:

```go
// When connection succeeds
qrMutex.Lock()
isConnected = true
currentQRCode = ""
qrMutex.Unlock()
```

### Step 4: Add Status Endpoint

In the `startRESTServer` function (around line 679), add this new endpoint before the server starts:

```go
// Handler for WhatsApp connection status and QR code
http.HandleFunc("/api/whatsapp/status", func(w http.ResponseWriter, r *http.Request) {
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    qrMutex.RLock()
    connected := isConnected
    qrCode := currentQRCode
    qrMutex.RUnlock()

    w.Header().Set("Content-Type", "application/json")

    response := map[string]interface{}{
        "connected": connected,
    }

    if !connected && qrCode != "" {
        response["qrCode"] = qrCode
        response["message"] = "Scan QR code with WhatsApp app"
    } else if !connected {
        response["message"] = "Waiting for QR code..."
    } else {
        response["message"] = "Connected to WhatsApp"
    }

    json.NewEncoder(w).Encode(response)
})
```

### Step 5: Add CORS Support (Optional but Recommended)

To allow the Next.js app to call these endpoints, add CORS headers. Add this helper function:

```go
func enableCORS(w *http.ResponseWriter) {
    (*w).Header().Set("Access-Control-Allow-Origin", "*")
    (*w).Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
    (*w).Header().Set("Access-Control-Allow-Headers", "Content-Type")
}
```

Then add to each endpoint handler:

```go
http.HandleFunc("/api/whatsapp/status", func(w http.ResponseWriter, r *http.Request) {
    enableCORS(&w)

    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    // ... rest of handler
})
```

## Complete Code Reference

Here's the complete code for the status endpoint with all features:

```go
// Handler for WhatsApp connection status and QR code
http.HandleFunc("/api/whatsapp/status", func(w http.ResponseWriter, r *http.Request) {
    // Enable CORS
    w.Header().Set("Access-Control-Allow-Origin", "*")
    w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
    w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

    // Handle preflight
    if r.Method == http.MethodOptions {
        w.WriteHeader(http.StatusOK)
        return
    }

    // Only allow GET
    if r.Method != http.MethodGet {
        http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
        return
    }

    // Get current state
    qrMutex.RLock()
    connected := isConnected
    qrCode := currentQRCode
    qrMutex.RUnlock()

    // Build response
    w.Header().Set("Content-Type", "application/json")

    response := map[string]interface{}{
        "connected": connected,
    }

    if !connected && qrCode != "" {
        response["qrCode"] = qrCode
        response["message"] = "Scan QR code with WhatsApp app"
    } else if !connected {
        response["message"] = "Waiting for QR code... Please restart the bridge if this persists."
    } else {
        response["message"] = "Connected to WhatsApp"
    }

    json.NewEncoder(w).Encode(response)
})
```

## Testing the Endpoints

### Test Status Endpoint

```bash
curl http://localhost:8080/api/whatsapp/status
```

Expected responses:

**When not connected (waiting for QR):**
```json
{
  "connected": false,
  "qrCode": "2@abcdef123456...",
  "message": "Scan QR code with WhatsApp app"
}
```

**When connected:**
```json
{
  "connected": true,
  "message": "Connected to WhatsApp"
}
```

## Deployment Checklist

- [ ] Added global variables for connection state
- [ ] Modified QR event handler to store QR code
- [ ] Added connection success handler
- [ ] Added `/api/whatsapp/status` endpoint
- [ ] Added CORS support
- [ ] Tested endpoint locally
- [ ] Restarted bridge and verified QR code appears
- [ ] Scanned QR and verified status changes to connected
- [ ] Verified Next.js Settings page displays QR code
- [ ] Verified connection banner disappears when connected

## Troubleshooting

**QR code not appearing in Settings:**
1. Check bridge is running: `curl http://localhost:8080/api/whatsapp/status`
2. Check WHATSAPP_BRIDGE_URL in Next.js .env.local
3. Check browser console for CORS errors
4. Restart the Go bridge

**Connection status not updating:**
1. Verify the global variable is being set when pairing succeeds
2. Check the event handler is called
3. Test the endpoint directly with curl

**CORS errors:**
1. Ensure CORS headers are added to all endpoints
2. Handle OPTIONS preflight requests
3. Restart the Go bridge after changes

## File Locations

- Go bridge: `whatsapp-mcp/whatsapp-bridge/main.go`
- Next.js Settings: `apps/web/app/dashboard/settings/page.tsx`
- Status API: `apps/web/app/api/whatsapp/status/route.ts`

## Next Steps

Once the Go bridge is modified:

1. Restart the bridge: `cd whatsapp-mcp/whatsapp-bridge && go run main.go`
2. Open Next.js app: `http://localhost:3000`
3. Login and go to Settings
4. You should see the QR code!
5. Scan with WhatsApp app
6. Page auto-updates to "Connected!"
7. Go to Groups page to see your WhatsApp groups
