import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Install: npm install bcryptjs @types/bcryptjs

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,

  pages: {
    signIn: "/login",
    error: "/login",
    newUser: "/register",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { email },
          include: {
            agentProfile: { select: { id: true, verificationStatus: true } },
          },
        });

        if (!user || !user.password) return null;

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agentProfileId: user.agentProfile?.id ?? null,
          agentVerified: user.agentProfile?.verificationStatus === "VERIFIED",
        };
      },
    }),
  ],

  callbacks: {
    // Attach custom fields to the JWT token
    async jwt({ token, user }) {
      if (user) {
        type JwtUser = {
          id: string;
          role?: "USER" | "AGENT" | "ADMIN";
          agentProfileId?: string | null;
          agentVerified?: boolean;
        };

        const jwtUser = user as JwtUser;
        token.id = user.id;
        if (jwtUser.role) token.role = jwtUser.role;
        if (jwtUser.agentProfileId !== undefined)
          token.agentProfileId = jwtUser.agentProfileId;
        if (jwtUser.agentVerified !== undefined)
          token.agentVerified = jwtUser.agentVerified;
      }
      return token;
    },

    // Expose custom fields on the session object
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.agentProfileId = token.agentProfileId as string | null;
        session.user.agentVerified = token.agentVerified as boolean;
      }
      return session;
    },
  },
});
