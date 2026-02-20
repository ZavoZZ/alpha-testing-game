# 🚀 Automated Deployment Guide

**Version:** 2.3.0  
**Last Updated:** 2026-02-15  
**Server:** ovidiuguru.online (188.245.220.40)

---

## 📋 Overview

This guide covers the complete automated deployment system for the MERN game application. Everything is set up to deploy automatically with minimal manual intervention.

---

## 🎯 Deployment Methods

### Method 1: Automatic (GitHub Actions) ⭐ RECOMMENDED

**Triggers automatically when you push to main branch**

1. Make your changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your commit message"
   git push origin main
   ```
3. GitHub Actions will automatically:
   - Pull code to server
   - Install dependencies
   - Build client
   - Run migrations
   - Restart services
   - Run health checks

**Monitor deployment:**
- Go to: https://github.com/YOUR_USERNAME/MERN-template/actions
- Watch the deployment progress in real-time

### Method 2: Manual SSH Deployment

**For when you need direct control**

```bash
# SSH into server
ssh root@ovidiuguru.online

# Run deployment script
cd /root/MERN-template
bash scripts/deploy-production.sh
```

This script will:
- ✅ Create database backup
- ✅ Pull latest code
- ✅ Install dependencies
- ✅ Build client
- ✅ Run migrations
- ✅ Restart services
- ✅ Run health checks

### Method 3: Quick Deploy

**For minor updates (no migrations needed)**

```bash
ssh root@ovidiuguru.online
cd /root/MERN-template
bash scripts/quick-deploy.sh
```

---

## 🔧 Setup Requirements

### 1. GitHub Secrets Configuration

Add these secrets to your GitHub repository:
- Go to: Settings → Secrets and variables → Actions → New repository secret

**Required secrets:**
```
SERVER_HOST=188.245.220.40
SERVER_USER=root
SERVER_SSH_KEY=[Your private SSH key]
```

**To get your SSH key:**
```bash
# On your local machine
cat ~/.ssh/id_rsa
# Copy the entire output and paste as SERVER_SSH_KEY
```

### 2. Server Setup (One-time)

**Already configured on ovidiuguru.online:**
- ✅ PM2 process manager
- ✅ MongoDB database
- ✅ Nginx reverse proxy
- ✅ Firewall (UFW)
- ✅ Node.js 20+
- ✅ Git repository

---

## 📊 Available Scripts

### Deployment Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `deploy-production.sh` | Full production deployment | `bash scripts/deploy-production.sh` |
| `quick-deploy.sh` | Fast deployment (no migrations) | `bash scripts/quick-deploy.sh` |
| `rollback.sh` | Restore previous version | `bash scripts/rollback.sh [backup-name]` |
| `health-check.sh` | Check all services | `bash scripts/health-check.sh` |

### GitHub Actions Workflows

| Workflow | Trigger | Purpose |
|----------|---------|---------|
| `deploy.yml` | Push to main | Automatic deployment |
| `ci.yml` | Pull requests | Run tests and build |
| `backup.yml` | Daily at 2 AM UTC | Database backup |
| `health-check.yml` | Every 15 minutes | Monitor services |

---

## 🏥 Health Monitoring

### Automatic Health Checks

GitHub Actions runs health checks every 15 minutes:
- Main application
- All microservices
- Database connectivity
- Response times

**View health status:**
- https://github.com/YOUR_USERNAME/MERN-template/actions/workflows/health-check.yml

### Manual Health Check

```bash
ssh root@ovidiuguru.online
cd /root/MERN-template
bash scripts/health-check.sh
```

**Output includes:**
- ✅ Service status (all ports)
- ✅ HTTP endpoint checks
- ✅ Database connectivity
- ✅ Disk space
- ✅ Memory usage
- ✅ Public access

---

## 📦 Database Backups

### Automatic Backups

- **Frequency:** Daily at 2 AM UTC
- **Retention:** Last 7 days
- **Location:** `/root/backups/`
- **Format:** Compressed `.tar.gz`

### Manual Backup

```bash
ssh root@ovidiuguru.online

# Create backup
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mongodump --out /root/backups/manual-$TIMESTAMP

# List backups
ls -lh /root/backups/
```

### Restore Backup

```bash
ssh root@ovidiuguru.online
cd /root/MERN-template

# List available backups
ls -lh /root/backups/

# Restore specific backup
bash scripts/rollback.sh pre-deploy-20260215-004500
```

---

## 🔄 Rollback Procedure

### When to Rollback

- Critical bugs in production
- Services failing to start
- Database corruption
- User-facing errors

### How to Rollback

```bash
ssh root@ovidiuguru.online
cd /root/MERN-template

# Run rollback script
bash scripts/rollback.sh

# Follow prompts:
# 1. Select backup to restore
# 2. Confirm rollback
# 3. Optionally revert code
# 4. Services restart automatically
```

**The script will:**
1. Stop all services
2. Restore database from backup
3. Optionally revert code to previous commit
4. Restart services
5. Run health checks

---

## 🐛 Troubleshooting

### Deployment Failed

**Check GitHub Actions logs:**
1. Go to: https://github.com/YOUR_USERNAME/MERN-template/actions
2. Click on failed workflow
3. Review error messages

**Common issues:**
- SSH connection failed → Check SERVER_SSH_KEY secret
- Build failed → Check for syntax errors in code
- Services won't start → Check PM2 logs: `pm2 logs`

### Services Not Starting

```bash
ssh root@ovidiuguru.online

# Check PM2 status
pm2 list

# View logs
pm2 logs [service-name]

# Restart specific service
pm2 restart [service-name]

# Restart all services
pm2 restart all
```

### Database Issues

```bash
# Check MongoDB status
systemctl status mongod

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log

# Restart MongoDB
systemctl restart mongod
```

### Nginx Issues

```bash
# Check Nginx status
systemctl status nginx

# Test configuration
nginx -t

# View logs
tail -f /var/log/nginx/ovidiuguru_error.log

# Restart Nginx
systemctl restart nginx
```

---

## 📝 Deployment Checklist

### Before Deployment

- [ ] All tests pass locally
- [ ] Code committed to Git
- [ ] No console errors
- [ ] Database migrations ready (if needed)
- [ ] Documentation updated

### During Deployment

- [ ] Monitor GitHub Actions progress
- [ ] Watch for errors in logs
- [ ] Verify services restart successfully

### After Deployment

- [ ] Test main application: https://ovidiuguru.online
- [ ] Test login/signup
- [ ] Test game features
- [ ] Check PM2 status: `pm2 list`
- [ ] Monitor logs: `pm2 logs`
- [ ] Run health check: `bash scripts/health-check.sh`

---

## 🎮 Testing After Deployment

### 1. Basic Functionality

```bash
# Test public endpoints
curl https://ovidiuguru.online/health
curl https://ovidiuguru.online/api/economy/health
curl https://ovidiuguru.online/api/economy/marketplace
```

### 2. User Journey

1. Open https://ovidiuguru.online
2. Login with test account
3. Navigate to Dashboard
4. Test Work Station
5. Test Inventory
6. Test Marketplace
7. Verify all features work

### 3. Performance Check

```bash
# Check response times
time curl https://ovidiuguru.online

# Check server resources
ssh root@ovidiuguru.online
htop  # Press q to quit
```

---

## 📊 Monitoring & Logs

### PM2 Monitoring

```bash
# Real-time monitoring
pm2 monit

# List all processes
pm2 list

# View logs
pm2 logs

# View specific service logs
pm2 logs economy-server

# Clear logs
pm2 flush
```

### System Logs

```bash
# Nginx access logs
tail -f /var/log/nginx/ovidiuguru_access.log

# Nginx error logs
tail -f /var/log/nginx/ovidiuguru_error.log

# MongoDB logs
tail -f /var/log/mongodb/mongod.log

# System logs
journalctl -xe
```

---

## 🔐 Security Notes

### SSH Access

- Only use SSH keys (no passwords)
- Keep private keys secure
- Rotate keys periodically

### GitHub Secrets

- Never commit secrets to repository
- Use GitHub Secrets for sensitive data
- Rotate secrets if compromised

### Database

- Regular backups (automated daily)
- Keep backups for 7 days minimum
- Test restore procedure periodically

---

## 🚀 Quick Reference

### Most Common Commands

```bash
# Deploy to production
git push origin main  # Automatic via GitHub Actions

# Manual deployment
ssh root@ovidiuguru.online
cd /root/MERN-template
bash scripts/deploy-production.sh

# Check health
bash scripts/health-check.sh

# View logs
pm2 logs

# Restart services
pm2 restart all

# Rollback
bash scripts/rollback.sh
```

---

## 📞 Support

### Resources

- **Documentation:** `/docs/` folder
- **GitHub Issues:** https://github.com/YOUR_USERNAME/MERN-template/issues
- **Server Logs:** `pm2 logs` and `/var/log/`

### Emergency Contacts

- **Server:** root@ovidiuguru.online
- **Backup Location:** `/root/backups/`
- **Project Directory:** `/root/MERN-template/`

---

## 🎉 Success Criteria

**Deployment is successful when:**

- ✅ All services show "online" in `pm2 list`
- ✅ No errors in `pm2 logs`
- ✅ Health checks pass: `bash scripts/health-check.sh`
- ✅ Site accessible: https://ovidiuguru.online
- ✅ All features working (login, work, inventory, marketplace)
- ✅ No console errors in browser
- ✅ Database queries responding quickly

---

**Last Updated:** 2026-02-15  
**Version:** 2.3.0  
**Status:** Production Ready ✅
