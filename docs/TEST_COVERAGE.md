# Test Coverage Summary

## Overview

Comprehensive test suite covering all core terminal functionality. Run `npm run test:unit` to see current test count and status.

## Test Files

### 1. ansi-colors.test.ts

Tests ANSI color code parsing and detection:

- ✅ Plain text parsing
- ✅ Single and multiple color codes
- ✅ Text before/after color codes
- ✅ Color without reset
- ✅ All standard colors (30-37)
- ✅ Empty string handling
- ✅ ANSI code detection in text

**Edge cases covered:**

- Empty strings
- Unknown color codes
- Text without ANSI codes
- Escaped brackets

### 2. commands-utils.test.ts

Tests command execution logic for all commands:

- ✅ Unknown command error handling
- ✅ Built-in commands: ping, help, clear, echo, date, neofetch, colors
- ✅ Case insensitive command handling
- ✅ Echo with special characters
- ✅ Cat command (file reading, markdown parsing, error handling, links open in new tab)
- ✅ Ls command (file listing, fetch errors, empty lists)

**Edge cases covered:**

- Empty arguments (echo with no args)
- Special characters in arguments
- File not found (cat command)
- Server vs client execution paths
- Fetch failures
- Empty file lists

**Mocking notes:**

- The `marked` mock includes a `.use()` stub to support the custom link renderer (`target="_blank"`) without throwing errors during tests

### 3. session.test.ts

Tests session management and cookie handling:

- ✅ UUID generation format validation
- ✅ Unique ID generation
- ✅ ID length verification (36 chars)
- ✅ Existing session retrieval from cookies
- ✅ New session creation
- ✅ Secure cookie settings in production
- ✅ Cookie expiration (1 year)
- ✅ HttpOnly flag
- ✅ SameSite=lax setting
- ✅ Cookie path (/)
- ✅ Empty string handling

**Edge cases covered:**

- Missing cookie
- Empty cookie value
- Production vs development environments

### 4. terminal.test.ts

Tests TypeScript type definitions:

- ✅ Link types (command and URL)
- ✅ CommandConfig with various options
- ✅ TerminalConfig structure
- ✅ HistoryEntry types (command, output, greeting)
- ✅ Optional fields (links, isGreeting, isHtml)

**Edge cases covered:**

- Static vs dynamic commands
- Commands with actions
- Commands with links
- Multiple commands
- All optional fields present

### 5. server.test.ts

Tests API endpoint for file listing:

- ✅ File listing with sorting
- ✅ Hidden file filtering (.gitignore, etc.)
- ✅ Directory filtering
- ✅ Alphabetical sorting
- ✅ Empty directory handling
- ✅ Filesystem error handling
- ✅ Mixed file types
- ✅ Files with special characters

**Edge cases covered:**

- Empty directories
- Only directories (no files)
- Permission errors
- ENOENT errors
- Files with spaces, dashes, underscores

### 6. terminal.test.ts (E2E)

End-to-end tests for full terminal workflows using Playwright.

## Coverage Analysis

### Core Functionality ✅

- Command parsing and execution
- ANSI color support
- File system operations (cat, ls)
- Session management
- Cookie persistence
- Error handling

### Edge Cases ✅

- Empty inputs
- Missing files
- Invalid commands
- Filesystem errors
- Network failures
- Special characters
- Case sensitivity
- Empty arrays/strings

### Security ✅

- Cookie security (httpOnly, secure, sameSite)
- Session ID format (UUID v4)
- File access restrictions (no hidden files)
- Markdown XSS protection (built into marked library)

## Running Tests

```bash
# Run all tests
npm run test:unit

# Run tests in watch mode
npm run test:unit -- --watch

# Run with verbose output
npm run test:unit -- --run --reporter=verbose

# Run specific test file
npm run test:unit -- src/lib/ansi-colors.test.ts
```

## Test Configuration

Tests are configured in [vite.config.ts](../vite.config.ts) with two projects:

1. **Client tests** (`*.svelte.test.ts`): Browser-based tests using Playwright
2. **Server tests** (`*.test.ts`): **Edge runtime environment** tests

### Edge Runtime Testing

Server tests use `environment: 'edge-runtime'` to simulate Cloudflare Workers:

```typescript
{
  name: 'server',
  environment: 'edge-runtime',  // Simulates Cloudflare Workers
  include: ['src/**/*.{test,spec}.{js,ts}'],
  exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
}
```

**Why Edge Runtime?**

- Tests run in an environment that closely mimics Cloudflare Workers
- Catches issues where Node.js-specific APIs are used (which won't work on Workers)
- Ensures code works in actual deployment environment
- Validates that no filesystem access or other unsupported APIs are used

See [ARCHITECTURE.md](ARCHITECTURE.md#testing-edge-runtime) for more details.

## Future Test Enhancements

### Potential Additions:

- [ ] Integration tests for Terminal.svelte component
- [ ] E2E tests for full user workflows
- [ ] Performance tests for large file handling
- [ ] Stress tests for command history limits
- [ ] Browser compatibility tests
- [ ] Accessibility tests

### Missing Coverage:

- Terminal.svelte component (requires browser testing setup)
- +page.server.ts actions (requires SvelteKit testing utils)
- Complete markdown rendering pipeline
- KV storage integration

## Notes

- Playwright browser is not installed in dev environment (client tests will fail until `npx playwright install` is run)
- Mocks are used for filesystem operations to avoid test environment dependencies
- Tests are environment-aware (server vs client paths)
