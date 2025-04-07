import { useState, useEffect } from "react";
import { useTimer } from "@/hooks/useTimer";
import { Clock } from "lucide-react";

interface TimerProps {
  initialMinutes: number;
}

export default function Timer({ initialMinutes }: TimerProps) {
  const { minutes, seconds, isTimeWarning } = useTimer(initialMinutes);

  return (
    <div 
      className={`bg-primary-dark rounded-md px-4 py-2 flex items-center ${
        isTimeWarning ? 'text-red-300' : ''
      }`}
    >
      <Clock className="mr-2 h-4 w-4" />
      <span className="font-medium">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}
