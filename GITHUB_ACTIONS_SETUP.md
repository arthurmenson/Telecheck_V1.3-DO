# GitHub Actions CI/CD Setup for DigitalOcean Deployment

**Status**: ✅ CI/CD Pipeline Ready
**Target**: whale-app on DigitalOcean App Platform

---

## 🎯 Overview

The GitHub Actions workflow automatically:
1. Runs all tests (unit, integration, E2E)
2. Builds and validates the application
3. Deploys to DigitalOcean whale-app on push to ETM_telecheck branch
4. Performs health checks
5. Reports deployment status

---

## 🔑 Required GitHub Secret

You need to add ONE secret to your GitHub repository:

### DIGITALOCEAN_ACCESS_TOKEN

**Where to get it**:
1. Go to: https://cloud.digitalocean.com/account/api/tokens
2. Click "Generate New Token"
3. Name: `github-actions-whale-app`
4. Scopes: Read + Write
5. Copy the token (you'll only see it once!)

**How to add to GitHub**:
1. Go to: https://github.com/arthurmenson/Telecheck_V1.3-DO/settings/secrets/actions
2. Click "New repository secret"
3. Name: `DIGITALOCEAN_ACCESS_TOKEN`
4. Value: Paste your DigitalOcean token
5. Click "Add secret"

---

## 🚀 How It Works

### Trigger

The deployment job runs when:
- ✅ Branch: `ETM_telecheck`
- ✅ Event: `push` (not pull requests)
- ✅ All tests pass (build-test, contracts, services, pact, e2e_mock, sbom)

### Deployment Steps

1. **Install doctl** - DigitalOcean CLI
2. **Find whale-app** - Checks if app exists
3. **Create or Update** - Creates new app or updates existing
4. **Wait for Deployment** - Monitors deployment status (max 15 min)
5. **Get App URL** - Retrieves the live URL
6. **Health Check** - Verifies `/health` endpoint (max 2 min)
7. **Summary** - Posts deployment status

### Expected Timeline

```
Tests: ~5-10 minutes
├─ build-test: 3 min
├─ contracts: 1 min
├─ services: 2 min
├─ pact: 1 min
├─ e2e_mock: 2 min
└─ sbom: 1 min

Deployment: ~10-15 minutes
├─ Build images: 5 min
├─ Deploy services: 5 min
├─ Health checks: 1 min
└─ Database migrations: 1 min

Total: ~15-25 minutes
```

---

## 📊 Monitoring Deployment

### View in GitHub Actions

1. Go to: https://github.com/arthurmenson/Telecheck_V1.3-DO/actions
2. Click on the latest workflow run
3. Click "deploy-digitalocean" job
4. Watch real-time logs

### View in DigitalOcean

1. Go to: https://cloud.digitalocean.com/apps
2. Click on "whale-app"
3. View deployment status and logs

---

## ✅ Success Indicators

When deployment succeeds, you'll see:

**In GitHub Actions**:
```
✅ Deployment successful!
🚀 Application deployed to: https://whale-app-xxxxx.ondigitalocean.app
✅ Health check passed!
```

**In DigitalOcean**:
- Deployment status: ACTIVE
- Services: All running (green)
- Health checks: Passing

---

## 🐛 Troubleshooting

### Deployment Fails

**Check GitHub Actions logs**:
```bash
# Common issues and solutions:

1. "DIGITALOCEAN_ACCESS_TOKEN not found"
   → Add the secret to repository settings

2. "whale-app not found"
   → The workflow will create it automatically

3. "Deployment timeout"
   → Check DigitalOcean console for build errors
   → Review Dockerfile build logs

4. "Health check failed"
   → Check DATABASE_URL is set in DigitalOcean
   → Verify environment variables
```

### View Detailed Logs

**GitHub Actions**:
- Navigate to failed job
- Expand each step to see detailed output
- Download logs: Actions → Workflow run → Download logs

**DigitalOcean**:
- Go to whale-app → Runtime Logs
- Filter by service (API or Web)
- Check build logs for Docker errors

---

## 🔄 Manual Deployment Trigger

If you need to manually trigger deployment:

1. Go to: https://github.com/arthurmenson/Telecheck_V1.3-DO/actions
2. Select "CI" workflow
3. Click "Run workflow"
4. Select branch: `ETM_telecheck`
5. Click "Run workflow"

Or push an empty commit:
```bash
git commit --allow-empty -m "trigger: manual deployment"
git push origin ETM_telecheck
```

---

## 📝 Workflow Configuration

The deployment job is configured in: `.github/workflows/ci.yml`

Key settings:
```yaml
deploy-digitalocean:
  runs-on: ubuntu-latest
  needs: [build-test, contracts, services, pact, e2e_mock, sbom]
  if: github.ref == 'refs/heads/ETM_telecheck' && github.event_name == 'push'
```

**Customization**:
- Change branch: Edit `if: github.ref == 'refs/heads/ETM_telecheck'`
- Change app name: Edit `.do/app.yaml` name field
- Adjust timeouts: Edit wait loops in workflow steps

---

## 🎯 Next Steps

1. **Add DigitalOcean Token**:
   ```
   GitHub → Settings → Secrets → Actions
   → New repository secret
   → DIGITALOCEAN_ACCESS_TOKEN
   ```

2. **Push Code**:
   ```bash
   git push origin ETM_telecheck
   ```

3. **Watch Deployment**:
   ```
   GitHub Actions → Latest run → deploy-digitalocean job
   ```

4. **Verify Live**:
   ```bash
   # Get URL from GitHub Actions output or DigitalOcean console
   curl https://whale-app-xxxxx.ondigitalocean.app/health
   ```

---

## ✅ Checklist

Before deployment:
- [ ] DigitalOcean access token generated
- [ ] Token added to GitHub secrets as `DIGITALOCEAN_ACCESS_TOKEN`
- [ ] `.do/app.yaml` configuration reviewed
- [ ] All tests passing locally
- [ ] Environment variables configured in DigitalOcean (optional, can be set after first deploy)

After deployment:
- [ ] GitHub Actions workflow completes successfully
- [ ] Health check passes
- [ ] Application accessible at provided URL
- [ ] DigitalOcean console shows ACTIVE status

---

## 🎉 Continuous Deployment

Once set up, every push to `ETM_telecheck` will:
- ✅ Run all tests automatically
- ✅ Deploy to whale-app on DigitalOcean
- ✅ Run health checks
- ✅ Report status in GitHub

**Zero manual deployment needed!** 🚀

---

**Last Updated**: 2025-10-25
**Workflow File**: `.github/workflows/ci.yml`
**Status**: Ready for deployment
