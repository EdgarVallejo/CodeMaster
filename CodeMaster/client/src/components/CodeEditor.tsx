import { useState } from "react";

interface CodeEditorProps {
  code: string;
  files: string[];
  currentTab: string;
  onTabChange: (tab: string) => void;
  onCodeChange: (value: string) => void;
}

export default function CodeEditor({
  code,
  files,
  currentTab,
  onTabChange,
  onCodeChange
}: CodeEditorProps) {
  return (
    <div className="w-3/5 flex flex-col h-full overflow-hidden">
      {/* Editor Tabs */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 flex items-center">
        {files.map((fileName) => (
          <button
            key={fileName}
            className={`px-4 py-3 font-medium border-b-2 ${
              currentTab === fileName
                ? "border-primary text-primary"
                : "border-transparent hover:border-gray-300"
            }`}
            onClick={() => onTabChange(fileName)}
          >
            {fileName}
          </button>
        ))}
      </div>
      
      {/* Code Editor */}
      <div className="flex-1 overflow-hidden" id="codeEditor">
        <textarea
          className="w-full h-full p-4 font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary"
          value={code}
          onChange={(e) => onCodeChange(e.target.value)}
          placeholder="Enter your code here..."
          spellCheck={false}
        />
      </div>
    </div>
  );
}
