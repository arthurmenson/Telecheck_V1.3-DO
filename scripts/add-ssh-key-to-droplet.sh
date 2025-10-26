#!/bin/bash
#
# Add SSH key to existing droplet
#

DROPLET_ID="526312060"
SSH_KEY_ID="51610891"

echo "=== Adding SSH Key to Droplet ==="
echo "Droplet ID: $DROPLET_ID"
echo "SSH Key ID: $SSH_KEY_ID"
echo ""

# Get DigitalOcean API token
cd "$(dirname "$0")/.."
DO_TOKEN=$(./doctl.exe auth list --format Token --no-header | head -n 1)

if [ -z "$DO_TOKEN" ]; then
    echo "ERROR: Could not get DigitalOcean API token"
    exit 1
fi

echo "Token retrieved successfully"
echo ""

# Unfortunately, DigitalOcean API doesn't support adding SSH keys to existing droplets
# The only way is to rebuild the droplet with the new key, or manually add via web console
# So we'll SSH using password reset instead

echo "⚠️  Note: DigitalOcean doesn't support adding SSH keys to running droplets via API"
echo "Alternative: Use root password from password reset email"
echo ""
echo "To add SSH key manually:"
echo "1. SSH to droplet: ssh root@138.197.122.16"
echo "2. Paste the following into ~/.ssh/authorized_keys:"
echo ""
cat ~/.ssh/id_rsa.pub
echo ""
echo "Or rebuild droplet with SSH key (will destroy data):"
echo "./doctl.exe compute droplet delete $DROPLET_ID"
echo "./doctl.exe compute droplet create hcw-telecheck-video \\"
echo "  --image ubuntu-22-04-x64 \\"
echo "  --size s-4vcpu-8gb \\"
echo "  --region nyc3 \\"
echo "  --ssh-keys $SSH_KEY_ID"
echo ""

# Try SSH with host key check disabled
echo "=== Attempting SSH Connection ==="
ssh -o StrictHostKeyChecking=no -o ConnectTimeout=5 root@138.197.122.16 "echo 'SSH connection successful!'" 2>&1 || {
    echo ""
    echo "SSH connection failed (expected - no password set)"
    echo ""
    echo "Next step: Copy SSH public key to droplet via DigitalOcean console"
    echo "1. Go to: https://cloud.digitalocean.com/droplets/526312060/console"
    echo "2. Login as root (may need password reset)"
    echo "3. Run: mkdir -p ~/.ssh && chmod 700 ~/.ssh"
    echo "4. Run: echo '$(cat ~/.ssh/id_rsa.pub)' >> ~/.ssh/authorized_keys"
    echo "5. Run: chmod 600 ~/.ssh/authorized_keys"
    echo "6. Test: ssh root@138.197.122.16"
}
