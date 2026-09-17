import * as Haptics from 'expo-haptics';
import { AppState } from 'react-native';
export async function hapticFeedback(enabled: boolean, kind: 'press' | 'complete' = 'press') {
    if (!enabled || AppState.currentState !== 'active')
        return;
    try {
        if (kind === 'complete')
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        else
            await Haptics.selectionAsync();
    }
    catch { /* Feedback is optional and must never interrupt navigation. */ }
}
