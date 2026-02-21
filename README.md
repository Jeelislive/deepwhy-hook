# deepwhy

> Don't fix X. Find why.

Claude Code hooks that force Claude to trace root causes — not patch symptoms.

## The problem

When you report a bug, AI assistants reach for the nearest fix:

```
TypeError: Cannot read 'id' of undefined
→ Add null check on user.id   ← WRONG. Symptom fix.
```

Senior engineers don't do this. They ask *why* the user is null in the first place.

## What deepwhy does

Two Claude Code hooks that change how Claude thinks about bugs:

**On every bug report** — injects the DEEPWHY PROTOCOL:
1. **EXTRACT** — What is the exact symptom?
2. **BRANCH** — What are ALL possible causes? (not just one)
3. **EVIDENCE** — Search the codebase. Prove or disprove each branch.
4. **PRUNE** — Rule out weak branches. State why.
5. **ROOT** — Identify the surviving root cause with confidence score.
6. **FIX** — Fix ONLY the root. List symptomatic fixes explicitly avoided.

**After every file edit** — reminds Claude to verify the edit targets the root cause, not a symptom.

## Example

```
You:   TypeError: Cannot read 'id' of undefined — why?

Claude: DEEPWHY analysis:

  Symptom (X): TypeError on user.id

  ↑ caused by: user object is null (Y1)
    ★ Cache TTL = 0 in prod config (Z1) — confidence: 0.91  ← ROOT
    ✗ Cache never initialized (Z2)       — no evidence found

  ✗ id field missing from schema (Y2)   — ruled out (schema unchanged)

  Root Cause: Cache TTL is 0 in config/prod.json
  Fix: Set TTL to 300s
  Avoided: null check on user.id (would hide the real bug)
```

## Install

**Requires:** [Claude Code](https://claude.ai/code) and Node.js 18+

```bash
git clone https://github.com/YOUR_USERNAME/deepwhy
cd deepwhy
node install.js
```

That's it. Restart Claude Code.

### Manual install

If you prefer to edit `~/.claude/settings.json` yourself:

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

## Uninstall

Remove the two hook entries from `~/.claude/settings.json`.

## How it works

The hooks are plain Node.js scripts. They read from stdin (Claude passes JSON), inspect the prompt or tool call, and write back JSON that Claude reads as additional context.

No API calls. No external dependencies. No data leaves your machine.

## Files

```
hooks/claude-code/
├── user-prompt-submit.js   # Injects DEEPWHY PROTOCOL on bug prompts
├── post-tool-use.js        # Verifies edits target root cause
└── README.md               # Hook-specific docs
install.js                  # Auto-patches ~/.claude/settings.json
```
