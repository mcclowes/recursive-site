import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

interface Suggestion {
  type: 'warning' | 'info' | 'suggestion' | 'success';
  message: string;
  line: number;
}

interface UseRealtimeAnalysisReturn {
  suggestions: Suggestion[];
  isConnected: boolean;
  sendCodeForAnalysis: (code: string, language: string) => void;
  clearSuggestions: () => void;
}

export function useRealtimeAnalysis(): UseRealtimeAnalysisReturn {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const sessionId = useRef<string>(uuidv4());

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io({
      path: '/api/socket',
      addTrailingSlash: false,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from WebSocket server');
    });

    socket.on('suggestions', (data: { suggestions: Suggestion[]; sessionId: string }) => {
      if (data.sessionId === sessionId.current) {
        setSuggestions(data.suggestions);
      }
    });

    socket.on('error', (error: { message: string; sessionId: string }) => {
      if (error.sessionId === sessionId.current) {
        console.error('WebSocket error:', error.message);
        // You could show a toast notification here
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const sendCodeForAnalysis = (code: string, language: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('code-analysis', {
        code,
        language,
        sessionId: sessionId.current,
      });
    }
  };

  const clearSuggestions = () => {
    setSuggestions([]);
  };

  return {
    suggestions,
    isConnected,
    sendCodeForAnalysis,
    clearSuggestions,
  };
}