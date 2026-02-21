#!/usr/bin/env node
/**
 * deepwhy installer
 * Adds deepwhy hooks to ~/.claude/settings.json automatically.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const settingsPath = resolve(process.env.HOME, '.claude', 'settings.json')
const hookDir = resolve(__dir, 'hooks', 'claude-code')

// Load existing settings or start fresh
let settings = {}
if (existsSync(settingsPath)) {
  try {
    settings = JSON.parse(readFileSync(settingsPath, 'utf8'))
  } catch {
    console.error('Could not parse ~/.claude/settings.json — please check it is valid JSON.')
    process.exit(1)
  }
}

settings.hooks ??= {}

// UserPromptSubmit hook
settings.hooks.UserPromptSubmit ??= []
const submitCmd = `node ${resolve(hookDir, 'user-prompt-submit.js')}`
const alreadyHasSubmit = settings.hooks.UserPromptSubmit
  .flatMap(e => e.hooks ?? [])
  .some(h => h.command === submitCmd)

if (!alreadyHasSubmit) {
  settings.hooks.UserPromptSubmit.push({
    hooks: [{ type: 'command', command: submitCmd }]
  })
}

// PostToolUse hook
settings.hooks.PostToolUse ??= []
const postCmd = `node ${resolve(hookDir, 'post-tool-use.js')}`
const alreadyHasPost = settings.hooks.PostToolUse
  .flatMap(e => e.hooks ?? [])
  .some(h => h.command === postCmd)

if (!alreadyHasPost) {
  settings.hooks.PostToolUse.push({
    matcher: 'Write|Edit|MultiEdit',
    hooks: [{ type: 'command', command: postCmd }]
  })
}

writeFileSync(settingsPath, JSON.stringify(settings, null, 2))

console.log('✓ deepwhy hooks installed to ~/.claude/settings.json')
console.log()
console.log('  UserPromptSubmit →', submitCmd)
console.log('  PostToolUse      →', postCmd)
console.log()
console.log('Restart Claude Code to activate.')
