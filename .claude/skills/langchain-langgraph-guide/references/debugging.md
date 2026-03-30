# LangGraph TypeScript Debugging Guide

## Table of Contents

- [Common Errors and Fixes](#common-errors-and-fixes)
- [Debugging Workflow](#debugging-workflow)
- [Streaming Debug](#streaming-debug)
- [State Inspection](#state-inspection)
- [LangSmith Tracing](#langsmith-tracing)

## Common Errors and Fixes

### "Channel X is not defined" / State field missing

**Cause**: Node returns a key not in the state Annotation.
**Fix**: Ensure all keys returned by nodes are defined in `Annotation.Root({})`.

### "Reducer is not defined for channel X"

**Cause**: Multiple nodes write to the same field without a reducer.
**Fix**: Add a `reducer` function to the Annotation field.

```typescript
results: Annotation<string[]>({
  reducer: (current, update) => [...current, ...update],
  default: () => [],
}),
```

### "Recursion limit reached"

**Cause**: Agent loop cycles too many times (default: 25).
**Fix**: Increase `recursionLimit` in config or fix the loop exit condition.

```typescript
const result = await graph.invoke(input, { recursionLimit: 50 });
```

### Tool call errors / "Tool not found"

**Cause**: Tool name mismatch between LLM binding and ToolNode.
**Fix**: Ensure `tools` array passed to `model.bindTools(tools)` matches `new ToolNode(tools)`.

### "Cannot read properties of undefined"

**Cause**: Accessing state field that has no default value and wasn't set.
**Fix**: Add `default` to Annotation or check for undefined in node.

### Checkpointer / Persistence errors

**Cause**: Missing or misconfigured checkpointer.
**Fix**: Ensure checkpointer is passed during `compile()`.

```typescript
import { MemorySaver } from "@langchain/langgraph";

const graph = builder.compile({ checkpointer: new MemorySaver() });
```

## Debugging Workflow

1. **Reproduce**: Create a minimal input that triggers the issue
2. **Stream events**: Use `.stream()` with debug mode to trace node execution
3. **Check state**: Inspect state at each node using `streamEvents`
4. **Verify graph structure**: Use `graph.getGraph().drawMermaid()` to visualize
5. **Search docs**: Use `SearchDocsByLangChain` MCP tool for latest API info

## Streaming Debug

```typescript
// Stream node-by-node output
for await (const event of await graph.stream(input, {
	streamMode: "updates",
})) {
	console.log("Node:", Object.keys(event)[0]);
	console.log("Output:", JSON.stringify(event, null, 2));
}
```

```typescript
// Stream all events including LLM tokens
for await (const event of await graph.streamEvents(input, {
	version: "v2",
})) {
	if (event.event === "on_chat_model_stream") {
		process.stdout.write(event.data.chunk.content);
	}
}
```

## State Inspection

```typescript
// Get current state snapshot (requires checkpointer)
const state = await graph.getState({ configurable: { thread_id: "1" } });
console.log("Current state:", state.values);
console.log("Next nodes:", state.next);

// Get state history
for await (const snapshot of graph.getStateHistory({
	configurable: { thread_id: "1" },
})) {
	console.log("Step:", snapshot.metadata?.step);
	console.log("State:", snapshot.values);
}
```

## LangSmith Tracing

Set environment variables for automatic tracing:

```bash
export LANGSMITH_TRACING=true
export LANGSMITH_API_KEY="ls_..."
export LANGSMITH_PROJECT="my-project"
```

Use LangSmith dashboard to:

- View full execution trace per run
- Inspect LLM inputs/outputs at each step
- Identify which node failed and why
- Compare runs side-by-side
