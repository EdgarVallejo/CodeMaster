import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertTriangle, AlertCircle, Info, X, Check } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from "recharts";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: {
    success: boolean;
    compilationSuccessful: boolean;
    compilationOutput?: string;
    testResults?: {
      testCaseId: string;
      name: string;
      passed: boolean;
      message?: string;
    }[];
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
  };
}

export default function FeedbackModal({ isOpen, onClose, results }: FeedbackModalProps) {
  const getFeedbackIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'warning':
        return <AlertTriangle className="text-yellow-500 h-5 w-5" />;
      case 'info':
        return <Info className="text-blue-500 h-5 w-5" />;
      default:
        return <AlertCircle className="text-gray-500 h-5 w-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" aria-describedby="feedback-modal-description">
        <DialogHeader className="px-6 py-4 bg-primary text-white">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl font-medium">Submission Results</DialogTitle>
            <Button 
              variant="ghost" 
              className="p-1 text-white hover:text-gray-100" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="p-6" id="feedback-modal-description">
          <div className="mb-6">
            <div className="flex items-center mb-4">
              {results.compilationSuccessful ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Compilation Successful</h3>
                </>
              ) : (
                <>
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white">
                    <X className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-medium ml-3">Compilation Failed</h3>
                </>
              )}
            </div>
            
            <div className="px-4 py-3 bg-gray-50 rounded-md text-gray-600">
              <p>{results.compilationSuccessful 
                ? "Your code compiled without any errors. Great job!" 
                : "Your code failed to compile. Please check the errors below."}</p>
              
              {!results.compilationSuccessful && results.compilationOutput && (
                <pre className="mt-2 p-3 bg-gray-800 text-white rounded-md text-sm whitespace-pre-wrap overflow-auto max-h-40">
                  {results.compilationOutput}
                </pre>
              )}
            </div>
          </div>
          
          {results.compilationSuccessful && results.testResults && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Test Results</h3>
              
              <div className="space-y-3">
                {results.testResults.map((result) => (
                  <div key={result.testCaseId} className="border rounded-md overflow-hidden">
                    <div className={`px-4 py-3 ${
                      result.passed 
                        ? "bg-green-50 border-b border-green-100" 
                        : "bg-red-50 border-b border-red-100"
                    } flex justify-between items-center`}>
                      <div className="flex items-center">
                        {result.passed ? (
                          <Check className="text-green-500 mr-2 h-4 w-4" />
                        ) : (
                          <X className="text-red-500 mr-2 h-4 w-4" />
                        )}
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <span className={result.passed ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                        {result.passed ? "Passed" : "Failed"}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="text-sm">{result.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {results.qualityFeedback && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Code Quality Analysis</h3>
              
              {/* Group feedback by category */}
              {(() => {
                // Extract all categories and sort them in a specific order
                const allCategories = results.qualityFeedback
                  .map(feedback => feedback.category || 'General')
                  .filter((value, index, self) => self.indexOf(value) === index);
                
                // Define the priority order for categories
                const categoryOrder = [
                  'Summary', 
                  'Documentation', 
                  'Structure', 
                  'Design', 
                  'Error Handling', 
                  'Robustness', 
                  'Style', 
                  'Modern Java', 
                  'General'
                ];
                
                // Sort categories based on predefined order
                const sortedCategories = allCategories.sort((a, b) => {
                  const indexA = categoryOrder.indexOf(a);
                  const indexB = categoryOrder.indexOf(b);
                  return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
                });
                
                return sortedCategories.map(category => {
                  const categoryFeedback = results.qualityFeedback!.filter(
                    feedback => (feedback.category || 'General') === category
                  );
                  
                  if (categoryFeedback.length === 0) return null;
                  
                  return (
                    <div key={category} className="mb-4">
                      <h4 className="text-md font-medium mb-2 pb-1 border-b">{category}</h4>
                      <div className="space-y-3 pl-1">
                        {categoryFeedback.map((feedback, index) => (
                          <div key={index} className="flex items-start border-l-2 pl-3" 
                               style={{ 
                                 borderColor: feedback.type === 'success' 
                                   ? '#16a34a' 
                                   : feedback.type === 'warning' 
                                     ? '#f59e0b' 
                                     : '#3b82f6' 
                               }}>
                            <div className="mt-1 mr-3">
                              {getFeedbackIcon(feedback.type)}
                            </div>
                            <div>
                              <p className="font-medium">{feedback.message}</p>
                              {feedback.details && (
                                <p className="text-gray-600 text-sm">{feedback.details}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
              
              <div className="mt-4 p-3 bg-slate-50 rounded-md text-sm border border-slate-200">
                <p className="font-semibold">What does this analysis mean?</p>
                <p className="mt-1">This automated analysis evaluates your code across multiple dimensions including documentation, structure, error handling, and style. Consider implementing the suggestions to improve your code quality and follow Java best practices.</p>
              </div>
            </div>
          )}
          
          {results.performanceMetrics && (
            <div>
              <h3 className="text-lg font-medium mb-3">Performance Metrics</h3>
              <div className="border rounded-md p-4 bg-slate-50">
                <p className="mb-2 text-sm text-gray-700">The assessment of your solution across key performance metrics:</p>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={[
                        {
                          name: "Performance Metrics",
                          codeQuality: results.performanceMetrics.codeQuality,
                          efficiency: results.performanceMetrics.efficiency,
                          bestPractices: results.performanceMetrics.bestPractices,
                          complexity: results.performanceMetrics.complexity,
                          timePerformance: results.performanceMetrics.timePerformance,
                        }
                      ]}
                      margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 10]} />
                      <Tooltip />
                      <Bar dataKey="codeQuality" name="Code Quality" fill="#4338ca" barSize={30} />
                      <Bar dataKey="efficiency" name="Efficiency" fill="#0891b2" barSize={30} />
                      <Bar dataKey="bestPractices" name="Best Practices" fill="#15803d" barSize={30} />
                      <Bar dataKey="complexity" name="Complexity" fill="#a855f7" barSize={30} />
                      <Bar dataKey="timePerformance" name="Time Performance" fill="#f59e0b" barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-start p-2 rounded bg-white border">
                    <div className="h-4 w-4 mt-0.5 mr-2 rounded-sm" style={{ backgroundColor: "#4338ca" }}></div>
                    <div>
                      <p className="font-medium">Code Quality: {results.performanceMetrics.codeQuality}/10</p>
                      <p className="text-gray-600">Clean, readable, and maintainable code</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-2 rounded bg-white border">
                    <div className="h-4 w-4 mt-0.5 mr-2 rounded-sm" style={{ backgroundColor: "#0891b2" }}></div>
                    <div>
                      <p className="font-medium">Efficiency: {results.performanceMetrics.efficiency}/10</p>
                      <p className="text-gray-600">Optimal algorithm and resource usage</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-2 rounded bg-white border">
                    <div className="h-4 w-4 mt-0.5 mr-2 rounded-sm" style={{ backgroundColor: "#15803d" }}></div>
                    <div>
                      <p className="font-medium">Best Practices: {results.performanceMetrics.bestPractices}/10</p>
                      <p className="text-gray-600">Following Java coding standards</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-2 rounded bg-white border">
                    <div className="h-4 w-4 mt-0.5 mr-2 rounded-sm" style={{ backgroundColor: "#a855f7" }}></div>
                    <div>
                      <p className="font-medium">Complexity: {results.performanceMetrics.complexity}/10</p>
                      <p className="text-gray-600">Appropriate solution complexity</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start p-2 rounded bg-white border">
                    <div className="h-4 w-4 mt-0.5 mr-2 rounded-sm" style={{ backgroundColor: "#f59e0b" }}></div>
                    <div>
                      <p className="font-medium">Time Performance: {results.performanceMetrics.timePerformance}/10</p>
                      <p className="text-gray-600">Execution speed and time complexity</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Button 
            onClick={onClose}
            className="bg-primary hover:bg-primary-dark text-white"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
