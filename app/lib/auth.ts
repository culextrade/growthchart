import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "username" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                });

                if (!user) {
                    return null;
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    return null;
                }

                if (user.isLocked) {
                    return null;
                }

                return {
                    id: user.id,
                    username: user.username,
                    role: user.role,
                    tenant_id: user.tenant_id,
                    name: user.name,
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.username = (user as any).username;
                token.name = user.name;
                token.role = (user as any).role;
                token.tenant_id = (user as any).tenant_id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                (session.user as any).username = token.username;
                session.user.name = token.name as string | null | undefined;
                (session.user as any).role = token.role;
                (session.user as any).tenant_id = token.tenant_id;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};
