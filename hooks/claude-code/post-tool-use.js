#!/usr/bin/env node
// deepwhy — post-tool-use hook
// After any file edit, reminds Claude to verify the edit targets the ROOT CAUSE.

let input = ''
process.stdin.setEncoding('utf8')
process.stdin.on('data', chunk => { input += chunk })
process.stdin.on('end', () => {
  try {
    const data = JSON.parse(input)
    const toolName = data.tool_name ?? ''

    if (!['Write', 'Edit', 'MultiEdit'].includes(toolName)) {
      process.exit(0)
      return
    }

    const filePath = data.tool_input?.file_path ?? 'unknown file'
    process.stdout.write(JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PostToolUse',
        additionalContext:
          `DEEPWHY CHECK: You edited "${filePath}". ` +
          `Does this target the ROOT CAUSE you identified, not a symptomatic fix? ` +
          `If not — revert and fix the actual root.`
      }
    }))
  } catch {
    process.exit(0)
  }
})
