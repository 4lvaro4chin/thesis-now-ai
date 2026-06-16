type TokenType = 'AND' | 'OR' | 'NOT' | 'TRUNC' | 'term' | 'paren';

interface BooleanTagProps {
  type: TokenType;
  value: string;
}

export function BooleanTag({ type, value }: BooleanTagProps) {
  const styles: Record<TokenType, { bg: string; text: string; font: string } | null> = {
    AND: { bg: '#E1F5EE', text: '#0F6E56', font: 'monospace' },
    OR: { bg: '#EBF4FD', text: '#1B6FA8', font: 'monospace' },
    NOT: { bg: '#FEF0EC', text: '#A33820', font: 'monospace' },
    TRUNC: { bg: '#FDF4E3', text: '#8A5100', font: 'monospace' },
    term: { bg: '#F4F6F5', text: '#2D3748', font: 'inherit' },
    paren: null,
  };

  const style = styles[type];

  if (type === 'paren') {
    return (
      <span style={{ color: '#9CA3AF', fontFamily: 'monospace', fontSize: '13px' }}>
        {value}
      </span>
    );
  }

  if (!style) return null;

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.text,
        fontFamily: style.font,
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        display: 'inline-block',
      }}
    >
      {value}
    </span>
  );
}
