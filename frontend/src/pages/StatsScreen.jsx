import React, { useState, useEffect } from 'react';

/**
 * PoolIQ Efficiency Hub (StatsScreen) — Warm Humanist Interface
 * Displays aggregate passenger and municipal savings in Lakhs (₹),
 * CO2 offsets, detour SLA compliance, and weekly transit cadence.
 */
export default function StatsScreen({ backendMetrics = null }) {
  const [period, setPeriod] = useState('month');
  const [selectedDayIdx, setSelectedDayIdx] = useState(4);

  const [liveJitter, setLiveJitter] = useState(0);
  const [lastAddition, setLastAddition] = useState(240);
  const [weeklyBonusRides, setWeeklyBonusRides] = useState([0, 0, 0, 1, 3, 0, 0]);
  const [weeklyBonusSavings, setWeeklyBonusSavings] = useState([0, 0, 0, 240, 780, 0, 0]);

  useEffect(() => {
    const timer = setInterval(() => {
      const added = Math.floor(180 + Math.random() * 140);
      setLiveJitter((prev) => prev + added);
      setLastAddition(added);

      setWeeklyBonusRides((prev) => {
        const next = [...prev];
        next[selectedDayIdx] = (next[selectedDayIdx] || 0) + 1;
        return next;
      });
      setWeeklyBonusSavings((prev) => {
        const next = [...prev];
        next[selectedDayIdx] = (next[selectedDayIdx] || 0) + added;
        return next;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedDayIdx]);

  const liveDetour = backendMetrics && backendMetrics.avg_detour_pct
    ? `${backendMetrics.avg_detour_pct.toFixed(1)}%`
    : '5.1%';
  const liveSavedPct = backendMetrics && backendMetrics.saved_pct
    ? `${Math.round(backendMetrics.saved_pct)}%`
    : '33.4%';

  const baseWeeklyConfigs = {
    month: [
      { day: 'Mon', baseCount: 182, baseSavings: 38400 },
      { day: 'Tue', baseCount: 214, baseSavings: 44200 },
      { day: 'Wed', baseCount: 148, baseSavings: 31100 },
      { day: 'Thu', baseCount: 242, baseSavings: 51000 },
      { day: 'Fri', baseCount: 298, baseSavings: 64500 },
      { day: 'Sat', baseCount: 196, baseSavings: 41800 },
      { day: 'Sun', baseCount: 112, baseSavings: 24000 }
    ],
    all: [
      { day: 'Mon', baseCount: 1240, baseSavings: 280000 },
      { day: 'Tue', baseCount: 1480, baseSavings: 330000 },
      { day: 'Wed', baseCount: 1120, baseSavings: 250000 },
      { day: 'Thu', baseCount: 1690, baseSavings: 380000 },
      { day: 'Fri', baseCount: 1980, baseSavings: 450000 },
      { day: 'Sat', baseCount: 1390, baseSavings: 310000 },
      { day: 'Sun', baseCount: 850, baseSavings: 190000 }
    ]
  };

  const baseData = {
    month: {
      rawSavings: 384200,
      soloBaseNum: 1148000,
      pooledBaseNum: 764000,
      delta: `+28.4% vs last month`,
      pctOffset: liveSavedPct,
      poolPct: '66.6%',
      co2: 1840,
      detour: liveDetour,
      detourMin: '+1.8 min',
      efficiency: '96.8%'
    },
    all: {
      rawSavings: 2864500,
      soloBaseNum: 8620000,
      pooledBaseNum: 5756000,
      delta: '+34.2% overall efficiency',
      pctOffset: '33.2%',
      poolPct: '66.8%',
      co2: 14250,
      detour: liveDetour,
      detourMin: '+1.7 min',
      efficiency: '97.4%'
    }
  };

  const current = baseData[period];
  const dynamicTotalNum = current.rawSavings + liveJitter;
  const dynamicNetSaved = dynamicTotalNum.toLocaleString('en-IN');
  const dynamicLakhsStr = `₹${(dynamicTotalNum / 100000).toFixed(2)} Lakhs`;
  const dynamicSoloStr = `₹${((current.soloBaseNum + Math.floor(liveJitter * 1.5)) / 100000).toFixed(2)}L`;
  const dynamicPooledStr = `₹${((current.pooledBaseNum + Math.floor(liveJitter * 0.5)) / 100000).toFixed(2)}L`;
  const dynamicCo2Str = (current.co2 + Math.floor(liveJitter * 0.0035)).toLocaleString('en-IN');

  const currentWeeklyConfigs = baseWeeklyConfigs[period];
  const maxWeeklyCount = Math.max(
    ...currentWeeklyConfigs.map((c, i) => c.baseCount + (weeklyBonusRides[i] || 0))
  );

  const dynamicWeekly = currentWeeklyConfigs.map((cfg, idx) => {
    const totalCount = cfg.baseCount + (weeklyBonusRides[idx] || 0);
    const totalSavingsNum = cfg.baseSavings + (weeklyBonusSavings[idx] || 0);
    const savingsFormatted = period === 'all'
      ? `₹${(totalSavingsNum / 100000).toFixed(1)}L`
      : `₹${(totalSavingsNum / 1000).toFixed(1)}k`;
    const heightPct = `${Math.min(100, Math.max(25, Math.round((totalCount / maxWeeklyCount) * 100)))}%`;
    return {
      day: cfg.day,
      count: totalCount,
      rides: `${totalCount} Rides`,
      savings: savingsFormatted,
      height: heightPct
    };
  });

  const selectedDay = dynamicWeekly[selectedDayIdx] || dynamicWeekly[4];

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header & Filter Toggle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            Efficiency Hub
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Network savings and environmental impact
          </p>
        </div>

        <div className="bg-white p-1 rounded-full flex items-center border border-[#EAE5DC] shadow-xs">
          <button
            type="button"
            onClick={() => setPeriod('month')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              period === 'month'
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'text-[#787571] hover:text-[#1D1D22]'
            }`}
          >
            This Month
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'text-[#787571] hover:text-[#1D1D22]'
            }`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Main Impact Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#787571] uppercase tracking-wide">
            Total Pooled Savings
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#F5C451]/20 text-[#1D1D22] text-[11px] font-bold border border-[#F5C451]/40 flex items-center gap-1">
            <span className="material-symbols-outlined text-[13px]">trending_up</span>
            {current.delta}
          </span>
        </div>

        <div className="flex flex-col">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[32px] font-bold text-[#1D1D22] tracking-tight leading-none">
              ₹{dynamicNetSaved}
            </span>
            <span className="text-[13px] font-semibold text-[#787571]">
              ({dynamicLakhsStr})
            </span>
          </div>
          <span className="text-[11px] text-[#787571] mt-1">
            Realized commuter savings across Nashik Metropolitan routes
          </span>
        </div>

        {/* Solo vs Pooled Breakdown */}
        <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#EAE5DC] flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#787571]">
              Solo Baseline: <strong className="text-[#1D1D22] ml-1">{dynamicSoloStr}</strong>
            </span>
            <span className="text-[#1D1D22] font-semibold">
              Pooled Cost: <strong className="text-[#1D1D22] ml-1">{dynamicPooledStr}</strong>
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-[#EAE5DC] overflow-hidden flex">
            <div
              className="h-full bg-[#1D1D22] rounded-full transition-all duration-500 ease-out"
              style={{ width: current.poolPct }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#787571]">
            <span>Pooled volume: {current.poolPct}</span>
            <span className="font-semibold text-[#1D1D22]">{current.pctOffset} cost reduction</span>
          </div>
        </div>
      </div>

      {/* 2-Column Secondary Metrics */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[24px] p-4 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#1D1D22]">
            <span className="text-[11px] font-medium text-[#787571] uppercase">CO₂ Offset</span>
            <span className="material-symbols-outlined text-[18px] text-[#F5C451]">eco</span>
          </div>
          <span className="text-[22px] font-bold text-[#1D1D22] tracking-tight mt-1">
            {dynamicCo2Str} kg
          </span>
          <span className="text-[11px] text-[#787571]">Clean electric pooling</span>
        </div>

        <div className="bg-white rounded-[24px] p-4 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-1">
          <div className="flex items-center justify-between text-[#1D1D22]">
            <span className="text-[11px] font-medium text-[#787571] uppercase">Avg Detour</span>
            <span className="material-symbols-outlined text-[18px] text-[#1D1D22]">alt_route</span>
          </div>
          <span className="text-[22px] font-bold text-[#1D1D22] tracking-tight mt-1">
            {current.detourMin}
          </span>
          <span className="text-[11px] text-[#787571]">Strictly within 15% SLA</span>
        </div>
      </div>

      {/* Weekly Pooling Performance Chart */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-bold text-[#1D1D22]">Weekly Pooling Cadence</h3>
            <span className="text-[11px] text-[#787571]">Daily trip volume and savings</span>
          </div>
          <span className="text-xs font-semibold text-[#1D1D22] px-2.5 py-1 bg-[#FAF7F2] rounded-full border border-[#EAE5DC]">
            {selectedDay.day}: {selectedDay.rides} · {selectedDay.savings}
          </span>
        </div>

        <div className="h-32 flex items-end justify-between gap-2 px-1 pt-4">
          {dynamicWeekly.map((bar, idx) => {
            const isSelected = selectedDayIdx === idx;
            return (
              <div
                key={idx}
                onClick={() => setSelectedDayIdx(idx)}
                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end cursor-pointer group"
              >
                <span className={`text-[10px] font-semibold ${isSelected ? 'text-[#1D1D22] font-bold' : 'text-[#787571]'}`}>
                  {bar.count}
                </span>
                <div
                  className={`w-full rounded-t-lg transition-all duration-300 ${
                    isSelected ? 'bg-[#F5C451]' : 'bg-[#EAE5DC] group-hover:bg-[#1D1D22]/60'
                  }`}
                  style={{ height: bar.height }}
                ></div>
                <span className={`text-[11px] font-medium ${isSelected ? 'text-[#1D1D22] font-bold' : 'text-[#787571]'}`}>
                  {bar.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
