import React, { useState } from 'react';

/**
 * Fairness Vault & Co-Op — Warm Humanist Interface
 * Clean, reassuring SLA guarantees and co-rider preference controls.
 */
export default function FairnessScreen() {
  const [quietCommute, setQuietCommute] = useState(true);
  const [womenVerified, setWomenVerified] = useState(false);
  const [temperature, setTemperature] = useState(23);
  const [luggageLock, setLuggageLock] = useState(true);
  const [claimStatus, setClaimStatus] = useState('active');

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            Fairness Vault
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Automated detour guarantees and shared commute harmony
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE5DC] shadow-xs text-[#1D1D22] text-[11px] font-semibold">
          <span className="material-symbols-outlined text-[15px] text-[#F5C451]">verified_user</span>
          <span>SLA Protected</span>
        </div>
      </div>

      {/* 1. Automated SLA Detour Rebate Guarantee Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1D1D22] text-[#F5C451] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span>
            </div>
            <div>
              <h3 className="text-[14px] font-bold text-[#1D1D22]">Zero-Breach Detour Guarantee</h3>
              <span className="text-[11px] text-[#787571]">Automated instant rebate contract</span>
            </div>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#1D1D22] text-[11px] font-bold border border-[#EAE5DC]">
            15% Cap
          </span>
        </div>

        <p className="text-[13px] text-[#787571] leading-relaxed">
          If your shared detour exceeds 15% of your direct baseline route, PoolIQ automatically credits 25% of your fare back to your account balance.
        </p>

        {/* Live Protection Status */}
        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium text-[#787571] uppercase tracking-wide block">Active Coverage</span>
            <span className="text-[13px] font-bold text-[#1D1D22]">Max Allowed Detour: 3.2 mins</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-[#EAE5DC]">
            <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
            <span className="text-[11px] font-semibold text-[#1D1D22]">Guarded</span>
          </div>
        </div>
      </div>

      {/* 2. Co-Rider Harmony Preferences */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#1D1D22]">Co-Rider Harmony</h3>
            <span className="text-[11px] text-[#787571]">Matched with compatible passengers</span>
          </div>
          <span className="material-symbols-outlined text-[#787571] text-[20px]">tune</span>
        </div>

        <div className="flex flex-col gap-2.5 pt-1">
          {/* Quiet Commute */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px] text-[#1D1D22]">volume_off</span>
              <div>
                <span className="text-[13px] font-semibold text-[#1D1D22] block">Quiet Commute Lock</span>
                <span className="text-[11px] text-[#787571]">Matched with silent co-riders (no speaker calls)</span>
              </div>
            </div>
            <button
              onClick={() => setQuietCommute(!quietCommute)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${quietCommute ? 'bg-[#1D1D22]' : 'bg-[#EAE5DC]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${quietCommute ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Women-Verified Pool */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px] text-[#1D1D22]">shield_person</span>
              <div>
                <span className="text-[13px] font-semibold text-[#1D1D22] block">Women-Verified Pool</span>
                <span className="text-[11px] text-[#787571]">Exclusive matching with verified women riders</span>
              </div>
            </div>
            <button
              onClick={() => setWomenVerified(!womenVerified)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${womenVerified ? 'bg-[#1D1D22]' : 'bg-[#EAE5DC]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${womenVerified ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Luggage Allocation */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px] text-[#1D1D22]">luggage</span>
              <div>
                <span className="text-[13px] font-semibold text-[#1D1D22] block">Boot Space Reservation</span>
                <span className="text-[11px] text-[#787571]">Guarantees 1 large suitcase capacity in vehicle boot</span>
              </div>
            </div>
            <button
              onClick={() => setLuggageLock(!luggageLock)}
              className={`w-11 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${luggageLock ? 'bg-[#1D1D22]' : 'bg-[#EAE5DC]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white transition-transform ${luggageLock ? 'translate-x-5' : 'translate-x-0'}`}></div>
            </button>
          </div>

          {/* Cabin Temperature */}
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[19px] text-[#1D1D22]">ac_unit</span>
              <div>
                <span className="text-[13px] font-semibold text-[#1D1D22] block">Cabin Climate Consensus</span>
                <span className="text-[11px] text-[#787571]">Fleet-standard cabin temperature</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTemperature(t => Math.max(20, t - 1))}
                className="w-7 h-7 rounded-full bg-white border border-[#EAE5DC] text-xs font-bold text-[#1D1D22] flex items-center justify-center hover:bg-[#F4EFEB] cursor-pointer"
              >
                -
              </button>
              <span className="text-xs font-bold text-[#1D1D22]">{temperature}°C</span>
              <button
                onClick={() => setTemperature(t => Math.min(26, t + 1))}
                className="w-7 h-7 rounded-full bg-white border border-[#EAE5DC] text-xs font-bold text-[#1D1D22] flex items-center justify-center hover:bg-[#F4EFEB] cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Green Co-op Karma Ledger */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[14px] font-bold text-[#1D1D22]">Green Transit Ledger</h3>
            <span className="text-[11px] text-[#787571]">Municipal verified carbon offsets</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#1D1D22] text-[11px] font-bold border border-[#EAE5DC]">
            Silver Pooler
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex flex-col items-center">
            <span className="text-[11px] font-medium text-[#787571] uppercase">CO₂ Offset</span>
            <span className="text-[18px] font-bold text-[#1D1D22] mt-0.5">38.4 kg</span>
            <span className="text-[10px] text-[#787571]">This Month</span>
          </div>
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex flex-col items-center">
            <span className="text-[11px] font-medium text-[#787571] uppercase">City Rank</span>
            <span className="text-[18px] font-bold text-[#1D1D22] mt-0.5">#42</span>
            <span className="text-[10px] text-[#787571]">Nashik West</span>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#1D1D22]">
            Earned ₹45 Municipal Transit Voucher
          </span>
          <button
            onClick={() => setClaimStatus('claimed')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              claimStatus === 'claimed'
                ? 'bg-[#1D1D22] text-white'
                : 'bg-white border border-[#EAE5DC] text-[#1D1D22] hover:bg-[#F4EFEB]'
            }`}
          >
            {claimStatus === 'claimed' ? 'Claimed ✓' : 'Claim Voucher'}
          </button>
        </div>
      </div>
    </div>
  );
}
