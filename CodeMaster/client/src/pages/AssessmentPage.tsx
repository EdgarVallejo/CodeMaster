import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import ProblemPanel from "@/components/ProblemPanel";
import CodeEditor from "@/components/CodeEditor";
import FeedbackModal from "@/components/FeedbackModal";
import { Problem } from "@shared/schema";

// Define problem structure type with more specific template type
interface ProblemWithTemplate extends Problem {
  solutionTemplate: Record<string, string>;
}
import { apiRequest } from "@/lib/queryClient";

export default function AssessmentPage() {
  const [selectedProblemId, setSelectedProblemId] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<string>("");
  const [code, setCode] = useState<Record<string, string>>({});
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [evaluationResults, setEvaluationResults] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Fetch all problems
  const { data: problems = [] } = useQuery<ProblemWithTemplate[]>({
    queryKey: ['/api/problems'],
    staleTime: Infinity,
  });

  // Fetch selected problem details
  const { data: selectedProblem, isLoading: isLoadingProblem } = useQuery<ProblemWithTemplate>({
    queryKey: [`/api/problems/${selectedProblemId}`],
    enabled: !!selectedProblemId,
    staleTime: Infinity,
  });

  // Set up initial code from template when problem changes
  useEffect(() => {
    if (selectedProblem && selectedProblem.solutionTemplate) {
      const initialCode: Record<string, string> = {};
      const solutionTemplate = selectedProblem.solutionTemplate;
      const files = Object.keys(solutionTemplate);
      
      files.forEach(file => {
        initialCode[file] = solutionTemplate[file];
      });
      
      setCode(initialCode);
      
      // Set the first tab as active
      if (files.length > 0) {
        setCurrentTab(files[0]);
      }
    }
  }, [selectedProblem]);

  const handleProblemChange = (id: number) => {
    setSelectedProblemId(id);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
  };

  const handleCodeChange = (value: string) => {
    setCode(prev => ({
      ...prev,
      [currentTab]: value
    }));
  };

  const handleSubmit = async () => {
    if (!selectedProblem || isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Submit the current file's code - we'll focus on the current tab
      // In a production version, we would bundle all files together
      const mainFile = currentTab;
      const fileContent = code[mainFile];
      
      const response = await apiRequest('POST', '/api/evaluate', {
        code: fileContent,
        language: 'java',
        problemId: selectedProblemId,
        filename: mainFile
      });
      
      const results = await response.json();
      setEvaluationResults(results);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header 
        onSubmit={handleSubmit} 
        isSubmitting={isSubmitting}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <ProblemPanel 
          problems={problems || []} 
          selectedProblemId={selectedProblemId}
          problem={selectedProblem as Problem}
          isLoading={isLoadingProblem}
          onProblemChange={handleProblemChange}
        />
        
        <CodeEditor 
          code={code[currentTab] || ""}
          files={selectedProblem ? Object.keys(selectedProblem.solutionTemplate || {}) : []}
          currentTab={currentTab}
          onTabChange={handleTabChange}
          onCodeChange={handleCodeChange}
        />
      </div>
      
      {isModalOpen && evaluationResults && (
        <FeedbackModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          results={evaluationResults}
        />
      )}
    </div>
  );
}
