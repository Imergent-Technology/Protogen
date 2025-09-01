# Deployment Guide

## Environment Setup

### Development Environment
1. Copy the environment template:
   ```bash
   cp env.template .env
   ```

2. Update the `.env` file with your development credentials:
   ```bash
   POSTGRES_DB=protogen_dev
   POSTGRES_USER=protogen
   POSTGRES_PASSWORD=your_secure_dev_password_here
   ```

3. Start the development environment:
   ```bash
   docker-compose up --build
   ```

### Production Environment

#### Database Configuration
For production deployment, update the environment variables with your live database credentials:

```bash
# Production Database
POSTGRES_DB=your_production_db_name
POSTGRES_USER=your_production_username
POSTGRES_PASSWORD=your_secure_production_password
```

#### Security Notes
- **Never commit `.env` files to version control**
- **Use environment variables in production**
- **Store credentials securely (password manager recommended)**
- **Rotate passwords regularly**
- **Use strong, unique passwords for each environment**

#### Deployment Steps
1. Set up environment variables on your production server
2. Configure your web server (Apache/Nginx) to point to the API container
3. Set up SSL certificates
4. Configure database backups
5. Set up monitoring and logging

## Docker Services

- **API**: Laravel backend (Port 8080)
- **UI**: React frontend (Port 3000)
- **PostgreSQL**: Database (Port 5432)
- **Nginx**: Web server for API

## Environment Variables Reference

| Variable | Development | Production | Description |
|----------|-------------|------------|-------------|
| POSTGRES_DB | protogen_dev | your_production_db_name | Database name |
| POSTGRES_USER | protogen | your_production_username | Database username |
| POSTGRES_PASSWORD | your_secure_dev_password | your_secure_production_password | Database password |
| APP_ENV | local | production | Application environment |
| APP_DEBUG | true | false | Debug mode | 