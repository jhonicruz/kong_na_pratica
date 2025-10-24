#!/bin/sh

# Wait for Kong Admin API to become available (tries ~30s)
KONG_ADMIN_URL="http://kong:8001"
for i in $(seq 1 30); do
  if curl -sSf ${KONG_ADMIN_URL}/ | grep -q "Welcome to Kong" || curl -sSf ${KONG_ADMIN_URL}/; then
    echo "Kong Admin reachable"
    break
  fi
  echo "Waiting for Kong Admin... ($i)"
  sleep 1
done

set -e

echo "Creating upstream backend-upstream if not exists"
# Remove existing upstream/service to ensure idempotent desired state
curl -sSf -X DELETE ${KONG_ADMIN_URL}/services/backend-service >/dev/null 2>&1 || true
curl -sSf -X DELETE ${KONG_ADMIN_URL}/upstreams/backend-upstream >/dev/null 2>&1 || true

# Create upstream
curl -sSf -X POST ${KONG_ADMIN_URL}/upstreams --data "name=backend-upstream" || true

echo "Adding targets"
curl -sSf -X POST ${KONG_ADMIN_URL}/upstreams/backend-upstream/targets --data "target=backend-1:4000" --data "weight=100" || true
curl -sSf -X POST ${KONG_ADMIN_URL}/upstreams/backend-upstream/targets --data "target=backend-2:4000" --data "weight=100" || true
curl -sSf -X POST ${KONG_ADMIN_URL}/upstreams/backend-upstream/targets --data "target=backend-3:4000" --data "weight=100" || true

echo "Upserting service pointing to upstream (no service path to avoid duplication)"
# Use PUT to upsert the service by name and ensure no 'path' is set
curl -sSf -X PUT ${KONG_ADMIN_URL}/services/backend-service --data "host=backend-upstream" || true

echo "Creating route /api"
curl -sSf -X POST ${KONG_ADMIN_URL}/services/backend-service/routes --data "name=backend-route" --data "paths[]=/api" --data "strip_path=true" || true

echo "Kong config script finished"