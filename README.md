# ESG Quiz App

A React Native quiz application built with Expo Router for ESG (Environmental, Social, Governance) Investment Analysis study questions.

## Features

- 📱 **Multiple Choice Quiz**: Interactive quiz with 72 questions from BA/ECON 470 course
- 🎯 **Customizable Question Count**: Choose to answer all questions or limit to a specific number
- 🔀 **Shuffle Mode**: Randomize question order for varied practice sessions
- ⏱️ **Timer**: Track your quiz completion time
- 📊 **Score Tracking**: See your score and percentage at the end
- 💡 **Explanations**: Learn from detailed explanations for each question
- 🎨 **Safe Area Support**: Properly handles iPhone Dynamic Island and notches
- 🔄 **Main Menu**: Return to start screen anytime during quiz

## Tech Stack

- **React Native** with **Expo Router**
- **TypeScript**
- **React Native Safe Area Context**

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Expo CLI (optional, can use npx)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd ESGQuiz
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npx expo start
```

4. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your phone
   - Press `w` for web browser

## Project Structure

```
ESGQuiz/
├── app/                    # Expo Router app directory
│   ├── (tabs)/            # Tab navigation screens
│   │   └── index.tsx      # Main quiz screen
│   └── _layout.tsx         # Root layout with SafeAreaProvider
├── assets/                 # Static assets
│   └── Study_Questions_LMS_Part2_72_MC.json  # Quiz questions data
└── components/             # Reusable components
```

## Usage

1. **Start Screen**: 
   - Toggle "Shuffle Questions" to randomize order
   - Optionally enable "Limit Number of Questions" and select desired count
   - Click "Start Quiz" to begin

2. **Quiz Screen**:
   - Answer questions by selecting A, B, C, or D
   - View explanations after answering
   - Use "Main Menu" button to return to start
   - Timer tracks elapsed time

3. **Results Screen**:
   - View your score and percentage
   - See total time taken
   - Click "Restart Quiz" to start over

## Data Source

Questions are loaded from `assets/Study_Questions_LMS_Part2_72_MC.json` which contains:
- 72 multiple choice questions
- 4 choices per question (A, B, C, D)
- Correct answers and explanations

## Development

### Available Scripts

- `npm start` - Start Expo development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web
- `npm run lint` - Run ESLint

## License

This project is for educational purposes.

## Author

Created for BA/ECON 470 - ESG Investment Analysis course study purposes.
