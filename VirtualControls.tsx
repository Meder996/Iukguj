import React, { useRef, useState } from 'react';
import { Crosshair, Bomb, RefreshCw } from 'lucide-react';

interface VirtualControlsProps {
  onMoveChange: (moveX: number, moveY: number) => void;
  onAimChange: (aimAngle: number) => void;
  onFireChange: (isFiring: boolean) => void;
  onReload: () => void;
  onBuy?: () => void;
  onGrenade: () => void;
  hasGrenade: boolean;
  onInteract: () => void;
  canInteract: boolean;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveChange,
  onAimChange,
  onFireChange,
  onReload,
  onGrenade,
  hasGrenade,
  onInteract,
  canInteract,
}) => {
  const joystickRef = useRef<HTMLDivElement>(null);
  const [stickPos, setStickPos] = useState({ x: 0, y: 0 });
  const [touchActive, setTouchActive] = useState(false);
  const touchIdRef = useRef<number | null>(null);
  const originRef = useRef({ x: 0, y: 0 });

  const aimPadRef = useRef<HTMLDivElement>(null);
  const aimTouchIdRef = useRef<number | null>(null);
  const aimOriginRef = useRef({ x: 0, y: 0 });

  // Movement Joystick Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;

    const rect = joystickRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      originRef.current = { x: centerX, y: centerY };
      setTouchActive(true);
      updateJoystick(touch.clientX, touch.clientY);
    }
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    const dx = clientX - originRef.current.x;
    const dy = clientY - originRef.current.y;
    const dist = Math.hypot(dx, dy);
    const maxRadius = 45;

    if (dist <= maxRadius) {
      setStickPos({ x: dx, y: dy });
      onMoveChange(dx / maxRadius, dy / maxRadius);
    } else {
      const angle = Math.atan2(dy, dx);
      const nx = Math.cos(angle) * maxRadius;
      const ny = Math.sin(angle) * maxRadius;
      setStickPos({ x: nx, y: ny });
      onMoveChange(Math.cos(angle), Math.sin(angle));
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setTouchActive(false);
        setStickPos({ x: 0, y: 0 });
        onMoveChange(0, 0);
        break;
      }
    }
  };

  // Aim & Shoot Pad handlers
  const handleAimTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (aimTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    aimTouchIdRef.current = touch.identifier;

    const rect = aimPadRef.current?.getBoundingClientRect();
    if (rect) {
      aimOriginRef.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
      updateAim(touch.clientX, touch.clientY);
      onFireChange(true);
    }
  };

  const updateAim = (clientX: number, clientY: number) => {
    const dx = clientX - aimOriginRef.current.x;
    const dy = clientY - aimOriginRef.current.y;
    const angle = Math.atan2(dy, dx);
    onAimChange(angle);
  };

  const handleAimTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === aimTouchIdRef.current) {
        updateAim(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleAimTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === aimTouchIdRef.current) {
        aimTouchIdRef.current = null;
        onFireChange(false);
        break;
      }
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between p-4 pb-20 items-end">
      {/* Movement Virtual Joystick */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="w-32 h-32 rounded-full border-2 border-white/20 bg-slate-900/40 backdrop-blur-sm relative flex items-center justify-center pointer-events-auto touch-none"
      >
        <div
          className={`w-14 h-14 rounded-full transition-transform duration-75 ${
            touchActive ? 'bg-amber-400/80 shadow-[0_0_15px_rgba(251,191,36,0.6)]' : 'bg-white/40'
          }`}
          style={{
            transform: `translate(${stickPos.x}px, ${stickPos.y}px)`,
          }}
        />
        <span className="absolute bottom-2 text-[10px] font-mono text-white/50 tracking-wider">MOVE</span>
      </div>

      {/* Right side: Fire/Aim Touchpad + Action buttons */}
      <div className="flex flex-col items-end gap-3 pointer-events-auto">
        <div className="flex items-center gap-2">
          {canInteract && (
            <button
              onTouchStart={onInteract}
              className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-bold flex items-center justify-center shadow-lg active:scale-95 cursor-pointer text-xs"
            >
              <Bomb size={18} />
            </button>
          )}

          {hasGrenade && (
            <button
              onTouchStart={onGrenade}
              className="w-12 h-12 rounded-full bg-orange-600 text-white font-bold flex items-center justify-center shadow-lg active:scale-95 cursor-pointer text-xs"
            >
              <Crosshair size={18} />
            </button>
          )}

          <button
            onTouchStart={onReload}
            className="w-12 h-12 rounded-full bg-slate-800 text-white border border-slate-600 flex items-center justify-center shadow-lg active:scale-95 cursor-pointer text-xs"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Aim & Shoot Area */}
        <div
          ref={aimPadRef}
          onTouchStart={handleAimTouchStart}
          onTouchMove={handleAimTouchMove}
          onTouchEnd={handleAimTouchEnd}
          onTouchCancel={handleAimTouchEnd}
          className="w-32 h-32 rounded-full border-2 border-red-500/40 bg-red-950/20 backdrop-blur-sm flex items-center justify-center relative touch-none active:bg-red-500/30"
        >
          <Crosshair size={32} className="text-red-400/70 animate-pulse" />
          <span className="absolute bottom-2 text-[10px] font-mono text-red-300/60 tracking-wider">AIM / FIRE</span>
        </div>
      </div>
    </div>
  );
};
