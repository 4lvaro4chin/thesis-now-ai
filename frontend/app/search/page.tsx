'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthProtection } from '@/lib/useAuthProtection';
import { useTranslation } from '@/lib/useTranslation';
import { useTracking } from '@/lib/useTracking';

interface Token {
  id: string;
  type: 'term' | 'and' | 'or' | 'not' | 'lparen' | 'rparen';
  value: string;
}

let tokenIdCounter = 0;
const newTokenId = () => `tk-${tokenIdCounter++}`;

// Database logos - Official style
const DatabaseLogos = {
  pubmed: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="12" fill="#0072BA" />
      <text x="50" y="62" fontSize="48" fontWeight="900" fill="white" textAnchor="middle" fontFamily="Arial, sans-serif">
        P
      </text>
    </svg>
  ),
  semantic_scholar: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#0369A1" />
      <circle cx="30" cy="30" r="14" fill="#EC4899" />
      <circle cx="50" cy="18" r="14" fill="#8B5CF6" />
      <circle cx="70" cy="30" r="14" fill="#06B6D4" />
      <circle cx="38" cy="60" r="14" fill="#10B981" />
      <circle cx="62" cy="60" r="14" fill="#F59E0B" />
      <circle cx="50" cy="82" r="14" fill="#EF4444" />
    </svg>
  ),
  sciencedirect: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#E85C0D" />
      <path d="M 20 50 Q 20 30 35 25 L 65 25 Q 80 30 80 50 Q 80 70 65 75 L 35 75 Q 20 70 20 50" fill="white" />
    </svg>
  ),
  arxiv: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#B91C1C" />
      <text x="50" y="68" fontSize="56" fontWeight="bold" fill="white" textAnchor="middle" fontFamily="Georgia, serif">
        a
      </text>
    </svg>
  ),
  google_scholar: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#4285F4" />
      <path d="M 50 25 L 68 42 L 68 75 Q 50 85 32 75 L 32 42 Z" fill="white" />
      <circle cx="50" cy="38" r="8" fill="#EA4335" />
    </svg>
  ),
  openalex: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#003D82" />
      <path d="M 25 50 L 50 25 L 75 50 L 75 75 L 25 75 Z" fill="white" />
      <text x="50" y="62" fontSize="18" fontWeight="bold" fill="#003D82" textAnchor="middle">
        OA
      </text>
    </svg>
  ),
  crossref: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#159B5E" />
      <line x1="35" y1="35" x2="65" y2="65" stroke="white" strokeWidth="6" />
      <line x1="65" y1="35" x2="35" y2="65" stroke="white" strokeWidth="6" />
    </svg>
  ),
  europepmc: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#D97706" />
      <circle cx="35" cy="50" r="12" fill="none" stroke="white" strokeWidth="4" />
      <circle cx="65" cy="50" r="12" fill="none" stroke="white" strokeWidth="4" />
      <line x1="47" y1="50" x2="53" y2="50" stroke="white" strokeWidth="4" />
    </svg>
  ),
  doaj: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#C8202F" />
      <rect x="35" y="48" width="30" height="26" rx="4" fill="white" />
      <path d="M 40 48 V 38 a 10 10 0 0 1 20 0" fill="none" stroke="white" strokeWidth="5" />
    </svg>
  ),
  alicia: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#0E7490" />
      <text x="50" y="64" textAnchor="middle" fontSize="42" fontWeight="700" fill="white" fontFamily="sans-serif">A</text>
    </svg>
  ),
  dialnet: (
    <svg viewBox="0 0 100 100" width="60" height="60" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" rx="8" fill="#C6001B" />
      <text x="50" y="65" textAnchor="middle" fontSize="36" fontWeight="700" fill="white" fontFamily="sans-serif">D</text>
    </svg>
  ),
};

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
const GREEN = { bg: 'rgba(29, 158, 117, 0.2)', bgHover: 'rgba(29, 158, 117, 0.3)', border: 'var(--green-400)', text: 'var(--green-300)' };
const BLUE = { bg: 'rgba(27, 111, 168, 0.2)', bgHover: 'rgba(27, 111, 168, 0.3)', border: '#4B8FC7', text: '#93C5E6' };
const RED = { bg: 'rgba(163, 56, 32, 0.25)', bgHover: 'rgba(163, 56, 32, 0.35)', border: 'var(--error)', text: '#FCA5A5' };

export default function SearchPage() {
  useAuthProtection();
  const router = useRouter();
  const { t, lang } = useTranslation();
  const searchParams = useSearchParams();
  const { track } = useTracking();

  const [title, setTitle] = useState('');
  const [selectedDatabases, setSelectedDatabases] = useState<Record<string, boolean>>({
    pubmed: true,
    semantic_scholar: true,
    europepmc: true,
    openalex: true,
    crossref: true,
    arxiv: true,
    doaj: true,
    alicia: true,
  });
  const [tokens, setTokens] = useState<Token[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [queryGenerated, setQueryGenerated] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [yearFrom, setYearFrom] = useState<string>('2010');
  const [yearTo, setYearTo] = useState<string>(new Date().getFullYear().toString());
  const [docTypes, setDocTypes] = useState<string[]>([]);
  const [langFilter, setLangFilter] = useState<string[]>([]);
  const [openAccess, setOpenAccess] = useState(false);
  const [peerReviewed, setPeerReviewed] = useState(false);
  const [filtersExpanded, setFiltersExpanded] = useState(false);

  // Load initial title, query, and step from URL parameters
  useEffect(() => {
    const initialTitle = searchParams.get('initialTitle');
    const booleanQueryParam = searchParams.get('booleanQuery');
    const stepParam = searchParams.get('step');

    if (initialTitle) {
      setTitle(decodeURIComponent(initialTitle));
    }
    if (booleanQueryParam) {
      const decoded = decodeURIComponent(booleanQueryParam);
      const parsed = tokenize(decoded);
      setTokens(parsed);
      setQueryGenerated(true);
      if (stepParam === '2') {
        setCurrentStep(2);
      }
    }
  }, [searchParams]);

  // Track page view
  useEffect(() => {
    track('search_page_viewed', { step: currentStep })
  }, []);

  // Generate query manually when user clicks button
  const handleGenerateQuery = async () => {
    if (!title.trim()) {
      setTokens([]);
      setExplanation('');
      return;
    }

    setLoadingQuery(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nlp/generate-query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), lang }),
      });

      if (response.ok) {
        const data = await response.json();
        setTokens(tokenize(data.query || title.trim()));
        setExplanation(data.explanation || '');
        setQueryGenerated(true);
        setCurrentStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setTokens([{ id: newTokenId(), type: 'term', value: title.trim() }]);
        setExplanation('');
        setQueryGenerated(false);
      }
    } catch (error) {
      console.error('Error generating query:', error);
      setTokens([{ id: newTokenId(), type: 'term', value: title.trim() }]);
      setExplanation('');
      setQueryGenerated(false);
    } finally {
      setLoadingQuery(false);
    }
  };

  // Step navigation handlers
  const handleNextStep = () => {
    if (currentStep === 1 && !queryGenerated) {
      alert('Please generate a query first');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep((currentStep + 1) as 1 | 2 | 3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as 1 | 2 | 3);
      if (currentStep === 2) {
        setQueryGenerated(false);
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    // Use explanation from GPT if available
    if (explanation) {
      return explanation;
    }

    // Fallback to local description if no explanation from backend
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

    const queryParams = new URLSearchParams({
      title: title.trim(),
      databases: selectedDbArray.join(','),
      query: finalQuery,
    });

    if (yearFrom) queryParams.set('year_from', yearFrom);
    if (yearTo) queryParams.set('year_to', yearTo);
    if (docTypes.length) queryParams.set('doc_types', docTypes.join(','));
    if (langFilter.length) queryParams.set('lang_filter', langFilter.join(','));
    if (openAccess) queryParams.set('open_access', 'true');
    if (peerReviewed) queryParams.set('peer_reviewed', 'true');

    track('search_initiated', {
      thesis_title: title.trim(),
      databases_selected: selectedDbArray,
      databases_count: selectedDbArray.length,
      query_length: finalQuery.length,
      year_from: yearFrom,
      year_to: yearTo,
      has_filters: !!(docTypes.length || langFilter.length || openAccess || peerReviewed),
    });

    router.push(`/searching?${queryParams.toString()}`);
  };

  const toggleDatabase = (db: string, value: boolean) => {
    setSelectedDatabases((prev) => ({ ...prev, [db]: value }));
  };

  const negated = computeNegation(tokens);
  const canSearch = title.trim() && getFinalQuery().length > 0;

  // Step indicator component
  const StepIndicator = () => (
    <div style={{ background: '#F9FAFB', padding: '20px 48px', borderBottom: '1px solid var(--border)', marginBottom: '40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {([1, 2, 3] as const).map((stepNum) => {
            const isActive = currentStep === stepNum;
            const isCompleted = currentStep > stepNum;
            const labelKey = `search.step.indicator.${stepNum}` as const;

            return (
              <div key={stepNum} style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: isActive || isCompleted ? 'var(--green-500)' : '#E5E7EB',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: '36px',
                  }}
                >
                  {isCompleted ? '✓' : stepNum}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: isActive ? 'var(--green-500)' : 'var(--text-muted)' }}>
                  {t(labelKey)}
                </span>
                {stepNum < 3 && (
                  <div
                    style={{
                      height: '2px',
                      background: isCompleted ? 'var(--green-500)' : '#E5E7EB',
                      flex: 1,
                      marginLeft: '12px',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Thesis Title Header component
  const ThesisTitleHeader = () => {
    if (!title.trim()) return null;
    return (
      <div style={{
        background: '#F9FAFB',
        borderBottom: '1px solid var(--border)',
        padding: '16px 48px',
        marginBottom: '40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <p style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '0.08em' }}>
            {t('search.step2.label')}
          </p>
          <h2 style={{
            fontSize: 'clamp(18px, 2vw, 24px)',
            fontWeight: 600,
            color: 'var(--navy)',
            lineHeight: 1.4,
            margin: 0,
            wordBreak: 'break-word',
          }}>
            {title}
          </h2>
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', paddingTop: '72px', paddingBottom: '100px' }}>
      <StepIndicator />
      <ThesisTitleHeader />

      {/* STEP 1: THESIS TITLE */}
      <div
        style={{
          display: currentStep !== 1 ? 'none' : 'block',
          background: 'linear-gradient(135deg, var(--green-50) 0%, #E8F8F4 100%)',
          borderBottom: '1px solid var(--green-100)',
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
              color: 'var(--green-500)',
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
              color: 'var(--green-900)',
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
              color: 'var(--text-muted)',
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
                color: 'var(--navy)',
                marginBottom: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              {t('search.step2.label')}
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
                border: title.trim() ? '2px solid #1D9E75' : '1.5px solid var(--border)',
                borderRadius: '12px',
                fontFamily: "'DM Sans', sans-serif",
                boxSizing: 'border-box',
                transition: 'all 0.2s',
                background: 'white',
                color: '#1F2937',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--green-500)';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(29, 158, 117, 0.1)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = title.trim() ? 'var(--green-500)' : 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
            {/* Generate Query Button Below Input */}
            <button
              onClick={handleGenerateQuery}
              disabled={!title.trim() || loadingQuery}
              style={{
                marginTop: '16px',
                padding: '12px 32px',
                background: title.trim() && !loadingQuery ? 'var(--green-500)' : 'var(--disabled)',
                border: 'none',
                borderRadius: '8px',
                color: title.trim() && !loadingQuery ? 'white' : 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: title.trim() && !loadingQuery ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: title.trim() && !loadingQuery ? '0 2px 8px rgba(15, 110, 86, 0.3)' : 'none',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                if (title.trim() && !loadingQuery) {
                  e.currentTarget.style.background = 'var(--green-700)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseLeave={(e) => {
                if (title.trim() && !loadingQuery) {
                  e.currentTarget.style.background = 'var(--green-500)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              {loadingQuery ? t('search.button.generating') : t('search.button.generateQuery')}
            </button>
          </div>
        </div>
      </div>

      {/* Query Builder - 3 separate sections */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 48px' }}>
        {/* Block 1: Query Booleana Generada - STEP 2 */}
        <div
          style={{
            display: currentStep !== 2 ? 'none' : 'block',
            background: 'var(--green-900)',
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
              color: 'var(--green-300)',
              marginBottom: '16px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            {t('search.step2.queryTitle')} {loadingQuery && t('search.step2.queryGenerating')}
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
              <span style={{ color: 'var(--green-300)', fontSize: '13px' }}>
                {t('search.step2.empty')}
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
                          border: '1.5px solid var(--error)',
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
                          color: negated[idx] ? '#EF5350' : 'var(--green-400)',
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
                            e.currentTarget.style.background = 'var(--error)';
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
                              background: 'var(--green-400)',
                              border: 'none',
                              borderRadius: '50%',
                              color: 'var(--green-900)',
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
                              background: token.type === 'and' ? 'var(--green-400)' : '#93C5E6',
                              border: 'none',
                              borderRadius: '50%',
                              color: 'var(--green-900)',
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
                color: 'var(--green-300)',
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
                color: 'var(--green-300)',
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
                border: '1px solid var(--error)',
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
                color: 'var(--green-300)',
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

          <p style={{ fontSize: '11px', color: 'var(--green-300)', marginBottom: '0', lineHeight: 1.5, opacity: 0.8 }}>
            💡 {t('search.step2.hint')}
          </p>
        </div>

        {/* Filters - STEP 2 - Collapsed by default */}
        {currentStep === 2 && (
          <div
            style={{
              background: 'var(--green-800)',
              border: '1px solid #0F6E56',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'white', margin: 0 }}>
                🔍 {t('search.filters.title')}
              </p>
              <button
                onClick={() => setFiltersExpanded(!filtersExpanded)}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                }}
              >
                {filtersExpanded ? '▼' : '▶'}
              </button>
            </div>

            {/* Filters Content - Collapsible */}
            <div style={{ display: filtersExpanded ? 'block' : 'none', transition: 'all 0.3s ease' }}>
              {/* Row 1: Year Range */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ fontSize: '13px', color: '#fff', minWidth: '80px' }}>
                  {t('search.filters.year')}:
                </label>
                <input
                  type="number"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  min="1900"
                  max="2100"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #0F6E56',
                    background: '#fff',
                    width: '100px',
                    fontSize: '13px',
                  }}
                  placeholder={t('search.filters.yearFrom')}
                />
                <span style={{ color: '#fff', fontSize: '13px' }}>–</span>
                <input
                  type="number"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  min="1900"
                  max="2100"
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #0F6E56',
                    background: '#fff',
                    width: '100px',
                    fontSize: '13px',
                  }}
                  placeholder={t('search.filters.yearTo')}
                />
              </div>

              {/* Row 2: Document Type */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#fff', marginBottom: '8px', fontWeight: 500 }}>
                  {t('search.filters.docType')}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['article', 'thesis', 'conference-paper', 'book-chapter', 'preprint', 'review'].map((type) => (
                    <button
                      key={type}
                      onClick={() =>
                        setDocTypes((prev) =>
                          prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
                        )
                      }
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: docTypes.includes(type) ? '#0F6E56' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = docTypes.includes(type) ? '#0F6E56' : 'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = docTypes.includes(type) ? '#0F6E56' : 'rgba(255,255,255,0.1)';
                      }}
                    >
                      {t(`filter.type.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Language */}
              <div style={{ marginBottom: '16px' }}>
                <p style={{ fontSize: '13px', color: '#fff', marginBottom: '8px', fontWeight: 500 }}>
                  {t('search.filters.language')}
                </p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['en', 'es', 'pt', 'fr', 'de'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() =>
                        setLangFilter((prev) =>
                          prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
                        )
                      }
                      style={{
                        padding: '6px 12px',
                        borderRadius: '20px',
                        border: 'none',
                        background: langFilter.includes(lang) ? '#0F6E56' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = langFilter.includes(lang)
                          ? '#0F6E56'
                          : 'rgba(255,255,255,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = langFilter.includes(lang)
                          ? '#0F6E56'
                          : 'rgba(255,255,255,0.1)';
                      }}
                    >
                      {t(`filter.lang.${lang}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 4: Toggles */}
              <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={openAccess}
                    onChange={(e) => setOpenAccess(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#fff', fontSize: '13px' }}>{t('search.filters.openAccess')}</span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={peerReviewed}
                    onChange={(e) => setPeerReviewed(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  <span style={{ color: '#fff', fontSize: '13px' }}>{t('search.filters.peerReviewed')}</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Block 2: Query Ejecutará + Lenguaje Natural - STEP 2 */}
        <div
          style={{
            display: currentStep !== 2 ? 'none' : 'block',
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
              border: '1px solid var(--green-100)',
              borderRadius: '8px',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '12px',
              lineHeight: 1.6,
              color: 'var(--green-900)',
              wordBreak: 'break-word',
            }}
          >
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '11px', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
              {t('search.step2.queryWillExecute')}
            </p>
            <p style={{ margin: 0, color: 'var(--green-900)', fontWeight: 600 }}>
              {getFinalQuery() || '(ingresa términos para generar query)'}
            </p>
          </div>

          {/* Active Filters Display */}
          {(yearFrom || yearTo || docTypes.length > 0 || langFilter.length > 0 || openAccess || peerReviewed) && (
            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {(yearFrom || yearTo) && (
                <span
                  style={{
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: 'var(--green-700)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  📅 {yearFrom}–{yearTo}
                </span>
              )}
              {docTypes.map((type) => (
                <span
                  key={type}
                  style={{
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: 'var(--green-700)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  📄 {t(`filter.type.${type}`)}
                </span>
              ))}
              {langFilter.map((lang) => (
                <span
                  key={lang}
                  style={{
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: 'var(--green-700)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  🌐 {t(`filter.lang.${lang}`)}
                </span>
              ))}
              {openAccess && (
                <span
                  style={{
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: 'var(--green-700)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  🔓 {t('search.filters.openAccess')}
                </span>
              )}
              {peerReviewed && (
                <span
                  style={{
                    background: 'rgba(29, 158, 117, 0.1)',
                    color: 'var(--green-700)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                  }}
                >
                  ✓ {t('search.filters.peerReviewed')}
                </span>
              )}
            </div>
          )}

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
              💬 <strong style={{ color: '#D97706' }}>{t('search.step2.naturalLanguage')}</strong>{' '}
              {getNaturalDescription()}
            </div>
          )}
        </div>

        {/* Block 3: Databases Selection - Premium Gallery View - STEP 3 */}
        <div
          style={{
            display: currentStep !== 3 ? 'none' : 'block',
            background: 'linear-gradient(135deg, var(--green-50) 0%, var(--green-100) 100%)',
            border: 'none',
            borderRadius: '16px',
            padding: '48px 40px',
            marginBottom: '40px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative corner accent */}
          <div
            style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '200px',
              height: '200px',
              background: 'rgba(29, 158, 117, 0.05)',
              borderRadius: '50%',
              pointerEvents: 'none',
            }}
          />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <h3
              style={{
                fontSize: '28px',
                fontWeight: 700,
                color: 'var(--navy)',
                marginBottom: '32px',
                margin: '0 0 32px 0',
                letterSpacing: '-0.5px',
              }}
            >
              {t('search.step3.selectDatabases')}
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '24px',
              }}
            >
            {[
              { id: 'pubmed', label: 'PubMed', descKey: 'search.db.pubmed.desc', available: true },
              { id: 'semantic_scholar', label: 'Semantic Scholar', descKey: 'search.db.semantic_scholar.desc', available: true },
              { id: 'europepmc', label: 'Europe PMC', descKey: 'search.db.europepmc.desc', available: true },
              { id: 'openalex', label: 'OpenAlex', descKey: 'search.db.openalex.desc', available: true },
              { id: 'crossref', label: 'Crossref', descKey: 'search.db.crossref.desc', available: true },
              { id: 'arxiv', label: 'arXiv', descKey: 'search.db.arxiv.desc', available: true },
              { id: 'doaj', label: 'DOAJ', descKey: 'search.db.doaj.desc', available: true },
              { id: 'alicia', label: 'ALICIA', descKey: 'search.db.alicia.desc', available: true },
              { id: 'dialnet', label: 'Dialnet', descKey: 'search.db.dialnet.desc', available: false },
              { id: 'sciencedirect', label: 'ScienceDirect', descKey: 'search.db.sciencedirect.desc', available: false },
              { id: 'google_scholar', label: 'Google Scholar', descKey: 'search.db.google_scholar.desc', available: false },
            ].map((db) => {
              const isSelected = selectedDatabases[db.id];
              const logoMap: Record<string, React.ReactNode> = {
                pubmed: DatabaseLogos.pubmed,
                semantic_scholar: DatabaseLogos.semantic_scholar,
                europepmc: DatabaseLogos.europepmc,
                openalex: DatabaseLogos.openalex,
                crossref: DatabaseLogos.crossref,
                arxiv: DatabaseLogos.arxiv,
                doaj: DatabaseLogos.doaj,
                alicia: DatabaseLogos.alicia,
                dialnet: DatabaseLogos.dialnet,
                sciencedirect: DatabaseLogos.sciencedirect,
                google_scholar: DatabaseLogos.google_scholar,
              };
              return (
                <label
                  key={db.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px',
                    cursor: db.available ? 'pointer' : 'not-allowed',
                    padding: '32px 28px',
                    borderRadius: '14px',
                    border: isSelected ? '2px solid #1D9E75' : db.available ? '2px solid var(--green-100)' : '2px solid #FECDD3',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: isSelected ? '#FFFFFF' : db.available ? '#FFFFFF' : '#FEF2F2',
                    boxShadow: isSelected
                      ? '0 8px 16px rgba(29, 158, 117, 0.12)'
                      : db.available ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                    textAlign: 'center',
                    filter: isSelected ? 'grayscale(0%)' : 'grayscale(100%)',
                    opacity: isSelected ? 1 : db.available ? 0.65 : 0.5,
                    position: 'relative',
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected && db.available) {
                      e.currentTarget.style.boxShadow = '0 12px 24px rgba(29, 158, 117, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected && db.available) {
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.opacity = '0.65';
                    }
                  }}
                >
                  {/* Premium Badge */}
                  {!db.available && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'var(--error)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '9px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Premium
                    </div>
                  )}

                  {/* Logo/Icon */}
                  <div style={{ lineHeight: 1, transform: isSelected ? 'scale(1.05)' : 'scale(1)', transition: 'transform 0.3s' }}>
                    {logoMap[db.id] || db.id}
                  </div>

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    disabled={!db.available}
                    checked={isSelected}
                    onChange={(e) => {
                      if (db.available) {
                        toggleDatabase(db.id, e.target.checked);
                      }
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      cursor: db.available ? 'pointer' : 'not-allowed',
                      accentColor: 'var(--green-500)',
                      opacity: db.available ? 1 : 0.5,
                    }}
                  />

                  {/* Label */}
                  <div style={{ width: '100%' }}>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isSelected ? 'var(--green-700)' : db.available ? 'var(--navy)' : '#A1A1A1',
                        marginBottom: '6px',
                      }}
                    >
                      {db.label}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: isSelected ? 'var(--green-500)' : db.available ? 'var(--text-muted)' : 'var(--disabled)',
                        lineHeight: 1.5,
                      }}
                    >
                      {db.available ? t(db.descKey) : 'Disponible con pago'}
                    </div>
                  </div>
                </label>
              );
            })}
            </div>
          </div>
        </div>

      </div>

      {/* Fixed bottom action bar — steps 2 & 3 */}
      {currentStep > 1 && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            borderTop: '1px solid var(--border)',
            boxShadow: '0 -4px 20px rgba(15, 110, 86, 0.06)',
          }}
        >
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '12px clamp(16px, 4vw, 48px)',
              minHeight: '72px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {/* Back — de-emphasized ghost link */}
            <button
              onClick={handlePreviousStep}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                minHeight: '44px',
                padding: '10px 16px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'color 0.15s',
                fontFamily: "'DM Sans', sans-serif",
                borderRadius: '8px',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--navy)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              {t('search.button.back')}
            </button>

            {/* Primary action — Next (step 2) / Execute (step 3) */}
            {currentStep === 2 && (
              <button
                onClick={handleNextStep}
                style={{
                  minHeight: '44px',
                  padding: '12px 36px',
                  background: 'var(--green-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: '0 2px 8px rgba(15, 110, 86, 0.3)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--green-700)';
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--green-500)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
                }}
              >
                {t('search.button.next')}
              </button>
            )}
            {currentStep === 3 && (
              <button
                onClick={handleSearch}
                disabled={!canSearch}
                style={{
                  minHeight: '44px',
                  padding: '12px 36px',
                  background: canSearch ? 'var(--green-500)' : 'var(--disabled)',
                  color: canSearch ? 'white' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: canSearch ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  fontFamily: "'DM Sans', sans-serif",
                  boxShadow: canSearch ? '0 2px 8px rgba(15, 110, 86, 0.3)' : 'none',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (canSearch) {
                    e.currentTarget.style.background = 'var(--green-700)';
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(15, 110, 86, 0.12)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (canSearch) {
                    e.currentTarget.style.background = 'var(--green-500)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(15, 110, 86, 0.3)';
                  }
                }}
              >
                {t('search.button.execute')}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
