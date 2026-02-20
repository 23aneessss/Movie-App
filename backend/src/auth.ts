import { expo } from "@better-auth/expo";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";

import { db } from "./db/client.js";
import * as schema from "./db/schema.js";
import { corsOrigins, env } from "./lib/env.js";

export const auth = betterAuth({
  appName: "Movie App",
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: ["movieapp://", "exp://", ...corsOrigins],
  plugins: [expo()],
});

export type AuthSession = Awaited<ReturnType<typeof auth.api.getSession>>;
