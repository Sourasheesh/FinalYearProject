import { pgTable, text, serial, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  role: text("role").notNull(),
  emailVerified: boolean("email_verified").default(false),
  failedAttempts: integer("failed_attempts").default(0),
  isLocked: boolean("is_locked").default(false),
  otpCode: text("otp_code"),
  otpExpiry: timestamp("otp_expiry"),
});

export const loginHistory = pgTable("login_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  ipAddress: text("ip_address").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  success: boolean("success").notNull(),
});

export type User = typeof users.$inferSelect;
export type LoginHistory = typeof loginHistory.$inferSelect;
