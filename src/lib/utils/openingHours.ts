import { OpeningHours } from "@/types/place";

export function isOpenNow(openingHours: OpeningHours | null): boolean {
	if (openingHours === null) {
		return false;
	}

	if (openingHours.openNow !== undefined) {
		return openingHours.openNow;
	}

	if (
		openingHours.periods === undefined ||
		openingHours.periods.length === 0
	) {
		return false;
	}

	const now = new Date();
	const currentDay = now.getDay();
	const currentHour = now.getHours();
	const currentMinute = now.getMinutes();
	const currentTime = currentHour * 60 + currentMinute;

	for (const period of openingHours.periods) {
		if (period.open.day !== currentDay) {
			continue;
		}

		const openTime = period.open.hour * 60 + period.open.minute;

		if (period.close === undefined) {
			if (currentTime >= openTime) {
				return true;
			}
			continue;
		}

		const closeTime = period.close.hour * 60 + period.close.minute;

		if (closeTime > openTime) {
			if (currentTime >= openTime && currentTime < closeTime) {
				return true;
			}
		} else {
			if (currentTime >= openTime) {
				return true;
			}
		}
	}

	return false;
}
