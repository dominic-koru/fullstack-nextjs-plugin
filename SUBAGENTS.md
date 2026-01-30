# Phase 4: Subagents (Sessions 7-8)

## Overview

Subagents are specialized Claude instances that run autonomously to handle specific tasks. Think of them as team members with different expertise who can work independently or in parallel.

## Core Concepts

### 1. Context Isolation

- Each agent starts with a **fresh context** (unless resumed)
- Agents don't see the main conversation history
- You provide task description and they return results
- Results are returned to you (not shown directly to user)

**Example Flow**:

```
Main Conversation
  ↓
Spawn Agent → [Agent works independently with tools]
  ↓
Agent Returns Result
  ↓
You summarize result for user
```

### 2. Agent Types

Claude Code provides several specialized agent types:

| Agent Type            | Specialization            | Tools Available                       | When to Use                       |
| --------------------- | ------------------------- | ------------------------------------- | --------------------------------- |
| **Bash**              | Command execution         | Bash only                             | Git operations, terminal tasks    |
| **general-purpose**   | Complex research          | All tools                             | Multi-step tasks, code search     |
| **Explore**           | Fast codebase exploration | All tools                             | Finding files, searching keywords |
| **Plan**              | Software architecture     | All tools                             | Implementation planning           |
| **claude-code-guide** | Claude Code help          | Read, Glob, Grep, WebFetch, WebSearch | Questions about Claude Code       |

### 3. When to Use Subagents

**Use subagents when:**

- ✅ Task requires multiple rounds of search/exploration
- ✅ Task is complex and self-contained
- ✅ You can run multiple tasks in parallel
- ✅ Task might take significant time (background execution)
- ✅ You want to isolate context for focused work

**Don't use subagents when:**

- ❌ Simple single file read (use Read tool directly)
- ❌ Known file path operations
- ❌ 2-3 file searches (use Glob/Grep directly)
- ❌ Task requires back-and-forth with user

### 4. Parallel Execution

Spawn multiple agents in **one message** to run them in parallel:

```typescript
// Example: Run tests and build simultaneously
[Single message with multiple Task tool calls]
- Task 1: test-runner agent
- Task 2: build-validator agent
```

**Benefits**:

- Faster execution (tasks run concurrently)
- Efficient for independent tasks
- Better user experience

### 5. Background Execution

Run long-running agents in the background:

```typescript
Task tool with run_in_background: true
  ↓
Returns output_file path immediately
  ↓
Continue other work
  ↓
Check output later with: Read(output_file) or tail -f output_file
```

### 6. Resume Capability

Continue previous agent work:

```typescript
First call: Task(prompt: "Find all API routes")
  ↓
Returns: {result, agent_id: "abc123"}
  ↓
Follow-up: Task(resume: "abc123", prompt: "Now check if they have tests")
  ↓
Agent continues with full context preserved
```

## Practical Agent Patterns for This Project

### Pattern 1: Code Exploration

**Scenario**: "Find all places where organisations are fetched"

```typescript
// Use Explore agent for keyword searches
Task({
  subagent_type: 'Explore',
  description: 'Find organisation fetching',
  prompt:
    'Find all files and code that fetch organisations from the API. Include API routes, service layer, and components.',
  model: 'haiku', // Optional: use haiku for speed
});
```

### Pattern 2: Test Running

**Scenario**: "Run tests and report failures"

```typescript
// Custom test-runner agent (defined in commands)
Task({
  subagent_type: 'general-purpose',
  description: 'Run all tests',
  prompt: `Run the full test suite using 'npm test -- --run'.

  Report:
  1. Total tests passed/failed
  2. Failing test details with error messages
  3. Suggested fixes for failures
  4. Files missing tests

  Return results in markdown format.`,
});
```

### Pattern 3: Code Review

**Scenario**: "Review recent changes for issues"

```typescript
Task({
  subagent_type: 'general-purpose',
  description: 'Review recent changes',
  prompt: `Review git diff of staged changes for:
  - Next.js 16 async params usage
  - API response format consistency
  - Zod validation presence
  - Error handling
  - Type safety issues
  - Missing tests

  Return findings with severity levels (critical/warning/suggestion).`,
});
```

### Pattern 4: Parallel Feature Analysis

**Scenario**: "Check if users AND organisations have proper validation"

```typescript
// Single message with TWO Task tool calls
Task({
  subagent_type: 'Explore',
  description: 'Check user validation',
  prompt: 'Analyze user validation: check API routes, Zod schemas, error handling',
});

Task({
  subagent_type: 'Explore',
  description: 'Check org validation',
  prompt: 'Analyze organisation validation: check API routes, Zod schemas, error handling',
});
```

### Pattern 5: Background Build

**Scenario**: "Start build while working on something else"

```typescript
Task({
  subagent_type: 'Bash',
  description: 'Build project',
  prompt: "Run 'npm run build' and report any errors",
  run_in_background: true,
});
// Returns immediately with output_file path
// Continue other work...
// Check later: Read(output_file)
```

## Agent Communication Best Practices

### 1. Clear Task Descriptions

**Good**:

```typescript
prompt: `Find all API routes in src/app/api/ that handle user operations.
For each route, check:
1. Do they use async params (Next.js 16)?
2. Do they have Zod validation?
3. Do they return consistent ApiResponse format?

Return a summary table with findings.`;
```

**Bad**:

```typescript
prompt: 'Check the user stuff'; // Too vague
```

### 2. Specify Expected Output

```typescript
prompt: `Analyze test coverage for the search utility.

Return in this format:
- Test file location: [path]
- Tests present: [count]
- Coverage gaps: [list]
- Suggested additional tests: [list]`;
```

### 3. Provide Context for Isolated Agents

Remember: agents don't see main conversation!

```typescript
// Main conversation: "Check if the authentication module is tested"
// Agent doesn't know what "authentication module" is!

// Good agent prompt:
prompt: `Check test coverage for the authentication system.
The auth code is likely in:
- src/lib/auth/
- src/app/api/auth/

Find test files and report coverage.`;
```

## Exercise Plan for Phase 4

### Session 7: Basic Agents

**Exercise 1: Explore Agent**

- Use Explore agent to find all API routes
- Use Explore agent to find all test files
- Compare speed vs manual Glob/Grep

**Exercise 2: Test Runner Agent**

- Create test-runner agent prompt
- Have it run tests and report failures
- Practice interpreting agent results

**Exercise 3: Code Review Agent**

- Create code-review agent prompt
- Review staged changes
- Practice providing review feedback to user

### Session 8: Advanced Agents

**Exercise 4: Parallel Agents**

- Spawn 2 agents in parallel
- One checks validation, one checks tests
- Combine results to give user complete report

**Exercise 5: Background Agent**

- Start long-running task in background
- Continue other work
- Check on background task progress

**Exercise 6: Resume Agent**

- Create agent for initial exploration
- Resume agent for follow-up analysis
- Understand context preservation

**Exercise 7: Custom Agent for Project**

- Design a "feature-readiness-checker" agent
- Given a feature, check: API routes, tests, docs, UI
- Return checklist of what's ready/missing

## Common Pitfalls

### ❌ Pitfall 1: Using Agents for Simple Tasks

```typescript
// DON'T
Task({ prompt: 'Read src/app/page.tsx' });

// DO
Read({ file_path: '/Users/.../src/app/page.tsx' });
```

### ❌ Pitfall 2: Forgetting Context Isolation

```typescript
// Main conversation: "Check the UserDialog component we just created"

// DON'T (agent doesn't know what "we just created" means)
Task({ prompt: 'Check the UserDialog component we just created' });

// DO (provide full context)
Task({
  prompt:
    'Check the UserDialog component in src/components/users/UserDialog.tsx for proper validation and error handling',
});
```

### ❌ Pitfall 3: Not Summarizing for User

```typescript
// Agent returns detailed analysis...

// DON'T (user doesn't see agent output)
[Just move on]

// DO (summarize for user)
"I analyzed the validation layer using an Explore agent. Found 3 issues: ..."
```

### ❌ Pitfall 4: Sequential Instead of Parallel

```typescript
// DON'T (sequential, slower)
[Message 1] Task({prompt: "Check user tests"})
[Wait for result]
[Message 2] Task({prompt: "Check org tests"})

// DO (parallel, faster)
[Single message with both Task calls]
Task({prompt: "Check user tests"})
Task({prompt: "Check org tests"})
```

## Agent Design Template

When designing a new agent pattern:

````markdown
**Agent Purpose**: [What problem does it solve?]

**Agent Type**: [Bash/general-purpose/Explore/etc]

**When to Use**: [Specific scenarios]

**Input Requirements**: [What info agent needs]

**Expected Output**: [What format/content]

**Success Criteria**: [How to know it worked]

**Example Prompt**:

```typescript
Task({
  subagent_type: '...',
  description: '...',
  prompt: `...`,
});
```
````

````

## Debugging Agents

### Check Agent Output

```typescript
// Agent returns result
const result = agentResult;

// If unclear, ask agent for more details by resuming
Task({
  resume: agent_id,
  prompt: "Can you show the specific code locations for the issues you found?"
})
````

### Common Agent Issues

| Issue                            | Cause                      | Solution                               |
| -------------------------------- | -------------------------- | -------------------------------------- |
| Agent can't find files           | Vague path description     | Provide specific directory paths       |
| Agent returns incomplete results | Prompt too broad           | Break into smaller, focused tasks      |
| Agent output not useful          | No output format specified | Specify exact format needed            |
| Agent takes too long             | Task too complex           | Use background execution or split task |

## Next Steps After Phase 4

After mastering subagents:

- **Phase 5**: MCP Servers (Sessions 9-10)
  - Integrate external tools
  - Database MCP server
  - File system MCP server
  - Custom MCP servers

- **Phase 6**: Advanced Workflows (Sessions 11-12)
  - Combine hooks + commands + agents
  - End-to-end feature development automation
  - Custom CI/CD workflows

## Summary

**Key Takeaways**:

1. ✅ Agents are isolated, specialized workers
2. ✅ Use agents for complex, multi-step tasks
3. ✅ Spawn multiple agents in parallel when possible
4. ✅ Provide clear, detailed prompts with context
5. ✅ Always summarize agent results for user
6. ✅ Use background execution for long tasks
7. ✅ Resume agents for follow-up work
8. ✅ Choose the right agent type for the task

**Most Important Rule**:

> Agents don't see the main conversation. Give them everything they need in the prompt.
