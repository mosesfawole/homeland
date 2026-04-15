import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase-server";
import { checkRateLimit, getRequestIp } from "@/lib/security";

// Install: npm install bcryptjs @types/bcryptjs

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
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

      async authorize(credentials, request) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = getRequestIp(request);
        const limit = await checkRateLimit(
          `login:${ip}:${email.toLowerCase()}`,
          10,
          60_000,
        );
        if (!limit.ok) {
          throw new Error("RateLimited");
        }
        const supabase = getSupabaseAdmin();
        const devBypassEmailVerification =
          process.env.NODE_ENV !== "production" &&
          process.env.AUTH_DEV_BYPASS_EMAIL_VERIFICATION === "1";

        const { data: user, error: userError } = await supabase
          .from("User")
          .select("id, email, name, role, password, emailVerified")
          .eq("email", email)
          .maybeSingle();

        if (userError || !user || !user.password) return null;
        if (!user.emailVerified && !devBypassEmailVerification) {
          throw new Error("EmailNotVerified");
        }

        const { data: agentProfile } = await supabase
          .from("AgentProfile")
          .select("id, verificationStatus")
          .eq("userId", user.id)
          .maybeSingle();

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          agentProfileId: agentProfile?.id ?? null,
          agentVerified: agentProfile?.verificationStatus === "VERIFIED",
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
        if (token.role === "USER" || token.role === "AGENT" || token.role === "ADMIN") {
          session.user.role = token.role;
        }
        session.user.agentProfileId = token.agentProfileId as string | null;
        session.user.agentVerified = token.agentVerified as boolean;
      }
      return session;
    },
  },
});
