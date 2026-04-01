export interface UserProfile {
	id: number;
	nickname: string;
	email: string;
	birthday: string | null;
	sex: number | null;
}

export interface UpdateUserProfileInput {
	nickname?: string;
	birthday?: string | null;
	sex?: number | null;
}
