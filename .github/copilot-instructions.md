# GitHub Copilot Instructions

## Project Overview

This is a **Terminal Interface** built with SvelteKit 5, featuring progressive enhancement, Cloudflare KV storage, and comprehensive test coverage. The project prioritizes code quality, type safety, and maintainability.

## Core Principles

1. **Test-Driven Development**: All features must have corresponding tests
2. **Type Safety**: Use TypeScript strict mode throughout
3. **Progressive Enhancement**: Code must work with and without JavaScript
4. **Security First**: Sanitize all user inputs and HTML output
5. **Accessibility**: WCAG compliant, keyboard navigable

## Testing Requirements

### Always Maintain Tests

**CRITICAL**: When modifying any code, you MUST update or create corresponding tests, especially for hot paths.

#### Test Coverage Standards

- **Target**: Maintain ≥80% test coverage with 100% pass rate
- **Minimum**: Every function must have at least one test
- **Edge Cases**: Test empty inputs, errors, boundaries, and invalid data
- **Both Modes**: Test server-side and client-side execution paths

#### Test File Naming Convention

```
src/lib/ansi-colors.ts       → src/lib/ansi-colors.test.ts
src/lib/commands-utils.ts    → src/lib/commands-utils.test.ts
src/routes/api/files/+server.ts → src/routes/api/files/server.test.ts
```

**Note**: Avoid `+` prefix in test files (SvelteKit reserved).

### Test Structure

Use Vitest with this structure:

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('module name', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('function name', () => {
		it('should handle normal case', () => {
			// Arrange
			const input = 'test';

			// Act
			const result = functionName(input);

			// Assert
			expect(result).toBe('expected');
		});

		it('should handle edge case: empty input', () => {
			const result = functionName('');
			expect(result).toBe('fallback');
		});

		it('should handle edge case: invalid input', () => {
			expect(() => functionName(null)).toThrow();
		});
	});
});
```

### When to Create/Update Tests

#### Adding New Features

1. Write test file FIRST (TDD approach)
2. Test all public functions and components
3. Include edge cases from the start
4. Test both success and failure paths

#### Modifying Existing Code

1. Run existing tests to ensure they still pass
2. Add new tests for new behavior
3. Update tests that break due to intentional changes
4. Never delete tests without replacing them

#### Refactoring

1. Tests should pass before and after refactoring
2. If tests need updates, the refactor may be breaking
3. Add regression tests for bugs being fixed

### Test Categories (examples)

#### Unit Tests (`*.test.ts`)

- Pure functions and utilities
- Command execution logic
- ANSI color parsing
- Type interfaces
- Session management

Example areas:

- `src/lib/commands-utils.test.ts` - Command execution
- `src/lib/ansi-colors.test.ts` - Color parsing
- `src/lib/server/session.test.ts` - Session management
- `src/lib/types/terminal.test.ts` - Type definitions

#### Integration Tests

- API endpoints
- Server actions
- File operations
- Database/KV operations

Example areas:

- `src/routes/api/files/server.test.ts` - File listing API

#### E2E Tests (`e2e/**/*.test.ts`)

- Full user workflows
- Browser interactions
- Progressive enhancement validation

### Testing Patterns

#### Mock External Dependencies

```typescript
// Mock fs/promises
vi.mock('fs/promises', () => ({
	default: {
		readdir: vi.fn(),
		readFile: vi.fn()
	}
}));

// Use in tests
const fs = await import('fs/promises');
vi.mocked(fs.default.readFile).mockResolvedValue('content');
```

#### Test Server vs Client Paths

```typescript
it('should work on server', async () => {
	const result = await executeCommand('ls', [], { isServer: true });
	expect(result.output).toContain('file');
});

it('should work on client', async () => {
	global.fetch = vi.fn().mockResolvedValue({
		ok: true,
		json: () => Promise.resolve(['file'])
	});

	const result = await executeCommand('ls', [], { isServer: false });
	expect(result.output).toContain('file');
});
```

#### Test Error Handling

```typescript
it('should handle errors gracefully', async () => {
	vi.mocked(fs.readFile).mockRejectedValue(new Error('ENOENT'));

	const result = await executeCommand('cat', ['missing.txt']);
	expect(result.output).toContain('No such file');
});
```

### Edge Cases to Always Test

1. **Empty Inputs**: `''`, `[]`, `null`, `undefined`
2. **Boundary Values**: Max/min lengths, zero, negative numbers
3. **Invalid Types**: Wrong type arguments
4. **Special Characters**: Spaces, quotes, escape sequences
5. **Concurrent Operations**: Race conditions, parallel execution
6. **Network Failures**: Fetch errors, timeouts
7. **Filesystem Errors**: Missing files, permissions, invalid paths
8. **State Issues**: Empty history, missing cookies, expired sessions

### Code Quality Checks

Before committing:

```bash
# Run all tests
npm run test:unit

# Check types
npm run check

# Lint code
npm run lint

# Format code
npm run format
```

All must pass before merging.

## Code Patterns

### Commands (commands-utils.ts)

When adding new commands:

```typescript
// 1. Add to commands.json
{
  "newcmd": {
    "description": "What it does",
    "response": "dynamic"
  }
}

// 2. Add logic in commands-utils.ts
case 'newcmd': {
  if (args.length === 0) {
    return { output: 'Usage: newcmd <arg>' };
  }

  try {
    // Implementation
    return { output: result };
  } catch (error) {
    return { output: 'Error: ' + error.message };
  }
}

// 3. Add tests
describe('newcmd command', () => {
  it('should return usage when no args', async () => {
    const result = await executeCommand('newcmd', []);
    expect(result.output).toContain('Usage');
  });

  it('should handle valid input', async () => {
    const result = await executeCommand('newcmd', ['arg']);
    expect(result.output).toBeTruthy();
  });

  it('should handle errors', async () => {
    // Test error path
  });
});
```

### ANSI Colors

When modifying color parsing:

- Test all 16 colors (30-37, 90-97)
- Test reset code (0)
- Test empty strings
- Test text without codes
- Test consecutive codes
- Test unknown codes

### API Endpoints

When creating endpoints:

- Test successful responses
- Test error responses (4xx, 5xx)
- Test empty data
- Test invalid requests
- Mock all external dependencies

## Security Guidelines

### Always Sanitize

```typescript
// Markdown is handled by marked library with built-in XSS protection
// For user input paths:
const safePath = path.join(SAFE_DIR, sanitize(userInput));
```

### Cookie Security

```typescript
cookies.set('name', value, {
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production',
	sameSite: 'lax',
	path: '/'
});
```

## Documentation

When adding features, update:

1. **README.md** - If it's a major feature
2. **TERMINAL_README.md** - If it adds commands or changes behavior
3. **TEST_COVERAGE.md** - When adding new test files
4. **static/docs.md** - If users need to know about it
5. **Code Comments** - For complex logic

## Common Pitfalls to Avoid

❌ **Don't**: Add code without tests  
✅ **Do**: Write tests first or alongside code

❌ **Don't**: Delete failing tests to make CI pass  
✅ **Do**: Fix the code or update the test appropriately

❌ **Don't**: Test implementation details  
✅ **Do**: Test public interfaces and behavior

❌ **Don't**: Use real filesystem/network in tests  
✅ **Do**: Mock external dependencies

❌ **Don't**: Forget to test error paths  
✅ **Do**: Test both success and failure scenarios

❌ **Don't**: Skip edge cases "because they're unlikely"  
✅ **Do**: Edge cases are where bugs hide

## Test Execution

```bash
# Run all tests
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# Specific file
npm run test:unit -- ansi-colors.test.ts

# Verbose output
npm run test:unit -- --run --reporter=verbose

# Coverage report
npm run test:unit -- --coverage
```

## Vitest Configuration

Tests are split into two projects:

- **server**: Node environment (most tests)
- **client**: Browser environment (Svelte components)

Located in `vite.config.ts`:

```typescript
test: {
	projects: [
		{
			name: 'server',
			environment: 'node',
			include: ['src/**/*.{test,spec}.{js,ts}']
		},
		{
			name: 'client',
			browser: { enabled: true },
			include: ['src/**/*.svelte.{test,spec}.{js,ts}']
		}
	];
}
```

## Key Metrics

Current status (maintain or improve):

- ✅ **All tests** passing (run `npm run test:unit` to verify)
- ✅ **Comprehensive coverage** across all core modules
- ✅ **0 failing** tests
- ✅ **100%** critical path coverage

## Summary

**Golden Rule**: If you write code, write tests. If you modify code, update tests. If tests fail, fix the issue—don't delete the test.

The test suite is the project's safety net. Treat it as production code.
