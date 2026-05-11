interface FlagChipProps {
  flag: string;
  label?: string;
  size?: number;
}

export function FlagChip({ flag, label, size = 24 }: FlagChipProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: size,
        lineHeight: 1,
      }}
      aria-label={label}
    >
      <span aria-hidden>{flag}</span>
      {label && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>}
    </span>
  );
}
