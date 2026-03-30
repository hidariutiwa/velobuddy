# LangGraph TypeScript Testing Guide

## Table of Contents

- [Testing Strategy](#testing-strategy)
- [Unit Testing Nodes](#unit-testing-nodes)
- [Testing Graph Execution](#testing-graph-execution)
- [Mocking LLM Calls](#mocking-llm-calls)
- [Testing Tools](#testing-tools)
- [E2E Testing with Streaming](#e2e-testing-with-streaming)

## Testing Strategy

| Layer           | What to Test                     | Approach                        |
| --------------- | -------------------------------- | ------------------------------- |
| Node functions  | Business logic, state transforms | Unit test with mock state       |
| Tools           | Input validation, API calls      | Unit test with mocked externals |
| Graph structure | Edge routing, conditional logic  | Integration test with fake LLM  |
| Full graph      | End-to-end behavior              | E2E test with real/mock LLM     |

## Unit Testing Nodes

```typescript
import { describe, it, expect } from "@jest/globals";

describe("processNode", () => {
	it("should transform state correctly", async () => {
		const inputState = {
			messages: [],
			query: "test query",
			results: [],
		};

		const result = await processNode(inputState);

		expect(result.results).toBeDefined();
		expect(result.results).toHaveLength(1);
	});

	it("should handle empty input gracefully", async () => {
		const inputState = {
			messages: [],
			query: "",
			results: [],
		};

		const result = await processNode(inputState);

		expect(result.results).toEqual([]);
	});
});
```

## Testing Graph Execution

```typescript
import { describe, it, expect } from "@jest/globals";

describe("myGraph", () => {
	it("should execute full pipeline", async () => {
		const graph = createMyGraph();
		const result = await graph.invoke({
			query: "test input",
		});

		expect(result.results).toBeDefined();
		expect(result.results.length).toBeGreaterThan(0);
	});

	it("should route to correct branch", async () => {
		const graph = createMyGraph();
		const events: string[] = [];

		for await (const event of await graph.stream(
			{ query: "route-to-A" },
			{ streamMode: "updates" },
		)) {
			events.push(Object.keys(event)[0]);
		}

		expect(events).toContain("branchA");
		expect(events).not.toContain("branchB");
	});
});
```

## Mocking LLM Calls

```typescript
import { AIMessage } from "@langchain/core/messages";
import { FakeListChatModel } from "@langchain/core/utils/testing";

// Create a fake LLM that returns predetermined responses
const fakeLLM = new FakeListChatModel({
	responses: [
		new AIMessage({
			content: "I'll search for that.",
			tool_calls: [
				{
					name: "search",
					args: { query: "test" },
					id: "call_1",
				},
			],
		}),
		new AIMessage({ content: "Here are the results." }),
	],
});

// Use in graph construction
function createTestGraph() {
	return createMyGraph({ model: fakeLLM });
}
```

## Testing Tools

```typescript
import { tool } from "@langchain/core/tools";
import { z } from "zod";

describe("searchTool", () => {
	it("should return results for valid query", async () => {
		const result = await searchTool.invoke({ query: "test" });
		expect(result).toContain("result");
	});

	it("should validate input schema", async () => {
		await expect(searchTool.invoke({ invalid: "field" })).rejects.toThrow();
	});
});
```

## E2E Testing with Streaming

```typescript
describe("streaming", () => {
	it("should stream all node updates", async () => {
		const graph = createMyGraph();
		const updates: Record<string, unknown>[] = [];

		for await (const chunk of await graph.stream(
			{ query: "test" },
			{ streamMode: "updates" },
		)) {
			updates.push(chunk);
		}

		expect(updates.length).toBeGreaterThan(0);
		// Verify expected nodes executed
		const nodeNames = updates.map((u) => Object.keys(u)[0]);
		expect(nodeNames).toContain("agent");
	});
});
```
