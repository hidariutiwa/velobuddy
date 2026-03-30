#!/bin/bash

echo 'setup prisma...'

echo 'install prisma packages...'
npm install prisma tsx @types/pg --save-dev > /dev/null
npm install @prisma/client @prisma/adapter-pg dotenv pg > /dev/null
echo 'prisma packages installed...'


SRC_DIR="src/lib"
if [ ! -d $SRC_DIR ]; then
    echo 'make "lib" directory...'
    mkdir -p $SRC_DIR
fi

echo 'prisma init...'
npx prisma init --datasource-provider postgresql --output ../src/lib/generated/prisma
echo 'prisma init succeeded...'

npm run format -y > /dev/null

cp .env.example .env
echo 'copy .env.example to .env...'

echo 'prisma setup completed.'
