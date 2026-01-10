import { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import { useQuizHistory } from '@/contexts/QuizHistoryContext';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const { user, signOut, signIn, signUp, signInWithApple, signInWithGoogle } = useAuth();
  const { quizHistory, clearHistory, loading: historyLoading } = useQuizHistory();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const safeAreaStyle = {
    paddingTop: insets.top,
    paddingBottom: insets.bottom,
    paddingLeft: insets.left,
    paddingRight: insets.right,
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: signOut,
        },
      ]
    );
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all quiz history?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearHistory,
        },
      ]
    );
  };

  // Not signed in - show login/signup form
  if (!user) {
    return (
      <SafeAreaView style={[styles.container, safeAreaStyle]} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>Welcome to ESG Quiz</Text>
          <Text style={styles.subtitle}>
            {isSignUp ? 'Create an account' : 'Sign in to track your progress'}
          </Text>

          <View style={styles.formContainer}>
            {isSignUp && (
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            )}
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={isSignUp ? handleSignUp : handleSignIn}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryButtonText}>
                  {isSignUp ? 'Sign Up' : 'Sign In'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => setIsSignUp(!isSignUp)}>
              <Text style={styles.linkText}>
                {isSignUp
                  ? 'Already have an account? Sign in'
                  : "Don't have an account? Sign up"}
              </Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={signInWithGoogle}
              disabled={loading}>
              <Text style={styles.socialButtonText}>Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.socialButton}
              onPress={signInWithApple}
              disabled={loading}>
              <Text style={styles.socialButtonText}>Continue with Apple</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Signed in - show profile and history
  const averageScore =
    quizHistory.length > 0
      ? Math.round(
          quizHistory.reduce((sum, quiz) => sum + quiz.percentage, 0) /
            quizHistory.length
        )
      : 0;

  const totalQuizzes = quizHistory.length;
  const totalQuestions = quizHistory.reduce((sum, quiz) => sum + quiz.totalQuestions, 0);
  const correctAnswers = quizHistory.reduce(
    (sum, quiz) => sum + (quiz.totalQuestions - quiz.wrongAnswers),
    0
  );

  return (
    <SafeAreaView style={[styles.container, safeAreaStyle]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalQuizzes}</Text>
            <Text style={styles.statLabel}>Total Quizzes</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{averageScore}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>
              {totalQuestions > 0
                ? Math.round((correctAnswers / totalQuestions) * 100)
                : 0}
              %
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quiz History</Text>
          {historyLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : quizHistory.length === 0 ? (
            <Text style={styles.emptyText}>No quiz history yet</Text>
          ) : (
            <>
              {quizHistory.slice(0, 10).map((quiz) => (
                <TouchableOpacity
                  key={quiz.id}
                  style={styles.historyItem}
                  onPress={() => router.push({
                    pathname: '/quiz-details/[id]',
                    params: { id: quiz.id }
                  })}>
                  <View style={styles.historyItemLeft}>
                    <Text style={styles.historyDate}>
                      {new Date(quiz.date).toLocaleDateString()}
                    </Text>
                    <Text style={styles.historyInfo}>
                      {quiz.score}/{quiz.totalQuestions} questions
                    </Text>
                  </View>
                  <View style={styles.historyItemRight}>
                    <Text
                      style={[
                        styles.historyScore,
                        quiz.percentage >= 70
                          ? styles.historyScoreGood
                          : quiz.percentage >= 50
                          ? styles.historyScoreMedium
                          : styles.historyScorePoor,
                      ]}>
                      {quiz.percentage}%
                    </Text>
                    <Text style={styles.historyTime}>
                      {Math.floor(quiz.timeSeconds / 60)}:
                      {(quiz.timeSeconds % 60).toString().padStart(2, '0')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              {quizHistory.length > 10 && (
                <Text style={styles.moreText}>
                  +{quizHistory.length - 10} more quizzes
                </Text>
              )}
            </>
          )}
        </View>

        <TouchableOpacity style={styles.secondaryButton} onPress={handleClearHistory}>
          <Text style={styles.secondaryButtonText}>Clear History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <Text style={styles.signOutButtonText}>Sign Out</Text>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  linkText: {
    color: '#007AFF',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e0e0e0',
  },
  dividerText: {
    marginHorizontal: 15,
    color: '#999',
    fontSize: 14,
  },
  socialButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  socialButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 12,
    minWidth: 90,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  loader: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 16,
    marginVertical: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  historyItemLeft: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 5,
  },
  historyInfo: {
    fontSize: 12,
    color: '#666',
  },
  historyItemRight: {
    alignItems: 'flex-end',
  },
  historyScore: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  historyScoreGood: {
    color: '#28a745',
  },
  historyScoreMedium: {
    color: '#ffc107',
  },
  historyScorePoor: {
    color: '#dc3545',
  },
  historyTime: {
    fontSize: 12,
    color: '#666',
  },
  moreText: {
    textAlign: 'center',
    color: '#007AFF',
    fontSize: 14,
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  signOutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
