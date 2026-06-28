import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../theme';

interface Props {
  onDigit: (d: number) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabled?: boolean;
}

const KEYS: (number | 'back' | 'submit')[] = [
  1, 2, 3,
  4, 5, 6,
  7, 8, 9,
  'back', 0, 'submit',
];

export function NumberPad({ onDigit, onBackspace, onSubmit, canSubmit, disabled }: Props) {
  return (
    <View style={styles.pad}>
      {KEYS.map((key) => {
        if (key === 'back') {
          return (
            <PadKey key="back" label="⌫" onPress={onBackspace} disabled={disabled} variant="muted" />
          );
        }
        if (key === 'submit') {
          return (
            <PadKey
              key="submit"
              label="✓"
              onPress={onSubmit}
              disabled={disabled || !canSubmit}
              variant="submit"
            />
          );
        }
        return (
          <PadKey key={key} label={String(key)} onPress={() => onDigit(key)} disabled={disabled} />
        );
      })}
    </View>
  );
}

function PadKey({
  label,
  onPress,
  disabled,
  variant = 'digit',
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'digit' | 'muted' | 'submit';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.key,
        variant === 'submit' && styles.keySubmit,
        variant === 'muted' && styles.keyMuted,
        pressed && !disabled && styles.keyPressed,
        disabled && styles.keyDisabled,
      ]}
    >
      <Text
        style={[
          styles.keyText,
          variant === 'submit' && styles.keyTextSubmit,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  key: {
    width: '30%',
    aspectRatio: 1.6,
    margin: '1.5%',
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  keyMuted: {
    backgroundColor: '#F3F4F6',
  },
  keySubmit: {
    backgroundColor: colors.correct,
  },
  keyPressed: {
    transform: [{ scale: 0.95 }],
    opacity: 0.85,
  },
  keyDisabled: {
    opacity: 0.4,
  },
  keyText: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.ink,
  },
  keyTextSubmit: {
    color: '#FFFFFF',
  },
});
