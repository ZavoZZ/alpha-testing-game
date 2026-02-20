# Deploy to Production

Deploy changes to production server safely with verification.

## Steps

1. **Pre-deployment Check**
   - Verify all tests pass: scripts/local-test.cmd
   - Check git status: git status
   - Commit any uncommitted changes

2. **Git Push**
   - Add changes: git add .
   - Commit: git commit -m "description"
   - Push: git push origin main
   - Wait for GitHub Actions to pass

3. **Deploy**
   - SSH to server: ssh root@ovidiuguru.online
   - Navigate: cd /root/MERN-template
   - Pull: git pull origin main
   - Backup: cp -r . ../backup-$(date +%Y%m%d)
   - Rebuild: docker compose up -d --build

4. **Verify**
   - Wait 30 seconds for services
   - Check: curl https://ovidiuguru.online
   - Test login functionality
   - Check Docker logs: docker compose logs

5. **Rollback (if needed)**
   - If issues: docker compose down
   - Restore: cp -r ../backup-TIMESTAMP/* .
   - Restart: docker compose up -d
