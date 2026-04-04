/**
 * @jest-environment jsdom
 */
import { PlaceBar, PlaceCard } from "../place";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("react-icons/md", () => ({
	MdFavorite: () => <span data-testid="icon-favorite">filled</span>,
	MdFavoriteBorder: () => (
		<span data-testid="icon-favorite-border">outline</span>
	),
}));

jest.mock("next/link", () => ({
	__esModule: true,
	default: ({
		href,
		children,
	}: {
		href: string;
		children: React.ReactNode;
	}) => <a href={href}>{children}</a>,
}));

const mockPlace = {
	id: 1,
	googlePlaceId: "place123",
	name: "代々木公園",
	latitude: 35.6714,
	longitude: 139.6956,
	address: "東京都渋谷区",
	imageUrl: null,
	priceLevel: null,
	openingHours: null,
	categories: ["公園"],
};

describe("PlaceCard", () => {
	it("shows MdFavoriteBorder when isFavorite is false", () => {
		render(<PlaceCard place={mockPlace} isFavorite={false} />);
		expect(screen.getByTestId("icon-favorite-border")).toBeTruthy();
	});

	it("shows MdFavorite when isFavorite is true", () => {
		render(<PlaceCard place={mockPlace} isFavorite={true} />);
		expect(screen.getByTestId("icon-favorite")).toBeTruthy();
	});

	it("calls onFavoriteToggle with (place, null) when not favorited and button clicked", () => {
		const onToggle = jest.fn();
		render(
			<PlaceCard
				place={mockPlace}
				isFavorite={false}
				favoriteId={null}
				onFavoriteToggle={onToggle}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "お気に入り追加" }));
		expect(onToggle).toHaveBeenCalledWith(mockPlace, null);
	});

	it("calls onFavoriteToggle with (place, 42) when favorited and button clicked", () => {
		const onToggle = jest.fn();
		render(
			<PlaceCard
				place={mockPlace}
				isFavorite={true}
				favoriteId={42}
				onFavoriteToggle={onToggle}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "お気に入り解除" }));
		expect(onToggle).toHaveBeenCalledWith(mockPlace, 42);
	});
});

describe("PlaceBar", () => {
	it("shows MdFavoriteBorder when isFavorite is false", () => {
		render(<PlaceBar place={mockPlace} isFavorite={false} />);
		expect(screen.getByTestId("icon-favorite-border")).toBeTruthy();
	});

	it("shows MdFavorite when isFavorite is true", () => {
		render(<PlaceBar place={mockPlace} isFavorite={true} />);
		expect(screen.getByTestId("icon-favorite")).toBeTruthy();
	});

	it("calls onFavoriteToggle with (place, null) when not favorited and button clicked", () => {
		const onToggle = jest.fn();
		render(
			<PlaceBar
				place={mockPlace}
				isFavorite={false}
				favoriteId={null}
				onFavoriteToggle={onToggle}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "お気に入り追加" }));
		expect(onToggle).toHaveBeenCalledWith(mockPlace, null);
	});

	it("calls onFavoriteToggle with (place, 42) when favorited and button clicked", () => {
		const onToggle = jest.fn();
		render(
			<PlaceBar
				place={mockPlace}
				isFavorite={true}
				favoriteId={42}
				onFavoriteToggle={onToggle}
			/>,
		);
		fireEvent.click(screen.getByRole("button", { name: "お気に入り解除" }));
		expect(onToggle).toHaveBeenCalledWith(mockPlace, 42);
	});
});
