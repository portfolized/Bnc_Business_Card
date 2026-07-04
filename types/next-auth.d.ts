import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      username: string;
      role: string;
    } & DefaultSession["user"];
  }

  interface User {
    username: string;
    role?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username: string;
    role: string;
    // Epoch ms of the last time id/username/role were synced from the DB. Used
    // to periodically re-sync so a session survives the user's row id changing.
    syncedAt?: number;
  }
}
