# Port Migration Summary - 33XX Scheme

**Migration Date**: October 20, 2025  
**Status**: ✅ Complete  
**Scheme**: 33XX Port Prefix

---

## 🎯 Migration Overview

Migrated all Protogen services to use a consistent **33XX port prefix** scheme to:
- ✅ Avoid port conflicts with other development services
- ✅ Prepare for edge service routing with subdomains
- ✅ Enable future HTTPS/TLS termination via Traefik
- ✅ Provide cleaner, more memorable port numbers

---

## 📊 Port Changes

### Before → After

| Service | Old Port | New Port | Subdomain | Localhost URL |
|---------|----------|----------|-----------|---------------|
| **Portal** | 3000 | **3388** | portal.protogen.local | http://localhost:3388 |
| **Admin** | 3001 | **3355** | admin.protogen.local | http://localhost:3355 |
| **API** | 8080/8081 | **3333** | api.protogen.local | http://localhost:3333 |
| **PGAdmin** | 5050 | **3322** | pgadmin.protogen.local | http://localhost:3322 |
| **PostgreSQL** | 5432 | **3311** | db.protogen.local | localhost:3311 |

---

## 🌐 Access URLs

### Portal (User Interface)
- **Subdomain**: http://portal.protogen.local:3388
- **Localhost**: http://localhost:3388
- **Internal**: http://protogen-portal:3000 (from Docker network)

### Admin (Administration Interface)
- **Subdomain**: http://admin.protogen.local:3355
- **Localhost**: http://localhost:3355
- **Internal**: http://protogen-admin:3001 (from Docker network)

### API (Backend Services)
- **Subdomain**: http://api.protogen.local:3333/api
- **Localhost**: http://localhost:3333/api
- **Internal**: http://webserver/api (from Docker network)

### PGAdmin (Database GUI)
- **Subdomain**: http://pgadmin.protogen.local:3322
- **Localhost**: http://localhost:3322
- **Internal**: http://protogen-pgadmin:80 (from Docker network)

### PostgreSQL (Direct Database Access)
- **Localhost**: localhost:3311
- **Internal**: postgres:5432 (from Docker network)
- **Credentials**: 
  - Database: protogen_dev
  - User: protogen
  - Password: your_secure_dev_password_here

---

## 🔧 Files Modified

### Infrastructure
- `docker-compose.yml` - All port mappings updated
- Added Traefik labels to all HTTP services
- Updated service descriptions

### Frontend Applications
- `portal/src/App.tsx` - API URL configuration
- `portal/src/services/apiClient.ts` - API base URL
- `portal/src/components/OAuthLogin.tsx` - OAuth URLs
- `admin/src/App.tsx` - API and auth URLs

### Shared Library
- `shared/src/services/ApiClient.ts` - Default API URL

### Documentation
- `README.md` - Updated access URLs
- `dev-refresh.sh` - Updated displayed URLs
- Created `docs/DNS_AND_ROUTING.md` - Comprehensive routing guide

---

## 🐳 Docker Configuration

### Container Names (unchanged)
- protogen-portal
- protogen-admin
- protogen-webserver
- protogen-api
- protogen-postgres
- protogen-pgadmin

### Docker Network
All services communicate via `app-network` bridge network.

**Internal service-to-service communication** uses Docker service names:
- Portal → API: `http://webserver/api`
- API → Database: `postgres:5432`
- PGAdmin → Database: `postgres:5432`

---

## 🏷️ Traefik Labels (Future Edge Service)

All HTTP services now have Traefik labels configured:

```yaml
labels:
  - "traefik.enable=true"
  - "traefik.http.routers.portal.rule=Host(`portal.protogen.local`)"
  - "traefik.http.services.portal.loadbalancer.server.port=3000"
```

**When Traefik is added**:
- Access via: https://portal.protogen.local (no port!)
- Automatic HTTPS with Let's Encrypt
- Subdomain-based routing
- TLS termination at edge

---

## 🧪 Testing & Verification

### Verified Working
- ✅ **API**: http://localhost:3333/api/scenes returns data
- ✅ **Portal**: http://localhost:3388 loads successfully
- ✅ **Admin**: http://localhost:3355 loads successfully
- ✅ **PostgreSQL**: Accessible on localhost:3311
- ✅ **PGAdmin**: http://localhost:3322 loads

### Test API Connectivity

```bash
# Test API endpoint
curl http://localhost:3333/api/scenes

# Or with subdomain (if /etc/hosts configured)
curl http://api.protogen.local:3333/api/scenes
```

### Test Portal

```bash
# Access portal
open http://localhost:3388

# Or with subdomain
open http://portal.protogen.local:3388
```

---

## 📝 /etc/hosts Configuration (Optional)

For subdomain routing from your host machine, add to `/etc/hosts`:

```
127.0.0.1 api.protogen.local
127.0.0.1 portal.protogen.local
127.0.0.1 admin.protogen.local
127.0.0.1 pgadmin.protogen.local
127.0.0.1 db.protogen.local
```

**Location**:
- **Linux/Mac**: `/etc/hosts`
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`

**Note**: This is optional. Services work with `localhost:33XX` URLs.

---

## 🚀 Next Steps

### Immediate
- ✅ All services running on new ports
- ✅ All URLs updated in codebase
- ✅ Documentation complete
- 🔄 **Test graph viewer** at http://localhost:3388

### Future: Traefik Edge Service

When ready to add HTTPS and clean URLs:

1. Create `docker-compose.traefik.yml`
2. Configure Traefik with Let's Encrypt
3. Start with: `docker-compose -f docker-compose.yml -f docker-compose.traefik.yml up -d`
4. Access via: https://portal.protogen.local (no port!)

**See**: `docs/DNS_AND_ROUTING.md` for Traefik configuration

---

## ✅ Migration Complete

**All services successfully migrated to 33XX port scheme!**

**New URLs**:
- Portal: http://localhost:3388
- Admin: http://localhost:3355  
- API: http://localhost:3333
- PGAdmin: http://localhost:3322
- PostgreSQL: localhost:3311

**Ready for**: Edge service integration with Traefik for HTTPS

---

**Completed**: October 20, 2025  
**Next**: Test graph viewer at http://localhost:3388

