import { pgTable, text, serial, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for authentication
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Define the problems table
export const problems = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  complexityLevel: integer("complexity_level").notNull().default(1),
  category: text("category").notNull(),
  testCases: jsonb("test_cases").notNull(),
  solutionTemplate: jsonb("solution_template").notNull(),
});

// Define the submissions table
export const submissions = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  problemId: integer("problem_id").references(() => problems.id),
  code: text("code").notNull(),
  language: text("language").notNull().default("java"),
  status: text("status").notNull(),
  results: jsonb("results"),
  submittedAt: text("submitted_at").notNull(),
});

// Schemas for form validation
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertProblemSchema = createInsertSchema(problems);

export const insertSubmissionSchema = createInsertSchema(submissions).pick({
  userId: true,
  problemId: true,
  code: true,
  language: true,
});

// Code evaluation request schema
export const codeEvaluationSchema = z.object({
  code: z.string(),
  language: z.string().default("java"),
  problemId: z.number(),
  filename: z.string().optional(),
});

// Performance metrics schema
export const performanceMetricsSchema = z.object({
  codeQuality: z.number(),
  efficiency: z.number(),
  bestPractices: z.number(),
  complexity: z.number(),
  timePerformance: z.number(),
});

// Types based on the tables
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problems.$inferSelect;

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

export type CodeEvaluation = z.infer<typeof codeEvaluationSchema>;
