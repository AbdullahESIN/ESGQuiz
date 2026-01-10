import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export interface QuizResult {
  id: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSeconds: number;
  wrongAnswers: number;
  questions: Array<{
    id: number;
    question: string;
    userAnswer: 'A' | 'B' | 'C' | 'D' | null;
    correctAnswer: 'A' | 'B' | 'C' | 'D';
    isCorrect: boolean;
  }>;
}

interface QuizHistoryContextType {
  quizHistory: QuizResult[];
  addQuizResult: (result: Omit<QuizResult, 'id' | 'date'>) => Promise<void>;
  clearHistory: () => Promise<void>;
  loading: boolean;
}

const QuizHistoryContext = createContext<QuizHistoryContextType | undefined>(undefined);

export function QuizHistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [quizHistory, setQuizHistory] = useState<QuizResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadHistory();
    } else {
      setQuizHistory([]);
      setLoading(false);
    }
  }, [user]);

  const loadHistory = async () => {
    if (!user) return;
    
    try {
      const key = `quiz_history_${user.id}`;
      const historyData = await AsyncStorage.getItem(key);
      if (historyData) {
        const history = JSON.parse(historyData);
        // Tarihe göre sırala (en yeni önce)
        history.sort((a: QuizResult, b: QuizResult) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setQuizHistory(history);
      }
    } catch (error) {
      console.error('Error loading quiz history:', error);
    } finally {
      setLoading(false);
    }
  };

  const addQuizResult = async (result: Omit<QuizResult, 'id' | 'date'>) => {
    if (!user) return;

    const newResult: QuizResult = {
      ...result,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    try {
      const key = `quiz_history_${user.id}`;
      const existingHistory = quizHistory;
      const updatedHistory = [newResult, ...existingHistory];
      await AsyncStorage.setItem(key, JSON.stringify(updatedHistory));
      setQuizHistory(updatedHistory);
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const clearHistory = async () => {
    if (!user) return;

    try {
      const key = `quiz_history_${user.id}`;
      await AsyncStorage.removeItem(key);
      setQuizHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  return (
    <QuizHistoryContext.Provider
      value={{
        quizHistory,
        addQuizResult,
        clearHistory,
        loading,
      }}>
      {children}
    </QuizHistoryContext.Provider>
  );
}

export function useQuizHistory() {
  const context = useContext(QuizHistoryContext);
  if (context === undefined) {
    throw new Error('useQuizHistory must be used within a QuizHistoryProvider');
  }
  return context;
}
