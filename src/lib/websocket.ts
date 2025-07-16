import { Server } from 'socket.io';
import { NextApiResponse } from 'next';
import { analyzeCodeWithAI } from './ai-analyzer';

export interface CodeAnalysisMessage {
  code: string;
  language: string;
  sessionId: string;
}

export interface SuggestionMessage {
  type: 'suggestion' | 'warning' | 'info' | 'success';
  message: string;
  line?: number;
  sessionId: string;
}

interface SocketWithServer {
  server: unknown;
}

let io: Server;

export function initializeWebSocket(res: NextApiResponse) {
  if (!io) {
    // Type assertion to handle the Next.js socket server
    const socket = res.socket as unknown as SocketWithServer;
    if (!socket || !socket.server) {
      throw new Error('Socket server not available');
    }
    
    io = new Server(socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('code-analysis', async (data: CodeAnalysisMessage) => {
        try {
          const { code, language, sessionId } = data;
          
          // Perform AI-powered analysis
          const analysis = await analyzeCodeWithAI(code, language);
          
          // Send suggestions back to client
          socket.emit('suggestions', {
            suggestions: analysis.suggestions,
            sessionId,
          });
        } catch (error) {
          console.error('Error analyzing code:', error);
          socket.emit('error', {
            message: 'Failed to analyze code',
            sessionId: data.sessionId,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }
  
  return io;
}

export { io };