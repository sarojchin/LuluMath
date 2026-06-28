import { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ChallengeScreen } from './src/screens/ChallengeScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { ResultsScreen } from './src/screens/ResultsScreen';
import { RoundResult, StageConfig } from './src/game/types';
import { applyResult, initialProgress, isMastered, Progress } from './src/state/progress';
import { colors } from './src/theme';

type Screen =
  | { name: 'home' }
  | { name: 'challenge'; stage: StageConfig; firstMastery: boolean }
  | { name: 'results'; stage: StageConfig; result: RoundResult };

export default function App() {
  const [progress, setProgress] = useState<Progress>(initialProgress);
  const [screen, setScreen] = useState<Screen>({ name: 'home' });

  function startStage(stage: StageConfig) {
    const firstMastery = !isMastered(progress, stage.table, stage.kind);
    setScreen({ name: 'challenge', stage, firstMastery });
  }

  function finishStage(stage: StageConfig, result: RoundResult) {
    setProgress((p) => applyResult(p, stage, result));
    setScreen({ name: 'results', stage, result });
  }

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar style="dark" />
      {screen.name === 'home' && <HomeScreen progress={progress} onPlay={startStage} />}
      {screen.name === 'challenge' && (
        <ChallengeScreen
          stage={screen.stage}
          isFirstMastery={screen.firstMastery}
          onComplete={(result) => finishStage(screen.stage, result)}
          onQuit={() => setScreen({ name: 'home' })}
        />
      )}
      {screen.name === 'results' && (
        <ResultsScreen
          stage={screen.stage}
          result={screen.result}
          onContinue={() => setScreen({ name: 'home' })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },
});
