# Contributing to Terminal Interface

Thank you for your interest in contributing to the Terminal Interface project! This guide will help you get started.

## 🌟 Welcome

We welcome contributions of all kinds:

- Bug reports and fixes
- New features and commands
- Documentation improvements
- Test coverage enhancements
- UI/UX improvements
- Accessibility enhancements

## 📋 Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork:**

   ```sh
   git clone https://github.com/YOUR_USERNAME/dariushdev-sveltekit.git
   cd dariushdev-sveltekit
   ```

3. **Add upstream remote:**

   ```sh
   git remote add upstream https://github.com/devDariush/dariushdev-sveltekit.git
   ```

4. **Install dependencies:**

   ```sh
   npm install
   ```

5. **Start development server:**
   ```sh
   npm run dev
   ```

## 🔄 Contribution Workflow

### 1. Create a Branch

Create a descriptive branch name:

```sh
git checkout -b feature/add-grep-command
git checkout -b fix/history-persistence-bug
git checkout -b docs/improve-testing-guide
```

### 2. Make Your Changes

Follow the project's coding standards (see below).

### 3. Write Tests (Required)

**⚠️ CRITICAL**: All code changes must include tests.

- Maintain ≥80% test coverage
- Test both success and error paths
- Include edge cases (empty inputs, invalid values, boundaries)
- Test server-side and client-side execution when applicable

See [TEST_COVERAGE.md](docs/TEST_COVERAGE.md) for detailed testing guidelines.

```sh
# Run tests
npm run test:unit

# Watch mode
npm run test:unit -- --watch

# Coverage report
npm run test:unit -- --coverage
```

### 4. Update Documentation (Required)

**⚠️ CRITICAL**: Update documentation when changing features or architecture.

Update relevant files:

- **README.md** - Major features, tech stack changes
- **docs/TERMINAL_README.md** - New commands, usage patterns
- **docs/ARCHITECTURE.md** - Technical implementation changes, new APIs
- **docs/TEST_COVERAGE.md** - New test files or test counts
- **docs/DOCS_INDEX.md** - New documentation files
- **static/docs.md** - User-facing command help
- **Code comments** - Complex or non-obvious logic

See [DOCS_INDEX.md](docs/DOCS_INDEX.md) for documentation structure.

### 5. Run Quality Checks

Before committing, ensure all checks pass:

```sh
# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format

# Run all tests
npm run test:unit

# E2E tests (optional locally)
npm run test:e2e
```

### 6. Commit Your Changes

Use clear, descriptive commit messages:

**Format:**

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `test:` - Test additions or updates
- `refactor:` - Code refactoring
- `style:` - Formatting changes
- `chore:` - Maintenance tasks

**Examples:**

```sh
git commit -m "feat: add grep command with regex support"
git commit -m "fix: resolve history persistence race condition"
git commit -m "docs: update ARCHITECTURE.md with new storage logic"
git commit -m "test: add edge case tests for cat command"
```

### 7. Push and Create a Pull Request

```sh
git push origin your-branch-name
```

Then open a pull request on GitHub with:

- Clear title describing the change
- Detailed description of what was changed and why
- References to any related issues
- Screenshots/GIFs for UI changes
- Test results confirmation

## 🎯 Coding Standards

### General Principles

1. **Test-Driven Development** - Write tests first or alongside code
2. **Type Safety** - Use TypeScript strict mode throughout
3. **Progressive Enhancement** - Code must work with and without JavaScript
4. **Security First** - Sanitize all user inputs
5. **Accessibility** - WCAG compliant, keyboard navigable
6. **Documentation** - Keep docs in sync with code changes

### File Structure

```
src/lib/feature.ts          → Feature implementation
src/lib/feature.test.ts     → Corresponding tests
```

**Note:** Avoid `+` prefix in test files (SvelteKit reserved).

### Testing Patterns

Use this structure for tests:

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

### Adding New Commands

When adding a new command:

1. **Add to `src/lib/commands.json`:**

   ```json
   {
   	"newcmd": {
   		"description": "What it does",
   		"response": "dynamic"
   	}
   }
   ```

2. **Implement in `src/lib/commands-utils.ts`:**

   ```typescript
   case 'newcmd': {
     if (args.length === 0) {
       return { output: 'Usage: newcmd <arg>' };
     }

     try {
       // Implementation
       return { output: result };
     } catch (error) {
       return { output: `Error: ${error.message}` };
     }
   }
   ```

3. **Add tests in `src/lib/commands-utils.test.ts`:**

   ```typescript
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

4. **Update documentation:**
   - Add to `docs/TERMINAL_README.md` command list
   - Add to `static/docs.md` for in-terminal help
   - Update `docs/TEST_COVERAGE.md` with new test details

## 🧪 Testing Guidelines

### What to Test

- ✅ All public functions and components
- ✅ Success and failure paths
- ✅ Edge cases (empty, null, undefined, boundaries)
- ✅ Server-side and client-side execution
- ✅ Error handling
- ✅ Progressive enhancement (with/without JS)

### What NOT to Do

- ❌ Add code without tests
- ❌ Delete failing tests to make CI pass
- ❌ Skip edge cases
- ❌ Use real filesystem/network in tests (mock instead)
- ❌ Leave outdated documentation

## 🔒 Security

- Sanitize all user inputs and file paths
- Use `httpOnly`, `secure`, and `sameSite` cookie attributes
- Validate all API inputs
- Never expose sensitive data in logs or errors

## 📚 Documentation

### Documentation Standards

- **Accuracy** - Must reflect actual implementation
- **Completeness** - Cover all user-facing changes
- **Examples** - Provide code examples where relevant
- **Cross-references** - Link related sections
- **Clarity** - Write for developers of all levels

### Key Documents

- [TERMINAL_README.md](docs/TERMINAL_README.md) - Terminal usage guide
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical implementation
- [TEST_COVERAGE.md](docs/TEST_COVERAGE.md) - Testing strategy
- [CLOUDFLARE_DEPLOYMENT.md](docs/CLOUDFLARE_DEPLOYMENT.md) - Deployment guide
- [COLOR_CODES.md](docs/COLOR_CODES.md) - ANSI color reference
- [DOCS_INDEX.md](docs/DOCS_INDEX.md) - Documentation overview

## 🐛 Reporting Bugs

When reporting bugs, include:

1. **Description** - Clear summary of the issue
2. **Steps to Reproduce** - Exact steps to trigger the bug
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Environment** - OS, browser, Node version
6. **Screenshots** - If applicable
7. **Console Errors** - Any relevant error messages

## 💡 Suggesting Features

When suggesting features:

1. **Use Case** - Explain the problem it solves
2. **Proposed Solution** - Describe your idea
3. **Alternatives** - Other approaches considered
4. **Implementation Notes** - Technical considerations

## 🎨 Areas for Contribution

...WIP

## 🤝 Getting Help

- **Questions?** Open a [GitHub Discussion](https://github.com/devDariush/dariushdev-sveltekit/discussions)
- **Bugs?** Open a [GitHub Issue](https://github.com/devDariush/dariushdev-sveltekit/issues)
- **Contributing?** Comment on an existing issue or open a new one

## 📜 License

By contributing, you agree that your contributions will be licensed under the same license as the project.

## ⭐ Recognition

All contributors will be recognized in the project. Thank you for helping make Terminal Interface better!

---

**Golden Rules:**

1. **If you write code, write tests.** If you modify code, update tests.
2. **If you change features, update docs.** Keep documentation in sync.
3. **Run all checks before submitting.** Tests, linting, type checking must pass.

Happy contributing! 🎉
