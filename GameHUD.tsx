import React from 'react';
import { Crosshair, Shield, Bomb, ShoppingCart, RefreshCw, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { WeaponDef } from '../game/weapons';
import { BombState, KillFeedEntry } from '../game/types';

interface GameHUDProps {
  health: number;
  armor: number;
  money: number;
  weapon: WeaponDef;
  ammo: number;
  isReloading: boolean;
  scoreCT: number;
  scoreT: number;
  roundTime: number; // in seconds
  bombState: BombState;
  killFeed: KillFeedEntry[];
  onOpenBuy: () => void;
  onReload: () => void;
  onThrowGrenade: () => void;
  hasGrenade: boolean;
  onInteract: () => void;
  canInteract: boolean;
  interactLabel: string;
  isPaused: boolean;
  onTogglePause: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isMobile?: boolean;
  gameMode: string;
  aliveCT: number;
  aliveT: number;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  health,
  armor,
  money,
  weapon,
  ammo,
  isReloading,
  scoreCT,
  scoreT,
  roundTime,
  bombState,
  killFeed,
  onOpenBuy,
  onReload,
  onThrowGrenade,
  hasGrenade,
  onInteract,
  canInteract,
  interactLabel,
  isPaused,
  onTogglePause,
  soundEnabled,
  onToggleSound,
  gameMode,
  aliveCT,
  aliveT,
}) => {
  const minutes = Math.floor(roundTime / 60);
  const seconds = Math.floor(roundTime % 60);
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div className="absolute inset-0 pointer-events-none select-none flex flex-col justify-between p-2 sm:p-4 z-20">
      
      {/* Top Header: Scoreboard, Round Timer, Alive Counts, Controls */}
      <div className="flex items-start justify-between">
        
        {/* Left top: Alive CT */}
        <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-mono text-xs font-bold text-cyan-300">CT ALIVE: {aliveCT}</span>
        </div>

        {/* Center: Match Score and Clock */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-700/80 px-4 py-1.5 rounded-xl shadow-lg backdrop-blur-md">
            <span className="font-mono font-black text-xl text-cyan-400">{scoreCT}</span>
            <div className="flex flex-col items-center">
              <span className={`font-mono font-bold text-sm tracking-wider ${roundTime <= 15 ? 'text-red-400 animate-ping' : 'text-slate-200'}`}>
                {formattedTime}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400">
                {gameMode}
              </span>
            </div>
            <span className="font-mono font-black text-xl text-amber-400">{scoreT}</span>
          </div>

          {/* Bomb indicator if planted */}
          {bombState.isPlanted && (
            <div className="mt-1 flex items-center gap-1.5 bg-red-600/90 text-white font-mono text-xs px-3 py-0.5 rounded-full font-bold animate-pulse shadow-red-500/50 shadow-md">
              <Bomb size={12} /> BOMB PLANTED (SITE {bombState.site}): {Math.ceil(bombState.timer)}s
            </div>
          )}
        </div>

        {/* Right top: Alive T and System Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-lg px-3 py-1.5 backdrop-blur-sm pointer-events-auto">
            <span className="font-mono text-xs font-bold text-amber-400">T ALIVE: {aliveT}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
          </div>

          <button
            onClick={onToggleSound}
            className="p-2 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Toggle Sound"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} className="text-red-400" />}
          </button>

          <button
            onClick={onTogglePause}
            className="p-2 rounded-lg bg-slate-950/70 border border-slate-700 text-slate-300 hover:text-white pointer-events-auto cursor-pointer"
            title="Pause Game (ESC / P)"
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </button>
        </div>
      </div>

      {/* Kill Feed (Top Right) */}
      <div className="absolute top-16 right-3 flex flex-col items-end gap-1 pointer-events-none max-w-xs">
        {killFeed.slice(-4).map((entry) => (
          <div
            key={entry.id}
            className="flex items-center gap-1.5 bg-slate-950/80 border border-slate-800 text-[11px] font-mono px-2.5 py-1 rounded shadow-md animate-in fade-in slide-in-from-right-3 duration-150"
          >
            <span className={entry.killerTeam === 'CT' ? 'text-cyan-400 font-bold' : 'text-amber-400 font-bold'}>
              {entry.killer}
            </span>
            <span className="text-slate-400 text-[10px] px-1 bg-slate-800/80 rounded uppercase font-semibold">
              {entry.weapon}
            </span>
            {entry.isHeadshot && (
              <span className="text-red-400 font-black text-xs" title="Headshot">💀</span>
            )}
            <span className={entry.victimTeam === 'CT' ? 'text-cyan-400' : 'text-amber-400'}>
              {entry.victim}
            </span>
          </div>
        ))}
      </div>

      {/* Center Prompt (Interact / Defuse / Plant) */}
      <div className="flex flex-col items-center justify-center pointer-events-none">
        {canInteract && (
          <button
            onClick={onInteract}
            className="pointer-events-auto bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-black px-5 py-2 rounded-xl text-sm font-['Chakra_Petch'] uppercase tracking-wider shadow-xl shadow-amber-500/30 flex items-center gap-2 cursor-pointer animate-bounce"
          >
            <Bomb size={18} /> {interactLabel} (E)
          </button>
        )}
      </div>

      {/* Bottom Footer: Health, Armor, Ammo, Tactical Actions */}
      <div className="flex items-end justify-between">
        
        {/* Left Bottom: Health & Armor & Money */}
        <div className="flex items-center gap-3">
          {/* Health */}
          <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl px-4 py-2 flex items-center gap-3 backdrop-blur-md shadow-lg">
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">HEALTH</span>
              <span className={`font-mono font-extrabold text-2xl ${health <= 25 ? 'text-rose-500 animate-pulse' : 'text-emerald-400'}`}>
                {Math.max(0, health)}
              </span>
            </div>
            {/* Health bar */}
            <div className="w-16 h-2 bg-slate-800 rounded-full overflow-hidden hidden sm:block">
              <div
                className={`h-full transition-all duration-200 ${health <= 25 ? 'bg-rose-500' : 'bg-emerald-400'}`}
                style={{ width: `${Math.max(0, Math.min(100, health))}%` }}
              />
            </div>
          </div>

          {/* Armor */}
          <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl px-4 py-2 flex items-center gap-2 backdrop-blur-md shadow-lg">
            <Shield size={18} className="text-cyan-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">ARMOR</span>
              <span className="font-mono font-extrabold text-2xl text-cyan-300">{armor}</span>
            </div>
          </div>

          {/* Money */}
          <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl px-3 py-2 hidden md:flex flex-col backdrop-blur-md shadow-lg">
            <span className="text-[10px] font-mono text-slate-400 uppercase">FUNDS</span>
            <span className="font-mono font-bold text-lg text-amber-400">${money}</span>
          </div>
        </div>

        {/* Center Bottom: Action Hotkeys for Touch / Desktop */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={onOpenBuy}
            className="bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-amber-400 border border-slate-700 hover:border-amber-400 rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            title="Open Armory (B)"
          >
            <ShoppingCart size={15} />
            <span className="font-bold">BUY (B)</span>
          </button>

          {hasGrenade && (
            <button
              onClick={onThrowGrenade}
              className="bg-orange-950/80 hover:bg-orange-900 active:scale-95 text-orange-300 border border-orange-600 rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
              title="Throw Frag Grenade (G)"
            >
              <Crosshair size={15} />
              <span className="font-bold">GRENADE (G)</span>
            </button>
          )}

          <button
            onClick={onReload}
            disabled={isReloading || weapon.category === 'knife'}
            className="bg-slate-900/90 hover:bg-slate-800 active:scale-95 text-slate-200 border border-slate-700 hover:border-slate-500 rounded-xl px-3 py-2 text-xs font-mono flex items-center gap-1.5 transition-all cursor-pointer shadow-md disabled:opacity-40"
            title="Reload Weapon (R)"
          >
            <RefreshCw size={15} className={isReloading ? 'animate-spin' : ''} />
            <span className="font-bold">RELOAD (R)</span>
          </button>
        </div>

        {/* Right Bottom: Current Weapon and Ammo */}
        <div className="bg-slate-950/85 border border-slate-700/80 rounded-xl px-4 py-2 backdrop-blur-md shadow-lg flex items-center gap-3">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold font-['Chakra_Petch'] text-amber-400">
              {weapon.name}
            </span>
            <div className="font-mono text-2xl font-black">
              {weapon.category === 'knife' ? (
                <span className="text-slate-400 text-sm">MELEE</span>
              ) : isReloading ? (
                <span className="text-amber-400 text-sm font-bold tracking-wider animate-pulse">RELOADING...</span>
              ) : (
                <>
                  <span className={ammo <= 4 ? 'text-red-400 animate-pulse' : 'text-white'}>{ammo}</span>
                  <span className="text-slate-500 text-sm"> / {weapon.magazineSize * 3}</span>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
