---
name: langchain-langgraph-guide
description: >
    Guide for designing, implementing, debugging, and testing LangChain + LangGraph applications
    in TypeScript, following official documentation and best practices. Use this skill when:
    (1) Designing LangGraph graph architectures (state, nodes, edges, subgraphs),
    (2) Implementing LangChain/LangGraph agents, tools, chains, or RAG pipelines in TypeScript,
    (3) Debugging LangGraph execution errors, state issues, or routing problems,
    (4) Writing tests for LangGraph graphs and LangChain components,
    (5) Any question about @langchain/langgraph, @langchain/core, or langchain TypeScript APIs.
    Always consult official docs via the SearchDocsByLangChain MCP tool before relying on
    pre-existing knowledge, as APIs change frequently.
---

# LangChain + LangGraph TypeScript Guide

## Core Principle: Docs-First

**ALWAYS** use the `SearchDocsByLangChain` MCP tool to verify APIs, patterns, and best practices before writing code. LangChain/LangGraph APIs evolve rapidly; never rely solely on cached knowledge.

```
SearchDocsByLangChain({ query: "your topic here" })
```

Search tips:

- Include "JavaScript" or "TypeScript" in queries to get JS-specific results
- Search for specific class/function names (e.g., "StateGraph JavaScript")
- Search for patterns (e.g., "human-in-the-loop LangGraph JavaScript")

## Packages

| Package                           | Purpose                                                       |
| --------------------------------- | ------------------------------------------------------------- |
| `@langchain/langgraph`            | Graph orchestration (StateGraph, nodes, edges, checkpointers) |
| `@langchain/core`                 | Base abstractions (messages, tools, runnables, callbacks)     |
| `langchain`                       | High-level agents (`createAgent`), chains, retrievers         |
| `@langchain/langgraph-checkpoint` | Persistence (MemorySaver, PostgresSaver, etc.)                |

Install: `npm install @langchain/langgraph @langchain/core langchain`

## Workflow by Phase

### 1. Design Phase

Before writing code, determine the graph architecture:

1. **Identify the pattern** — Is this a linear pipeline, router, agent loop, or multi-agent system?
2. **Define state** — What data flows between nodes? Use `Annotation.Root({})`.
3. **Map nodes** — Each discrete step = one node function.
4. **Map edges** — Static (`addEdge`) or conditional (`addConditionalEdges`)?
5. **Consider persistence** — Need memory across turns? Use a checkpointer.

For detailed patterns and examples, see [references/design-patterns.md](references/design-patterns.md).

### 2. Implementation Phase

Follow this order when implementing:

1. **Define state annotation** with proper types and reducers
2. **Implement node functions** as pure state transformers
3. **Define tools** using `@langchain/core/tools` with Zod schemas
4. **Build the graph** with `StateGraph`, add nodes/edges
5. **Compile** with optional checkpointer
6. **Test incrementally** — verify each node before wiring the full graph

Key implementation rules:

- Use `Annotation.Root({})` for state (not plain interfaces)
- Nodes return `Partial<State>` — never mutate state directly
- Use `MessagesAnnotation` for chat-based agents
- Bind tools to model with `model.bindTools(tools)` and use `ToolNode` for execution
- Pass configurable values via `config.configurable` (not hardcoded)

When unsure about an API, search docs:

```
SearchDocsByLangChain({ query: "ToolNode JavaScript" })
```

### 3. Debugging Phase

When encountering errors:

1. **Search the error message** in docs first
2. **Stream with `updates` mode** to see which node fails
3. **Inspect state** at failure point
4. **Verify graph structure** with `getGraph().drawMermaid()`

For common errors and debugging techniques, see [references/debugging.md](references/debugging.md).

### 4. Testing Phase

Test at multiple layers:

- **Node functions**: Unit test with mock state objects
- **Tools**: Unit test with mocked external dependencies
- **Graph routing**: Integration test with `FakeListChatModel`
- **Full graph**: E2E test with streaming verification

For testing patterns and examples, see [references/testing.md](references/testing.md).

## Quick Reference: Minimal Agent

```typescript
import { ChatAnthropic } from "@langchain/anthropic";
import { tool } from "@langchain/core/tools";
import {
	StateGraph,
	MessagesAnnotation,
	START,
	END,
	ToolNode,
} from "@langchain/langgraph";
import { z } from "zod";

// 1. Define tools
const searchTool = tool(
	async ({ query }) => {
		return `Results for: ${query}`;
	},
	{
		name: "search",
		description: "Search the web",
		schema: z.object({ query: z.string() }),
	},
);

const tools = [searchTool];

// 2. Create model with tools
const model = new ChatAnthropic({
	model: "claude-sonnet-4-5-20250929",
}).bindTools(tools);

// 3. Define nodes
async function callModel(state: typeof MessagesAnnotation.State) {
	const response = await model.invoke(state.messages);
	return { messages: [response] };
}

function shouldContinue(state: typeof MessagesAnnotation.State) {
	const lastMessage = state.messages[state.messages.length - 1];
	if (lastMessage.tool_calls?.length) return "tools";
	return END;
}

// 4. Build graph
const graph = new StateGraph(MessagesAnnotation)
	.addNode("agent", callModel)
	.addNode("tools", new ToolNode(tools))
	.addEdge(START, "agent")
	.addConditionalEdges("agent", shouldContinue, ["tools", END])
	.addEdge("tools", "agent")
	.compile();
```
