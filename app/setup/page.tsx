'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveGameState } from '@/lib/gameStore';
import { GameState } from '@/lib/gameData';

export default function SetupPage() {
  const router = useRouter();
  const [team1, setTeam1] = useState('Team 1');
  const [team2, setTeam2] = useState('Team 2');
  const [rounds, setRounds] = useState<3 | 5>(3);

  function startGame() {
    const state: GameState = {
      teamNames: [team1.trim() || 'Team 1', team2.trim() || 'Team 2'],
      totalRounds: rounds,
      currentRound: 1,
      currentTeam: 0,
      roundResults: [],
      phase: 'category-select',
    };
    saveGameState(state);
    router.push('/game');
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="text-5xl mb-2">🎮</div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Game Setup
          </h1>
        </div>

        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm space-y-6">
          {/* Team Names */}
          <div>
            <h2 className="text-purple-300 font-bold mb-3">Team Names</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-purple-400 mb-1 block">Team 1</label>
                <input
                  type="text"
                  value={team1}
                  onChange={(e) => setTeam1(e.target.value)}
                  maxLength={20}
                  className="w-full bg-purple-900/40 border border-purple-500/40 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Team 1"
                />
              </div>
              <div>
                <label className="text-sm text-purple-400 mb-1 block">Team 2</label>
                <input
                  type="text"
                  value={team2}
                  onChange={(e) => setTeam2(e.target.value)}
                  maxLength={20}
                  className="w-full bg-purple-900/40 border border-purple-500/40 rounded-xl px-4 py-3 text-white placeholder-purple-500 focus:outline-none focus:border-purple-400 transition-colors"
                  placeholder="Team 2"
                />
              </div>
            </div>
          </div>

          {/* Rounds */}
          <div>
            <h2 className="text-purple-300 font-bold mb-3">Rounds per Team</h2>
            <div className="grid grid-cols-2 gap-3">
              {([3, 5] as const).map((r) => (
                <button
                  key={r}
                  onClick={() => setRounds(r)}
                  className={`py-4 rounded-xl font-black text-2xl border-2 transition-all ${
                    rounds === r
                      ? 'border-purple-400 bg-purple-600/50 text-white shadow-lg shadow-purple-500/30'
                      : 'border-purple-700/40 bg-purple-900/20 text-purple-400 hover:border-purple-500/60'
                  }`}
                >
                  {r}
                  <span className="text-sm font-normal block text-purple-300">rounds</span>
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="bg-purple-900/30 rounded-xl p-4 border border-purple-700/30">
            <div className="text-sm text-purple-300 space-y-1">
              <div className="flex justify-between">
                <span>Teams:</span>
                <span className="text-white font-medium">{team1.trim() || 'Team 1'} vs {team2.trim() || 'Team 2'}</span>
              </div>
              <div className="flex justify-between">
                <span>Total rounds:</span>
                <span className="text-white font-medium">{rounds * 2} ({rounds} each)</span>
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-lg py-4 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-lg"
          >
            Let&apos;s Play! 🎉
          </button>
        </div>
      </div>
    </main>
  );
}
