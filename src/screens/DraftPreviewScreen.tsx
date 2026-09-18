import { useState } from 'react';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View } from 'react-native';
import { Screen } from '../components/Screen';
import { AppText } from '../components/AppText';
import { Button } from '../components/Button';
import { GameView } from '../game/GameView';
import { draftPuzzles, previewPuzzle, previewSession } from '../game/preview/drafts';
import type { GameResult } from '../game/types';
export function DraftPreviewScreen() {
  const { puzzleId } = useLocalSearchParams<{ puzzleId?: string }>();
  const router = useRouter();
  const [result, setResult] = useState<GameResult | null>(null);
  const [replay, setReplay] = useState(0);
  if (!__DEV__) return <Redirect href="/" />;
  const selected = typeof puzzleId === 'string' ? previewPuzzle(puzzleId) : undefined;
  if (puzzleId && !selected) return <Screen title="Draft Preview"><AppText>Draft unavailable or invalid.</AppText><Button title="Back to drafts" onPress={() => router.replace('/draft-preview')} /></Screen>;
  if (selected) {
    if (result?.levelId === selected.record.levelId) return <Screen title="Draft Preview · Result">
      <Stack.Screen options={{ headerShown: true, title: 'Draft Preview' }} />
      <AppText>{result.outcome === 'won' ? 'Puzzle solved' : 'Puzzle lost'}</AppText>
      <AppText>{result.levelId} · {result.mistakes} mistakes · {result.hintsUsed} hints · {Math.floor(result.elapsedMs / 1000)}s</AppText>
      <AppText>No normal progress saved. Editorial status remains draft.</AppText>
      <Button title="Replay draft" onPress={() => { setResult(null); setReplay(n => n + 1); }} />
      <Button secondary title="Back to drafts" onPress={() => { setResult(null); router.replace('/draft-preview'); }} />
    </Screen>;
    return <View style={{ flex: 1 }}>
      <Stack.Screen options={{ headerShown: false }} />
      <GameView key={`${selected.record.levelId}-${selected.record.revision}-${replay}`} launch={{ mode: 'level', levelId: selected.record.levelId, locale: selected.record.locale, puzzleRevision: selected.record.revision }} developmentPreview={{ puzzle: selected.puzzle, position: selected.record.position, storage: previewSession.storage }} onComplete={async value => { await previewSession.complete(value); setResult(value); }} />
    </View>;
  }
  return <Screen title="Draft Preview">
    <Stack.Screen options={{ headerShown: true, title: 'Draft Preview' }} />
    <AppText>Development only · FR 1–10 first</AppText>
    <AppText>Playtests do not approve puzzles or save normal progress. Preview sessions last until the app reloads.</AppText>
    {draftPuzzles().map(puzzle => <View key={puzzle.levelId} style={{ gap: 4 }}>
      <AppText variant="subtitle">{puzzle.locale.toUpperCase()} · Position {puzzle.position}</AppText>
      <AppText variant="muted">{puzzle.levelId} · Difficulty {puzzle.difficulty} · {puzzle.status}</AppText>
      <Button title={`Play ${puzzle.locale.toUpperCase()} ${puzzle.position}`} onPress={() => { setResult(null); router.push({ pathname: '/draft-preview', params: { puzzleId: puzzle.levelId } }); }} />
    </View>)}
  </Screen>;
}
