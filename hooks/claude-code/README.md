# deepwhy Claude Code Hooks

Forces Claude to trace root causes — not patch symptoms.

## What these hooks do

### `user-prompt-submit.js`
Detects bug/error prompts and injects the **DEEPWHY PROTOCOL** into Claude's context:

1. **EXTRACT** — What is the exact symptom?
2. **BRANCH** — Generate ALL possible causes (not just one)
3. **EVIDENCE** — Search the codebase. Prove or disprove each branch.
4. **PRUNE** — Rule out weak branches with reasoning.
5. **ROOT** — Identify the surviving root cause with confidence score.
6. **FIX** — Fix ONLY the root. List symptomatic fixes explicitly avoided.

### `post-tool-use.js`
After every file edit (`Write`, `Edit`, `MultiEdit`), reminds Claude to verify the edit targets the root cause, not a symptomatic fix.

## Install

Add to your `~/.claude/settings.json`:

```json
{
  "hooks": {
    "UserPromptSubmit": [{
      "hooks": [{
        "type": "command",
        "command": "node /path/to/deepwhy/hooks/claude-code/user-prompt-submit.js"
      }]
    }],
    "PostToolUse": [{
      "matcher": "Write|Edit|MultiEdit",
      "hooks": [{
        "type": "command",
        "command": "node /path/to/deepwhy/hooks/claude-code/post-tool-use.js"
      }]
    }]
  }
}
```

Replace `/path/to/deepwhy` with the actual path where you cloned this repo.

## Test

```bash
# Should output JSON with DEEPWHY PROTOCOL in additionalContext
echo '{"prompt":"TypeError: Cannot read id of undefined"}' \
  | node hooks/claude-code/user-prompt-submit.js

# Non-bug prompt should return {decision: "continue"}
echo '{"prompt":"refactor this function"}' \
  | node hooks/claude-code/user-prompt-submit.js
```

## Example output

When you describe a bug, Claude will structure its response as a causal tree:

```
Symptom (X): TypeError: Cannot read 'id' of undefined

  ↑ caused by: user object is null (Y1)
    ★ Cache TTL = 0 in prod config (Z1) — confidence: 0.91  ← ROOT
    ✗ Cache never initialized (Z2)       — no evidence

  ✗ id field missing from schema (Y2)   — ruled out

Root Cause: Cache TTL = 0
Fix: config/prod.json → TTL = 300s
Avoided: null check on user.id
```
