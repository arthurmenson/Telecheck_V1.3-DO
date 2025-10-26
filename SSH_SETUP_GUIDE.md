# SSH Access Setup Guide for Droplet 138.197.122.16

**Droplet**: hcw-telecheck-video
**IP**: 138.197.122.16
**ID**: 526312060
**Status**: SSH access NOT configured ❌

---

## Problem

The droplet was created without any SSH keys, and DigitalOcean doesn't support adding SSH keys to running droplets via API. We need manual intervention to set up passwordless SSH access.

## Solution Options

### Option 1: Add SSH Key via DigitalOcean Web Console (Recommended)

**Step 1: Access Droplet Console**

1. Go to: https://cloud.digitalocean.com/droplets/526312060/console
2. Click "Access" tab → "Launch Console"
3. Login as `root` (you may need to reset password first)

**Step 2: Add SSH Public Key**

Copy this SSH public key:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCwAlszCn+Ozaj4k9jkuSdYMqN/EX8gGevkp7MY238fhI6y1u+bqCKIcRUPM1ssmqq2WTWI5bqgJXo3ThJiipldaozZQ8dDUSNU/rBRubAHcIU11TOJz/bSC5hZlUwLFnObIdXmVfpIyKT4j/T4xR01kbBA5BghHV654hiiIKu8lHJXmCV3y78A+Q+8G7B2+wkNG4HfUgtdmEaOCJU3O+qu1k6puwGhdtdv91OJELURXVq12oDGRZ7grJyhBhP1gWG7wYej8J9wSLHLFp9yW2vaXAAOsjKTq//mPhV86APFkCCmeNKNusGEWnAyY9NX7uVY0mwYZIMMP8gGjMopdpK9TwHPgtgpB5xCEr5ODQCX7q/XAMC8xjksL4RmG77PO1Y1FzELj9t5Le+FUfvwZHDePR2Lni4wp0f4A90kS4IURS7Y57+ziWSkR6fe+HXx2WJIDMm2+w90zFGRoFfJA2GKHKWe9g4wnv42Vp/HJ1THLTnZ8HJNZWYc0hk6ldha8oabbaa6p+oTBBHWiuaep9Ej2Fj5zsHBXBkniqyPasgjBK3ScBAwNA2YqBXqJaNcbHdZ3iubCUWelqZOQoUsb6V98nhdAZJHUkZJEfGJas1fhf91tBijwwWO53FlQ+jS1lIafHr9Wm+bWmarDWqGHnCA8okUQww3u9W2UiBZq7HBlw== menso@ETM
```

Paste into the console:

```bash
# Create SSH directory if it doesn't exist
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Add the public key
echo 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCwAlszCn+Ozaj4k9jkuSdYMqN/EX8gGevkp7MY238fhI6y1u+bqCKIcRUPM1ssmqq2WTWI5bqgJXo3ThJiipldaozZQ8dDUSNU/rBRubAHcIU11TOJz/bSC5hZlUwLFnObIdXmVfpIyKT4j/T4xR01kbBA5BghHV654hiiIKu8lHJXmCV3y78A+Q+8G7B2+wkNG4HfUgtdmEaOCJU3O+qu1k6puwGhdtdv91OJELURXVq12oDGRZ7grJyhBhP1gWG7wYej8J9wSLHLFp9yW2vaXAAOsjKTq//mPhV86APFkCCmeNKNusGEWnAyY9NX7uVY0mwYZIMMP8gGjMopdpK9TwHPgtgpB5xCEr5ODQCX7q/XAMC8xjksL4RmG77PO1Y1FzELj9t5Le+FUfvwZHDePR2Lni4wp0f4A90kS4IURS7Y57+ziWSkR6fe+HXx2WJIDMm2+w90zFGRoFfJA2GKHKWe9g4wnv42Vp/HJ1THLTnZ8HJNZWYc0hk6ldha8oabbaa6p+oTBBHWiuaep9Ej2Fj5zsHBXBkniqyPasgjBK3ScBAwNA2YqBXqJaNcbHdZ3iubCUWelqZOQoUsb6V98nhdAZJHUkZJEfGJas1fhf91tBijwwWO53FlQ+jS1lIafHr9Wm+bWmarDWqGHnCA8okUQww3u9W2UiBZq7HBlw== menso@ETM' >> ~/.ssh/authorized_keys

# Set proper permissions
chmod 600 ~/.ssh/authorized_keys

# Verify the key was added
cat ~/.ssh/authorized_keys

echo "✅ SSH key added successfully!"
```

**Step 3: Test SSH Connection**

From your local machine:

```bash
ssh root@138.197.122.16
```

If successful, you should see:

```
Welcome to Ubuntu 22.04.x LTS (GNU/Linux ...)
```

---

### Option 2: Rebuild Droplet with SSH Key (DESTRUCTIVE)

**WARNING**: This will destroy all data on the droplet!

```bash
# Delete existing droplet
./doctl.exe compute droplet delete 526312060 --force

# Create new droplet with SSH key
./doctl.exe compute droplet create hcw-telecheck-video \
  --image ubuntu-22-04-x64 \
  --size s-4vcpu-8gb \
  --region nyc3 \
  --ssh-keys 51610891 \
  --wait

# Get the new droplet IP
./doctl.exe compute droplet list --format ID,Name,PublicIPv4

# Test SSH
ssh root@NEW_IP_ADDRESS
```

---

### Option 3: Reset Root Password (Alternative)

If you can't access the web console, you can reset the root password:

```bash
# Trigger password reset
./doctl.exe compute droplet-action password-reset 526312060

# Check your email for the temporary password
# Then SSH with password:
ssh root@138.197.122.16
# Enter the temporary password from email

# Once logged in, add SSH key:
mkdir -p ~/.ssh && chmod 700 ~/.ssh
echo 'ssh-rsa AAAA...menso@ETM' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

---

## After SSH Access is Configured

Once you can SSH to the droplet, run the deployment script:

```bash
# Test SSH connection
ssh root@138.197.122.16 "echo 'SSH works!'"

# Run HCW@Home deployment
cd /c/Users/menso/Downloads/Telecheck_V1.3-DO
chmod +x scripts/deploy-hcw-droplet.sh
bash scripts/deploy-hcw-droplet.sh
```

This will:

1. Install Docker
2. Upload docker-compose.hcw-production.yml
3. Create .env with secure secrets
4. Configure firewall
5. Start all HCW@Home services
6. Verify health checks

---

## What's Been Done

✅ **SSH Key Created**

- Location: ~/.ssh/id_rsa (private key)
- Location: ~/.ssh/id_rsa.pub (public key)
- Fingerprint: SHA256:sEzTNJr+mLsNU/Y1HYslWpVV9595ADUSrKQNNzvVWbE

✅ **SSH Key Uploaded to DigitalOcean**

- Key ID: 51610891
- Name: local-machine-20251025
- Fingerprint: 9f:72:39:58:bf:60:2e:c2:b8:45:13:d7:82:39:93:01

⚪ **Pending**

- Add key to droplet 138.197.122.16 (requires manual step via web console)

---

## Verification Commands

After adding the SSH key, verify everything works:

```bash
# 1. Test SSH connection
ssh root@138.197.122.16 "uname -a"

# Should output:
# Linux hcw-telecheck-video 5.15.0-... Ubuntu SMP ...

# 2. Check droplet info
./doctl.exe compute droplet get 526312060 --format ID,Name,PublicIPv4,Status

# 3. List all SSH keys in DigitalOcean
./doctl.exe compute ssh-key list --format ID,Name

# 4. Check if Docker is installed (should fail until we deploy)
ssh root@138.197.122.16 "docker --version"

# 5. Deploy HCW@Home stack
bash scripts/deploy-hcw-droplet.sh
```

---

## Troubleshooting

### SSH Connection Still Fails

```bash
# Check if SSH key is properly formatted
cat ~/.ssh/id_rsa.pub | wc -l
# Should output: 1 (single line)

# Check SSH key fingerprint
ssh-keygen -lf ~/.ssh/id_rsa.pub
# Should match: 9f:72:39:58:bf:60:2e:c2:b8:45:13:d7:82:39:93:01

# Try SSH with verbose output
ssh -vvv root@138.197.122.16
```

### Permission Denied (publickey)

This means the SSH key is not in the droplet's `~/.ssh/authorized_keys` file.

Solutions:

1. Use web console to add the key (Option 1 above)
2. Use password reset to login and add key manually (Option 3 above)
3. Rebuild droplet with SSH key (Option 2 above - DESTRUCTIVE)

### Web Console Not Accessible

If you can't access the DigitalOcean web console:

1. Clear browser cache and cookies
2. Try a different browser
3. Use incognito/private mode
4. Check if you're logged into the correct DigitalOcean account
5. Contact DigitalOcean support

---

## Next Steps

**Immediate Action Required**:

1. Choose one of the 3 options above to add SSH key
2. Test SSH connection: `ssh root@138.197.122.16`
3. Deploy HCW@Home: `bash scripts/deploy-hcw-droplet.sh`
4. Run tests: `bash scripts/test-hcw-journey.sh`

**Estimated Time**:

- Option 1 (Web Console): 5 minutes
- Option 2 (Rebuild): 10 minutes
- Option 3 (Password Reset): 10 minutes

**After SSH Works**:

- HCW@Home deployment: 35 minutes
- Complete testing: 1 hour
- **Total**: ~1.5-2 hours to full functionality

---

## SSH Key Details (For Reference)

**Public Key**:

```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQCwAlszCn+Ozaj4k9jkuSdYMqN/EX8gGevkp7MY238fhI6y1u+bqCKIcRUPM1ssmqq2WTWI5bqgJXo3ThJiipldaozZQ8dDUSNU/rBRubAHcIU11TOJz/bSC5hZlUwLFnObIdXmVfpIyKT4j/T4xR01kbBA5BghHV654hiiIKu8lHJXmCV3y78A+Q+8G7B2+wkNG4HfUgtdmEaOCJU3O+qu1k6puwGhdtdv91OJELURXVq12oDGRZ7grJyhBhP1gWG7wYej8J9wSLHLFp9yW2vaXAAOsjKTq//mPhV86APFkCCmeNKNusGEWnAyY9NX7uVY0mwYZIMMP8gGjMopdpK9TwHPgtgpB5xCEr5ODQCX7q/XAMC8xjksL4RmG77PO1Y1FzELj9t5Le+FUfvwZHDePR2Lni4wp0f4A90kS4IURS7Y57+ziWSkR6fe+HXx2WJIDMm2+w90zFGRoFfJA2GKHKWe9g4wnv42Vp/HJ1THLTnZ8HJNZWYc0hk6ldha8oabbaa6p+oTBBHWiuaep9Ej2Fj5zsHBXBkniqyPasgjBK3ScBAwNA2YqBXqJaNcbHdZ3iubCUWelqZOQoUsb6V98nhdAZJHUkZJEfGJas1fhf91tBijwwWO53FlQ+jS1lIafHr9Wm+bWmarDWqGHnCA8okUQww3u9W2UiBZq7HBlw== menso@ETM
```

**Private Key Location**: `~/.ssh/id_rsa` (keep this secret!)

**Fingerprint (SHA256)**: `sEzTNJr+mLsNU/Y1HYslWpVV9595ADUSrKQNNzvVWbE`

**Fingerprint (MD5)**: `9f:72:39:58:bf:60:2e:c2:b8:45:13:d7:82:39:93:01`

**DigitalOcean Key ID**: 51610891

**DigitalOcean Key Name**: local-machine-20251025

---

**Status**: 🔴 Manual intervention required - Use DigitalOcean web console to add SSH key
