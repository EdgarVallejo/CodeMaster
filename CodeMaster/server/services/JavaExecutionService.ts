import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';
import { promisify } from 'util';

const execPromise = promisify(exec);

interface TestCase {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  input?: string;
  expectedOutput?: string;
}

interface TestResult {
  testCaseId: string;
  name: string;
  passed: boolean;
  message?: string;
  executionTime?: number;
}

interface CodeEvaluationResult {
  success: boolean;
  compilationSuccessful: boolean;
  compilationOutput?: string;
  testResults?: TestResult[];
  qualityFeedback?: {
    type: 'success' | 'warning' | 'info';
    message: string;
    details?: string;
    category?: string;
  }[];
  performanceMetrics?: {
    codeQuality: number;
    efficiency: number;
    bestPractices: number;
    complexity: number;
    timePerformance: number;
  };
}

export class JavaExecutionService {
  private readonly tempDir: string;

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'java-assessment');
    // Ensure the temp directory exists
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  async executeJavaCode(code: string, testCases: TestCase[]): Promise<CodeEvaluationResult> {
    // Create a unique folder for this execution
    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    fs.mkdirSync(executionDir, { recursive: true });

    try {
      // Extract class name from code
      const classNameMatch = code.match(/public\s+class\s+(\w+)/);
      if (!classNameMatch) {
        return {
          success: false,
          compilationSuccessful: false,
          compilationOutput: "Could not determine class name from the code."
        };
      }

      const className = classNameMatch[1];
      const filePath = path.join(executionDir, `${className}.java`);

      // Write code to file
      fs.writeFileSync(filePath, code);

      // Compile the code
      const compilationResult = await this.compileJavaCode(executionDir, filePath);

      if (!compilationResult.success) {
        return {
          success: false,
          compilationSuccessful: false,
          compilationOutput: compilationResult.output
        };
      }

      // Run test cases
      const testResults = await this.runTestCases(executionDir, className, testCases);

      // Generate quality feedback
      const qualityFeedback = this.generateCodeQualityFeedback(code);
      
      // Generate performance metrics
      const performanceMetrics = this.generatePerformanceMetrics(code, testResults);

      return {
        success: true,
        compilationSuccessful: true,
        compilationOutput: compilationResult.output,
        testResults,
        qualityFeedback,
        performanceMetrics
      };
    } catch (error) {
      console.error('Error executing Java code:', error);
      return {
        success: false,
        compilationSuccessful: false,
        compilationOutput: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    } finally {
      // Clean up
      try {
        fs.rmSync(executionDir, { recursive: true, force: true });
      } catch (e) {
        console.error('Error cleaning up execution directory:', e);
      }
    }
  }

  private async compileJavaCode(workingDir: string, filePath: string): Promise<{ success: boolean; output: string }> {
    try {
      const { stdout, stderr } = await execPromise(`javac "${filePath}"`, { cwd: workingDir });
      
      // Check if the compilation was successful (no .class file indicates failure)
      const classFilePath = filePath.replace('.java', '.class');
      const compilationSuccessful = fs.existsSync(classFilePath);
      
      return {
        success: compilationSuccessful,
        output: stderr || stdout || "Compilation successful"
      };
    } catch (error) {
      return {
        success: false,
        output: error instanceof Error ? error.message : 'Unknown compilation error'
      };
    }
  }

  private async runTestCases(workingDir: string, className: string, testCases: TestCase[]): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testCases) {
      try {
        // Create a file for input if needed
        let inputFilePath: string | undefined;
        if (testCase.input) {
          inputFilePath = path.join(workingDir, `input_${testCase.id}.txt`);
          fs.writeFileSync(inputFilePath, testCase.input);
        }

        const start = process.hrtime();
        
        // Run the Java program
        const command = inputFilePath 
          ? `java "${className}" < "${inputFilePath}"`
          : `java "${className}"`;
        
        const { stdout, stderr } = await execPromise(command, { cwd: workingDir });
        
        const [seconds, nanoseconds] = process.hrtime(start);
        const executionTime = seconds * 1000 + nanoseconds / 1000000; // in milliseconds

        // Check if the output matches the expected output
        let passed = false;
        if (testCase.expectedOutput) {
          // Normalize line endings and whitespace for comparison
          const normalizedOutput = stdout.trim().replace(/\r\n/g, '\n');
          const normalizedExpected = testCase.expectedOutput.trim().replace(/\r\n/g, '\n');
          passed = normalizedOutput === normalizedExpected;
        } else {
          // If no expected output is provided, then pass if there's no error
          passed = !stderr;
        }

        results.push({
          testCaseId: testCase.id,
          name: testCase.name,
          passed,
          message: passed ? 'Test passed successfully' : `Test failed. ${stderr || ''}`,
          executionTime
        });
      } catch (error) {
        results.push({
          testCaseId: testCase.id,
          name: testCase.name,
          passed: false,
          message: `Error running test: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }
    }

    return results;
  }

  private generateCodeQualityFeedback(code: string): { type: 'success' | 'warning' | 'info'; message: string; details?: string; category?: string }[] {
    const feedback: { type: 'success' | 'warning' | 'info'; message: string; details?: string; category?: string }[] = [];

    // DOCUMENTATION ANALYSIS
    
    // Check for class-level Javadoc comments
    const hasClassJavadoc = /\/\*\*[\s\S]*?\*\/\s*public\s+class/.test(code);
    if (hasClassJavadoc) {
      feedback.push({
        type: 'success',
        message: 'Excellent class documentation',
        details: 'Your code includes clear Javadoc for the class, which greatly helps others understand its purpose and usage.',
        category: 'Documentation'
      });
    } else if (code.includes('public class')) {
      feedback.push({
        type: 'warning',
        message: 'Missing class Javadoc',
        details: 'Adding proper Javadoc comments to your class would improve code documentation. Include a class description, author, and version information.',
        category: 'Documentation'
      });
    }

    // Check for method-level Javadoc comments
    const methodDeclarationCount = (code.match(/public|private|protected\s+[\w<>[\],\s]+\s+\w+\s*\(/g) || []).length;
    const methodJavadocCount = (code.match(/\/\*\*[\s\S]*?\*\/\s*(public|private|protected)\s+[\w<>[\],\s]+\s+\w+\s*\(/g) || []).length;
    
    const javadocCoverage = methodDeclarationCount > 0 ? methodJavadocCount / methodDeclarationCount : 0;
    
    if (javadocCoverage >= 0.8) {
      feedback.push({
        type: 'success',
        message: 'Comprehensive method documentation',
        details: `You've documented ${methodJavadocCount} out of ${methodDeclarationCount} methods with proper Javadoc, which aids code maintainability.`,
        category: 'Documentation'
      });
    } else if (javadocCoverage > 0) {
      feedback.push({
        type: 'info',
        message: 'Partial method documentation',
        details: `Only ${methodJavadocCount} out of ${methodDeclarationCount} methods have Javadoc comments. Consider documenting all methods.`,
        category: 'Documentation'
      });
    } else if (methodDeclarationCount > 0) {
      feedback.push({
        type: 'warning',
        message: 'Missing method documentation',
        details: 'None of your methods have Javadoc comments. Adding @param, @return, and @throws tags to methods greatly improves code readability.',
        category: 'Documentation'
      });
    }
    
    // Check for inline comments
    const linesOfCode = code.split('\n').length;
    const inlineCommentCount = (code.match(/\/\/[^\n]*/g) || []).length;
    const commentRatio = linesOfCode > 0 ? inlineCommentCount / linesOfCode : 0;
    
    if (commentRatio > 0.15) {
      feedback.push({
        type: 'success',
        message: 'Good use of inline comments',
        details: 'Your code has a healthy amount of inline comments explaining implementation details.',
        category: 'Documentation'
      });
    } else if (commentRatio < 0.05 && linesOfCode > 30) {
      feedback.push({
        type: 'info',
        message: 'Consider adding more inline comments',
        details: 'Complex code sections could benefit from more inline comments explaining the "why" behind your implementation.',
        category: 'Documentation'
      });
    }

    // CODE STRUCTURE & ORGANIZATION

    // Check method length
    const methodLengths = this.extractMethodLengths(code);
    const longMethods = methodLengths.filter(length => length > 30);
    
    if (longMethods.length > 0) {
      feedback.push({
        type: 'warning',
        message: 'Methods are too long',
        details: `You have ${longMethods.length} method(s) with more than 30 lines. Consider breaking them into smaller, more focused methods with single responsibilities.`,
        category: 'Structure'
      });
    } else if (methodLengths.length > 0 && methodLengths.every(length => length < 20)) {
      feedback.push({
        type: 'success',
        message: 'Well-sized methods',
        details: 'Your methods are concise and focused, which improves readability and maintainability.',
        category: 'Structure'
      });
    }
    
    // Check for proper encapsulation (private fields)
    const fieldDeclarations = code.match(/\s+(private|public|protected)\s+[\w<>[\],\s]+\s+\w+(\s*=\s*[^;]+)?;/g) || [];
    const privateFieldCount = fieldDeclarations.filter(field => field.includes('private')).length;
    const publicFieldCount = fieldDeclarations.filter(field => field.includes('public')).length;
    
    if (publicFieldCount > 0 && privateFieldCount === 0) {
      feedback.push({
        type: 'warning',
        message: 'Poor encapsulation',
        details: 'You have public fields but no private fields. Consider making fields private and providing accessor methods to improve encapsulation.',
        category: 'Structure'
      });
    } else if (privateFieldCount > 0 && publicFieldCount === 0) {
      feedback.push({
        type: 'success',
        message: 'Good encapsulation',
        details: 'Your fields are properly encapsulated as private with controlled access, which is a best practice in OOP.',
        category: 'Structure'
      });
    }
    
    // Check for object-oriented design
    const hasInterfaces = code.includes('interface ') || code.includes('implements ');
    const hasInheritance = code.includes('extends ');
    
    if (hasInterfaces || hasInheritance) {
      feedback.push({
        type: 'success',
        message: 'Good object-oriented design',
        details: `You're using ${hasInterfaces ? 'interfaces' : ''}${hasInterfaces && hasInheritance ? ' and ' : ''}${hasInheritance ? 'inheritance' : ''} to create a flexible and extensible design.`,
        category: 'Design'
      });
    }
    
    // ERROR HANDLING & ROBUSTNESS
    
    // Check for systematic exception handling
    const methodCount = methodDeclarationCount;
    const tryCatchBlocks = (code.match(/try\s*\{[\s\S]*?catch\s*\([\s\S]*?\)\s*\{/g) || []).length;
    
    if (tryCatchBlocks > 0) {
      // Check for empty catch blocks
      const emptyCatchBlocks = (code.match(/catch\s*\([\s\S]*?\)\s*\{\s*\}/g) || []).length;
      
      if (emptyCatchBlocks > 0) {
        feedback.push({
          type: 'warning',
          message: 'Empty catch blocks',
          details: `You have ${emptyCatchBlocks} empty catch block(s). Empty catch blocks suppress exceptions without handling them, which can hide errors.`,
          category: 'Error Handling'
        });
      } else {
        feedback.push({
          type: 'success',
          message: 'Good exception handling',
          details: 'Your code includes proper try-catch blocks that handle exceptions meaningfully.',
          category: 'Error Handling'
        });
      }
    } else if (code.includes('throws ')) {
      feedback.push({
        type: 'info',
        message: 'Declared exceptions without handling',
        details: 'Your methods declare exceptions but don\'t handle them internally. Consider adding try-catch blocks for more robust error handling.',
        category: 'Error Handling'
      });
    } else if (methodCount > 1) { // Only suggest if there's more than one method
      feedback.push({
        type: 'info',
        message: 'Consider adding error handling',
        details: 'Your code doesn\'t have any exception handling. Consider adding try-catch blocks for operations that might fail (I/O, parsing, etc.).',
        category: 'Error Handling'
      });
    }
    
    // Check for input validation
    const hasMethods = methodCount > 0;
    const hasInputValidation = code.includes('null') && (code.includes('!= null') || code.includes('== null') || code.includes('null)'));
    
    if (hasMethods && hasInputValidation) {
      feedback.push({
        type: 'success',
        message: 'Good input validation',
        details: 'Your code checks for null values and validates input, which helps prevent unexpected behavior.',
        category: 'Robustness'
      });
    } else if (hasMethods) {
      feedback.push({
        type: 'info',
        message: 'Consider adding input validation',
        details: 'Your code could benefit from null checks and input validation to prevent potential errors.',
        category: 'Robustness'
      });
    }
    
    // CODE STYLE & BEST PRACTICES
    
    // Check for consistent naming conventions
    const camelCaseVars = (code.match(/\b[a-z][a-zA-Z0-9]*\b/g) || []).length;
    const nonCamelCaseVars = (code.match(/\b[a-z][a-zA-Z0-9_]*_[a-zA-Z0-9_]*\b/g) || []).length; // Check for snake_case
    
    if (nonCamelCaseVars > 2 && camelCaseVars > 0) {
      feedback.push({
        type: 'warning',
        message: 'Inconsistent naming conventions',
        details: 'Your code mixes camelCase and snake_case naming conventions. Stick to camelCase for Java variables and methods for consistency.',
        category: 'Style'
      });
    } else if (camelCaseVars > 0 && nonCamelCaseVars === 0) {
      feedback.push({
        type: 'success',
        message: 'Consistent naming conventions',
        details: 'Your code follows consistent camelCase naming conventions, which is the standard in Java.',
        category: 'Style'
      });
    }
    
    // Check for code duplication (primitive)
    const lines = code.split('\n');
    const duplicatePatterns: Record<string, number> = {};
    
    for (let i = 0; i < lines.length - 3; i++) {
      const pattern = lines.slice(i, i + 3).join('\n');
      if (pattern.trim() && !pattern.includes('import ')) {
        duplicatePatterns[pattern] = (duplicatePatterns[pattern] || 0) + 1;
      }
    }
    
    const duplicates = Object.entries(duplicatePatterns)
      .filter(([_, count]) => (count as number) > 1)
      .length;
    
    if (duplicates > 0) {
      feedback.push({
        type: 'warning',
        message: 'Potential code duplication',
        details: 'There appear to be duplicated code blocks in your solution. Consider extracting common functionality into reusable methods.',
        category: 'Style'
      });
    }
    
    // Check for modern Java features
    const hasStreams = code.includes('.stream()') || code.includes('Stream.');
    const hasLambdas = code.includes('->');
    const hasOptionals = code.includes('Optional<') || code.includes('Optional.');
    
    if (hasStreams || hasLambdas || hasOptionals) {
      feedback.push({
        type: 'success',
        message: 'Using modern Java features',
        details: `You're utilizing modern Java features like ${[
          hasStreams ? 'Streams' : null, 
          hasLambdas ? 'Lambdas' : null, 
          hasOptionals ? 'Optionals' : null
        ].filter(Boolean).join(', ')}, which improves code readability and expressiveness.`,
        category: 'Modern Java'
      });
    }
    
    // Final summary feedback
    const successCount = feedback.filter(f => f.type === 'success').length;
    const warningCount = feedback.filter(f => f.type === 'warning').length;
    
    if (successCount > warningCount + 1) {
      feedback.push({
        type: 'success',
        message: 'Overall excellent code quality',
        details: 'Your code demonstrates good practices in multiple areas. Great job!',
        category: 'Summary'
      });
    } else if (warningCount > successCount) {
      feedback.push({
        type: 'info',
        message: 'Several areas for improvement',
        details: 'Your code works but has several areas that could be improved for better quality and maintainability.',
        category: 'Summary'
      });
    }
    
    return feedback;
  }
  
  private extractMethodLengths(code: string): number[] {
    const methodLengths: number[] = [];
    const methodRegex = /(public|private|protected)\s+[\w<>[\],\s]+\s+\w+\s*\([^)]*\)\s*\{/g;
    
    // Find all method start positions
    const methodStarts: number[] = [];
    let match: RegExpExecArray | null;
    while ((match = methodRegex.exec(code)) !== null) {
      methodStarts.push(match.index);
    }
    
    // Sort method starts in ascending order
    methodStarts.sort((a, b) => a - b);
    
    // Calculate method lengths
    for (let i = 0; i < methodStarts.length; i++) {
      const startPos = methodStarts[i];
      const endPos = i < methodStarts.length - 1 ? methodStarts[i + 1] : code.length;
      
      // Extract method body
      const methodCode = code.substring(startPos, endPos);
      
      // Count lines in method
      const lines = methodCode.split('\n').length;
      methodLengths.push(lines);
    }
    
    return methodLengths;
  }
  
  private generatePerformanceMetrics(code: string, testResults: TestResult[]): {
    codeQuality: number;
    efficiency: number;
    bestPractices: number;
    complexity: number;
    timePerformance: number;
  } {
    // Calculate metrics based on code analysis and test results
    
    // Code Quality: Assess readability, documentation, organization
    let codeQuality = 7; // Base score
    
    // Add points for good practices
    if (code.includes('/**') && code.includes('*/')) codeQuality += 1;
    if (code.includes('@param') || code.includes('@return')) codeQuality += 0.5;
    if (code.includes('private ')) codeQuality += 0.5;
    
    // Deduct for issues
    const lineCount = code.split('\n').length;
    const methodCount = (code.match(/public|private|protected\s+\w+\s+\w+\s*\(/g) || []).length;
    
    // Deduct if methods are too long (more than 30 lines per method on average)
    if (lineCount > 0 && methodCount > 0 && (lineCount / methodCount > 30)) {
      codeQuality -= 1;
    }
    
    // Cap at 10
    codeQuality = Math.min(10, Math.max(1, Math.round(codeQuality)));
    
    // Efficiency: Assess algorithm efficiency, resource usage
    let efficiency = 6; // Base score
    
    // Improve score based on passed tests and execution time
    const passedTests = testResults.filter(result => result.passed).length;
    const totalTests = testResults.length;
    const testPassRatio = totalTests > 0 ? passedTests / totalTests : 0;
    
    efficiency += testPassRatio * 2; // Add up to 2 points for passing tests
    
    // Check execution time (if available)
    const executionTimes = testResults
      .filter(r => r.executionTime !== undefined)
      .map(r => r.executionTime!);
    
    if (executionTimes.length > 0) {
      const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      // If average execution time is under 100ms, it's very efficient (up to 2 more points)
      if (avgExecutionTime < 100) {
        efficiency += 2;
      } else if (avgExecutionTime < 500) {
        efficiency += 1;
      }
    }
    
    // Cap at 10
    efficiency = Math.min(10, Math.max(1, Math.round(efficiency)));
    
    // Best Practices: Following Java standards and conventions
    let bestPractices = 7; // Base score
    
    // Check for good Java practices
    if (code.includes('private ')) bestPractices += 0.5;
    if (code.includes('final ')) bestPractices += 0.5;
    if (code.includes('try') && code.includes('catch')) bestPractices += 0.5;
    if (code.includes('implements ') || code.includes('extends ')) bestPractices += 0.5;
    if (code.includes('ArrayList') || code.includes('HashMap')) bestPractices += 0.5;
    
    // Deduct for anti-patterns
    if (code.includes('public static void main')) {
      // Check if the main method is the only method (not a good practice for OOP)
      const mainMethodCount = (code.match(/public\s+static\s+void\s+main/g) || []).length;
      if (mainMethodCount === methodCount) {
        bestPractices -= 1;
      }
    }
    
    // Cap at 10
    bestPractices = Math.min(10, Math.max(1, Math.round(bestPractices)));
    
    // Complexity: How well the solution balances simplicity with functionality
    let complexity = 8; // Base score
    
    // Simple code with good results is ideal
    if (testPassRatio > 0.8) {
      if (lineCount < 100) complexity += 1; // Simple solutions that work get bonus points
    } else {
      complexity -= (1 - testPassRatio) * 2; // Complex code that fails tests gets penalized
    }
    
    // Check for complex constructs
    const hasLoops = code.includes('for (') || code.includes('while (');
    const hasRecursion = new RegExp(`\\w+\\s*\\([^)]*\\)\\s*\\{[\\s\\S]*?\\1\\s*\\(`).test(code);
    const hasCollections = code.includes('List<') || code.includes('Map<') || code.includes('Set<');
    
    // Appropriate complexity based on problem needs
    if (hasLoops && hasCollections) complexity += 0.5;
    if (hasRecursion && testPassRatio > 0.8) complexity += 1; // Effective use of recursion
    
    // Cap at 10
    complexity = Math.min(10, Math.max(1, Math.round(complexity)));
    
    // Time Performance: Execution speed, time complexity considerations
    let timePerformance = 6; // Base score
    
    // Assess based on execution times if available
    if (executionTimes.length > 0) {
      const avgExecutionTime = executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length;
      
      // Score based on execution time
      if (avgExecutionTime < 50) {
        timePerformance += 3; // Excellent performance
      } else if (avgExecutionTime < 200) {
        timePerformance += 2; // Good performance
      } else if (avgExecutionTime < 500) {
        timePerformance += 1; // Acceptable performance
      }
    } else {
      // If no execution times, assess based on code patterns
      
      // Look for efficient algorithms and data structures
      if (code.includes('HashMap') || code.includes('HashSet')) timePerformance += 1;
      if (!code.includes('for (') && code.includes('stream()')) timePerformance += 1; // Efficient stream operations
      
      // Penalize for inefficient patterns
      if ((code.match(/for\s*\([^)]*\)\s*\{[^}]*for\s*\([^)]*\)/g) || []).length > 1) {
        timePerformance -= 1; // Nested loops can be inefficient
      }
    }
    
    // Cap at 10
    timePerformance = Math.min(10, Math.max(1, Math.round(timePerformance)));
    
    return {
      codeQuality,
      efficiency,
      bestPractices,
      complexity,
      timePerformance
    };
  }
}
