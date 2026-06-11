'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';

interface Token {
  id: string;
  type: 'term' | 'and' | 'or' | 'not' | 'lparen' | 'rparen';
  value: string;
}

let tokenIdCounter = 0;
const newTokenId = () => `tk-${tokenIdCounter++}`;

// Convert backend query string into tokens (terms, operators, parens)
const tokenize = (query: string): Token[] => {
  const tokens: Token[] = [];
  const re = /\(|\)|"[^"]*"|[^\s()]+/g;

  for (const match of query.matchAll(re)) {
    const s = match[0];
    if (s === '(') {
      tokens.push({ id: newTokenId(), type: 'lparen', value: '(' });
    } else if (s === ')') {
      tokens.push({ id: newTokenId(), type: 'rparen', value: ')' });
    } else if (/^AND$/i.test(s)) {
      tokens.push({ id: newTokenId(), type: 'and', value: 'AND' });
    } else if (/^OR$/i.test(s)) {
      tokens.push({ id: newTokenId(), type: 'or', value: 'OR' });
    } else if (/^NOT$/i.test(s)) {
      tokens.push({ id: newTokenId(), type: 'not', value: 'NOT' });
    } else {
      tokens.push({ id: newTokenId(), type: 'term', value: s.replace(/^"|"$/g, '') });
    }
  }

  return tokens;
};

// Remove empty terms, dangling operators and empty paren pairs so the
// final query is always valid even mid-edition
const sanitizeTokens = (tokens: Token[]): Token[] => {
  let toks = tokens.filter((t) => !(t.type === 'term' && !t.value.trim()));
  let changed = true;

  while (changed) {
    changed = false;
    const out: Token[] = [];

    for (let i = 0; i < toks.length; i++) {
      const t = toks[i];
      const prev = out[out.length - 1];
      const next = toks[i + 1];

      if (t.type === 'and' || t.type === 'or') {
        const prevOk = prev && (prev.type === 'term' || prev.type === 'rparen');
        const nextOk = next && (next.type === 'term' || next.type === 'lparen' || next.type === 'not');
        if (!prevOk || !nextOk) {
          changed = true;
          continue;
        }
      }

      if (t.type === 'not') {
        const nextOk = next && (next.type === 'term' || next.type === 'lparen');
        if (!nextOk) {
          changed = true;
          continue;
        }
      }

      out.push(t);
    }

    toks = out;

    for (let i = 0; i < toks.length - 1; i++) {
      if (toks[i].type === 'lparen' && toks[i + 1].type === 'rparen') {
        toks.splice(i, 2);
        changed = true;
        break;
      }
    }
  }

  return toks;
};

// Mark which tokens live inside a negation: the NOT itself, plus the
// term or paren group that follows it
const computeNegation = (tokens: Token[]): boolean[] => {
  const negated = new Array(tokens.length).fill(false);
  let i = 0;

  while (i < tokens.length) {
    if (tokens[i].type === 'not') {
      negated[i] = true;

      if (tokens[i + 1]?.type === 'lparen') {
        let depth = 0;
        let j = i + 1;
        while (j < tokens.length) {
          if (tokens[j].type === 'lparen') depth++;
          if (tokens[j].type === 'rparen') depth--;
          negated[j] = true;
          j++;
          if (depth === 0) break;
        }
        i = j;
        continue;
      } else if (tokens[i + 1]) {
        negated[i + 1] = true;
        i += 2;
        continue;
      }
    }
    i++;
  }

  return negated;
};

// Colores de marca mejorados para fondo oscuro
const GREEN = { bg: 'rgba(29, 158, 117, 0.2)', bgHover: 'rgba(29, 158, 117, 0.3)', border: '#5DCAA5', text: '#9FE1CB' };
const BLUE = { bg: 'rgba(27, 111, 168, 0.2)', bgHover: 'rgba(27, 111, 168, 0.3)', border: '#4B8FC7', text: '#93C5E6' };
const RED = { bg: 'rgba(163, 56, 32, 0.25)', bgHover: 'rgba(163, 56, 32, 0.35)', border: '#DC2626', text: '#FCA5A5' };

export default function SearchPage() {
  useAuthProtection();
  const router = useRouter();
  const { t } = useTranslation();

  const [title, setTitle] = useState('');
  const [selectedDatabases, setSelectedDatabases] = useState<Record<string, boolean>>({
    pubmed: true,
    semantic_scholar: true,
  });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Generate query when title changes
  useEffect(() => {
    if (!title.trim()) {
      setTokens([]);
      return;
    }

    const generateQuery = async () => {
      setLoadingQuery(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nlp/generate-query`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: title.trim() }),
        });

        if (response.ok) {
          const data = await response.json();
          setTokens(tokenize(data.query || title.trim()));
        } else {
          setTokens([{ id: newTokenId(), type: 'term', value: title.trim() }]);
        }
      } catch (error) {
        console.error('Error generating query:', error);
        setTokens([{ id: newTokenId(), type: 'term', value: title.trim() }]);
      } finally {
        setLoadingQuery(false);
      }
    };

    const debounceTimer = setTimeout(generateQuery, 500);
    return () => clearTimeout(debounceTimer);
  }, [title]);

  const getFinalQuery = (): string => {
    const toks = sanitizeTokens(tokens);
    if (toks.length === 0) return '';

    return toks
      .map((t) => t.value)
      .join(' ')
      .replace(/\( /g, '(')
      .replace(/ \)/g, ')');
  };

  const getNaturalDescription = (): string => {
    const toks = sanitizeTokens(tokens);
    if (toks.length === 0) return '';

    const parts = toks.map((t) => {
      switch (t.type) {
        case 'term':
          return `"${t.value}"`;
        case 'and':
          return 'y';
        case 'or':
          return 'o';
        case 'not':
          return 'excluyendo';
        default:
          return t.value;
      }
    });

    const phrase = parts.join(' ').replace(/\( /g, '(').replace(/ \)/g, ')');
    return `Buscará documentos que mencionen ${phrase}.`;
  };

  // Insert after the selected block (or at the end if nothing selected),
  // then move selection to the last inserted block so adds can be chained
  const insertTokens = (newToks: Token[]) => {
    const idx = selectedId ? tokens.findIndex((t) => t.id === selectedId) : -1;
    const insertAt = idx === -1 ? tokens.length : idx + 1;
    const out = [...tokens];
    out.splice(insertAt, 0, ...newToks);
    setTokens(out);
    setSelectedId(newToks[newToks.length - 1].id);
  };

  const addToken = (type: 'term' | 'and' | 'or' | 'not' | 'paren') => {
    if (type === 'paren') {
      const termId = newTokenId();
      insertTokens([
        { id: newTokenId(), type: 'lparen', value: '(' },
        { id: termId, type: 'term', value: '' },
        { id: newTokenId(), type: 'rparen', value: ')' },
      ]);
      setEditingId(termId);
      setEditingValue('');
      return;
    }

    const id = newTokenId();
    const value = type === 'term' ? '' : type.toUpperCase();
    insertTokens([{ id, type, value }]);

    if (type === 'term') {
      setEditingId(id);
      setEditingValue('');
    }
  };

  const updateToken = (id: string, value: string) => {
    setTokens(tokens.map((t) => (t.id === id ? { ...t, value } : t)));
  };

  const toggleOperator = (id: string) => {
    setTokens(
      tokens.map((t) =>
        t.id === id && (t.type === 'and' || t.type === 'or')
          ? { ...t, type: t.type === 'and' ? 'or' : 'and', value: t.type === 'and' ? 'OR' : 'AND' }
          : t
      )
    );
  };

  const deleteToken = (id: string) => {
    setTokens(tokens.filter((t) => t.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const moveToken = (from: number | null, to: number) => {
    if (from === null || from === to) {
      setDragIndex(null);
      return;
    }
    const toks = [...tokens];
    const [moved] = toks.splice(from, 1);
    toks.splice(to, 0, moved);
    setTokens(toks);
    setDragIndex(null);
  };

  const handleSearch = () => {
    if (!title.trim()) {
      alert('Please enter a thesis title');
      return;
    }

    const finalQuery = getFinalQuery();
    if (!finalQuery) {
      alert('La query está vacía');
      return;
    }

    const selectedDbArray = Object.entries(selectedDatabases)
      .filter(([_, selected]) => selected)
      .map(([db, _]) => db);

    if (selectedDbArray.length === 0) {
      alert('Please select at least one database');
      return;
    }

    const queryString = new URLSearchParams({
      title: title.trim(),
      databases: selectedDbArray.join(','),
      query: finalQuery,
    }).toString();

    router.push(`/searching?${queryString}`);
  };

  const toggleDatabase = (db: string, value: boolean) => {
    setSelectedDatabases((prev) => ({ ...prev, [db]: value }));
  };

  const negated = computeNegation(tokens);
  const canSearch = title.trim() && getFinalQuery().length > 0;

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '100px' }}>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #F0FBF7 0%, #E8F8F4 100%)',
          borderBottom: '1px solid #E1F5EE',
          padding: '64px 48px',
          marginBottom: '60px',
        }}
      >
        <div style={{ maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '12px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
              color: '#1D9E75',
              marginBottom: '16px',
            }}
          >
            {t('search.section.builder')}
          </p>
          <h1
            style={{
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 700,
              color: '#04342C',
              letterSpacing: '-0.7px',
              lineHeight: 1.2,
              marginBottom: '16px',
            }}
          >
            {t('search.title')}
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#6B7280',
              lineHeight: 1.6,
              marginBottom: '40px',
            }}
          >
            {t('search.subtitle')}
          </p>

          {/* Title Input */}
          <div style={{ marginBottom: '24px' }}>
            <label
              style={{
                display: 'block',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '12px',
                fontWeight: 600,
                color: '#1B2A4A',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('search.section.title')}
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('search.placeholder')}
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '15px',
                border: title.trim() ? '2px solid #1D9E75' : '1.5px solid #E8EDEB',
                borderRadius: '12px',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                background: 'white',
                color: '#1F2937',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#1D9E75';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(29, 158, 117, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = title.trim() ? '#1D9E75' : '#E8EDEB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {/* Search Button Below Input */}
            <button
              onClick={handleSearch}
              disabled={!canSearch}
              style={{
                marginTop: '16px',
                padding: '12px 32px',
                background: canSearch ? '#1D9E75' : '#D1D5DB',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                fontSize: '14px',
                fontWeight: 600,
                cursor: canSearch ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: canSearch ? '0 2px 8px rgba(15, 110, 86, 0.3)' : 'none',
                fontFamily: "'DM Sans', sans-serif",
              }}
              onMouseEnter={(e) => {
                if (canSearch) {
                  e.currentTarget.style.background = '#0F6E56';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (canSearch) {
                  e.currentTarget.style.background = '#1D9E75';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {t('search.button.execute')}
            </button>
          </div>
        </div>
      </div>

      {/* Query Builder - 3 separate sections */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 48px' }}>
        {/* Block 1: Query Booleana Generada */}
        <div
          style={{
            background: '#04342C',
            border: '1px solid #0F6E56',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#9FE1CB',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            🔨 Query Booleana Generada {loadingQuery && '· generando...'}
          </p>

          {/* Token Blocks */}
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(159, 225, 203, 0.2)',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '12px',
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px',
              alignItems: 'center',
              minHeight: '44px',
            }}
          >
            {tokens.length === 0 ? (
              <span style={{ color: '#9FE1CB', fontSize: '13px' }}>
                Ingresa un título para generar la query...
              </span>
            ) : (
              tokens.map((token, idx) => {
                // Determine colors: OR uses blue, everything else green or red based on negation
                let colors = GREEN;
                if (negated[idx]) {
                  colors = RED;
                } else if (token.type === 'or') {
                  colors = BLUE;
                }
                const isHovered = hoveredId === token.id;
                const isDragging = dragIndex === idx;
                const isSelected = selectedId === token.id;

                return (
                  <div
                    key={token.id}
                    draggable={editingId !== token.id}
                    onDragStart={() => setDragIndex(idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      moveToken(dragIndex, idx);
                    }}
                    onDragEnd={() => setDragIndex(null)}
                    onMouseEnter={() => setHoveredId(token.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    onClick={() => setSelectedId(isSelected ? null : token.id)}
                    style={{
                      position: 'relative',
                      display: 'inline-block',
                      opacity: isDragging ? 0.4 : 1,
                      cursor: 'grab',
                      outline: isSelected ? '2px solid #2563EB' : 'none',
                      outlineOffset: '2px',
                      borderRadius: '6px',
                    }}
                  >
                    {/* Term: tag with inline edit */}
                    {token.type === 'term' &&
                      (editingId === token.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={() => {
                            updateToken(token.id, editingValue);
                            setEditingId(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              updateToken(token.id, editingValue);
                              setEditingId(null);
                            }
                          }}
                          style={{
                            padding: '6px 10px',
                            fontSize: '12px',
                            fontFamily: 'monospace',
                            border: `1.5px solid ${colors.border}`,
                            borderRadius: '6px',
                            background: 'white',
                            color: '#1F2937',
                            fontWeight: 500,
                            minWidth: '80px',
                            boxSizing: 'border-box',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            background: isHovered ? colors.bgHover : colors.bg,
                            border: `1.5px solid ${colors.border}`,
                            color: colors.text,
                            padding: '6px 10px',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 500,
                            fontFamily: 'monospace',
                            transition: 'background 0.2s',
                            minWidth: '40px',
                            minHeight: '18px',
                            display: 'inline-block',
                          }}
                        >
                          {token.value || <span style={{ opacity: 0.5 }}>•••</span>}
                        </div>
                      ))}

                    {/* AND / OR: draggable block, toggled via hover button */}
                    {(token.type === 'and' || token.type === 'or') && (
                      <span
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          fontWeight: 600,
                          border: `1.5px solid ${colors.border}`,
                          borderRadius: '4px',
                          background: isHovered ? colors.bgHover : colors.bg,
                          color: colors.text,
                          fontFamily: "'DM Sans', sans-serif",
                          display: 'inline-block',
                          transition: 'background 0.2s',
                        }}
                      >
                        {token.value}
                      </span>
                    )}

                    {/* NOT: fixed red block */}
                    {token.type === 'not' && (
                      <span
                        style={{
                          padding: '6px 8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          background: 'rgba(163, 56, 32, 0.25)',
                          color: '#FCA5A5',
                          borderRadius: '4px',
                          border: '1.5px solid #DC2626',
                          display: 'inline-block',
                        }}
                      >
                        NOT
                      </span>
                    )}

                    {/* Parens: big symbols */}
                    {(token.type === 'lparen' || token.type === 'rparen') && (
                      <span
                        style={{
                          fontSize: '18px',
                          fontWeight: 700,
                          color: negated[idx] ? '#EF5350' : '#5DCAA5',
                          fontFamily: 'monospace',
                          padding: '0 2px',
                          display: 'inline-block',
                        }}
                      >
                        {token.value}
                      </span>
                    )}

                    {/* Hover controls: delete (all) + edit (terms) + swap (operators) */}
                    {isHovered && editingId !== token.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteToken(token.id);
                          }}
                          style={{
                            position: 'absolute',
                            top: '-7px',
                            right: '-7px',
                            width: '16px',
                            height: '16px',
                            background: '#EF4444',
                            border: 'none',
                            borderRadius: '50%',
                            color: '#FFFFFF',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 700,
                            padding: 0,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            zIndex: 2,
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#DC2626';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#EF4444';
                          }}
                        >
                          ✕
                        </button>
                        {token.type === 'term' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(token.id);
                              setEditingValue(token.value);
                            }}
                            style={{
                              position: 'absolute',
                              top: '-7px',
                              left: '-7px',
                              width: '16px',
                              height: '16px',
                              background: '#5DCAA5',
                              border: 'none',
                              borderRadius: '50%',
                              color: '#04342C',
                              cursor: 'pointer',
                              fontSize: '9px',
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2,
                              fontWeight: 'bold',
                            }}
                          >
                            ✎
                          </button>
                        )}
                        {(token.type === 'and' || token.type === 'or') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleOperator(token.id);
                            }}
                            title={`Cambiar a ${token.type === 'and' ? 'OR' : 'AND'}`}
                            style={{
                              position: 'absolute',
                              top: '-7px',
                              left: '-7px',
                              width: '16px',
                              height: '16px',
                              background: token.type === 'and' ? '#5DCAA5' : '#93C5E6',
                              border: 'none',
                              borderRadius: '50%',
                              color: '#04342C',
                              cursor: 'pointer',
                              fontSize: '8px',
                              fontWeight: 700,
                              padding: 0,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              zIndex: 2,
                            }}
                          >
                            ⇄
                          </button>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Add Block Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '12px' }}>
            <button
              onClick={() => addToken('term')}
              style={{
                padding: '6px 12px',
                background: 'rgba(159, 225, 203, 0.15)',
                border: '1px solid rgba(159, 225, 203, 0.3)',
                color: '#9FE1CB',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(159, 225, 203, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(159, 225, 203, 0.15)';
              }}
            >
              + Término
            </button>
            <button
              onClick={() => addToken('and')}
              style={{
                padding: '6px 12px',
                background: 'rgba(93, 202, 165, 0.2)',
                border: '1px solid #5DCAA5',
                color: '#9FE1CB',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(93, 202, 165, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(93, 202, 165, 0.2)';
              }}
            >
              + AND
            </button>
            <button
              onClick={() => addToken('or')}
              style={{
                padding: '6px 12px',
                background: 'rgba(75, 143, 199, 0.2)',
                border: '1px solid #4B8FC7',
                color: '#93C5E6',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(75, 143, 199, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(75, 143, 199, 0.2)';
              }}
            >
              + OR
            </button>
            <button
              onClick={() => addToken('not')}
              style={{
                padding: '6px 12px',
                background: 'rgba(163, 56, 32, 0.15)',
                border: '1px solid #DC2626',
                color: '#FCA5A5',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(163, 56, 32, 0.25)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(163, 56, 32, 0.15)';
              }}
            >
              + NOT
            </button>
            <button
              onClick={() => addToken('paren')}
              style={{
                padding: '6px 12px',
                background: 'rgba(159, 225, 203, 0.1)',
                border: '1px solid rgba(159, 225, 203, 0.3)',
                color: '#9FE1CB',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'monospace',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(159, 225, 203, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(159, 225, 203, 0.1)';
              }}
            >
              + ( )
            </button>
          </div>

          <p style={{ fontSize: '11px', color: '#9FE1CB', marginBottom: '0', lineHeight: 1.5, opacity: 0.8 }}>
            💡 Clic = seleccionar (inserta bloques después). Arrastrar = reordenar.
            Hover: editar (✎), alternar AND/OR (⇄), eliminar (✕).
          </p>
        </div>

        {/* Block 2: Query Ejecutará + Lenguaje Natural */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #1D9E75',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '24px',
          }}
        >
          {/* Final Query Display */}
          <div
            style={{
              background: '#FFFFFF',
              border: '1px solid #E1F5EE',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              color: '#04342C',
              wordBreak: 'break-word',
            }}
          >
            <p style={{ margin: 0, color: '#6B7280', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              📋 Query ejecutará
            </p>
            <p style={{ margin: 0, color: '#04342C', fontWeight: 600 }}>
              {getFinalQuery() || '(ingresa términos para generar query)'}
            </p>
          </div>

          {/* Natural Language Note */}
          {tokens.length > 0 && (
            <div
              style={{
                background: '#FFFBEB',
                border: '2px solid #F59E0B',
                borderRadius: '8px',
                padding: '12px',
                marginTop: '12px',
                fontSize: '12px',
                lineHeight: 1.6,
                color: '#78350F',
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              💬 <strong style={{ color: '#D97706' }}>En lenguaje natural:</strong>{' '}
              {getNaturalDescription()}
            </div>
          )}
        </div>

        {/* Block 3: Databases Selection */}
        <div
          style={{
            background: '#FFFFFF',
            border: '2px solid #1D9E75',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '40px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#1D9E75',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            🌍 Dónde buscar
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              marginBottom: '24px',
            }}
          >
            {[
              { id: 'pubmed', label: 'PubMed', desc: 'Medicina, ciencias de la salud' },
              { id: 'semantic_scholar', label: 'Semantic Scholar', desc: 'Multidisciplinario, académico' },
            ].map((db) => (
              <label
                key={db.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  padding: '14px',
                  borderRadius: '10px',
                  border: selectedDatabases[db.id] ? '2px solid #1D9E75' : '1.5px solid #E8EDEB',
                  transition: 'all 0.2s',
                  background: selectedDatabases[db.id] ? '#F0FBF7' : '#FFFFFF',
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedDatabases[db.id]}
                  onChange={(e) => toggleDatabase(db.id, e.target.checked)}
                  style={{
                    width: '18px',
                    height: '18px',
                    cursor: 'pointer',
                    accentColor: '#1D9E75',
                    marginTop: '3px',
                    flexShrink: 0,
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: selectedDatabases[db.id] ? '#0F6E56' : '#1B2A4A',
                      marginBottom: '2px',
                    }}
                  >
                    {db.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                    }}
                  >
                    {db.desc}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Execute Button - Outside blocks */}
        <button
          onClick={handleSearch}
          disabled={!canSearch}
          style={{
            padding: '14px 40px',
            background: canSearch ? '#1D9E75' : '#D1D5DB',
            border: 'none',
            borderRadius: '8px',
            color: 'white',
            fontSize: '15px',
            fontWeight: 600,
            cursor: canSearch ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s',
            boxShadow: canSearch ? '0 2px 8px rgba(15, 110, 86, 0.3)' : 'none',
            fontFamily: "'DM Sans', sans-serif",
            width: '100%',
          }}
          onMouseEnter={(e) => {
            if (canSearch) {
              e.currentTarget.style.background = '#0F6E56';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }
          }}
          onMouseLeave={(e) => {
            if (canSearch) {
              e.currentTarget.style.background = '#1D9E75';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          {t('search.button.execute')}
        </button>
      </div>
    </div>
  );
}
