import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
import { jwt } from "better-auth/plugins"
import { mongodbAdapter } from "@better-auth/mongo-adapter"

import { validatePassword } from "./password"
import { client, db } from "./mongodb"

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  user: {
    additionalFields: {
      // Public registrations can never set this field: `input: false`
      // forces the server-side default. Admin roles must be assigned
      // directly in the database or by a trusted server process.
      role: {
        type: "string",
        defaultValue: "customer",
        input: false,
      },
      isBlocked: {
        type: "boolean",
        defaultValue: false,
        input: false,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  plugins: [
    jwt({
      // The browser must never see the JWT: without this the plugin exposes it
      // through a `set-auth-jwt` header on every /get-session response.
      disableSettingJwtHeader: true,
      jwks: {
        // Pinned so the Express server can verify against a known algorithm.
        keyPairConfig: { alg: "EdDSA" },
      },
      jwt: {
        issuer: process.env.JWT_ISSUER ?? process.env.BETTER_AUTH_URL,
        audience: process.env.JWT_AUDIENCE ?? "salonbook-api",
        expirationTime: "10m",
        // The `sub` claim is the user id, added by the plugin. Everything else
        // the Express API needs to build `req.auth` lives here.
        definePayload: ({ user }) => ({
          name: user.name,
          email: user.email,
          role: user.role,
          isBlocked: user.isBlocked === true,
        }),
      },
    }),
  ],
  database: mongodbAdapter(db, {
    client,
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // The JWT plugin exposes GET /token over HTTP. Only the Next.js server
      // mints tokens: `auth.api.getToken()` reaches this hook without a
      // `request`, while a browser call always has one.
      if (ctx.path === "/token" && ctx.request) {
        throw APIError.from("NOT_FOUND", {
          message: "Not found",
          code: "TOKEN_ENDPOINT_DISABLED",
        })
      }

      if (ctx.path !== "/sign-up/email") {
        return
      }

      const password =
        typeof ctx.body?.password === "string" ? ctx.body.password : ""
      const error = validatePassword(password)

      if (error) {
        throw APIError.from("BAD_REQUEST", {
          message: error,
          code: "INVALID_PASSWORD",
        })
      }
    }),
  },
})
