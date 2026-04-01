/**
 * @jest-environment jsdom
 */
import { SearchBar } from "./search";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("react-icons/fa", () => ({
	FaSearch: () => null,
}));

describe("SearchBar", () => {
	describe("レンダリング", () => {
		it("コンポーネントが正常にレンダリングされること", () => {
			const onSearch = jest.fn();
			render(<SearchBar onSearch={onSearch} />);
			const input = screen.getByPlaceholderText("探す");
			expect(input).toBeDefined();
		});
	});

	describe("Enter キー押下", () => {
		it("Enter キー押下で onSearch が入力値で呼ばれること", () => {
			const onSearch = jest.fn();
			render(<SearchBar onSearch={onSearch} />);

			const input = screen.getByPlaceholderText("探す");
			fireEvent.change(input, { target: { value: "カフェ" } });
			fireEvent.keyDown(input, { key: "Enter" });

			expect(onSearch).toHaveBeenCalledTimes(1);
			expect(onSearch).toHaveBeenCalledWith("カフェ");
		});

		it("空文字のまま Enter キーを押した場合、onSearch が呼ばれないこと", () => {
			const onSearch = jest.fn();
			render(<SearchBar onSearch={onSearch} />);

			const input = screen.getByPlaceholderText("探す");
			fireEvent.keyDown(input, { key: "Enter" });

			expect(onSearch).not.toHaveBeenCalled();
		});

		it("スペースのみ入力して Enter キーを押した場合、onSearch が呼ばれないこと（trim 確認）", () => {
			const onSearch = jest.fn();
			render(<SearchBar onSearch={onSearch} />);

			const input = screen.getByPlaceholderText("探す");
			fireEvent.change(input, { target: { value: "   " } });
			fireEvent.keyDown(input, { key: "Enter" });

			expect(onSearch).not.toHaveBeenCalled();
		});

		it("Enter キー以外のキー（例: a キー）を押した場合、onSearch が呼ばれないこと", () => {
			const onSearch = jest.fn();
			render(<SearchBar onSearch={onSearch} />);

			const input = screen.getByPlaceholderText("探す");
			fireEvent.change(input, { target: { value: "カフェ" } });
			fireEvent.keyDown(input, { key: "a" });

			expect(onSearch).not.toHaveBeenCalled();
		});
	});
});
