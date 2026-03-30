#!/bin/bash

MIGRATE_NAME=${1:-"migration_$(date +%Y%m%d%H%M)"}
echo migrate: $MIGRATE_NAME

echo "start migration..."
npx prisma migrate dev --name $MIGRATE_NAME > /dev/null
echo "migration completed..."

echo "generate prisma-client..."
npx prisma generate > /dev/null
echo "generate prisma-client succeeded..."

echo "prisma migration completed."
