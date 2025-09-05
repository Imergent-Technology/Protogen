# Troubleshooting Guide

This guide covers common issues and their solutions when setting up and running the Protogen development environment.

## Common Issues

### 1. CORS Policy Errors

**Symptoms:**
- `Access to fetch at '...' has been blocked by CORS policy`
- `No 'Access-Control-Allow-Origin' header is present`

**Solutions:**
1. **Ensure DNS is properly configured:**
   ```bash
   # Check if protogen.local is in hosts file
   grep "protogen.local" /etc/hosts
   
   # Add if missing (Linux/macOS/WSL2)
   echo "127.0.0.1 protogen.local" | sudo tee -a /etc/hosts
   
   # Windows (PowerShell as Administrator)
   Add-Content "$env:SystemRoot\System32\drivers\etc\hosts" "`n127.0.0.1 protogen.local"
   ```

2. **Verify Vite configuration:**
   - Check that `allowedHosts` includes `protogen.local` in both `admin/vite.config.ts` and `ui/vite.config.ts`
   - Restart containers after making changes: `docker-compose restart admin ui`

3. **Check Laravel CORS configuration:**
   - Verify `api/config/cors.php` has correct `allowed_origins`
   - Ensure no duplicate CORS headers in Nginx configuration

### 2. Container Connection Issues

**Symptoms:**
- `SQLSTATE[08006] [7] could not translate host name "postgres" to address`
- `Connection refused` errors

**Solutions:**
1. **Run commands inside containers:**
   ```bash
   # Instead of running from host machine
   php artisan migrate
   
   # Run inside the API container
   docker exec -it api php artisan migrate
   ```

2. **Check container status:**
   ```bash
   docker-compose ps
   docker-compose logs api
   ```

3. **Restart containers:**
   ```bash
   docker-compose restart
   ```

### 3. Database Migration Errors

**Symptoms:**
- `SQLSTATE[42P01]: Undefined table: relation "..." does not exist`
- Migration order conflicts

**Solutions:**
1. **Check migration order:**
   - Ensure base table migrations run before dependent ones
   - Migration timestamps should be chronological

2. **Reset and re-run migrations:**
   ```bash
   docker exec -it api php artisan migrate:fresh --seed
   ```

3. **Check migration files:**
   - Verify all required tables exist in migrations
   - Check for syntax errors in migration files

### 4. Frontend Build Issues

**Symptoms:**
- CSS not loading
- Build errors
- Missing dependencies

**Solutions:**
1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build CSS:**
   ```bash
   npm run build:css:prod
   ```

3. **Clear cache:**
   ```bash
   npm run clean
   rm -rf node_modules
   npm install
   ```

### 5. Port Conflicts

**Symptoms:**
- `Address already in use` errors
- Services not accessible on expected ports

**Solutions:**
1. **Check port usage:**
   ```bash
   # Linux/macOS
   lsof -i :8080
   
   # Windows
   netstat -ano | findstr :8080
   ```

2. **Stop conflicting services:**
   ```bash
   # Stop all containers
   docker-compose down
   
   # Kill processes using specific ports
   sudo kill -9 $(lsof -t -i:8080)
   ```

3. **Change ports in docker-compose.yml if needed**

### 6. Permission Issues

**Symptoms:**
- `Permission denied` errors
- Cannot write to files

**Solutions:**
1. **Fix file ownership:**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   ```

2. **Fix file permissions:**
   ```bash
   chmod +x scripts/*.sh
   chmod 644 api/.env
   ```

3. **Run as correct user:**
   - Don't run setup scripts as root
   - Use `sudo` only for specific commands that need it

### 7. DNS Resolution Issues

**Symptoms:**
- Cannot access `progress.local`
- Browser shows "This site can't be reached"

**Solutions:**
1. **Verify hosts file entry:**
   ```bash
   # Linux/macOS/WSL2
   cat /etc/hosts | grep protogen.local
   
   # Windows
   Get-Content "$env:SystemRoot\System32\drivers\etc\hosts" | Select-String "protogen.local"
   ```

2. **Test DNS resolution:**
   ```bash
   # Linux/macOS/WSL2
   ping protogen.local
   
   # Windows
   ping protogen.local
   ```

3. **Clear DNS cache:**
   ```bash
   # Linux/macOS
   sudo systemctl restart systemd-resolved
   
   # Windows
   ipconfig /flushdns
   ```

### 8. Vite Development Server Issues

**Symptoms:**
- `Blocked request. This host is not allowed`
- Frontend not accessible

**Solutions:**
1. **Check Vite configuration:**
   - Verify `allowedHosts` in `vite.config.ts` files
   - Ensure `host: '0.0.0.0'` is set

2. **Restart containers:**
   ```bash
   docker-compose restart admin ui
   ```

3. **Check container logs:**
   ```bash
   docker-compose logs admin
   docker-compose logs ui
   ```

## Debugging Commands

### Container Management
```bash
# View all containers
docker-compose ps

# View logs for specific service
docker-compose logs -f api

# Execute command in container
docker exec -it api php artisan route:list

# Restart specific service
docker-compose restart api
```

### Database Operations
```bash
# Check database connection
docker exec -it api php artisan tinker --execute="DB::connection()->getPdo();"

# View database tables
docker exec -it api php artisan tinker --execute="Schema::getAllTables();"

# Check migrations status
docker exec -it api php artisan migrate:status
```

### Network Diagnostics
```bash
# Test API endpoint
curl -v http://protogen.local:8080/api/graph/nodes

# Test frontend
curl -v http://protogen.local:3001

# Check port availability
netstat -tulpn | grep :8080
```

## Getting Help

If you encounter issues not covered in this guide:

1. **Check the logs:**
   ```bash
   docker-compose logs -f
   ```

2. **Verify your setup:**
   - Run the setup verification: `./scripts/setup-complete.sh`
   - Check that all prerequisites are met

3. **Review recent changes:**
   - Check git history for recent modifications
   - Verify configuration files are correct

4. **Create a minimal reproduction:**
   - Document the exact steps to reproduce the issue
   - Include error messages and system information

## Prevention Tips

1. **Always use the setup scripts** for initial configuration
2. **Keep containers updated** with `docker-compose pull`
3. **Use version control** for configuration changes
4. **Test changes incrementally** rather than making multiple changes at once
5. **Document custom configurations** in your local environment
