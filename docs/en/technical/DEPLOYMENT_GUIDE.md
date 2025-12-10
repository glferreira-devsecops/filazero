# FilaZero Saúde - Production Deployment Guide

## Overview

This guide provides step-by-step instructions for deploying FilaZero Saúde in production environments. Choose the deployment option that best fits your needs:

1. **VPS Deployment** (DigitalOcean, Linode, Vultr) - Full control, $5-10/month
2. **Cloud Platform** (Fly.io, Railway, Render) - Zero DevOps, $5-15/month
3. **Docker Deployment** - Portable, works anywhere
4. **On-Premise** - Self-hosted on clinic servers

---

## Prerequisites

### System Requirements

**Minimum**:

- 1 CPU core
- 1GB RAM
- 25GB SSD storage
- Ubuntu 22.04 LTS (or compatible Linux)

**Recommended**:

- 2 CPU cores
- 2GB RAM
- 50GB SSD storage
- Regular automated backups

### Software Dependencies

- **Node.js**: 18.x or higher (for building frontend)
- **npm**: 9.x or higher
- **Nginx**: Latest stable (for reverse proxy)
- **Certbot**: For SSL certificates (Let's Encrypt)

---

## Option 1: VPS Deployment (DigitalOcean/Linode)

### Step 1: Provision VPS

```bash
# Example: DigitalOcean $6/month droplet
- Region: Choose closest to target users
- Image: Ubuntu 22.04 LTS
- Size: Basic ($6/mo), 1GB RAM, 1 CPU, 25GB SSD
- SSH: Add your SSH key
```

### Step 2: Initial Server Setup

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y nginx certbot python3-certbot-nginx unzip curl

# Create non-root user
adduser filazero
usermod -aG sudo filazero
su - filazero
```

### Step 3: Install Node.js (for frontend build)

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify
node --version  # Should show v18.x
npm --version   # Should show 9.x+
```

### Step 4: Deploy Backend (PocketBase)

```bash
# Create directory
sudo mkdir -p /opt/filazero/backend
cd /opt/filazero/backend

# Download PocketBase (adjust URL for your platform)
# For Linux AMD64:
curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_amd64.zip -o pb.zip

# For Linux ARM64 (if on ARM server):
# curl -L https://github.com/pocketbase/pocketbase/releases/download/v0.21.5/pocketbase_0.21.5_linux_arm64.zip -o pb.zip

# Extract
unzip pb.zip
chmod +x pocketbase
rm pb.zip

# Upload your pb_migrations folder
# scp -r backend/pb_migrations filazero@your-server:/opt/filazero/backend/

# Create systemd service
sudo nano /etc/systemd/system/pocketbase.service
```

**`/etc/systemd/system/pocketbase.service`**:

```ini
[Unit]
Description=PocketBase Backend for FilaZero
After=network.target

[Service]
Type=simple
User=filazero
Group=filazero
WorkingDirectory=/opt/filazero/backend
ExecStart=/opt/filazero/backend/pocketbase serve --http=127.0.0.1:8090
Restart=always
RestartSec=5s

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase
sudo systemctl status pocketbase  # Should show "active (running)"
```

### Step 5: Build and Deploy Frontend

```bash
# On your local machine, build frontend
cd filazero-saude/frontend
npm install
npm run build

# Upload dist folder to server
scp -r dist filazero@your-server:/opt/filazero/frontend

# On server, verify
ls /opt/filazero/frontend/dist  # Should show index.html, assets/
```

### Step 6: Configure Nginx

```bash
# On server
sudo nano /etc/nginx/sites-available/filazero
```

**`/etc/nginx/sites-available/filazero`**:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Frontend static files
    location / {
        root /opt/filazero/frontend/dist;
        try_files $uri $uri/ /index.html;

        # Caching for static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # PocketBase API
    location /api {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # PocketBase Admin UI
    location /_/ {
        proxy_pass http://127.0.0.1:8090;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # PocketBase Realtime (WebSocket)
    location /api/realtime {
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/filazero /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

### Step 7: Setup SSL (HTTPS)

```bash
# Install SSL certificate with Certbot
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Follow prompts:
# - Enter email for renewal notifications
# - Agree to terms
# - Choose option 2: Redirect HTTP to HTTPS

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Step 8: Configure Firewall

```bash
# Allow HTTP, HTTPS, SSH
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
sudo ufw status
```

### Step 9: Create Admin User

```bash
# Visit https://your-domain.com/_/
# Create initial admin account
# Email: admin@your-clinic.com
# Password: (strong password)

# Collections will be auto-created via migrations
```

### Step 10: Verify Deployment

```bash
# Check frontend
curl https://your-domain.com

# Check API
curl https://your-domain.com/api/health

# Check PocketBase logs
sudo journalctl -u pocketbase -f
```

---

## Option 2: Fly.io Deployment (Recommended for Simplicity)

### Prerequisites

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login
```

### Step 1: Prepare Project

Create `Dockerfile` in project root:

```dockerfile
# Build frontend
FROM node:18-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Final image
FROM alpine:latest

# Install ca-certificates for HTTPS
RUN apk --no-cache add ca-certificates

# Copy built frontend
COPY --from=frontend-build /app/dist /dist

# Copy PocketBase binary and migrations
COPY backend/pocketbase /pocketbase
COPY backend/pb_migrations /pb_migrations

# Expose port
EXPOSE 8090

# Run PocketBase, serving frontend from /dist
CMD ["/pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb_data", "--publicDir=/dist"]
```

Create `fly.toml`:

```toml
app = "filazero-saude"
primary_region = "gru"  # São Paulo, Brazil (choose nearest to users)

[build]
  dockerfile = "Dockerfile"

[env]
  PORT = "8090"

[[services]]
  internal_port = 8090
  protocol = "tcp"

  [[services.ports]]
    handlers = ["http"]
    port = 80
    force_https = true

  [[services.ports]]
    handlers = ["tls", "http"]
    port = 443

  [[services.http_checks]]
    interval = "30s"
    timeout = "5s"
    grace_period = "10s"
    method = "GET"
    path = "/api/health"

[[vm]]
  cpu_kind = "shared"
  cpus = 1
  memory_mb = 512

[mounts]
  source = "filazero_data"
  destination = "/pb_data"
```

### Step 2: Create Volume (for database persistence)

```bash
fly volumes create filazero_data --region gru --size 3
```

### Step 3: Deploy

```bash
# Launch app
fly launch --config fly.toml

# Deploy
fly deploy

# Check status
fly status

# View logs
fly logs

# Your app will be at: https://filazero-saude.fly.dev
```

### Step 4: Custom Domain (Optional)

```bash
# Add custom domain
fly certs add your-domain.com

# Add CNAME/A record in your DNS:
# CNAME: your-domain.com -> filazero-saude.fly.dev
# Or A: your-domain.com -> (IP from `fly ips list`)
```

### Cost: ~$5-10/month

---

## Option 3: Railway Deployment

### Step 1: Prepare Project

Create `railway.toml`:

```toml
[build]
builder = "dockerfile"

[deploy]
startCommand = "/pocketbase serve --http=0.0.0.0:$PORT"
```

Use same `Dockerfile` as Fly.io example above.

### Step 2: Deploy

```bash
# Install Railway CLI
npm install -g railway

# Login
railway login

# Initialize project
railway init

# Deploy
railway up

# Add volume for /pb_data (via Railway dashboard)
# Environment > Add Variable > RAILWAY_VOLUME_MOUNT_PATH=/pb_data
```

### Cost: ~$5/month (free tier available)

---

## Option 4: Docker Compose (Self-Hosted)

### docker-compose.yml

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    depends_on:
      - backend

  backend:
    image: alpine:latest
    command: /pocketbase serve --http=0.0.0.0:8090
    ports:
      - "8090:8090"
    volumes:
      - ./backend/pocketbase:/pocketbase
      - ./backend/pb_migrations:/pb_migrations
      - pb_data:/pb_data
    restart: always

volumes:
  pb_data:
```

### Frontend Dockerfile

```dockerfile
# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf (for frontend container)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://backend:8090;
        proxy_set_header Host $host;
    }

    location /_/ {
        proxy_pass http://backend:8090;
    }
}
```

### Deploy

```bash
docker-compose up -d
# Frontend: http://localhost:3000
# Backend API: http://localhost:8090
```

---

## Environment Variables

### Backend (PocketBase)

Optional environment variables:

```bash
# Custom HTTP bind address
PB_HTTP=0.0.0.0:8090

# Data directory
PB_DATA=/pb_data

# Public directory (for serving frontend)
PB_PUBLIC=/dist
```

### Frontend

Update `frontend/src/services/pocketbase.js` with your production URL:

```javascript
import PocketBase from 'pocketbase';

const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090';
const pb = new PocketBase(PB_URL);

export default pb;
```

Add `.env` file in frontend:

```bash
VITE_POCKETBASE_URL=https://your-domain.com
```

Rebuild frontend after changing:

```bash
npm run build
```

---

## Database Backup & Restore

### Backup

```bash
# Stop PocketBase
sudo systemctl stop pocketbase

# Backup database file
cp /opt/filazero/backend/pb_data/data.db /backup/data_$(date +%Y%m%d_%H%M%S).db

# Or backup entire pb_data folder
tar -czf /backup/pb_data_$(date +%Y%m%d_%H%M%S).tar.gz /opt/filazero/backend/pb_data

# Restart PocketBase
sudo systemctl start pocketbase
```

### Automated Backup (cron)

```bash
# Create backup script
sudo nano /usr/local/bin/backup-filazero.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backup/filazero"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Stop PocketBase
systemctl stop pocketbase

# Backup database
cp /opt/filazero/backend/pb_data/data.db $BACKUP_DIR/data_$DATE.db

# Compress
gzip $BACKUP_DIR/data_$DATE.db

# Restart PocketBase
systemctl start pocketbase

# Delete backups older than 30 days
find $BACKUP_DIR -name "data_*.db.gz" -mtime +30 -delete
```

```bash
# Make executable
sudo chmod +x /usr/local/bin/backup-filazero.sh

# Add to crontab (daily at 2 AM)
sudo crontab -e
# Add line:
0 2 * * * /usr/local/bin/backup-filazero.sh
```

### Restore

```bash
# Stop PocketBase
sudo systemctl stop pocketbase

# Restore database
gunzip /backup/filazero/data_20241209_020000.db.gz
cp /backup/filazero/data_20241209_020000.db /opt/filazero/backend/pb_data/data.db

# Restart PocketBase
sudo systemctl start pocketbase
```

---

## Monitoring & Logging

### System Logs

```bash
# PocketBase logs
sudo journalctl -u pocketbase -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Application Monitoring

**Free Tools**:

- **UptimeRobot**: HTTP monitoring (free, 50 monitors)
  - Monitor: <https://your-domain.com/api/health>
  - Alert if down > 5 minutes

- **Plausible Analytics**: Privacy-friendly analytics
  - Add script tag in `index.html`

- **Sentry**: Error tracking (free tier: 5K events/month)
  - Add Sentry SDK to React app

### Resource Monitoring

```bash
# CPU/Memory usage
htop

# Disk usage
df -h

# PocketBase process
ps aux | grep pocketbase
```

---

## SSL Certificate Renewal

Certbot auto-renews certificates. Verify:

```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal (if needed)
sudo certbot renew

# Check certificate expiry
sudo certbot certificates
```

---

## Scaling & Performance

### Vertical Scaling (Single Server)

Upgrade VPS resources:

- 1GB → 2GB RAM ($10/month → $18/month)
- Improves concurrent user capacity

### Horizontal Scaling (Multiple Servers)

Use load balancer + multiple PocketBase instances:

```
                   Load Balancer (Nginx)
                          |
        +-----------------+-----------------+
        |                 |                 |
   PocketBase 1      PocketBase 2      PocketBase 3
   (Server 1)        (Server 2)        (Server 3)
        |                 |                 |
        +-----------------+-----------------+
                          |
                  PostgreSQL (Shared DB)
```

### Database Migration (SQLite → PostgreSQL)

When to migrate:

- Database size > 100MB
- Concurrent users > 1,000
- Need for replication

PocketBase supports PostgreSQL (v0.21+):

```bash
export DATABASE_URL="postgresql://user:password@host:5432/filazero"
./pocketbase serve --db=$DATABASE_URL
```

---

## Troubleshooting

### PocketBase Won't Start

```bash
# Check logs
sudo journalctl -u pocketbase -n 50

# Common issues:
# - Port 8090 already in use: Change port in service file
# - Permission denied: Check file ownership (sudo chown filazero:filazero /opt/filazero -R)
# - Missing pb_data: Create directory (mkdir /opt/filazero/backend/pb_data)
```

### Frontend Not Loading

```bash
# Check Nginx status
sudo systemctl status nginx

# Test Nginx config
sudo nginx -t

# Check file permissions
ls -la /opt/filazero/frontend/dist

# Should be readable by www-data user
sudo chown -R www-data:www-data /opt/filazero/frontend/dist
```

### Real-Time Not Working

```bash
# Verify WebSocket proxy in Nginx config
# Must have:
location /api/realtime {
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}

# Restart Nginx
sudo systemctl restart nginx
```

### SSL Certificate Issues

```bash
# Renew certificate
sudo certbot renew --force-renewal

# Check certificate status
sudo certbot certificates

# Re-run Certbot if expired
sudo certbot --nginx -d your-domain.com
```

---

## Performance Tuning

### Nginx Optimization

Add to `/etc/nginx/nginx.conf`:

```nginx
http {
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1000;
    gzip_types text/plain text/css application/json application/javascript text/xml;

    # Connection limits
    keepalive_timeout 65;
    keepalive_requests 100;

    # Cache settings
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
}
```

### PocketBase Optimization

```bash
# Increase file descriptors (for many concurrent connections)
ulimit -n 65536

# Add to systemd service:
[Service]
LimitNOFILE=65536
```

---

## Security Hardening

### Firewall (UFW)

```bash
# Allow only necessary ports
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### Fail2ban (SSH brute-force protection)

```bash
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### Disable Root SSH

```bash
sudo nano /etc/ssh/sshd_config
# Set: PermitRootLogin no
sudo systemctl restart sshd
```

---

## Cost Breakdown

### VPS Deployment

| Item | Monthly Cost |
|------|--------------|
| VPS (1GB RAM) | $6 |
| Domain | $1 |
| SSL | Free (Let's Encrypt) |
| Backups | Free (local cron) |
| **Total** | **~$7/month** |

### Cloud Platform (Fly.io)

| Item | Monthly Cost |
|------|--------------|
| Compute (512MB) | $4 |
| Volume (3GB) | $1 |
| Bandwidth (100GB) | Free |
| SSL | Free |
| **Total** | **~$5/month** |

---

## Additional Resources

- **PocketBase Docs**: <https://pocketbase.io/docs/>
- **React Deployment**: <https://vitejs.dev/guide/static-deploy>
- **Nginx Docs**: <https://nginx.org/en/docs/>
- **Certbot**: <https://certbot.eff.org/>

---

**Last Updated**: December 2024
**Support**: Contact developer for deployment assistance
