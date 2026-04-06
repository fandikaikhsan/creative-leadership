'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ALL_CARDS,
  CATEGORIES,
  Category,
  ClueCard,
  GameConnection,
  GameState,
  RoundResult,
  calculateScore,
} from '@/lib/gameData';
import { loadGameState, saveGameState } from '@/lib/gameStore';

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function ClueCardView({
  card,
  selected,
  disabled,
  onClick,
}: {
  card: ClueCard;
  selected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const base =
    'relative flex flex-col items-center justify-center rounded-xl p-2 cursor-pointer card-hover select-none border-2 transition-all duration-150 min-h-[72px]';

  if (card.type === 'color') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} ${selected ? 'card-selected border-purple-400' : 'border-transparent'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
        style={{ backgroundColor: card.color + '33', borderColor: selected ? '#a855f7' : card.color + '66' }}
      >
        <div className="w-8 h-8 rounded-full border-2 border-white/30 mb-1" style={{ backgroundColor: card.color }} />
        <span className="text-xs font-bold text-white/90">{card.display}</span>
        {selected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
      </button>
    );
  }

  if (card.type === 'emoji') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${base} bg-amber-900/30 ${selected ? 'card-selected border-purple-400' : 'border-amber-700/40'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        <span className="text-3xl mb-1">{card.display}</span>
        {selected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} bg-green-900/30 ${selected ? 'card-selected border-purple-400' : 'border-green-700/40'} ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      <span className="text-xs font-black text-green-300 tracking-wide">{card.display}</span>
      {selected && <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-white text-[10px]">✓</div>}
    </button>
  );
}

function Timer({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [remaining, setRemaining] = useState(seconds);
  const endRef = useRef(onEnd);
  endRef.current = onEnd;

  useEffect(() => {
    if (remaining <= 0) {
      endRef.current();
      return;
    }
    const id = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(id);
  }, [remaining]);

  const pct = (remaining / seconds) * 100;
  const warning = remaining <= 30;
  const critical = remaining <= 10;

  const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
  const secs = (remaining % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`text-3xl font-black tabular-nums ${critical ? 'timer-warning text-red-400' : warning ? 'text-orange-400' : 'text-white'}`}>
        {mins}:{secs}
      </div>
      <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${critical ? 'bg-red-500' : warning ? 'bg-orange-400' : 'bg-green-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Phase: Category Selection
// ─────────────────────────────────────────────
function CategorySelect({
  teamName,
  usedCategories,
  onSelect,
}: {
  teamName: string;
  usedCategories: string[];
  onSelect: (c: Category) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-3xl font-black text-purple-300 mb-1">{teamName}</h2>
        <p className="text-purple-400 mb-8">Pick your category for this round</p>
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const used = usedCategories.includes(cat.name);
            return (
              <button
                key={cat.name}
                onClick={() => !used && onSelect(cat)}
                disabled={used}
                className={`w-full py-5 rounded-2xl font-bold text-lg border-2 transition-all ${
                  used
                    ? 'border-white/10 bg-white/5 text-white/30 cursor-not-allowed'
                    : 'border-purple-500/50 bg-purple-900/40 text-white hover:border-purple-400 hover:bg-purple-800/50 hover:scale-[1.02]'
                }`}
              >
                {cat.name === 'Superheroes' && '🦸 '}
                {cat.name === 'Harry Potter' && '⚡ '}
                {cat.name === 'Disney' && '🏰 '}
                {cat.name}
                {used && <span className="ml-2 text-sm">(used)</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Phase: Active Game Round
// ─────────────────────────────────────────────
function ActiveRound({
  teamName,
  category,
  onRoundEnd,
}: {
  teamName: string;
  category: Category;
  onRoundEnd: (connections: GameConnection[]) => void;
}) {
  const [selectedCards, setSelectedCards] = useState<ClueCard[]>([]);
  const [completedConnections, setCompletedConnections] = useState<GameConnection[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [roundEnded, setRoundEnded] = useState(false);

  const usedCardIds = completedConnections.flatMap((c) => c.cards.map((cd) => cd.id));

  const pendingScore = calculateScore(selectedCards, true);
  const pendingPenalty = selectedCards.length > 2
    ? selectedCards.slice(2).reduce((s, c) => s + (c.type === 'color' ? 2 : c.type === 'emoji' ? 4 : 5), 0)
    : 0;

  function toggleCard(card: ClueCard) {
    if (usedCardIds.includes(card.id)) return;
    setSelectedCards((prev) =>
      prev.find((c) => c.id === card.id)
        ? prev.filter((c) => c.id !== card.id)
        : [...prev, card]
    );
  }

  function markGuessed() {
    if (selectedCards.length === 0) return;
    const score = calculateScore(selectedCards, true);
    setCompletedConnections((prev) => [...prev, { cards: selectedCards, guessed: true, score }]);
    setSelectedCards([]);
  }

  function markMissed() {
    if (selectedCards.length === 0) return;
    const score = calculateScore(selectedCards, false);
    setCompletedConnections((prev) => [...prev, { cards: selectedCards, guessed: false, score }]);
    setSelectedCards([]);
  }

  function endRound() {
    setRoundEnded(true);
    onRoundEnd(completedConnections);
  }

  const totalScore = completedConnections.reduce((s, c) => s + c.score, 0);

  if (!timerActive) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
        <div className="max-w-md w-full text-center">
          <div className="text-5xl mb-4">🎯</div>
          <h2 className="text-2xl font-black text-purple-300 mb-2">{teamName}&apos;s Turn</h2>
          <div className="bg-purple-900/40 border border-purple-500/30 rounded-2xl p-6 mb-8">
            <div className="text-4xl mb-2">
              {category.name === 'Superheroes' && '🦸'}
              {category.name === 'Harry Potter' && '⚡'}
              {category.name === 'Disney' && '🏰'}
            </div>
            <div className="text-2xl font-black text-white mb-3">{category.name}</div>
            <div className="text-sm text-purple-300 space-y-1 text-left">
              <p>• Rep picks clue cards to form <strong>connections</strong></p>
              <p>• Team guesses the answer — rep stays silent!</p>
              <p>• 2 minutes on the clock</p>
            </div>
          </div>
          <button
            onClick={() => setTimerActive(true)}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-black text-xl px-10 py-4 rounded-full transition-all hover:scale-105 shadow-lg"
          >
            Start Timer ⏱️
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen px-3 py-4 max-w-2xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="text-xs text-purple-400">Playing</div>
          <div className="font-black text-white text-lg">{teamName}</div>
          <div className="text-sm text-purple-300">{category.name}</div>
        </div>
        <Timer seconds={120} onEnd={() => !roundEnded && endRound()} />
        <div className="text-right">
          <div className="text-xs text-purple-400">Score</div>
          <div className="text-2xl font-black text-yellow-400">{totalScore}</div>
        </div>
      </div>

      {/* Selected cards staging area */}
      <div className="bg-white/5 border border-purple-500/30 rounded-xl p-3 mb-3 min-h-[90px]">
        <div className="text-xs text-purple-400 mb-2 font-medium">Current Connection ({selectedCards.length} cards{selectedCards.length > 2 ? ` · -${pendingPenalty} penalty` : ' · free'})</div>
        {selectedCards.length === 0 ? (
          <p className="text-purple-600 text-sm italic">Select cards below to build a connection…</p>
        ) : (
          <div className="flex flex-wrap gap-2 items-center">
            {selectedCards.map((card) => (
              <span
                key={card.id}
                className="inline-flex items-center gap-1 bg-purple-800/60 border border-purple-500/60 rounded-lg px-2 py-1 text-sm cursor-pointer hover:bg-red-900/40 hover:border-red-500/60 transition-colors"
                onClick={() => toggleCard(card)}
                title="Click to remove"
              >
                {card.type === 'color' && <span className="w-3 h-3 rounded-full inline-block border border-white/20" style={{ backgroundColor: card.color }} />}
                {card.display}
                <span className="text-white/40 text-xs">×</span>
              </span>
            ))}
            <div className="ml-auto flex gap-2">
              <button
                onClick={markGuessed}
                className="bg-green-600/80 hover:bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                ✓ Guessed! (+{pendingScore})
              </button>
              <button
                onClick={markMissed}
                className="bg-red-800/60 hover:bg-red-700/80 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
              >
                ✗ Missed ({calculateScore(selectedCards, false)})
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Completed connections */}
      {completedConnections.length > 0 && (
        <div className="mb-3 space-y-1">
          {completedConnections.map((conn, i) => (
            <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm border ${conn.guessed ? 'bg-green-900/20 border-green-700/30' : 'bg-red-900/20 border-red-700/30'}`}>
              <span className="text-lg">{conn.guessed ? '✅' : '❌'}</span>
              <div className="flex flex-wrap gap-1 flex-1">
                {conn.cards.map((c, j) => (
                  <span key={j} className="text-white/80">
                    {c.type === 'color' && <span className="inline-block w-2.5 h-2.5 rounded-full mr-0.5 border border-white/20" style={{ backgroundColor: c.color }} />}
                    {c.display}
                    {j < conn.cards.length - 1 && ' +'}
                  </span>
                ))}
              </div>
              <span className={`font-bold ${conn.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>{conn.score > 0 ? '+' : ''}{conn.score}</span>
            </div>
          ))}
        </div>
      )}

      {/* Clue cards grid */}
      <div className="flex-1 overflow-y-auto">
        {/* Colors */}
        <div className="mb-3">
          <div className="text-xs text-pink-400 font-bold uppercase tracking-wider mb-2">🎨 Color Cards (-2/extra)</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {ALL_CARDS.filter(c => c.type === 'color').map((card) => (
              <ClueCardView
                key={card.id}
                card={card}
                selected={selectedCards.some((c) => c.id === card.id)}
                disabled={usedCardIds.includes(card.id)}
                onClick={() => toggleCard(card)}
              />
            ))}
          </div>
        </div>
        {/* Emojis */}
        <div className="mb-3">
          <div className="text-xs text-amber-400 font-bold uppercase tracking-wider mb-2">😊 Emoji Cards (-4/extra)</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
            {ALL_CARDS.filter(c => c.type === 'emoji').map((card) => (
              <ClueCardView
                key={card.id}
                card={card}
                selected={selectedCards.some((c) => c.id === card.id)}
                disabled={usedCardIds.includes(card.id)}
                onClick={() => toggleCard(card)}
              />
            ))}
          </div>
        </div>
        {/* Words */}
        <div className="mb-3">
          <div className="text-xs text-green-400 font-bold uppercase tracking-wider mb-2">📝 Word Cards (-5/extra)</div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
            {ALL_CARDS.filter(c => c.type === 'word').map((card) => (
              <ClueCardView
                key={card.id}
                card={card}
                selected={selectedCards.some((c) => c.id === card.id)}
                disabled={usedCardIds.includes(card.id)}
                onClick={() => toggleCard(card)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* End round button */}
      <button
        onClick={endRound}
        className="mt-3 w-full bg-purple-800/60 hover:bg-purple-700/80 border border-purple-500/40 text-white font-bold py-3 rounded-xl transition-colors"
      >
        End Round Early
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Phase: Round End Summary
// ─────────────────────────────────────────────
function RoundEnd({
  result,
  state,
  onNext,
}: {
  result: RoundResult;
  state: GameState;
  onNext: () => void;
}) {
  const isLastRound =
    state.roundResults.length >= state.totalRounds * 2;

  const teamScores = [0, 1].map((ti) =>
    state.roundResults
      .filter((r) => r.teamIndex === ti)
      .reduce((s, r) => s + r.totalScore, 0)
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🏁</div>
          <h2 className="text-3xl font-black text-purple-300">Round Complete!</h2>
          <p className="text-purple-400">{result.category} — {state.teamNames[result.teamIndex]}</p>
        </div>

        {/* Connections recap */}
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-4 mb-4">
          <h3 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">Connections</h3>
          {result.connections.length === 0 ? (
            <p className="text-purple-500 text-sm italic">No connections were made.</p>
          ) : (
            <div className="space-y-2">
              {result.connections.map((conn, i) => (
                <div key={i} className={`flex items-center gap-2 rounded-lg px-3 py-2 border ${conn.guessed ? 'bg-green-900/20 border-green-700/30' : 'bg-red-900/20 border-red-700/30'}`}>
                  <span>{conn.guessed ? '✅' : '❌'}</span>
                  <div className="flex flex-wrap gap-1 flex-1 text-sm text-white/80">
                    {conn.cards.map((c, j) => (
                      <span key={j}>
                        {c.type === 'color' && <span className="inline-block w-2.5 h-2.5 rounded-full mr-0.5" style={{ backgroundColor: c.color }} />}
                        {c.display}{j < conn.cards.length - 1 ? ' +' : ''}
                      </span>
                    ))}
                  </div>
                  <span className={`font-bold text-sm ${conn.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {conn.score > 0 ? '+' : ''}{conn.score}
                  </span>
                </div>
              ))}
            </div>
          )}
          <div className="mt-3 pt-3 border-t border-white/10 flex justify-between">
            <span className="text-purple-300 font-medium">Round Total</span>
            <span className={`font-black text-xl ${result.totalScore >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              {result.totalScore > 0 ? '+' : ''}{result.totalScore} pts
            </span>
          </div>
        </div>

        {/* Scoreboard */}
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-4 mb-6">
          <h3 className="text-sm font-bold text-purple-300 mb-3 uppercase tracking-wider">Scoreboard</h3>
          <div className="space-y-2">
            {state.teamNames.map((name, ti) => (
              <div key={ti} className="flex items-center justify-between">
                <span className="text-white font-medium">{name}</span>
                <span className="text-yellow-400 font-black text-lg">{teamScores[ti]} pts</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg"
        >
          {isLastRound ? 'See Final Results 🏆' : 'Next Team\'s Turn →'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Main Game Page
// ─────────────────────────────────────────────
export default function GamePage() {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [showRoundEnd, setShowRoundEnd] = useState(false);

  useEffect(() => {
    const s = loadGameState();
    if (!s) { router.replace('/'); return; }
    setState(s);
  }, [router]);

  const usedCategories = state?.roundResults
    .filter((r) => r.teamIndex === state.currentTeam)
    .map((r) => r.category) ?? [];

  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    setState((prev) => prev ? { ...prev, phase: 'game' } : prev);
  }, []);

  const handleRoundEnd = useCallback((connections: GameConnection[]) => {
    if (!state || !selectedCategory) return;

    const totalScore = connections.reduce((s, c) => s + c.score, 0);
    const result: RoundResult = {
      teamIndex: state.currentTeam,
      category: selectedCategory.name,
      connections,
      totalScore,
    };

    const newResults = [...state.roundResults, result];
    const isGameOver = newResults.length >= state.totalRounds * 2;

    const nextTeam = (state.currentTeam + 1) % 2;
    const nextRound = nextTeam === 0 ? state.currentRound + 1 : state.currentRound;

    const newState: GameState = {
      ...state,
      roundResults: newResults,
      currentTeam: nextTeam,
      currentRound: nextRound,
      phase: isGameOver ? 'results' : 'round-end',
    };

    saveGameState(newState);
    setState(newState);
    setLastResult(result);
    setShowRoundEnd(true);
  }, [state, selectedCategory]);

  const handleNextAfterRound = useCallback(() => {
    if (!state) return;
    if (state.phase === 'results') {
      router.push('/results');
      return;
    }
    setShowRoundEnd(false);
    setSelectedCategory(null);
    setState((prev) => prev ? { ...prev, phase: 'category-select' } : prev);
  }, [state, router]);

  if (!state) return (
    <div className="flex items-center justify-center min-h-screen text-purple-400">Loading…</div>
  );

  if (showRoundEnd && lastResult) {
    return <RoundEnd result={lastResult} state={state} onNext={handleNextAfterRound} />;
  }

  if (state.phase === 'category-select' || !selectedCategory) {
    return (
      <div>
        <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-sm border-b border-purple-900/50 px-4 py-2 flex justify-between items-center text-sm">
          <span className="text-purple-300">Round <strong className="text-white">{state.currentRound}</strong> of <strong className="text-white">{state.totalRounds}</strong></span>
          <span className="text-purple-300">
            {state.teamNames.map((n, i) => (
              <span key={i} className={i === state.currentTeam ? 'text-yellow-400 font-bold' : 'text-purple-500'}>
                {i > 0 && ' · '}{n}
              </span>
            ))}
          </span>
        </div>
        <CategorySelect
          teamName={state.teamNames[state.currentTeam]}
          usedCategories={usedCategories}
          onSelect={handleCategorySelect}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-black/60 backdrop-blur-sm border-b border-purple-900/50 px-4 py-2 flex justify-between items-center text-sm">
        <span className="text-purple-300">Round <strong className="text-white">{state.currentRound}</strong> of <strong className="text-white">{state.totalRounds}</strong></span>
        <span className="text-purple-300">
          {state.teamNames.map((n, i) => (
            <span key={i} className={i === state.currentTeam ? 'text-yellow-400 font-bold' : 'text-purple-500'}>
              {i > 0 && ' · '}{n}
            </span>
          ))}
        </span>
      </div>
      <ActiveRound
        teamName={state.teamNames[state.currentTeam]}
        category={selectedCategory}
        onRoundEnd={handleRoundEnd}
      />
    </div>
  );
}
