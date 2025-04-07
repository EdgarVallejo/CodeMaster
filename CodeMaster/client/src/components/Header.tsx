import { useState, useEffect } from "react";
import Timer from "./Timer";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

interface HeaderProps {
  onSubmit: () => void;
  isSubmitting: boolean;
}

export default function Header({ onSubmit, isSubmitting }: HeaderProps) {
  return (
    <header className="bg-primary text-white py-4 px-6 shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
          </svg>
          <h1 className="text-xl font-medium">Kami Java Coding Assessment Simulator</h1>
        </div>
        
        <div className="flex items-center space-x-6">
          <Timer initialMinutes={45} />
          
          <Button
            className="bg-secondary hover:bg-secondary-dark transition-colors rounded-md px-5 py-2 font-medium flex items-center text-white"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <Send className="mr-2 h-4 w-4" />
            {isSubmitting ? 'Submitting...' : 'Submit Solution'}
          </Button>
        </div>
      </div>
    </header>
  );
}
