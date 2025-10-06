#!/usr/bin/env node
/**
 * Generate API Reference Documentation from Contract Snapshots
 * 
 * Reads contracts/current.json and generates markdown documentation
 * for each API endpoint with request/response examples.
 */

const fs = require('fs');
const path = require('path');

const CONTRACTS_FILE = path.join(__dirname, '../contracts/current.json');
const DOCS_DIR = path.join(__dirname, '../docs/api');

// Ensure docs directory exists
if (!fs.existsSync(DOCS_DIR)) {
  fs.mkdirSync(DOCS_DIR, { recursive: true });
}

// Read contract snapshot
let contracts;
try {
  const contractsData = fs.readFileSync(CONTRACTS_FILE, 'utf8');
  contracts = JSON.parse(contractsData);
} catch (error) {
  console.error('Error reading contracts file:', error.message);
  process.exit(1);
}

// Group routes by category
function categorizeRoute(path) {
  if (path.startsWith('/api/onboarding')) return 'Onboarding';
  if (path.startsWith('/api/owner')) return 'Owner Portal';
  if (path.startsWith('/api/provider')) return 'Provider Portal';
  if (path.startsWith('/api/developer')) return 'Developer Portal';
  if (path.startsWith('/api/accountant')) return 'Accountant Portal';
  if (path.startsWith('/api/fed')) return 'Federation';
  if (path.startsWith('/api/federation')) return 'Federation';
  if (path.startsWith('/api/auth')) return 'Authentication';
  if (path.startsWith('/api/webhooks')) return 'Webhooks';
  if (path.startsWith('/api/v2')) return 'API v2';
  if (path.startsWith('/api/theme')) return 'Theming';
  if (path.startsWith('/api/health')) return 'System';
  return 'Other';
}

// Generate markdown for a single route
function generateRouteDoc(route) {
  const { method, path, description, auth, rateLimit, idempotency, request, response } = route;
  
  let md = `## ${method} ${path}\n\n`;
  
  if (description) {
    md += `${description}\n\n`;
  }
  
  // Authentication
  if (auth) {
    md += `### Authentication\n\n`;
    md += `**Required**: ${auth.required ? 'Yes' : 'No'}\n\n`;
    if (auth.type) {
      md += `**Type**: ${auth.type}\n\n`;
    }
    if (auth.scopes && auth.scopes.length > 0) {
      md += `**Scopes**: ${auth.scopes.join(', ')}\n\n`;
    }
  }
  
  // Rate Limiting
  if (rateLimit) {
    md += `### Rate Limiting\n\n`;
    md += `**Preset**: ${rateLimit.preset || 'default'}\n\n`;
    if (rateLimit.limit) {
      md += `**Limit**: ${rateLimit.limit} requests per ${rateLimit.window || 'window'}\n\n`;
    }
  }
  
  // Idempotency
  if (idempotency) {
    md += `### Idempotency\n\n`;
    md += `**Required**: ${idempotency.required ? 'Yes' : 'No'}\n\n`;
    if (idempotency.required) {
      md += `**Header**: \`Idempotency-Key\`\n\n`;
    }
  }
  
  // Request
  if (request) {
    md += `### Request\n\n`;
    
    if (request.headers && Object.keys(request.headers).length > 0) {
      md += `**Headers**:\n\n`;
      md += '```\n';
      for (const [key, value] of Object.entries(request.headers)) {
        md += `${key}: ${value}\n`;
      }
      md += '```\n\n';
    }
    
    if (request.body) {
      md += `**Body**:\n\n`;
      md += '```json\n';
      md += JSON.stringify(request.body, null, 2);
      md += '\n```\n\n';
    }
    
    if (request.query && Object.keys(request.query).length > 0) {
      md += `**Query Parameters**:\n\n`;
      for (const [key, value] of Object.entries(request.query)) {
        md += `- \`${key}\`: ${value.description || value.type || 'string'}\n`;
      }
      md += '\n';
    }
  }
  
  // Response
  if (response) {
    md += `### Response\n\n`;
    
    if (response.status) {
      md += `**Status**: ${response.status}\n\n`;
    }
    
    if (response.headers && Object.keys(response.headers).length > 0) {
      md += `**Headers**:\n\n`;
      md += '```\n';
      for (const [key, value] of Object.entries(response.headers)) {
        md += `${key}: ${value}\n`;
      }
      md += '```\n\n';
    }
    
    if (response.body) {
      md += `**Body**:\n\n`;
      md += '```json\n';
      md += JSON.stringify(response.body, null, 2);
      md += '\n```\n\n';
    }
  }
  
  md += '---\n\n';
  
  return md;
}

// Generate category index
function generateCategoryIndex(category, routes) {
  let md = `# ${category} API\n\n`;
  md += `**Total Endpoints**: ${routes.length}\n\n`;
  md += `## Endpoints\n\n`;
  
  for (const route of routes) {
    md += `- [${route.method} ${route.path}](#${route.method.toLowerCase()}-${route.path.replace(/\//g, '').replace(/\[/g, '').replace(/\]/g, '')})\n`;
  }
  
  md += '\n---\n\n';
  
  for (const route of routes) {
    md += generateRouteDoc(route);
  }
  
  return md;
}

// Main generation
console.log('Generating API documentation from contracts...');

const routesByCategory = {};

for (const route of contracts.routes || []) {
  const category = categorizeRoute(route.path);
  if (!routesByCategory[category]) {
    routesByCategory[category] = [];
  }
  routesByCategory[category].push(route);
}

// Generate index
let indexMd = `# Cortiware API Reference\n\n`;
indexMd += `**Generated**: ${new Date().toISOString()}\n\n`;
indexMd += `## Categories\n\n`;

for (const category of Object.keys(routesByCategory).sort()) {
  const routes = routesByCategory[category];
  indexMd += `- [${category}](${category.toLowerCase().replace(/\s+/g, '-')}.md) (${routes.length} endpoints)\n`;
}

fs.writeFileSync(path.join(DOCS_DIR, 'README.md'), indexMd);
console.log(`✓ Generated index: docs/api/README.md`);

// Generate category files
for (const [category, routes] of Object.entries(routesByCategory)) {
  const filename = `${category.toLowerCase().replace(/\s+/g, '-')}.md`;
  const filepath = path.join(DOCS_DIR, filename);
  const content = generateCategoryIndex(category, routes);
  fs.writeFileSync(filepath, content);
  console.log(`✓ Generated ${category}: docs/api/${filename}`);
}

console.log(`\n✅ API documentation generated successfully!`);
console.log(`   Total categories: ${Object.keys(routesByCategory).length}`);
console.log(`   Total endpoints: ${contracts.routes?.length || 0}`);
console.log(`   Output directory: docs/api/`);

