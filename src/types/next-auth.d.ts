import { type DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

//Auth.js's built-in Session type only has name, email, image. Without this augmentation, ctx.session.user.id would be a TypeScript error everywhere you use it.