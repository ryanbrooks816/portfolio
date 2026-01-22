#!/usr/bin/env node

/**
 * Access Code Management Utility
 *
 * Usage:
 *   node scripts/manage-access-codes.js list
 *   node scripts/manage-access-codes.js create "CODE-2026" "vault" 365 50
 *   node scripts/manage-access-codes.js revoke "CODE-2026"
 *   node scripts/manage-access-codes.js usage "CODE-2026"
 */

const { createHmac } = require("crypto");

// Load .env for local development
require("dotenv").config();

const SESSION_SECRET = process.env.SESSION_SECRET;
const CODE_SECRET = process.env.CODE_SECRET;

if (!SESSION_SECRET) {
  console.error("Error: SESSION_SECRET environment variable is not set.");
  process.exit(1);
}

if (!CODE_SECRET) {
  console.error("Error: CODE_SECRET environment variable is not set.");
  process.exit(1);
}

function hashCode(code) {
  return createHmac("sha256", CODE_SECRET).update(code.toLowerCase()).digest("hex");
}

function generateKVCommands(action, code, scope, daysValid, maxUses) {
  const codeHash = hashCode(code);

  switch (action) {
    case "create": {
      const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();
      const record = {
        code,
        expiresAt,
        scope,
        maxUses: parseInt(maxUses),
        uses: 0,
        createdAt: new Date().toISOString(),
      };

      console.log(`# Create access code: ${code}`);
      console.log(`wrangler kv key put --binding=ACCESS_CODES "${codeHash}" '${JSON.stringify(record)}'`);
      console.log();
      console.log(`Code details:`);
      console.log(`- Code: ${code}`);
      console.log(`- Hash: ${codeHash}`);
      console.log(`- Scope: ${scope}`);
      console.log(`- Expires: ${expiresAt.split("T")[0]}`);
      console.log(`- Max uses: ${maxUses}`);
      break;
    }

    case "revoke": {
      console.log(`# Revoke access code: ${code}`);
      console.log(`wrangler kv key delete --binding=ACCESS_CODES "${codeHash}"`);
      console.log();
      console.log(`Code hash: ${codeHash}`);
      break;
    }

    case "usage": {
      console.log(`# Check usage for code: ${code}`);
      console.log(`wrangler kv key get --binding=ACCESS_CODES "${codeHash}"`);
      console.log();
      console.log(`Code hash: ${codeHash}`);
      break;
    }

    case "list": {
      console.log(`# List all access codes:`);
      console.log(`wrangler kv key list --binding=ACCESS_CODES`);
      console.log();
      console.log(`To decode a code hash, use:`);
      console.log(`wrangler kv key get --binding=ACCESS_CODES "hash_value"`);
      break;
    }

    default:
      console.log("Unknown action. Use: create, revoke, usage, or list");
  }
}

// Parse command line arguments
const [action, code, scope = "*", daysValid = 90, maxUses = 50] = process.argv.slice(2);

if (!action) {
  console.log("Access Code Management Utility");
  console.log("===============================");
  console.log();
  console.log("Usage:");
  console.log("  node scripts/manage-access-codes.js list");
  console.log('  node scripts/manage-access-codes.js create "CODE-2026" "*" 365 50');
  console.log('  node scripts/manage-access-codes.js revoke "CODE-2026"');
  console.log('  node scripts/manage-access-codes.js usage "CODE-2026"');
  console.log();
  console.log("Arguments:");
  console.log("  action     - create, revoke, usage, or list");
  console.log("  code       - Access code string (required for create/revoke/usage)");
  console.log("  scope      - '*' for all private projects, or comma-separated project slugs (e.g. 'project-a,project-b')");
  console.log("  daysValid  - Days until expiration (default: 90)");
  console.log("  maxUses    - Maximum uses allowed (default: 50)");
  console.log();
  console.log("Scopes:");
  console.log("  *                   - All private projects");
  console.log("  project-a           - Only 'project-a'");
  console.log("  project-a,project-b - Only 'project-a' and 'project-b'");
  process.exit(1);
}

if (["create", "revoke", "usage"].includes(action) && !code) {
  console.error(`Error: Code is required for action: ${action}`);
  process.exit(1);
}

generateKVCommands(action, code, scope, daysValid, maxUses);
