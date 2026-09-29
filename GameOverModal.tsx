import React from 'react';
import { HighScoreRecord } from '../utils/highscores';
import { Trophy, RotateCcw, Award } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  isVictory: boolean;
  roundScoreCT: number;
  roundScoreT: number;
  playerScore: number;
  kills: number;
  headshots: number;
  accuracy: number;
  onRestart: () => void;
  onViewHighScores: () => void;
  highScores: HighScoreRecord[];
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  isVictory,
  roundScoreCT,
  roundScoreT,
  playerScore,
  kills,
  headshots,
  accuracy,
  onRestart,
  onViewHighScores,
  highScores,
}) => {
  if (!isOpen) return null;

  const hsRate = kills > 0 ? Math.round((headshots / kills) * 100) : 0;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-slate-700 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Banner */}
        <div className="text-center mb-6">
          <div
            className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest uppercase mb-3 ${
              isVictory ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-red-500/20 text-red-400 border border-red-500/40'
            }`}
          >
            {isVictory ? 'MISSION ACCOMPLISHED' : 'MISSION FAILED'}
          </div>

          <h2 className="text-4xl font-extrabold font-['Chakra_Petch'] tracking-wide">
            {isVictory ? (
              <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">
                COUNTER-TERRORISTS WIN
              </span>
            ) : (
              <span className="text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                TERRORISTS WIN
              </span>
            )}
          </h2>

          <div className="flex items-center justify-center gap-6 mt-3 font-mono text-xl">
            <span className="text-cyan-400 font-bold">CT: {roundScoreCT}</span>
            <span className="text-slate-500 font-black">VS</span>
            <span className="text-amber-400 font-bold">T: {roundScoreT}</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800 mb-6 font-mono">
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase">Score</div>
            <div className="text-xl font-bold text-amber-400">{playerScore}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase">Kills</div>
            <div className="text-xl font-bold text-emerald-400">{kills}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase">HS Rate</div>
            <div className="text-xl font-bold text-rose-400">{hsRate}%</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-slate-400 uppercase">Accuracy</div>
            <div className="text-xl font-bold text-cyan-400">{accuracy}%</div>
          </div>
        </div>

        {/* Top 3 Highscore preview */}
        <div className="mb-6 bg-slate-800/40 p-3 rounded-lg border border-slate-700/60">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2 font-mono uppercase font-semibold">
            <span className="flex items-center gap-1.5"><Trophy size={14} className="text-amber-400" /> Leaderboard Top 3</span>
            <button
              onClick={onViewHighScores}
              className="text-amber-400 hover:underline cursor-pointer"
            >
              Full Board &rarr;
            </button>
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {highScores.slice(0, 3).map((entry, idx) => (
              <div key={idx} className="flex justify-between items-center py-1 px-2 rounded bg-slate-900/60">
                <span className="text-slate-300">
                  <strong className={idx === 0 ? 'text-amber-400' : 'text-slate-400'}>#{idx + 1} </strong>
                  {entry.name}
                </span>
                <span className="font-bold text-amber-300">{entry.score} pts</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onRestart}
            className="flex-1 py-3 px-4 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20 cursor-pointer font-['Chakra_Petch'] uppercase tracking-wider text-base"
          >
            <RotateCcw size={18} /> Play Again (Space)
          </button>
          <button
            onClick={onViewHighScores}
            className="py-3 px-4 bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer text-sm"
          >
            <Award size={18} className="text-amber-400" /> Leaderboard
          </button>
        </div>
      </div>
    </div>
  );
};

interface HighScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: HighScoreRecord[];
}

export const HighScoresModal: React.FC<HighScoresModalProps> = ({ isOpen, onClose, scores }) => {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={24} />
            <h2 className="text-xl font-bold font-['Chakra_Petch'] uppercase text-amber-400">Hall of Fame</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm bg-slate-800 px-3 py-1 rounded">
            Close
          </button>
        </div>

        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {scores.map((sc, i) => (
            <div
              key={sc.id || i}
              className={`p-3 rounded-lg border flex items-center justify-between font-mono text-sm ${
                i === 0
                  ? 'border-amber-500/60 bg-amber-950/20 text-amber-200'
                  : i === 1
                  ? 'border-slate-500/60 bg-slate-800/40 text-slate-200'
                  : i === 2
                  ? 'border-amber-700/60 bg-amber-950/10 text-orange-200'
                  : 'border-slate-800 bg-slate-950/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="font-bold w-5 text-center">{i + 1}</span>
                <div>
                  <div className="font-bold text-white">{sc.name}</div>
                  <div className="text-[11px] text-slate-500">{sc.date} • {sc.kills} Kills ({sc.headshots} HS)</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-amber-400 text-base">{sc.score}</div>
                <div className="text-[10px] text-slate-500 uppercase">{sc.roundsWon} Rounds</div>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="w-full mt-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider text-sm font-['Chakra_Petch']"
        >
          Return to Game
        </button>
      </div>
    </div>
  );
};
