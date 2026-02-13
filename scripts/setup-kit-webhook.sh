#!/bin/bash
# Script to register Kit webhook for "BCP Member" tag notifications

echo "Setting up Kit webhook for BCP Member notifications..."
echo ""

# Check for API key
if [ -z "$KIT_API_KEY" ]; then
  echo "Error: KIT_API_KEY environment variable not set"
  echo "Usage: KIT_API_KEY=your_v3_api_key ./scripts/setup-kit-webhook.sh"
  exit 1
fi

# Configuration
WEBHOOK_URL="https://apply.boundlesscreator.com/api/webhooks/kit-member"
BCP_MEMBER_TAG_ID="8240961"

echo "Webhook URL: $WEBHOOK_URL"
echo "Tag ID: $BCP_MEMBER_TAG_ID (BCP Member)"
echo ""

# Create the webhook
echo "Creating webhook..."
RESPONSE=$(curl -s -X POST "https://api.convertkit.com/v3/automations/hooks" \
  -H "Content-Type: application/json" \
  -d "{
    \"api_secret\": \"$KIT_API_KEY\",
    \"target_url\": \"$WEBHOOK_URL\",
    \"event\": {
      \"name\": \"subscriber.tag_add\",
      \"tag_id\": $BCP_MEMBER_TAG_ID
    }
  }")

echo "Response from Kit API:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Check if successful
if echo "$RESPONSE" | grep -q '"rule"'; then
  echo "✅ Webhook created successfully!"
  echo ""
  echo "To test:"
  echo "1. Go to Kit and tag a subscriber as 'BCP Member'"
  echo "2. Check Discord #dashboard for notification"
else
  echo "❌ Webhook creation failed. Check the error above."
  exit 1
fi
