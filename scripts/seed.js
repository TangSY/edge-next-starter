#!/usr/bin/env node

/**
 * Database seed script
 * Populates test data
 *
 * Usage:
 *   node scripts/seed.js --env=local|test|prod
 */

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// Parse command-line arguments
const args = process.argv.slice(2);
const env = args.find(arg => arg.startsWith('--env='))?.split('=')[1] || 'local';

const envConfig = {
  local: {
    database: 'cloudflare-worker-template-local',
    flags: '--local',
  },
  test: {
    database: 'cloudflare-worker-template-test',
    flags: '--remote --config wrangler.test.toml',
  },
  prod: {
    database: 'cloudflare-worker-template-prod',
    flags: '--remote --config wrangler.prod.toml',
  },
};

if (!envConfig[env]) {
  console.error(`❌ Unsupported environment: ${env}. Use --env=local|test|prod`);
  process.exit(1);
}

console.log('🌱 Seeding database...');
console.log(`   Environment: ${env}\n`);

// Create temporary SQL file
const seedSQL = `
-- Insert test users
INSERT OR IGNORE INTO users (id, email, name) VALUES
  (1, 'alice@example.com', 'Alice'),
  (2, 'bob@example.com', 'Bob'),
  (3, 'charlie@example.com', 'Charlie');

-- Insert test posts
INSERT OR IGNORE INTO posts (id, user_id, title, content, published) VALUES
  (1, 1, 'First Post', 'This is the first post content', 1),
  (2, 1, 'Second Post', 'This is the second post content', 1),
  (3, 2, 'Bob''s Post', 'Bob''s first post', 1),
  (4, 3, 'Draft Post', 'This is a draft', 0);
`;

const tmpFile = path.join(process.cwd(), '.tmp-seed.sql');
fs.writeFileSync(tmpFile, seedSQL);

try {
  const { database, flags } = envConfig[env];
  const command = `wrangler d1 execute ${database} ${flags} --file=${tmpFile}`;
  console.log('📝 Executing seed data...');
  execSync(command, { stdio: 'inherit' });
  console.log('\n✨ Seed data inserted successfully!');
} catch (error) {
  console.error('❌ Failed to seed database:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary file
  if (fs.existsSync(tmpFile)) {
    fs.unlinkSync(tmpFile);
  }
}
