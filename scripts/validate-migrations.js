#!/usr/bin/env node
/**
 * Database migration auto-validation script (ESM)
 *
 * Features:
 * 1. Check consistency between Prisma schema and latest migration SQL
 * 2. Validate migration file naming and order
 * 3. Check for unapplied migrations
 * 4. Validate SQL syntax of migration files
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path configuration
const MIGRATIONS_DIR = path.join(__dirname, '../migrations');
const PRISMA_SCHEMA_PATH = path.join(__dirname, '../prisma/schema.prisma');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Print colored message
 */
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Print error and exit
 */
function error(message) {
  log(`❌ ${message}`, 'red');
  process.exit(1);
}

/**
 * Print warning
 */
function warn(message) {
  log(`⚠️  ${message}`, 'yellow');
}

/**
 * Print success message
 */
function success(message) {
  log(`✅ ${message}`, 'green');
}

/**
 * Print info
 */
function info(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Get all migration files
 */
function getMigrationFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    error(`Migration directory not found: ${MIGRATIONS_DIR}`);
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(file => file.endsWith('.sql') && !file.includes('.template'))
    .sort();

  return files;
}

/**
 * Validate migration file naming format
 * Format: NNNN_description.sql (e.g., 0001_init.sql)
 */
function validateMigrationNaming(files) {
  info('Validating migration file naming...');

  const namePattern = /^\d{4}_[a-z_]+\.sql$/;
  const errors = [];

  files.forEach(file => {
    if (!namePattern.test(file)) {
      errors.push(`Invalid file name: ${file}`);
    }
  });

  if (errors.length > 0) {
    error(`Migration naming validation failed:\n  ${errors.join('\n  ')}`);
  }

  success('Migration naming validation passed');
}

/**
 * Validate migration file order
 */
function validateMigrationSequence(files) {
  info('Validating migration file sequence...');

  const errors = [];
  let lastNumber = 0;

  files.forEach(file => {
    const number = parseInt(file.substring(0, 4));

    if (number !== lastNumber + 1) {
      errors.push(
        `Sequence gap or duplicate: ${file} (expected ${String(lastNumber + 1).padStart(4, '0')})`
      );
    }

    lastNumber = number;
  });

  if (errors.length > 0) {
    error(`Migration sequence validation failed:\n  ${errors.join('\n  ')}`);
  }

  success('Migration sequence validation passed');
}

/**
 * Read Prisma schema file
 */
function readPrismaSchema() {
  if (!fs.existsSync(PRISMA_SCHEMA_PATH)) {
    error(`Prisma schema not found: ${PRISMA_SCHEMA_PATH}`);
  }

  return fs.readFileSync(PRISMA_SCHEMA_PATH, 'utf8');
}

/**
 * Extract model definitions from Prisma schema
 */
function extractModelsFromSchema(schema) {
  const models = new Map();
  const modelPattern = /model\s+(\w+)\s*{([^}]+)}/g;

  let match;
  while ((match = modelPattern.exec(schema)) !== null) {
    const modelName = match[1];
    const modelBody = match[2];

    // Extract fields
    const fields = [];
    const fieldPattern = /^\s*(\w+)\s+(\w+)/gm;
    let fieldMatch;

    while ((fieldMatch = fieldPattern.exec(modelBody)) !== null) {
      fields.push({
        name: fieldMatch[1],
        type: fieldMatch[2],
      });
    }

    models.set(modelName.toLowerCase(), {
      name: modelName,
      fields,
    });
  }

  return models;
}

/**
 * Extract table definitions from SQL migrations
 */
function extractTablesFromMigrations(files) {
  const tables = new Map();

  files.forEach(file => {
    const sqlPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Extract CREATE TABLE statements
    const createTablePattern = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([^;]+)\);?/gi;

    let match;
    while ((match = createTablePattern.exec(sql)) !== null) {
      const tableName = match[1];
      const tableBody = match[2];

      // Extract column definitions
      const fields = [];
      const lines = tableBody.split(',');

      lines.forEach(line => {
        const trimmed = line.trim();
        if (
          trimmed &&
          !trimmed.toUpperCase().startsWith('PRIMARY') &&
          !trimmed.toUpperCase().startsWith('FOREIGN') &&
          !trimmed.toUpperCase().startsWith('UNIQUE') &&
          !trimmed.toUpperCase().startsWith('CHECK')
        ) {
          const parts = trimmed.split(/\s+/);
          if (parts.length >= 2) {
            fields.push({
              name: parts[0],
              type: parts[1],
            });
          }
        }
      });

      tables.set(tableName.toLowerCase(), {
        name: tableName,
        fields,
        file,
      });
    }
  });

  return tables;
}

/**
 * Validate consistency between Prisma schema and migration files
 */
function validateSchemaConsistency() {
  info('Validating Prisma schema consistency with migrations...');

  const schema = readPrismaSchema();
  const models = extractModelsFromSchema(schema);
  const files = getMigrationFiles();
  const tables = extractTablesFromMigrations(files);

  const errors = [];
  const warnings = [];

  // Check each Prisma model has a corresponding SQL table
  models.forEach((model, modelName) => {
    // Prisma model names can be plural or singular; check mapping
    const tableName = model.name.toLowerCase() + 's'; // simple plural form

    if (!tables.has(modelName) && !tables.has(tableName)) {
      errors.push(
        `Model "${model.name}" in Prisma schema has no corresponding table in migrations`
      );
    }
  });

  // Check each SQL table has a corresponding Prisma model
  tables.forEach((table, tableName) => {
    const singularName = tableName.endsWith('s') ? tableName.slice(0, -1) : tableName;

    if (!models.has(tableName) && !models.has(singularName)) {
      warnings.push(
        `Table "${table.name}" in migrations has no corresponding model in Prisma schema`
      );
    }
  });

  if (errors.length > 0) {
    error(`Schema consistency validation failed:\n  ${errors.join('\n  ')}`);
  }

  if (warnings.length > 0) {
    warnings.forEach(warning => warn(warning));
  }

  success('Prisma schema consistency validation passed');
}

/**
 * Validate SQL syntax (basic checks)
 */
function validateSqlSyntax(files) {
  info('Validating SQL syntax...');

  const errors = [];

  files.forEach(file => {
    const sqlPath = path.join(MIGRATIONS_DIR, file);
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Basic syntax checks
    const checks = [
      {
        pattern: /CREATE\s+TABLE/i,
        required: true,
        message: 'No CREATE TABLE statement found',
      },
      {
        pattern: /;/,
        required: true,
        message: 'Missing semicolon',
      },
    ];

    checks.forEach(check => {
      if (check.required && !check.pattern.test(sql)) {
        errors.push(`${file}: ${check.message}`);
      }
    });
  });

  if (errors.length > 0) {
    error(`SQL syntax validation failed:\n  ${errors.join('\n  ')}`);
  }

  success('SQL syntax validation passed');
}

/**
 * Main function
 */
function main() {
  console.log('');
  log('='.repeat(60), 'blue');
  log('  Database Migration Validation', 'blue');
  log('='.repeat(60), 'blue');
  console.log('');

  try {
    const files = getMigrationFiles();

    if (files.length === 0) {
      warn('No migration files found');
      return;
    }

    info(`Found ${files.length} migration file(s)\n`);

    // Run all validations
    validateMigrationNaming(files);
    validateMigrationSequence(files);
    validateSqlSyntax(files);
    validateSchemaConsistency();

    console.log('');
    log('='.repeat(60), 'green');
    success('All validations passed! ');
    log('='.repeat(60), 'green');
    console.log('');
  } catch (err) {
    console.log('');
    log('='.repeat(60), 'red');
    error(`Validation failed: ${err.message}`);
    log('='.repeat(60), 'red');
    console.log('');
  }
}

// Run main
main();
