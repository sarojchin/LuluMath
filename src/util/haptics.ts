import * as Haptics from 'expo-haptics';

// Thin wrappers that never throw (haptics are a no-op on web / unsupported devices)
// and let the feel escalate with a streak without being overwhelming.

export function hapticCorrect(streak: number): void {
  try {
    if (streak > 0 && streak % 5 === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (streak >= 3) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  } catch {
    // ignore
  }
}

export function hapticWrong(): void {
  try {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch {
    // ignore
  }
}

export function hapticTap(): void {
  try {
    Haptics.selectionAsync();
  } catch {
    // ignore
  }
}
