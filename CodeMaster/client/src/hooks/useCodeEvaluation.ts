import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { CodeEvaluation } from "@shared/schema";

interface UseCodeEvaluationProps {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useCodeEvaluation({ onSuccess, onError }: UseCodeEvaluationProps = {}) {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<any>(null);

  const evaluateCode = async (code: string, problemId: number) => {
    setIsEvaluating(true);
    setResults(null);

    try {
      const payload: CodeEvaluation = {
        code,
        language: "java",
        problemId
      };

      const response = await apiRequest("POST", "/api/evaluate", payload);
      const data = await response.json();
      
      setResults(data);
      
      if (onSuccess) {
        onSuccess(data);
      }
      
      return data;
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      throw error;
    } finally {
      setIsEvaluating(false);
    }
  };

  return {
    evaluateCode,
    isEvaluating,
    results
  };
}
