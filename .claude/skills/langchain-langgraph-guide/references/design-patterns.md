# LangGraph TypeScript Design Patterns

## Table of Contents

- [Graph Architecture Patterns](#graph-architecture-patterns)
- [State Design](#state-design)
- [Node Patterns](#node-patterns)
- [Edge Patterns](#edge-patterns)
- [Common Anti-Patterns](#common-anti-patterns)

## Graph Architecture Patterns

### Linear Pipeline

Use when steps execute sequentially without branching.

```typescript
const builder = new StateGraph(StateAnnotation)
	.addNode("step1", step1Fn)
	.addNode("step2", step2Fn)
	.addEdge(START, "step1")
	.addEdge("step1", "step2")
	.addEdge("step2", END);
```

### Router Pattern

Use when a classifier/LLM decides which branch to take.

```typescript
const builder = new StateGraph(StateAnnotation)
	.addNode("classifier", classifyFn)
	.addNode("branchA", branchAFn)
	.addNode("branchB", branchBFn)
	.addEdge(START, "classifier")
	.addConditionalEdges("classifier", routeFn, ["branchA", "branchB"])
	.addEdge("branchA", END)
	.addEdge("branchB", END);
```

### Agent Loop (ReAct)

Use for tool-calling agents that loop until done.

```typescript
const builder = new StateGraph(MessagesAnnotation)
	.addNode("agent", callModel)
	.addNode("tools", toolNode)
	.addEdge(START, "agent")
	.addConditionalEdges("agent", shouldContinue, ["tools", END])
	.addEdge("tools", "agent");
```

### Multi-Agent / Subgraph

Use when different agents handle different domains.

```typescript
const researchGraph = createResearchGraph();
const writerGraph = createWriterGraph();

const builder = new StateGraph(StateAnnotation)
	.addNode("researcher", researchGraph)
	.addNode("writer", writerGraph)
	.addEdge(START, "researcher")
	.addEdge("researcher", "writer")
	.addEdge("writer", END);
```

### Human-in-the-Loop

Use `interrupt` for human approval/input steps.

```typescript
import { interrupt } from "@langchain/langgraph";

function humanReviewNode(state: typeof StateAnnotation.State) {
	const approval = interrupt("Please review and approve this action.");
	return { approval };
}
```

## State Design

### Annotation-based State (Recommended)

```typescript
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";

const StateAnnotation = Annotation.Root({
	...MessagesAnnotation.spec,
	query: Annotation<string>,
	results: Annotation<string[]>({
		reducer: (current, update) => [...current, ...update],
		default: () => [],
	}),
});
```

### Key Rules

- Use `Annotation.Root({})` for state definition
- Use `reducer` for fields that accumulate (e.g., messages, results)
- Use `default` for fields that need initial values
- Extend `MessagesAnnotation` for chat-based agents
- Keep state flat; avoid deep nesting

## Node Patterns

### Node Function Signature

```typescript
async function myNode(
	state: typeof StateAnnotation.State,
	config?: RunnableConfig,
): Promise<Partial<typeof StateAnnotation.State>> {
	return { fieldToUpdate: newValue };
}
```

### Command for Dynamic Routing

```typescript
import { Command } from "@langchain/langgraph";

function routingNode(state: typeof StateAnnotation.State) {
	if (state.needsReview) {
		return new Command({ goto: "review", update: { status: "reviewing" } });
	}
	return new Command({ goto: END, update: { status: "done" } });
}

builder.addNode("router", routingNode, { ends: ["review", END] });
```

## Edge Patterns

### Conditional Edges

```typescript
function routeDecision(state: typeof StateAnnotation.State): string {
	if (state.score > 0.8) return "accept";
	return "reject";
}

builder.addConditionalEdges("scorer", routeDecision, ["accept", "reject"]);
```

## Common Anti-Patterns

| Anti-Pattern                     | Fix                                                 |
| -------------------------------- | --------------------------------------------------- |
| Mutating state directly in nodes | Return partial state update objects                 |
| Deeply nested state objects      | Keep state flat with Annotation                     |
| Missing reducers for list fields | Add `reducer` to Annotation spec                    |
| Hardcoded model names in nodes   | Pass via `config.configurable`                      |
| No error handling in tool nodes  | Wrap tool calls in try-catch, return error in state |
| Overly complex single graph      | Split into subgraphs composed together              |
