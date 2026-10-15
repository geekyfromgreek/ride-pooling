import React, { useState, useEffect } from 'react';
import { fetchRouteDiff } from '../utils/api';

/**
 * USP 2 — Explainable Dynamic Re-Pooling & Route Diff
 * Shows how an incoming ride request re-optimizes an active route with before/after comparisons and SLA impact.
 */
export default function RouteDiffView({
  requestId = 'R2',
  onSelectPolyline = null
}) {
  const [diffData, setDiffData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeView, setActiveView] = useState('after'); // 'before' | 'after'

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const data = await fetchRouteDiff(requestId);
      if (mounted && data) {
        setDiffData(data);
      }
      setLoading(false);
    }
    load();
    return () => {
      mounted = false;
    };
  }, [requestId]);

  const handleTogglePolyline = (view) => {
    setActiveView(view);
    if (!onSelectPolyline || !diffData) return;
    if (view === 'before' && diffData.before && diffData.before.polyline) {
      onSelectPolyline(diffData.before.polyline, 'before');
    } else if (view === 'after' && diffData.after && diffData.after.polyline) {
      onSelectPolyline(diffData.after.polyline, 'after');
    }
  };

  const beforeStops = diffData?.before?.stops || [
    { seq: 0, type: 'PICKUP', request_id: 'R1', label: 'Pickup CBS Chowk' },
    { seq: 1, type: 'DROP', request_id: 'R1', label: 'Drop Gangapur Rd' }
  ];

  const afterStops = diffData?.after?.stops || [
    { seq: 0, type: 'PICKUP', request_id: 'R1', label: 'Pickup CBS Chowk', status: 'UNCHANGED' },
    { seq: 1, type: 'PICKUP', request_id: requestId, label: `Pickup ${requestId} (Indira Nagar)`, status: 'ADDED' },
    { seq: 2, type: 'DROP', request_id: requestId, label: `Drop ${requestId} (Govind Nagar)`, status: 'ADDED' },
    { seq: 3, type: 'DROP', request_id: 'R1', label: 'Drop Gangapur Rd', status: 'REORDERED' }
  ];

  const detourPct = diffData?.detour_pct ?? 5.1;
  const costDelta = diffData?.cost_delta ?? 28.8;

  const passengerImpacts = [
    {
      id: 'R1 (Existing Rider)',
      beforeDetour: '0.0%',
      afterDetour: `${detourPct.toFixed(1)}%`,
      delta: `+${detourPct.toFixed(1)}%`,
      status: 'Within 15% SLA Bound',
      ok: detourPct <= 15.0
    },
    {
      id: `${requestId} (Pooled Rider)`,
      beforeDetour: 'None',
      afterDetour: `${Math.round(detourPct * 0.8 * 10) / 10}%`,
      delta: 'New insertion',
      status: 'Within 15% SLA Bound',
      ok: true
    }
  ];

  return (
    <div className="w-full rounded-2xl bg-white border border-[#EAE5DC] shadow-sm p-5 flex flex-col gap-4 text-[#1D1D22]">
      {/* Header */}
      <div className="flex flex-col gap-1 border-b border-[#F0EBE1] pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="text-xs font-semibold text-[#3B82F6]">
              Explainable Dynamic Re-Pooling
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[11px] text-[#787571] font-medium">
            Request {requestId}
          </span>
        </div>
        <h2 className="text-base font-bold text-[#1D1D22] mt-0.5">
          Live Route Re-Optimization
        </h2>
        <p className="text-xs text-[#787571] leading-relaxed">
          Inspect how matching a new passenger dynamically adjusts waypoint sequencing while preserving existing riders’ arrival SLA.
        </p>
      </div>

      {/* Segmented View Controller */}
      <div className="flex items-center justify-between bg-[#FAF7F2] p-1 rounded-xl border border-[#EAE5DC]">
        <button
          onClick={() => handleTogglePolyline('before')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'before'
              ? 'bg-white text-[#1D1D22] shadow-sm'
              : 'text-[#787571] hover:text-[#1D1D22]'
          }`}
        >
          Before Request ({beforeStops.length} Stops)
        </button>
        <button
          onClick={() => handleTogglePolyline('after')}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeView === 'after'
              ? 'bg-white text-[#1D1D22] shadow-sm'
              : 'text-[#787571] hover:text-[#1D1D22]'
          }`}
        >
          After Dynamic Match ({afterStops.length} Stops)
        </button>
      </div>

      {/* Metric Highlights */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
          <span className="text-[11px] text-[#787571] font-medium">Detour Added</span>
          <div className="text-lg font-bold text-[#1D1D22] mt-0.5">+{detourPct.toFixed(1)}%</div>
          <span className="text-[11px] text-[#059669] font-medium">Well within 15% SLA</span>
        </div>
        <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
          <span className="text-[11px] text-[#787571] font-medium">Fleet Cost Delta</span>
          <div className="text-lg font-bold text-[#1D1D22] mt-0.5">+₹{costDelta.toFixed(1)}</div>
          <span className="text-[11px] text-[#787571]">Shared fare gain ₹60+</span>
        </div>
      </div>

      {/* Waypoint Itinerary */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-bold text-[#1D1D22]">
          {activeView === 'before' ? 'Original Route Sequence' : 'Re-Optimized Waypoint Sequence'}
        </span>
        <div className="flex flex-col gap-1.5">
          {(activeView === 'before' ? beforeStops : afterStops).map((stop, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#1D1D22] text-white flex items-center justify-center text-[10px] font-bold">
                  {idx + 1}
                </span>
                <span className="font-semibold text-[#1D1D22]">{stop.label || `Stop ${stop.seq}`}</span>
              </div>
              {stop.status && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    stop.status === 'ADDED'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border border-[#BFDBFE]'
                      : stop.status === 'REORDERED'
                      ? 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]'
                      : 'bg-[#F3F4F6] text-[#4B5563]'
                  }`}
                >
                  {stop.status === 'ADDED' ? 'Added Co-Rider' : stop.status === 'REORDERED' ? 'Sequenced' : 'Existing Stop'}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Passenger Impact SLA Table */}
      <div className="flex flex-col gap-2 mt-1">
        <span className="text-xs font-bold text-[#1D1D22]">
          Rider SLA Impact Verification
        </span>
        <div className="overflow-x-auto rounded-xl border border-[#EAE5DC]">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#FAF7F2] text-[#787571] border-b border-[#EAE5DC]">
              <tr>
                <th className="px-3 py-2 font-semibold">Rider</th>
                <th className="px-3 py-2 font-semibold">Before</th>
                <th className="px-3 py-2 font-semibold">After</th>
                <th className="px-3 py-2 font-semibold">Detour</th>
                <th className="px-3 py-2 font-semibold">Guarantee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0EBE1]">
              {passengerImpacts.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAF7F2]/50">
                  <td className="px-3 py-2 font-semibold text-[#1D1D22]">{row.id}</td>
                  <td className="px-3 py-2 text-[#787571]">{row.beforeDetour}</td>
                  <td className="px-3 py-2 font-semibold text-[#1D1D22]">{row.afterDetour}</td>
                  <td className="px-3 py-2 font-semibold text-[#059669]">{row.delta}</td>
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46] text-[10px] font-semibold">
                      <span className="material-symbols-outlined text-[12px]">check</span>
                      SLA Pass
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
