import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { codeEvaluationSchema } from "@shared/schema";
import { JavaExecutionService } from "./services/JavaExecutionService";
import { ProblemService } from "./services/ProblemService";
import fs from "fs";
import path from "path";
import { exec } from "child_process";
import * as os from "os";
import { v4 as uuidv4 } from "uuid";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize services
  const javaExecutionService = new JavaExecutionService();
  const problemService = new ProblemService();

  // API endpoint to get all problems
  app.get("/api/problems", async (req, res) => {
    try {
      const problems = await problemService.getAllProblems();
      res.json(problems);
    } catch (error) {
      console.error("Error fetching problems:", error);
      res.status(500).json({ message: "Failed to fetch problems" });
    }
  });

  // API endpoint to get a specific problem by ID
  app.get("/api/problems/:id", async (req, res) => {
    try {
      const problemId = parseInt(req.params.id);
      const problem = await problemService.getProblemById(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      res.json(problem);
    } catch (error) {
      console.error("Error fetching problem:", error);
      res.status(500).json({ message: "Failed to fetch problem" });
    }
  });

  // API endpoint to evaluate Java code
  app.post("/api/evaluate", async (req, res) => {
    try {
      const validation = codeEvaluationSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ message: "Invalid request", errors: validation.error.format() });
      }
      
      const { code, language, problemId } = validation.data;
      
      // Get problem to check against test cases
      const problem = await problemService.getProblemById(problemId);
      
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }
      
      // Execute code and get results
      const results = await javaExecutionService.executeJavaCode(code, problem.testCases);
      
      res.json(results);
    } catch (error) {
      console.error("Error evaluating code:", error);
      res.status(500).json({ message: "Failed to evaluate code" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
