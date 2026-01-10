import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQuizHistory } from '@/contexts/QuizHistoryContext';

export default function QuizDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { quizHistory } = useQuizHistory();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const quiz = quizHistory.find((q) => q.id === id);

  if (!quiz) {
    return (
      <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Quiz not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const safeAreaStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, safeAreaStyle]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Quiz Details</Text>
          <Text style={styles.date}>
            {new Date(quiz.date).toLocaleString()}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Score:</Text>
            <Text style={styles.summaryValue}>
              {quiz.score} / {quiz.totalQuestions}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Percentage:</Text>
            <Text
              style={[
                styles.summaryValue,
                quiz.percentage >= 70
                  ? styles.goodScore
                  : quiz.percentage >= 50
                  ? styles.mediumScore
                  : styles.poorScore,
              ]}>
              {quiz.percentage}%
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Time:</Text>
            <Text style={styles.summaryValue}>{formatTime(quiz.timeSeconds)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Wrong Answers:</Text>
            <Text style={styles.summaryValue}>{quiz.wrongAnswers}</Text>
          </View>
        </View>

        <View style={styles.questionsSection}>
          <Text style={styles.sectionTitle}>Questions Review</Text>
          {quiz.questions.map((q, index) => (
            <View
              key={q.id}
              style={[
                styles.questionCard,
                q.isCorrect ? styles.correctCard : styles.incorrectCard,
              ]}>
              <View style={styles.questionHeader}>
                <Text style={styles.questionNumber}>Question {index + 1}</Text>
                <Text
                  style={[
                    styles.questionStatus,
                    q.isCorrect ? styles.correctStatus : styles.incorrectStatus,
                  ]}>
                  {q.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                </Text>
              </View>
              <Text style={styles.questionText}>{q.question}</Text>
              <View style={styles.answerSection}>
                <Text style={styles.answerLabel}>Your Answer:</Text>
                <Text
                  style={[
                    styles.answerText,
                    q.isCorrect ? styles.correctAnswer : styles.incorrectAnswer,
                  ]}>
                  {q.userAnswer || 'Not answered'}
                </Text>
              </View>
              <View style={styles.answerSection}>
                <Text style={styles.answerLabel}>Correct Answer:</Text>
                <Text style={[styles.answerText, styles.correctAnswer]}>
                  {q.correctAnswer}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Back to Profile</Text>
        </TouchableOpacity>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  summaryCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  goodScore: {
    color: '#28a745',
  },
  mediumScore: {
    color: '#ffc107',
  },
  poorScore: {
    color: '#dc3545',
  },
  questionsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 2,
  },
  correctCard: {
    borderColor: '#d4edda',
    backgroundColor: '#f8fff9',
  },
  incorrectCard: {
    borderColor: '#f8d7da',
    backgroundColor: '#fff8f8',
  },
  questionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  questionStatus: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  correctStatus: {
    color: '#28a745',
  },
  incorrectStatus: {
    color: '#dc3545',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    lineHeight: 22,
  },
  answerSection: {
    marginBottom: 10,
  },
  answerLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  answerText: {
    fontSize: 16,
    fontWeight: '600',
  },
  correctAnswer: {
    color: '#28a745',
  },
  incorrectAnswer: {
    color: '#dc3545',
  },
  backButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
