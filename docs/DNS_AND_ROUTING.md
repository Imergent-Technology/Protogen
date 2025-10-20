# DNS and Routing Configuration

**Last Updated**: October 20, 2025  
**Status**: Active - 33XX Port Scheme

---

## 🌐 Port and Subdomain Mapping

All Protogen services use the **33XX port prefix** for consistency:

| Service | Subdomain | Internal Port | External Port | Container |
|---------|-----------|---------------|---------------|-----------|
| **Portal** | portal.protogen.local | 3000 | **3388** | protogen-portal |
| **Admin** | admin.protogen.local | 3001 | **3355** | protogen-admin |
| **API** | api.protogen.local | 80 (nginx) | **3333** | protogen-webserver |
| **PGAdmin** | pgadmin.protogen.local | 80 | **3322** | protogen-pgadmin |
| **PostgreSQL** | db.protogen.local | 5432 | **3311** | protogen-postgres |

---

## 🔗 Access URLs

### Browser Access (External)

**User Portal**:
- Subdomain: http://portal.protogen.local:3388
- Localhost: http://localhost:3388

**Admin Portal**:
- Subdomain: http://admin.protogen.local:3355
- Localhost: http://localhost:3355

**API**:
- Subdomain: http://api.protogen.local:3333
- Localhost: http://localhost:3333
- API Endpoint: http://api.protogen.local:3333/api

**PGAdmin**:
- Subdomain: http://pgadmin.protogen.local:3322
- Localhost: http://localhost:3322

**PostgreSQL** (Database client):
- Host: localhost
- Port: 3311
- Database: protogen_dev
- User: protogen

---

## 🐳 Internal Docker Network Routing

Services communicate with each other using **Docker service names** on the `app-network`:

### From Portal/Admin to API

**Use Docker service name** (preferred for internal calls):
```
http://webserver/api
```

**Or use external subdomain** (works but goes through host):
```
http://api.protogen.local:3333/api
```

### From API to Database

**Use Docker service name**:
```
Host: postgres
Port: 5432  (internal port, not 3311)
```

### Example Service-to-Service URLs

```javascript
// Portal -> API (from browser, external)
fetch('http://api.protogen.local:3333/api/scenes')

// Portal -> API (if we had server-side rendering, internal)
fetch('http://webserver/api/scenes')

// API -> Database (Laravel .env)
DB_HOST=postgres
DB_PORT=5432

// PGAdmin -> Database
Host: postgres
Port: 5432
```

---

## 🏷️ Traefik Labels (Future HTTPS/Edge Routing)

Each service has Traefik labels configured for future edge service integration:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.portal.rule=Host(`portal.protogen.local`)"
  - "traefik.http.services.portal.loadbalancer.server.port=3000"
```

**When you add Traefik**:
- Traefik will listen on ports 80/443
- Route requests to appropriate services via subdomains
- Handle HTTPS/TLS termination
- No port numbers needed in URLs

**Future URLs** (with Traefik + HTTPS):
- https://portal.protogen.local
- https://admin.protogen.local
- https://api.protogen.local
- https://pgadmin.protogen.local

---

## 📝 Host Configuration

### /etc/hosts Setup

For subdomain routing to work from your host machine, add to `/etc/hosts`:

```
127.0.0.1 api.protogen.local
127.0.0.1 portal.protogen.local
127.0.0.1 admin.protogen.local
127.0.0.1 pgadmin.protogen.local
127.0.0.1 db.protogen.local
```

**On Windows (WSL2)**, also add to `C:\Windows\System32\drivers\etc\hosts`:
```
127.0.0.1 api.protogen.local
127.0.0.1 portal.protogen.local
127.0.0.1 admin.protogen.local
127.0.0.1 pgadmin.protogen.local
```

---

## 🔧 Current Configuration

### Docker Compose Ports

```yaml
services:
  webserver:
    ports:
      - "3333:80"  # API on 3333
      
  postgres:
    ports:
      - "3311:5432"  # PostgreSQL on 3311
      
  portal:
    ports:
      - "3388:3000"  # Portal on 3388
      
  admin:
    ports:
      - "3355:3001"  # Admin on 3355
      
  pgadmin:
    ports:
      - "3322:80"  # PGAdmin on 3322
```

### Application URLs (in code)

**Shared Library** (`shared/src/services/ApiClient.ts`):
```typescript
constructor(baseUrl: string = 'http://api.protogen.local:3333/api')
```

**Portal** (`portal/src/App.tsx`):
```typescript
apiClient.setBaseUrl('http://api.protogen.local:3333/api');
```

**Admin** (`admin/src/App.tsx`):
```typescript
apiClient.setBaseUrl('http://api.protogen.local:3333/api');
```

---

## 🚀 Future: Edge Service with Traefik

### Planned Architecture

```
[Browser]
    ↓ HTTPS
[Traefik Edge Service] (ports 80/443)
    ↓ DNS Routing
    ├─ portal.protogen.local → Portal Container (3000)
    ├─ admin.protogen.local → Admin Container (3001)
    ├─ api.protogen.local → Webserver Container (80)
    └─ pgadmin.protogen.local → PGAdmin Container (80)
```

### Benefits

- ✅ **No port numbers** in URLs
- ✅ **HTTPS** with automatic Let's Encrypt certificates
- ✅ **Clean URLs**: https://portal.protogen.local
- ✅ **Load balancing** (if needed)
- ✅ **Middleware** (auth, rate limiting, etc.)

### To Add Traefik

Create `docker-compose.traefik.yml`:
```yaml
services:
  traefik:
    image: traefik:v2.10
    container_name: protogen-traefik
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"  # Traefik dashboard
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
    networks:
      - app-network
```

Then run:
```bash
docker-compose -f docker-compose.yml -f docker-compose.traefik.yml up -d
```

---

## 🔍 Debugging

### Check Service Accessibility

**From host machine**:
```bash
# API
curl http://api.protogen.local:3333/api/scenes

# Portal
curl http://portal.protogen.local:3388

# Admin
curl http://admin.protogen.local:3355
```

**From inside Docker network**:
```bash
# API from portal container
docker-compose exec portal curl http://webserver/api/scenes

# Database from API container
docker-compose exec api nc -zv postgres 5432
```

### Check Port Bindings

```bash
# See all port mappings
docker-compose ps

# Check specific service
docker port protogen-portal
docker port protogen-webserver
```

### Verify DNS Resolution

```bash
# From host
ping portal.protogen.local

# From container
docker-compose exec portal nslookup webserver
docker-compose exec portal ping -c 1 postgres
```

---

## 📚 Related Documentation

- `/docker-compose.yml` - Service configuration
- `/docs/DEVELOPMENT.md` - Development guide
- `/docs/CACHING_ISSUES.md` - Cache troubleshooting
- `./dev-refresh.sh` - Cache-busting script

---

## 🎯 Quick Reference

### Current URLs (Development)

| Service | URL | Notes |
|---------|-----|-------|
| Portal | http://portal.protogen.local:3388 | User-facing app |
| Admin | http://admin.protogen.local:3355 | Admin panel |
| API | http://api.protogen.local:3333/api | REST API |
| PGAdmin | http://pgadmin.protogen.local:3322 | Database GUI |
| PostgreSQL | localhost:3311 | Direct DB access |

### After Traefik Setup (Future)

| Service | URL | Notes |
|---------|-----|-------|
| Portal | https://portal.protogen.local | No port! |
| Admin | https://admin.protogen.local | No port! |
| API | https://api.protogen.local/api | No port! |
| PGAdmin | https://pgadmin.protogen.local | No port! |

---

**Port Scheme**: 33XX prefix for consistency  
**DNS**: Subdomain-based routing  
**Future**: Traefik edge service for HTTPS

