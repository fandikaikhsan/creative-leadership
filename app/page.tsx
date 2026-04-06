'use client';

import Link from 'next/link';
import { clearGameState } from '@/lib/gameStore';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="text-7xl mb-4">🎨</div>
        <h1 className="text-6xl font-black mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
          Hue&apos;s Who
        </h1>
        <p className="text-purple-300 text-xl font-medium mt-2">
          The creative clue-card guessing game
        </p>
      </div>

      {/* How to Play */}
      <div className="max-w-2xl w-full mb-10">
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-purple-300 mb-4 text-center">How to Play</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-purple-900/40 rounded-xl p-4 text-center border border-purple-500/20">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm font-semibold text-purple-200">Two Teams</div>
              <div className="text-xs text-purple-400 mt-1">Compete against each other</div>
            </div>
            <div className="bg-purple-900/40 rounded-xl p-4 text-center border border-purple-500/20">
              <div className="text-3xl mb-2">⏱️</div>
              <div className="text-sm font-semibold text-purple-200">2 Minutes</div>
              <div className="text-xs text-purple-400 mt-1">Race to guess connections</div>
            </div>
            <div className="bg-purple-900/40 rounded-xl p-4 text-center border border-purple-500/20">
              <div className="text-3xl mb-2">🃏</div>
              <div className="text-sm font-semibold text-purple-200">3 Card Types</div>
              <div className="text-xs text-purple-400 mt-1">Color, Emoji, and Word clues</div>
            </div>
          </div>

          <div className="space-y-2 text-sm text-purple-200">
            <p><span className="text-yellow-400 font-bold">Rep picks</span> clue cards and groups them as connections — no talking or gestures!</p>
            <p><span className="text-green-400 font-bold">Team guesses</span> the character/answer from the clue combo.</p>
            <p><span className="text-pink-400 font-bold">Score 10pts</span> per correct guess. Extra cards (3rd+) add penalties.</p>
          </div>
        </div>
      </div>

      {/* Scoring table */}
      <div className="max-w-2xl w-full mb-10">
        <div className="bg-white/5 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-purple-300 mb-4 text-center">Penalty Rates</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-pink-900/50 border border-pink-500/40 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">🎨</div>
              <div className="text-pink-300 font-bold">Color Card</div>
              <div className="text-white text-lg font-black">-2 pts</div>
              <div className="text-pink-400 text-xs">per extra card</div>
            </div>
            <div className="bg-amber-900/50 border border-amber-500/40 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">😊</div>
              <div className="text-amber-300 font-bold">Emoji Card</div>
              <div className="text-white text-lg font-black">-4 pts</div>
              <div className="text-amber-400 text-xs">per extra card</div>
            </div>
            <div className="bg-green-900/50 border border-green-500/40 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">📝</div>
              <div className="text-green-300 font-bold">Word Card</div>
              <div className="text-white text-lg font-black">-5 pts</div>
              <div className="text-green-400 text-xs">per extra card</div>
            </div>
          </div>
          <p className="text-center text-purple-400 text-xs mt-3">First 2 cards in any connection are always free</p>
        </div>
      </div>

      {/* CTA */}
      <Link
        href="/setup"
        onClick={() => clearGameState()}
        className="glow-pulse bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xl px-12 py-4 rounded-full transition-all duration-200 shadow-lg hover:shadow-purple-500/50 hover:scale-105"
      >
        Start Game 🚀
      </Link>

      <p className="text-purple-600 text-sm mt-6">Categories: Superheroes · Harry Potter · Disney</p>
    </main>
  );
}
