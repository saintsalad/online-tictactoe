import NextAuth from "next-auth";

declare module "next-auth" {
    interface User {
        id: number;
        username: string;
    }
    interface Session {
        user: User &{
            id: number;
            username: string;
        }
        token: {
            id: number;
            username: string;
        }
    }
}
