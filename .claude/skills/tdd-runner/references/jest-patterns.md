# Jest テストパターンリファレンス

## テストファイル配置規約

```
<module>.ts          → <module>.test.ts     (同一ディレクトリ)
app/lib/utils.ts     → app/lib/utils.test.ts
app/hooks/useAuth.ts → app/hooks/useAuth.test.ts
```

## テストファイルテンプレート

### 純粋関数

```typescript
import { myFunction } from "./myFunction";

describe("myFunction", () => {
	describe("正常系", () => {
		it("入力Aに対してBを返す", () => {
			expect(myFunction("A")).toBe("B");
		});
	});

	describe("異常系", () => {
		it("不正な入力に対してエラーをスローする", () => {
			expect(() => myFunction(null as any)).toThrow("Invalid input");
		});
	});

	describe("境界値", () => {
		it("空文字列に対して空文字列を返す", () => {
			expect(myFunction("")).toBe("");
		});
	});
});
```

### 非同期関数

```typescript
import { fetchData } from "./fetchData";

describe("fetchData", () => {
	it("データを正常に取得する", async () => {
		const result = await fetchData("valid-id");
		expect(result).toEqual({ id: "valid-id", name: "test" });
	});

	it("存在しないIDでエラーをスローする", async () => {
		await expect(fetchData("invalid")).rejects.toThrow("Not found");
	});
});
```

### モック

```typescript
import { query } from "@/lib/db";

// 外部モジュールのモック
jest.mock("@/lib/db", () => ({
	query: jest.fn(),
}));

const mockQuery = query as jest.MockedFunction<typeof query>;

beforeEach(() => {
	jest.clearAllMocks();
});
```

## テスト設計チェックリスト

1. **正常系**: 期待される入力に対する正しい出力
2. **異常系**: 不正入力、エラーケース
3. **境界値**: 空値、0、上限・下限値
4. **型安全**: TypeScript の型が正しく推論されること（コンパイルエラーが出ないこと）

## Jest 設定（Next.js 16 + TypeScript）

### jest.config.ts

```typescript
import type { Config } from "jest";
import nextJest from "next/jest";

const createJestConfig = nextJest({ dir: "./" });

const config: Config = {
	testEnvironment: "node",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
};

export default createJestConfig(config);
```

### 必要パッケージ

```bash
npm install -D jest @types/jest ts-node
```

> `next/jest` が SWC トランスフォームを提供するため `ts-jest` は不要。
