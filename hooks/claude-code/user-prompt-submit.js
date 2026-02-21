#!/usr/bin/env node
// deepwhy — user-prompt-submit hook
// Injects DEEPWHY PROTOCOL into Claude's context when a bug/error prompt is detected.

const BUG_KEYWORDS = [
  // JS/runtime errors
  'TypeError', 'ReferenceError', 'SyntaxError', 'RangeError',
  'undefined is not', 'cannot read', 'cannot set',
  'unhandled rejection', 'uncaught exception',
  'stack trace', 'stack overflow',
  // System/network errors
  'ECONNREFUSED', 'ENOENT', 'ETIMEDOUT', 'ECONNRESET',
  'segfault', 'out of memory',
  // Structural symptoms
  'not working', 'stopped working', 'broken',
  'why is', 'why does', 'why are', "why won't",
  'crash', 'exception', 'keeps failing',
  'infinite loop', 'memory leak', 'deadlock',
  // User-facing symptoms (proven by test failures)
  'randomly', 'intermittently', 'sometimes fails',
  'hangs', 'freezes', 'duplicate',
  'wrong user', 'wrong data', 'shows wrong',
  'logged out', 'missing data', 'flickers'
]

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => { input += chunk })
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input)
    const prompt = (data.prompt ?? '').toLowerCase()
    const isBugReport = BUG_KEYWORDS.some(kw => prompt.includes(kw.toLowerCase()))

    if (!isBugReport) {
      process.stdout.write(JSON.stringify({ decision: 'continue' }))
      return
    }

    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `
DEEPWHY PROTOCOL — Think like a senior engineer:

1. EXTRACT: What is the exact symptom (X)?
2. BRANCH: What are ALL possible causes? Generate every branch — not just one.
3. EVIDENCE: Search the codebase. Prove or disprove each branch.
4. PRUNE: Rule out weak branches. State why.
5. ROOT: Identify the surviving root cause. Give a confidence score.
6. FIX: Fix ONLY the root. Explicitly list symptomatic fixes you are avoiding.

Show the full causal tree:
  ↑ caused by: [branch] — ✓ confirmed / ✗ ruled-out / ★ root-cause
`
      }
    }))
  } catch {
    process.stdout.write(JSON.stringify({ decision: 'continue' }))
  }
})
