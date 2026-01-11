import { useQuizHistory } from '@/contexts/QuizHistoryContext';
import { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface Choice {
  option: 'A' | 'B' | 'C' | 'D';
  text: string;
}

interface Question {
  id: number;
  question: string;
  choices: Choice[];
  answer: { option: 'A' | 'B' | 'C' | 'D' };
  explanation: string;
}

interface QuizData {
  title: string;
  question_count: number;
  questions: Question[];
}

type ViewState = 'start' | 'quiz' | 'end' | 'review';

export default function HomeScreen() {
  const [viewState, setViewState] = useState<ViewState>('start');
  const [shuffle, setShuffle] = useState(false);
  const [limitQuestions, setLimitQuestions] = useState(false);
  const data: QuizData = require('../../assets/Study_Questions_LMS_Part2_72_MC.json');
  const maxQuestions = data.question_count;
  const [numQuestions, setNumQuestions] = useState(maxQuestions);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<'A' | 'B' | 'C' | 'D' | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Map<number, 'A' | 'B' | 'C' | 'D'>>(new Map());
  const [wrongQuestions, setWrongQuestions] = useState<Question[]>([]);
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { addQuizResult } = useQuizHistory();
  
  const insets = useSafeAreaInsets();

  // Cleanup timer on unmount or when leaving quiz
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, []);

  // Start timer when quiz starts
  useEffect(() => {
    if (viewState === 'quiz' || viewState === 'review') {
      if (viewState === 'quiz') {
        setElapsedSeconds(0);
      }
      timerIntervalRef.current = setInterval(() => {
        setElapsedSeconds(prev => prev + 1);
      }, 1000);
    } else {
      // Stop timer when leaving quiz
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      if (viewState === 'start' || viewState === 'end') {
        setElapsedSeconds(0);
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [viewState]);

  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Load and select questions
  const loadData = (shouldShuffle: boolean, count: number) => {
    try {
      let loadedQuestions = [...data.questions];
      
      if (shouldShuffle) {
        // Fisher-Yates shuffle
        for (let i = loadedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [loadedQuestions[i], loadedQuestions[j]] = [loadedQuestions[j], loadedQuestions[i]];
        }
      }
      
      // Select exactly 'count' questions
      const selectedQuestions = loadedQuestions.slice(0, count);
      setQuestions(selectedQuestions);
    } catch (error) {
      console.error('Error loading quiz data:', error);
    }
  };

  const startQuiz = () => {
    const questionCount = limitQuestions ? numQuestions : maxQuestions;
    loadData(shuffle, questionCount);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setElapsedSeconds(0);
    setUserAnswers(new Map());
    setWrongQuestions([]);
    setViewState('quiz');
  };

  const handleAnswer = (option: 'A' | 'B' | 'C' | 'D') => {
    if (selectedOption !== null) return; // Already answered
    
    setSelectedOption(option);
    setShowExplanation(true);
    
    const currentQuestion = questions[currentIndex];
    // Kullanıcının cevabını kaydet
    setUserAnswers(prev => {
      const newMap = new Map(prev);
      newMap.set(currentQuestion.id, option);
      return newMap;
    });
    
    if (option === currentQuestion.answer.option) {
      setScore(prevScore => prevScore + 1);
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Stop timer when quiz ends
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
      // Yanlış yapılan soruları bul
      const wrong = questions.filter(q => {
        const userAnswer = userAnswers.get(q.id);
        return userAnswer !== q.answer.option;
      });
      setWrongQuestions(wrong);
      
      // Quiz sonuçlarını kaydet
      const quizQuestions = questions.map(q => ({
        id: q.id,
        question: q.question,
        userAnswer: userAnswers.get(q.id) || null,
        correctAnswer: q.answer.option,
        isCorrect: userAnswers.get(q.id) === q.answer.option,
      }));

      try {
        await addQuizResult({
          score,
          totalQuestions: questions.length,
          percentage: Math.round((score / questions.length) * 100),
          timeSeconds: elapsedSeconds,
          wrongAnswers: wrong.length,
          questions: quizQuestions,
        });
      } catch (error) {
        console.error('Error saving quiz result:', error);
      }
      
      setViewState('end');
    }
  };

  const handleRestart = () => {
    setViewState('start');
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setElapsedSeconds(0);
    setUserAnswers(new Map());
    setWrongQuestions([]);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const handleReviewWrongAnswers = () => {
    if (wrongQuestions.length === 0) {
      Alert.alert('No Wrong Answers', 'You answered all questions correctly!');
      return;
    }
    setQuestions(wrongQuestions);
    setCurrentIndex(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setScore(0);
    setElapsedSeconds(0);
    setUserAnswers(new Map());
    setViewState('review');
  };

  const handleMainMenu = () => {
    Alert.alert(
      'Return to Main Menu?',
      'Your progress will be lost.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Main Menu',
          style: 'destructive',
          onPress: () => {
            if (timerIntervalRef.current) {
              clearInterval(timerIntervalRef.current);
              timerIntervalRef.current = null;
            }
            setViewState('start');
            setCurrentIndex(0);
            setSelectedOption(null);
            setShowExplanation(false);
            setScore(0);
            setElapsedSeconds(0);
          },
        },
      ]
    );
  };

  const handleLimitQuestionsToggle = (value: boolean) => {
    setLimitQuestions(value);
    if (!value) {
      // When disabling limit, reset to all questions
      setNumQuestions(maxQuestions);
    } else {
      // When enabling limit, set to a reasonable default if currently at max
      if (numQuestions === maxQuestions) {
        setNumQuestions(10);
      }
    }
  };

  const incrementQuestions = () => {
    if (numQuestions < maxQuestions) {
      setNumQuestions(prev => prev + 1);
    }
  };

  const decrementQuestions = () => {
    if (numQuestions > 1) {
      setNumQuestions(prev => prev - 1);
    }
  };

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion?.answer.option;

  // Start View
  if (viewState === 'start') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>{data.title}</Text>
          <Text style={styles.subtitle}>{data.question_count} questions available</Text>
          
          <View style={styles.shuffleContainer}>
            <Text style={styles.shuffleLabel}>Shuffle Questions</Text>
            <Switch
              value={shuffle}
              onValueChange={setShuffle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={shuffle ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          <View style={styles.shuffleContainer}>
            <Text style={styles.shuffleLabel}>Limit Number of Questions</Text>
            <Switch
              value={limitQuestions}
              onValueChange={handleLimitQuestionsToggle}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={limitQuestions ? '#f5dd4b' : '#f4f3f4'}
            />
          </View>

          {limitQuestions && (
            <View style={styles.questionCountContainer}>
              <Text style={styles.questionCountLabel}>Number of Questions</Text>
              <View style={styles.stepperContainer}>
                <TouchableOpacity
                  style={[styles.stepperButton, numQuestions <= 1 && styles.stepperButtonDisabled]}
                  onPress={decrementQuestions}
                  disabled={numQuestions <= 1}
                >
                  <Text style={[styles.stepperButtonText, numQuestions <= 1 && styles.stepperButtonTextDisabled]}>−</Text>
                </TouchableOpacity>
                <Text style={styles.questionCountValue}>{numQuestions}</Text>
                <TouchableOpacity
                  style={[styles.stepperButton, numQuestions >= maxQuestions && styles.stepperButtonDisabled]}
                  onPress={incrementQuestions}
                  disabled={numQuestions >= maxQuestions}
                >
                  <Text style={[styles.stepperButtonText, numQuestions >= maxQuestions && styles.stepperButtonTextDisabled]}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {!limitQuestions && (
            <Text style={styles.allQuestionsText}>
              All {maxQuestions} questions will be shown
            </Text>
          )}
          
          <TouchableOpacity style={styles.startButton} onPress={startQuiz}>
            <Text style={styles.startButtonText}>Start Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // End View
  if (viewState === 'end') {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Quiz Complete!</Text>
          <Text style={styles.scoreText}>
            Score: {score} / {questions.length}
          </Text>
          <Text style={styles.percentageText}>
            {Math.round((score / questions.length) * 100)}%
          </Text>
          <Text style={styles.timeText}>
            Time: {formatTime(elapsedSeconds)}
          </Text>
          
          {wrongQuestions.length > 0 && (
            <View style={styles.wrongAnswersInfo}>
              <Text style={styles.wrongAnswersText}>
                Wrong Answers: {wrongQuestions.length}
              </Text>
            </View>
          )}
          
          {wrongQuestions.length > 0 && (
            <TouchableOpacity style={styles.reviewButton} onPress={handleReviewWrongAnswers}>
              <Text style={styles.reviewButtonText}>Review Wrong Answers</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity style={styles.restartButton} onPress={handleRestart}>
            <Text style={styles.restartButtonText}>Restart Quiz</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Review View (yanlış soruları tekrar çözme)
  if (viewState === 'review') {
    const handleReviewNext = () => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setShowExplanation(false);
      } else {
        // Review bittiğinde end view'a dön
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current);
          timerIntervalRef.current = null;
        }
        // Review'deki yeni cevapları kontrol et
        const newWrong = questions.filter(q => {
          const userAnswer = userAnswers.get(q.id);
          return userAnswer !== q.answer.option;
        });
        setWrongQuestions(newWrong);
        setViewState('end');
      }
    };

    const handleReviewBackToEnd = () => {
      Alert.alert(
        'Exit Review?',
        'Your progress will be saved.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Exit',
            onPress: () => {
              if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
              }
              const newWrong = questions.filter(q => {
                const userAnswer = userAnswers.get(q.id);
                return userAnswer !== q.answer.option;
              });
              setWrongQuestions(newWrong);
              setViewState('end');
            },
          },
        ]
      );
    };

    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.quizHeader}>
          <TouchableOpacity style={styles.mainMenuButton} onPress={handleReviewBackToEnd}>
            <Text style={styles.mainMenuButtonText}>Exit Review</Text>
          </TouchableOpacity>
          <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
        </View>
        
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.reviewBadge}>
            <Text style={styles.reviewBadgeText}>Review Mode</Text>
          </View>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Question {currentIndex + 1} of {questions.length}
            </Text>
          </View>

          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          <View style={styles.choicesContainer}>
            {currentQuestion.choices.map((choice) => {
              const isSelected = selectedOption === choice.option;
              const isCorrectAnswer = choice.option === currentQuestion.answer.option;
              let buttonStyle: ViewStyle | ViewStyle[] = styles.choiceButton;
              let textStyle: TextStyle | TextStyle[] = styles.choiceButtonText;

              if (selectedOption !== null) {
                if (isCorrectAnswer) {
                  buttonStyle = [styles.choiceButton, styles.correctButton] as ViewStyle[];
                  textStyle = [styles.choiceButtonText, styles.correctButtonText] as TextStyle[];
                } else if (isSelected && !isCorrectAnswer) {
                  buttonStyle = [styles.choiceButton, styles.incorrectButton] as ViewStyle[];
                  textStyle = [styles.choiceButtonText, styles.incorrectButtonText] as TextStyle[];
                } else {
                  buttonStyle = [styles.choiceButton, styles.disabledButton] as ViewStyle[];
                  textStyle = [styles.choiceButtonText, styles.disabledButtonText] as TextStyle[];
                }
              }

              return (
                <TouchableOpacity
                  key={choice.option}
                  style={buttonStyle}
                  onPress={() => handleAnswer(choice.option)}
                  disabled={selectedOption !== null}
                >
                  <Text style={textStyle}>
                    {choice.option}. {choice.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {showExplanation && (
            <>
              {isCorrect ? (
                <View style={styles.correctMessageContainer}>
                  <Text style={[styles.resultText, { marginBottom: 0, color: '#155724' }]}>✓ Correct!</Text>
                </View>
              ) : (
                <View style={styles.explanationContainer}>
                  <Text style={styles.resultText}>✗ Incorrect</Text>
                  <Text style={styles.explanationText}>
                    {currentQuestion.explanation}
                  </Text>
                  <Text style={styles.answerText}>
                    Correct answer: {currentQuestion.answer.option}
                  </Text>
                </View>
              )}
              <TouchableOpacity style={styles.nextButton} onPress={handleReviewNext}>
                <Text style={styles.nextButtonText}>
                  {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Review'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz View
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.quizHeader}>
        <TouchableOpacity style={styles.mainMenuButton} onPress={handleMainMenu}>
          <Text style={styles.mainMenuButtonText}>Main Menu</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(elapsedSeconds)}</Text>
      </View>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentIndex + 1} of {questions.length}
          </Text>
        </View>

        <Text style={styles.questionText}>{currentQuestion.question}</Text>

        <View style={styles.choicesContainer}>
          {currentQuestion.choices.map((choice) => {
            const isSelected = selectedOption === choice.option;
            const isCorrectAnswer = choice.option === currentQuestion.answer.option;
            let buttonStyle: ViewStyle | ViewStyle[] = styles.choiceButton;
            let textStyle: TextStyle | TextStyle[] = styles.choiceButtonText;

            if (selectedOption !== null) {
              if (isCorrectAnswer) {
                buttonStyle = [styles.choiceButton, styles.correctButton] as ViewStyle[];
                textStyle = [styles.choiceButtonText, styles.correctButtonText] as TextStyle[];
              } else if (isSelected && !isCorrectAnswer) {
                buttonStyle = [styles.choiceButton, styles.incorrectButton] as ViewStyle[];
                textStyle = [styles.choiceButtonText, styles.incorrectButtonText] as TextStyle[];
              } else {
                buttonStyle = [styles.choiceButton, styles.disabledButton] as ViewStyle[];
                textStyle = [styles.choiceButtonText, styles.disabledButtonText] as TextStyle[];
              }
            }

            return (
              <TouchableOpacity
                key={choice.option}
                style={buttonStyle}
                onPress={() => handleAnswer(choice.option)}
                disabled={selectedOption !== null}
              >
                <Text style={textStyle}>
                  {choice.option}. {choice.text}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {showExplanation && (
          <>
            {isCorrect ? (
              <View style={styles.correctMessageContainer}>
                <Text style={styles.resultText}>✓ Correct!</Text>
              </View>
            ) : (
              <View style={styles.explanationContainer}>
                <Text style={styles.resultText}>✗ Incorrect</Text>
                <Text style={styles.explanationText}>
                  {currentQuestion.explanation}
                </Text>
                <Text style={styles.answerText}>
                  Correct answer: {currentQuestion.answer.option}
                </Text>
              </View>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
              <Text style={styles.nextButtonText}>
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  quizHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  mainMenuButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: '#f0f0f0',
  },
  mainMenuButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  timerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontVariant: ['tabular-nums'],
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  shuffleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  shuffleLabel: {
    fontSize: 16,
  },
  questionCountContainer: {
    width: '100%',
    maxWidth: 300,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  questionCountLabel: {
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    backgroundColor: '#ccc',
  },
  stepperButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepperButtonTextDisabled: {
    color: '#999',
  },
  questionCountValue: {
    fontSize: 24,
    fontWeight: 'bold',
    minWidth: 50,
    textAlign: 'center',
    color: '#333',
  },
  allQuestionsText: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  startButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: '100%',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
    lineHeight: 26,
  },
  choicesContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 20,
  },
  choiceButton: {
    backgroundColor: '#f0f0f0',
    padding: 15,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    width: '100%',
  },
  choiceButtonText: {
    fontSize: 16,
    color: '#333',
  },
  correctButton: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  correctButtonText: {
    color: '#155724',
    fontWeight: 'bold',
  },
  incorrectButton: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  incorrectButtonText: {
    color: '#721c24',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#e9ecef',
    borderColor: '#adb5bd',
    opacity: 0.6,
  },
  disabledButtonText: {
    color: '#6c757d',
  },
  correctMessageContainer: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#d4edda',
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  explanationContainer: {
    width: '100%',
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    marginBottom: 20,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#555',
    marginBottom: 10,
  },
  answerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 5,
  },
  nextButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
    width: '100%',
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  percentageText: {
    fontSize: 24,
    color: '#007AFF',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 30,
    fontVariant: ['tabular-nums'],
  },
  restartButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  restartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  wrongAnswersInfo: {
    marginTop: 20,
    marginBottom: 10,
    padding: 12,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ffc107',
  },
  wrongAnswersText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    textAlign: 'center',
  },
  reviewButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  reviewButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  reviewBadge: {
    backgroundColor: '#ffc107',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  reviewBadgeText: {
    color: '#856404',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
