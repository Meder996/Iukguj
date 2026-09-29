import React from 'react';
import { WeaponDef, WEAPONS } from '../game/weapons';
import { ShoppingCart, X, Shield, Crosshair } from 'lucide-react';
import { sounds } from '../utils/audio';

interface BuyMenuProps {
  isOpen: boolean;
  onClose: () => void;
  money: number;
  currentWeapon: WeaponDef;
  onBuyWeapon: (weapon: WeaponDef) => void;
  hasArmor: boolean;
  onBuyArmor: () => void;
  hasGrenade: boolean;
  onBuyGrenade: () => void;
}

export const BuyMenu: React.FC<BuyMenuProps> = ({
  isOpen,
  onClose,
  money,
  currentWeapon,
  onBuyWeapon,
  hasArmor,
  onBuyArmor,
  hasGrenade,
  onBuyGrenade
}) => {
  if (!isOpen) return null;

  const weaponList = Object.values(WEAPONS).filter(w => w.id !== 'knife');

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border-2 border-amber-500/80 rounded-xl max-w-2xl w-full p-6 text-white shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800"
        >
          <X size={20} />
        </button>

        <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <ShoppingCart className="text-amber-400" size={26} />
            <div>
              <h2 className="text-xl font-bold font-['Chakra_Petch'] tracking-wide text-amber-400 uppercase">
                Armory Buy Menu (B)
              </h2>
              <p className="text-xs text-slate-400">Select weapons and tactical gear</p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs uppercase text-slate-400 block font-mono">Current Funds</span>
            <span className="text-2xl font-bold font-mono text-emerald-400">${money}</span>
          </div>
        </div>

        {/* Weapons grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-2">
          {weaponList.map((weapon) => {
            const canAfford = money >= weapon.price;
            const isEquipped = currentWeapon.id === weapon.id;

            return (
              <button
                key={weapon.id}
                disabled={!canAfford && !isEquipped}
                onClick={() => {
                  if (canAfford && !isEquipped) {
                    sounds.playBuy();
                    onBuyWeapon(weapon);
                  }
                }}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition-all ${
                  isEquipped
                    ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-1 ring-emerald-500'
                    : canAfford
                    ? 'border-slate-700 bg-slate-800/80 hover:border-amber-400 hover:bg-slate-800 cursor-pointer'
                    : 'border-slate-800 bg-slate-950/40 opacity-40 cursor-not-allowed'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-bold font-['Chakra_Petch'] text-base flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full inline-block"
                        style={{ backgroundColor: weapon.color }}
                      />
                      {weapon.name}
                    </div>
                    <span className="text-xs text-slate-400 capitalize">{weapon.category}</span>
                  </div>
                  <span className={`font-mono font-bold text-sm ${canAfford ? 'text-amber-400' : 'text-slate-500'}`}>
                    ${weapon.price}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mt-2 line-clamp-1">{weapon.description}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-700/50 font-mono">
                  <span>DMG: {weapon.damage}</span>
                  <span>RPM: {Math.round(weapon.fireRate * 60)}</span>
                  <span>MAG: {weapon.magazineSize}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Tactical Equipment (Armor & Grenade) */}
        <div className="mt-4 pt-4 border-t border-slate-700 grid grid-cols-2 gap-3">
          <button
            disabled={hasArmor || money < 650}
            onClick={() => {
              if (money >= 650 && !hasArmor) {
                sounds.playBuy();
                onBuyArmor();
              }
            }}
            className={`p-3 rounded-lg border flex items-center justify-between ${
              hasArmor
                ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                : money >= 650
                ? 'border-slate-700 bg-slate-800 hover:border-amber-400 cursor-pointer'
                : 'border-slate-800 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-blue-400" />
              <div className="text-left">
                <div className="text-sm font-bold">Kevlar + Helmet</div>
                <div className="text-xs text-slate-400">100 Armor Protection</div>
              </div>
            </div>
            <span className="font-mono text-sm text-amber-400 font-bold">{hasArmor ? 'EQUIPPED' : '$650'}</span>
          </button>

          <button
            disabled={hasGrenade || money < 300}
            onClick={() => {
              if (money >= 300 && !hasGrenade) {
                sounds.playBuy();
                onBuyGrenade();
              }
            }}
            className={`p-3 rounded-lg border flex items-center justify-between ${
              hasGrenade
                ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300'
                : money >= 300
                ? 'border-slate-700 bg-slate-800 hover:border-amber-400 cursor-pointer'
                : 'border-slate-800 opacity-40 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center gap-2">
              <Crosshair size={18} className="text-orange-400" />
              <div className="text-left">
                <div className="text-sm font-bold">HE Frag Grenade</div>
                <div className="text-xs text-slate-400">Press G to throw</div>
              </div>
            </div>
            <span className="font-mono text-sm text-amber-400 font-bold">{hasGrenade ? 'EQUIPPED' : '$300'}</span>
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm uppercase tracking-wider transition-colors"
          >
            Done Shopping (ESC / B)
          </button>
        </div>
      </div>
    </div>
  );
};
