import { Problem } from "@shared/schema";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface TestCase {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  input?: string;
  expectedOutput?: string;
}

interface ProblemPanelProps {
  problems: Problem[];
  selectedProblemId: number;
  problem?: Problem;
  isLoading: boolean;
  onProblemChange: (id: number) => void;
}

export default function ProblemPanel({
  problems,
  selectedProblemId,
  problem,
  isLoading,
  onProblemChange
}: ProblemPanelProps) {
  return (
    <div className="w-2/5 border-r border-gray-200 flex flex-col h-full overflow-hidden">
      {/* Problem Selector */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <label htmlFor="problemSelector" className="text-sm font-medium text-gray-600">
            Select Problem:
          </label>
          <Select
            value={selectedProblemId.toString()}
            onValueChange={(value) => onProblemChange(parseInt(value))}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select a problem" />
            </SelectTrigger>
            <SelectContent>
              {problems.map((problem) => (
                <SelectItem key={problem.id} value={problem.id.toString()}>
                  {problem.title} (Level {problem.complexityLevel})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Problem Description */}
      <div className="p-6 overflow-y-auto flex-1">
        {isLoading || !problem ? (
          <ProblemSkeleton />
        ) : (
          <div id="problemDescription">
            <h2 className="text-xl font-medium mb-4">{problem.title}</h2>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-primary">Problem Description</h3>
                <div className="flex items-center">
                  <span className="text-sm font-bold mr-2">Complexity:</span>
                  <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    problem.complexityLevel === 1 ? "bg-green-100 text-green-800" :
                    problem.complexityLevel === 2 ? "bg-blue-100 text-blue-800" :
                    problem.complexityLevel === 3 ? "bg-yellow-100 text-yellow-800" :
                    problem.complexityLevel === 4 ? "bg-orange-100 text-orange-800" :
                    "bg-red-100 text-red-800"
                  }`}>
                    Level {problem.complexityLevel}
                  </span>
                </div>
              </div>
              <p className="mb-3">{problem.description}</p>
              
              <h4 className="font-medium mt-4 mb-2 text-primary">Requirements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Create appropriate classes with fields and methods</li>
                <li>Implement the required functionality</li>
                <li>Include appropriate validation and error handling</li>
                <li>Write clean, maintainable code with comments</li>
              </ul>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3 text-primary">Example Input/Output</h3>
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 font-medium">
                  Example Usage
                </div>
                <div className="p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap overflow-auto max-h-60">
                    {Object.values(problem.solutionTemplate as Record<string, string>)[0].split('\n').slice(0, 15).join('\n')}
                  </pre>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-3 text-primary">Test Cases</h3>
              <div className="space-y-3">
                {(problem.testCases as TestCase[]).map((testCase: TestCase) => (
                  <div key={testCase.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 font-medium flex justify-between">
                      <span>{testCase.name}</span>
                      {!testCase.visible && (
                        <span className="text-blue-500 flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-1"
                          >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                            <path d="M12 17h.01" />
                          </svg>
                          Hidden
                        </span>
                      )}
                    </div>
                    <div className="p-4 font-mono text-sm">
                      <p className="mb-2 text-gray-600">{testCase.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ProblemSkeleton() {
  return (
    <div>
      <Skeleton className="h-8 w-64 mb-4" />
      
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-4" />
        
        <Skeleton className="h-6 w-36 mt-4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-1" />
      </div>
      
      <Skeleton className="h-6 w-48 mb-3" />
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <Skeleton className="h-6 w-36" />
        </div>
        <div className="p-4">
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      
      <Skeleton className="h-6 w-36 mb-3" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden mb-3">
          <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
            <Skeleton className="h-6 w-48" />
          </div>
          <div className="p-4">
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
