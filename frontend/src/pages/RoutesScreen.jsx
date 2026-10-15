import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from '../components/LeafletMap';
import { CORRIDORS } from '../data/nashikLocations';

/**
 * PoolIQ Corridors Screen — Warm Humanist Interface
 * Clean segregation, responsive pill filters, and seamless booking.
 */
export default function RoutesScreen({ onSelectCorridor, userRole = 'passenger' }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [corridors, setCorridors] = useState(CORRIDORS);
  const [selectedCorridorId, setSelectedCorridorId] = useState('c-station');
  const [adminNotice, setAdminNotice] = useState('');

  useEffect(() => {
    const timer = setInterval(() => {
      setCorridors((prev) =>
        prev.map((c) => ({
          ...c,
          liveVehicles: Math.max(3, c.liveVehicles + (Math.random() > 0.6 ? 1 : -1) * (Math.random() > 0.8 ? 1 : 0)),
          matchRate: Math.min(99, Math.max(75, c.matchRate + (Math.random() > 0.5 ? 1 : -1)))
        }))
      );
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleFilterClick = (filterKey) => {
    setActiveFilter(filterKey);
    const matching = corridors.filter((c) => {
      if (filterKey === 'all') return true;
      return c.category === filterKey;
    });
    if (matching.length > 0 && !matching.some((m) => m.id === selectedCorridorId)) {
      setSelectedCorridorId(matching[0].id);
    }
  };

  const filteredCorridors = useMemo(() => {
    return corridors.filter((c) => {
      const matchesFilter = activeFilter === 'all' || c.category === activeFilter;
      const matchesSearch =
        !searchTerm.trim() ||
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.subtitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.stops.some((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchesFilter && matchesSearch;
    });
  }, [corridors, activeFilter, searchTerm]);

  const handleAdjustFleet = (corridorId, delta) => {
    setCorridors((prev) =>
      prev.map((c) => {
        if (c.id === corridorId) {
          const updated = Math.max(1, Math.min(12, c.liveVehicles + delta));
          return {
            ...c,
            liveVehicles: updated,
            capacityTotal: updated * 4,
            headwayMin: Math.max(1.2, Number((14 / updated).toFixed(1)))
          };
        }
        return c;
      })
    );
    setAdminNotice(`Fleet adjusted: ${delta > 0 ? '+1 Shuttle deployed' : '-1 Shuttle recalled'}`);
    setTimeout(() => setAdminNotice(''), 3000);
  };

  const totalActiveVehicles = useMemo(() => {
    return corridors.reduce((acc, c) => acc + c.liveVehicles, 0);
  }, [corridors]);

  const selectedCorridor = corridors.find((c) => c.id === selectedCorridorId) || corridors[0];

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            {userRole === 'admin' ? 'Road Fleet Management' : 'Busy Road Network'}
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            {userRole === 'admin' ? 'Real-time vehicle allocation & headway' : 'High-density shared commuter corridors'}
          </p>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-white border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shadow-xs">
          {totalActiveVehicles} EVs Active
        </span>
      </div>

      {adminNotice && (
        <div className="bg-[#FAF7F2] border border-[#1D1D22] text-[#1D1D22] px-3 py-2 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-[#F5C451]">check_circle</span>
          <span>{adminNotice}</span>
        </div>
      )}

      {/* Search Input */}
      <div className="relative flex items-center">
        <span className="material-symbols-outlined absolute left-3.5 text-[#787571] text-[18px]">search</span>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search Gangapur, Satpur, PVG, Dwarka..."
          className="w-full h-11 pl-10 pr-4 rounded-full bg-white text-[#1D1D22] placeholder:text-[#787571] text-xs focus:outline-none focus:border-[#1D1D22] border border-[#EAE5DC] shadow-xs"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: 'all', label: 'All Routes' },
          { key: 'express', label: 'Express Radials' },
          { key: 'arterial', label: 'City Arterials' },
          { key: 'campus', label: 'Campus Links' },
          { key: 'feeder', label: 'Suburban' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleFilterClick(tab.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'bg-white text-[#787571] hover:text-[#1D1D22] border border-[#EAE5DC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Map Deck */}
      <div className="relative w-full h-[240px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1]">
        <LeafletMap
          center={[19.9977, 73.7803]}
          zoom={12}
          corridors={filteredCorridors}
          selectedCorridorId={selectedCorridorId}
          height="240px"
        />
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-1.5 text-xs font-semibold text-[#1D1D22]">
            <span className="w-2 h-2 rounded-full bg-[#1D1D22]"></span>
            <span>Active: {selectedCorridor.name}</span>
          </div>
        </div>
      </div>

      {/* Corridors Roster */}
      <div className="flex flex-col gap-3">
        {filteredCorridors.map((corridor) => {
          const isSelected = selectedCorridorId === corridor.id;

          if (userRole === 'admin') {
            const loadPct = Math.round((corridor.capacityOccupied / corridor.capacityTotal) * 100);
            return (
              <div
                key={corridor.id}
                onClick={() => setSelectedCorridorId(corridor.id)}
                className={`bg-white rounded-[24px] p-5 border transition-all cursor-pointer flex flex-col gap-3 shadow-[0_4px_20px_rgba(29,29,34,0.06)] ${
                  isSelected ? 'border-[#1D1D22]' : 'border-[#EAE5DC]'
                }`}
              >
                <div className="flex items-start justify-between pb-2 border-b border-[#EAE5DC]">
                  <div>
                    <h3 className="text-[15px] font-bold text-[#1D1D22]">{corridor.name}</h3>
                    <span className="text-[11px] text-[#787571]">{corridor.code} · {corridor.subtitle}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[15px] font-bold text-[#1D1D22]">{corridor.matchRate}%</span>
                    <span className="block text-[10px] text-[#787571]">Match Rate</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[10px] uppercase font-semibold text-[#787571]">Fleet Allocated</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-[#1D1D22]">{corridor.liveVehicles} EVs</span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdjustFleet(corridor.id, -1);
                          }}
                          className="w-6 h-6 rounded-full bg-white border border-[#EAE5DC] flex items-center justify-center font-bold text-xs hover:bg-[#FAF7F2] cursor-pointer"
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAdjustFleet(corridor.id, 1);
                          }}
                          className="w-6 h-6 rounded-full bg-[#1D1D22] text-white flex items-center justify-center font-bold text-xs hover:bg-black cursor-pointer"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[10px] uppercase font-semibold text-[#787571]">Headway</span>
                    <span className="text-sm font-bold text-[#1D1D22] block mt-1">{corridor.headwayMin} min</span>
                    <span className="text-[10px] text-[#787571]">Avg wait: {corridor.avgWait}</span>
                  </div>
                </div>
              </div>
            );
          }

          // Passenger View
          return (
            <div
              key={corridor.id}
              onClick={() => setSelectedCorridorId(corridor.id)}
              className={`bg-white rounded-[24px] p-5 border transition-all cursor-pointer flex flex-col gap-3 shadow-[0_4px_20px_rgba(29,29,34,0.06)] ${
                isSelected ? 'border-2 border-[#1D1D22]' : 'border border-[#EAE5DC]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[15px] font-bold text-[#1D1D22]">{corridor.name}</h3>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#787571]">{corridor.subtitle}</span>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-bold text-[#1D1D22]">{corridor.matchRate}%</span>
                  <span className="block text-[10px] text-[#787571]">Match Rate</span>
                </div>
              </div>

              {/* Waypoint Sequence */}
              <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-[#FAF7F2] text-[#1D1D22] border border-[#EAE5DC] overflow-x-auto no-scrollbar text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1D1D22] shrink-0"></span>
                <span className="font-semibold whitespace-nowrap">{corridor.stops[0]}</span>
                <span className="text-[#787571]">→</span>
                <span className="text-[#787571] whitespace-nowrap">{corridor.stops[1]}</span>
                {corridor.stops[2] && (
                  <>
                    <span className="text-[#787571]">→</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F5C451] shrink-0"></span>
                    <span className="font-semibold text-[#1D1D22] whitespace-nowrap">{corridor.stops[2]}</span>
                  </>
                )}
              </div>

              {/* Quick Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center justify-between">
                  <span className="text-[#787571]">Active Cabs</span>
                  <span className="font-bold text-[#1D1D22]">{corridor.liveVehicles} Live</span>
                </div>
                <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center justify-between">
                  <span className="text-[#787571]">Avg Wait</span>
                  <span className="font-bold text-[#1D1D22]">{corridor.avgWait}</span>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectCorridor(corridor);
                }}
                className="w-full py-2.5 rounded-full bg-[#1D1D22] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer mt-1"
              >
                <span>Book Pooled Ride on this Route</span>
                <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
