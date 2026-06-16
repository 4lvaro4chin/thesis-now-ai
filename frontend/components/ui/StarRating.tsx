import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function StarRating({ value, onChange, readonly = false, size = 'medium' }: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState(0);

  const sizeMap = {
    small: { star: 16, gap: 4 },
    medium: { star: 24, gap: 6 },
    large: { star: 32, gap: 8 },
  };

  const { star: starSize, gap } = sizeMap[size];

  const handleClick = (rating: number) => {
    if (!readonly && onChange) {
      onChange(rating);
    }
  };

  const displayValue = hoverValue || value || 0;

  return (
    <div style={{ display: 'flex', gap: `${gap}px`, cursor: readonly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map((rating) => (
        <button
          key={rating}
          type="button"
          onMouseEnter={() => !readonly && setHoverValue(rating)}
          onMouseLeave={() => setHoverValue(0)}
          onClick={() => handleClick(rating)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: readonly ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
            transform: readonly ? 'scale(1)' : (displayValue >= rating ? 'scale(1.1)' : 'scale(1)'),
          }}
        >
          <svg
            width={starSize}
            height={starSize}
            viewBox="0 0 24 24"
            fill={displayValue >= rating ? '#FCD34D' : 'none'}
            stroke={displayValue >= rating ? '#FCD34D' : '#D1D5DB'}
            strokeWidth={2}
            style={{ transition: 'all 0.2s' }}
          >
            <polygon points="12 2 15.09 10.26 24 10.35 17.77 16.01 20.16 24.02 12 18.35 3.84 24.02 6.23 16.01 0 10.35 8.91 10.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}
