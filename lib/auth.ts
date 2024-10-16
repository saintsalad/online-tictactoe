import {NextAuthOptions} from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {PrismaAdapter} from "@next-auth/prisma-adapter";
import {db} from "@/lib/db";
import {PrismaClient} from "@prisma/client";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/sign-in",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username"},
                password: { label: "Password", type: "password" }
            },
            // @ts-ignore
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }
                const existedUser = await db.player.findUnique({
                    where: {
                        username: credentials?.username,
                    }
                });
                if (!existedUser) {
                    return null;
                }
                //Check password match
                if (existedUser) {
                    console.log(existedUser);
                    if (existedUser.password == credentials.password) {
                        return existedUser;
                    }
                }
                return {
                    id: existedUser.id ,
                    username: existedUser.username
                }
            }
        })
    ],
    callbacks: {
        async jwt ({token, user}) {
            console.log("JWT Callback - token: ", token);
            console.log("JWT Callback - user: ", user);
            if (user) {
                return {
                    ...token,
                    username: user.username
                }
            }
            return token;
        },
        async session({session, token}) {
            return {
                ...session,
                user: {
                    ...session.user,
                    username: token.username
                }
            }
        },
    }
}