# Railway Deployment Checklist

## Critical Issues to Fix

### 1. **Service Runtime Configuration**
- [ ] **Python API Service**: Set runtime to `Python 3.11+`
- [ ] **Go Bridge Service**: Set runtime to `Go 1.21+`
- [ ] **Node.js Frontend**: Deploy to Vercel instead (NOT Railway)

### 2. **Build & Start Commands**

#### Python API Service
- [ ] **Build Command**: 
  ```bash
  pip install -r requirements-api.txt && pip install -e whatsapp-mcp-server
  ```
- [ ] **Start Command**:
  ```bash
  cd whatsapp-mcp && python api-server.py
  ```
- [ ] **Root Directory**: `whatsapp-mcp/`

#### Go Bridge Service
- [ ] **Build Command**: Leave empty (Railway auto-detects Go)
- [ ] **Start Command**: 
  ```bash
  cd whatsapp-mcp/whatsapp-bridge && go run main.go
  ```
- [ ] **Root Directory**: `.` (root)

### 3. **Environment Variables**
- [ ] Set up all required env vars in each service:
  - [ ] `DATABASE_URL` (if connecting to database)
  - [ ] `ANTHROPIC_API_KEY`
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_KEY`
  - [ ] Any other API keys needed

### 4. **Port Configuration**
- [ ] Python API Service → Port `3001` (check `api-server.py`)
- [ ] Go Bridge → Port `3000` or custom (check `main.go`)
- [ ] Configure Railway to expose correct ports

### 5. **Git & Repository**
- [ ] Ensure submodule is properly configured:
  ```bash
  git submodule update --init --recursive
  ```
- [ ] Check `.gitmodules` for correct submodule path
- [ ] Link Railway to correct GitHub branch

### 6. **Dependencies & Lockfiles**
- [ ] [ ] `requirements-api.txt` exists in `whatsapp-mcp/`
- [ ] [ ] `go.mod` & `go.sum` exist in `whatsapp-mcp/whatsapp-bridge/`
- [ ] [ ] Run locally to verify builds work before deploying

### 7. **Dockerfile Option (Recommended)**
Instead of relying on Railway's auto-detection, create:

**Root `Dockerfile`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY . .

RUN pip install --no-cache-dir -r whatsapp-mcp/requirements-api.txt
RUN pip install -e whatsapp-mcp/whatsapp-mcp-server

EXPOSE 3001

CMD ["python", "whatsapp-mcp/api-server.py"]
```

- [ ] Create `Dockerfile` at project root
- [ ] Tell Railway to use Docker instead of auto-detect

### 8. **Service Networking**
- [ ] Expose Python API publicly if needed
- [ ] Expose Go Bridge publicly if needed
- [ ] Configure CORS if services call each other
- [ ] Use Railway's private networking for internal calls

### 9. **Deployment Order**
- [ ] Deploy Python API first (dependencies: database)
- [ ] Deploy Go Bridge second (dependencies: WhatsApp auth)
- [ ] Deploy Next.js to Vercel (not Railway)

### 10. **Monitoring & Logs**
- [ ] [ ] Check Railway logs for build errors
- [ ] [ ] Verify services are actually running
- [ ] [ ] Check health endpoints if available
- [ ] [ ] Test connectivity between services

## Quick Fix Steps

1. **For immediate Railway fix**:
   - Create a `Dockerfile` at project root (see #7 above)
   - Switch to Docker build in Railway settings
   - Redeploy

2. **Verify locally first**:
   ```bash
   cd whatsapp-mcp
   pip install -r requirements-api.txt
   pip install -e whatsapp-mcp-server
   python api-server.py
   ```

3. **For Vercel**:
   - Set root directory to `apps/web`
   - Create `apps/web/vercel.json` with proper config
