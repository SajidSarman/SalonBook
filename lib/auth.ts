import { betterAuth } from "better-auth"
import { APIError, createAuthMiddleware } from "better-auth/api"
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
  database: mongodbAdapter(db, {
    client,
  }),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
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
