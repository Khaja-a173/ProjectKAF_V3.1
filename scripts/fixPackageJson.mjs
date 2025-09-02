import fs from 'fs';

const path = 'package.json';
const raw = fs.readFileSync(path, 'utf8');

// Try normal parse first; if it works we'll just replace scripts.
function tryParse(s) {
  try { return JSON.parse(s); } catch { return null; }
}

// Extract approximate scripts block region even if JSON is malformed.
function replaceScriptsTextual(text, newScriptsBlock) {
  const startIdx = text.indexOf('"scripts"');
  if (startIdx === -1) {
    // No scripts: inject after first {  ... "scripts": { ... }, ...
    const insertAt = text.indexOf('{');
    if (insertAt === -1) throw new Error('package.json missing opening {');
    return text.slice(0, insertAt + 1) + '\n  "scripts": ' + newScriptsBlock + (text.trim().endsWith('}') ? ',\n' : '\n}') + text.slice(insertAt + 1);
  }
  // Find the brace that opens scripts object
  const braceStart = text.indexOf('{', startIdx);
  if (braceStart === -1) throw new Error('scripts block has no opening {');
  // Walk to matching closing } for this block (track nesting)
  let i = braceStart, depth = 0;
  for (; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') { depth--; if (depth === 0) break; }
  }
  if (depth !== 0) throw new Error('scripts block braces are unbalanced');

  const before = text.slice(0, startIdx);
  const keyAndColon = '"scripts": ';
  // Preserve comma before/after carefully
  // Replace from "scripts" key start through closing }
  let after = text.slice(i + 1);
  // Ensure there is either a comma or not depending on following content; we will re-add later as needed.
  return before + keyAndColon + newScriptsBlock + after;
}

const desiredScripts = {
  "predev": "node -r dotenv/config scripts/checkEnv.mjs dotenv_config_path=.env",
  "check:env": "node -r dotenv/config scripts/checkEnv.mjs dotenv_config_path=.env",
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview",
  "server": "tsx server/index.ts",
  "healthz": "tsx server/index.ts",
  "test": "vitest run --reporter=dot",
  "test:watch": "vitest",
  "test:rls": "vitest run tests/rls.spec.ts --reporter=dot",
  "test:table": "vitest run tests/table-session.spec.ts --reporter=dot",
  "test:secret": "vitest run tests/secret-shipping.spec.ts --reporter=dot",
  "test:all": "vitest run --reporter=dot"
};

const parsed = tryParse(raw);
let out;

if (parsed) {
  // Clean replace of scripts while preserving other fields.
  parsed.scripts = { ...parsed.scripts, ...desiredScripts };
  out = JSON.stringify(parsed, null, 2) + '\n';
} else {
  // Malformed JSON: textual replace of scripts block
  const newBlock = JSON.stringify(desiredScripts, null, 2);
  const replaced = replaceScriptsTextual(raw, newBlock);
  // Now try to parse; if still broken (e.g., trailing commas elsewhere), minimally fix:
  const reparsed = tryParse(replaced);
  if (reparsed) {
    out = JSON.stringify(reparsed, null, 2) + '\n';
  } else {
    // Last resort: keep original top-level fields naive by extracting the first { ... } and re-emitting minimal JSON
    // Try to salvage name/version/dependencies if present
    const minimal = {
      name: "restaurantos",
      version: "1.0.0",
      type: "module",
      ...(() => {
        try {
          // heuristic extraction of dependencies blocks
          const depsMatch = raw.match(/"dependencies"\s*:\s*\{[\s\S]*?\}/);
          const devMatch  = raw.match(/"devDependencies"\s*:\s*\{[\s\S]*?\}/);
          const parseObj = (m) => {
            if (!m) return undefined;
            try { return JSON.parse('{' + m[0].split('{').slice(1).join('{')); } catch { return undefined; }
          };
          const deps = parseObj(depsMatch);
          const devDeps = parseObj(devMatch);
          return {
            ...(deps ? { dependencies: deps } : {}),
            ...(devDeps ? { devDependencies: devDeps } : {})
          };
        } catch { return {}; }
      })(),
      scripts: desiredScripts
    };
    out = JSON.stringify(minimal, null, 2) + '\n';
  }
}

fs.writeFileSync(path, out, 'utf8');
// Validate final JSON
JSON.parse(out);
console.log('[fixPackageJson] package.json repaired and valid.');