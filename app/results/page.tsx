'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { loadGameState, clearGameState } from '@/lib/gameStore';
import { GameState, CATEGORIES } from '@/lib/gameData';
import Link from 'next/link';

export default function ResultsPage() {
  const router = useRouter();
  const [state, setState] = useState<GameState | null>(null);

  useEffect(() => {
    const s = loadGameState();
    if (!s) { router.replace('/'); return; }
    setState(s);
  }, [router]);

  if (!state) return (
    <div className="flex items-center justify-center min-h-screen text-purple-400">Loading…</div>
  );

  const teamScores = [0, 1].map((ti) =>
    state.roundResults
      .filter((r) => r.teamIndex === ti)
      .reduce((s, r) => s + r.totalScore, 0)
  );

  const winner =
    teamScores[0] > teamScores[1] ? 0
    : teamScores[1] > teamScores[0] ? 1
    : -1; // tie

  const roundsByTeam = [0, 1].map((ti) =>
    state.roundResults.filter((r) => r.teamIndex === ti)
  );

  return (
    <main className="min-h-screen px-4 py-12 flex flex-col items-center">
      <div className="max-w-xl w-full">
        {/* Winner banner */}
        <div className="text-center mb-8">
          {winner === -1 ? (
            <>
              <div className="text-6xl mb-3">🤝</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                It&apos;s a Tie!
              </h1>
              <p className="text-purple-300 mt-2">Both teams scored {teamScores[0]} points — amazing!</p>
            </>
          ) : (
            <>
              <div className="text-6xl mb-3">🏆</div>
              <h1 className="text-4xl font-black bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                {state.teamNames[winner]} Wins!
              </h1>
              <p className="text-purple-300 mt-2">
                {teamScores[winner]} pts vs {teamScores[1 - winner]} pts
              </p>
            </>
          )}
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {state.teamNames.map((name, ti) => (
            <div
              key={ti}
              className={`rounded-2xl p-5 text-center border-2 ${
                ti === winner
                  ? 'border-yellow-400/60 bg-yellow-900/20'
                  : 'border-purple-500/30 bg-white/5'
              }`}
            >
              {ti === winner && <div className="text-2xl mb-1">👑</div>}
              <div className="font-bold text-purple-200 mb-1">{name}</div>
              <div className="text-4xl font-black text-yellow-400">{teamScores[ti]}</div>
              <div className="text-purple-400 text-xs mt-1">points</div>
            </div>
          ))}
        </div>

        {/* Round-by-round breakdown */}
        {[0, 1].map((ti) => (
          <div key={ti} className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-4">
            <h2 className="text-purple-300 font-bold mb-3 flex items-center gap-2">
              {ti === winner && <span>👑</span>}
              {state.teamNames[ti]}
              <span className="ml-auto text-yellow-400 font-black">{teamScores[ti]} pts</span>
            </h2>
            {roundsByTeam[ti].map((round, ri) => (
              <div key={ri} className="mb-3 last:mb-0">
                <div className="text-sm text-purple-400 font-medium mb-1">
                  Round {ri + 1} — {round.category}
                  <span className={`ml-2 font-bold ${round.totalScore >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {round.totalScore > 0 ? '+' : ''}{round.totalScore} pts
                  </span>
                </div>
                <div className="space-y-1">
                  {round.connections.map((conn, ci) => (
                    <div key={ci} className="flex items-center gap-2 text-xs">
                      <span>{conn.guessed ? '✅' : '❌'}</span>
                      <span className="text-white/60">
                        {conn.cards.map((c, j) => (
                          <span key={j}>
                            {c.type === 'color' && <span className="inline-block w-2 h-2 rounded-full mr-0.5" style={{ backgroundColor: c.color }} />}
                            {c.display}{j < conn.cards.length - 1 ? ' + ' : ''}
                          </span>
                        ))}
                      </span>
                      <span className={`ml-auto font-bold ${conn.score >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {conn.score > 0 ? '+' : ''}{conn.score}
                      </span>
                    </div>
                  ))}
                  {round.connections.length === 0 && (
                    <div className="text-xs text-purple-600 italic">No connections made</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}

        {/* Clue hints (reference) */}
        <details className="bg-white/5 border border-purple-500/20 rounded-2xl p-4 mb-6 cursor-pointer">
          <summary className="text-purple-300 font-bold select-none">📖 Reference: Category Connections</summary>
          <div className="mt-4 space-y-4">
            {state.roundResults
              .map((r) => r.category)
              .filter((v, i, a) => a.indexOf(v) === i)
              .map((catName) => {
                const cat = CATEGORIES.find((c) => c.name === catName);
                if (!cat) return null;
                return (
                  <div key={catName}>
                    <div className="text-sm font-bold text-purple-200 mb-2">{catName}</div>
                    <div className="space-y-1">
                      {cat.connections.slice(0, 8).map((conn, i) => (
                        <div key={i} className="text-xs flex gap-2 text-white/60">
                          <span className="font-medium text-white/80 min-w-[100px]">{conn.answer}</span>
                          <span>{conn.clues.join(' + ')}</span>
                          <span className="text-purple-500 ml-auto">{conn.logic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        </details>

        {/* Actions */}
        <div className="flex gap-3">
          <Link
            href="/setup"
            onClick={() => clearGameState()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-center py-4 rounded-xl transition-all hover:scale-[1.02] shadow-lg"
          >
            Play Again 🔄
          </Link>
          <Link
            href="/"
            onClick={() => clearGameState()}
            className="flex-1 bg-white/5 hover:bg-white/10 border border-purple-500/30 text-purple-300 font-bold text-center py-4 rounded-xl transition-all"
          >
            Home 🏠
          </Link>
        </div>
      </div>
    </main>
  );
}
