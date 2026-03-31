import { findOrCreateUserByGoogle } from "@/lib/db/user";
import "@/types/auth";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_AUTH_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET as string,
		}),
	],
	callbacks: {
		async signIn({ user, account }) {
			if (account?.provider !== "google") return false;
			if (!account.providerAccountId || !user.email || !user.name)
				return false;

			try {
				await findOrCreateUserByGoogle(
					account.providerAccountId,
					user.email,
					user.name,
				);
				return true;
			} catch {
				return false;
			}
		},
		async jwt({ token, account, user }) {
			if (account?.provider === "google" && user.email) {
				const dbUser = await findOrCreateUserByGoogle(
					account.providerAccountId,
					user.email,
					user.name ?? user.email,
				);
				token.userId = dbUser.id;
			}
			return token;
		},
		async session({ session, token }) {
			session.user.id = token.userId;
			return session;
		},
	},
};
