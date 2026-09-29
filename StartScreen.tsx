import React from 'react';
import { Play, Trophy, Sparkles, Volume2, VolumeX, Smartphone, Monitor } from 'lucide-react';

interface StartScreenProps {
  onStart: (mapId: string, diff: 'casual' | 'competitive' | 'deathmatch') => void;
  onOpenScores: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStart,
  onOpenScores,
  soundEnabled,
  onToggleSound,
}) => {
  const [selectedMap, setSelectedMap] = React.useState<'dust2' | 'inferno'>('dust2');
  const [gameMode, setGameMode] = React.useState<'competitive' | 'casual' | 'deathmatch'>('competitive');

  return (
    <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center p-4 z-40 overflow-y-auto">
      {/* Background visual styling */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-black pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

      {/* Top bar controls */}
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 transition-colors cursor-pointer"
          title="Toggle Sound"
        >
          {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} className="text-red-400" />}
        </button>
        <button
          onClick={onOpenScores}
          className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 hover:border-amber-400 text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-2 cursor-pointer font-mono text-sm"
        >
          <Trophy size={18} className="text-amber-400" /> Leaderboard
        </button>
      </div>

      <div className="relative z-10 max-w-xl w-full text-center flex flex-col items-center">
        {/* Logo and Tagline */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono uppercase tracking-widest mb-3">
          <Sparkles size={13} /> Tactical 2D Pixel Action • v2.0
        </div>

        <h1 className="text-5xl sm:text-6xl font-black font-['Chakra_Petch'] tracking-wider text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
          COUNTER <span className="text-amber-500 underline decoration-amber-500/60 decoration-4 underline-offset-8">STRIKE</span>
        </h1>
        <div className="font-mono text-xs uppercase tracking-[0.4em] text-slate-400 mt-2 mb-6">
          PIXEL OFFENSIVE • RETRO EDITION
        </div>

        {/* Mode selector */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-4 backdrop-blur-sm shadow-xl text-left">
          <label className="text-xs font-bold font-['Chakra_Petch'] uppercase tracking-wider text-slate-400 mb-2 block">
            Select Game Mode
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'competitive', label: 'Defusal (5v5)', desc: 'Plant / Defuse bomb, 5 rounds' },
              { id: 'deathmatch', label: 'Deathmatch', desc: 'Instant respawn, fast frag frenzy' },
              { id: 'casual', label: 'Warmup Bot Skirmish', desc: 'Aim training against CT/T bots' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => setGameMode(m.id as any)}
                className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  gameMode === m.id
                    ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm font-['Chakra_Petch'] text-amber-300">{m.label}</div>
                <div className="text-[10px] text-slate-400 leading-tight mt-1">{m.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Map selector */}
        <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6 backdrop-blur-sm shadow-xl text-left">
          <label className="text-xs font-bold font-['Chakra_Petch'] uppercase tracking-wider text-slate-400 mb-2 block">
            Select Map
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setSelectedMap('dust2')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedMap === 'dust2'
                  ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-amber-300 font-['Chakra_Petch']">de_dust2</div>
              <div className="text-xs text-slate-400">Long A, Bombsite B, Mid double doors</div>
            </button>
            <button
              onClick={() => setSelectedMap('inferno')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                selectedMap === 'inferno'
                  ? 'border-amber-400 bg-amber-500/15 text-white ring-1 ring-amber-400'
                  : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div className="font-bold text-sm text-amber-300 font-['Chakra_Petch']">de_inferno</div>
              <div className="text-xs text-slate-400">Banana push, Apartments, Courtyard</div>
            </button>
          </div>
        </div>

        {/* Big Start Button */}
        <button
          onClick={() => onStart(selectedMap, gameMode)}
          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-xl font-['Chakra_Petch'] uppercase tracking-widest rounded-xl shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play size={24} className="fill-slate-950" />
          Deploy To Combat
        </button>

        {/* Controls cheat sheet */}
        <div className="mt-6 grid grid-cols-2 gap-3 w-full text-[11px] font-mono text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800">
          <div className="flex items-center gap-2">
            <Monitor size={14} className="text-amber-400 shrink-0" />
            <span><strong>Desktop:</strong> WASD move • Mouse aim & shoot • R reload • B buy • G grenade • E defuse/plant</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone size={14} className="text-amber-400 shrink-0" />
            <span><strong>Mobile:</strong> Left virtual stick to move, touch right pad to aim & auto-fire, on-screen action pads</span>
          </div>
        </div>
      </div>
    </div>
  );
};
