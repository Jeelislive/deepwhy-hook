#!/usr/bin/env node
// deepwhy — user-prompt-submit hook
// Injects DEEPWHY PROTOCOL into Claude's context when a bug/error prompt is detected.

const BUG_KEYWORDS = [
  'error', 'bug', 'fix', 'broken', 'crash', 'exception',
  'fail', 'issue', 'problem', 'undefined', 'null', 'TypeError',
  'why is', 'why does', 'not working'
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
