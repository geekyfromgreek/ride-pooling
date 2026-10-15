import React, { useState, useEffect } from 'react';
import LeafletMap from '../components/LeafletMap';
import { FLEET_VEHICLES } from '../data/nashikLocations';

/**
 * PoolIQ Fleet Telemetry Screen — Warm Humanist Interface
 * Clean vehicle roster with live EV battery states, seat occupancy, and daylight map.
 */
export default function FleetScreen({ backendVehicles = null }) {
  const [filter, setFilter] = useState('all');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshCountdown, setRefreshCountdown] = useState(5);
  const [vehicles, setVehicles] = useState(FLEET_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState('V1');
  const [avgSpeed, setAvgSpeed] = useState(31);
  const [utilization, setUtilization] = useState(88);

  useEffect(() => {
    if (backendVehicles && backendVehicles.length > 0) {
      const merged = FLEET_VEHICLES.map((fallback, idx) => {
        const bv = backendVehicles[idx];
        if (!bv) return fallback;
        const hasRoute = bv.route && bv.route.length > 0;
        const isOnboard = bv.onboard && bv.onboard.length > 0;
        const isTransit = hasRoute || isOnboard || fallback.status === 'transit';
        return {
          ...fallback,
          id: bv.id || fallback.id,
          status: fallback.status === 'maintenance' ? 'maintenance' : (isTransit ? 'transit' : 'terminal'),
          statusLabel: fallback.status === 'maintenance' ? 'Maintenance' : (isTransit ? 'In Transit' : 'At Terminal'),
          routeVector: hasRoute ? 'Active Optimized Dispatch' : fallback.routeVector,
          speed: fallback.status === 'maintenance' ? '0 km/h' : (isTransit ? (fallback.speed === '0 km/h' ? '36 km/h' : fallback.speed) : '0 km/h'),
          soc: fallback.soc,
          driver: fallback.driver,
          seatsTotal: bv.capacity || fallback.seatsTotal,
          seatsOccupied: bv.onboard ? bv.onboard.length : fallback.seatsOccupied,
          lat: bv.position ? bv.position.lat : fallback.lat,
          lon: bv.position ? bv.position.lon : fallback.lon
        };
      });
      setVehicles(merged);
    }
  }, [backendVehicles]);

  useEffect(() => {
    if (!autoRefresh) return;
    const timer = setInterval(() => {
      setRefreshCountdown((prev) => (prev <= 1 ? 5 : prev - 1));
      setVehicles((curr) =>
        curr.map((v) => {
          if (v.status === 'transit') {
            const latJitter = (Math.random() - 0.5) * 0.0008;
            const lonJitter = (Math.random() - 0.5) * 0.0008;
            const spd = Math.floor(30 + Math.random() * 12);
            return {
              ...v,
              lat: v.lat + latJitter,
              lon: v.lon + lonJitter,
              speed: `${spd} km/h`
            };
          }
          return v;
        })
      );
      setAvgSpeed(Math.floor(30 + Math.random() * 5));
      setUtilization(Math.floor(82 + Math.random() * 8));
    }, 2500);
    return () => clearInterval(timer);
  }, [autoRefresh]);

  const filteredVehicles = vehicles.filter((v) => {
    if (filter === 'all') return true;
    return v.status === filter;
  });

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            Fleet Operations
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Real-time status of electric transit shuttles
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
          <span>{vehicles.filter(v => v.status !== 'maintenance').length} Online</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {[
          { key: 'all', label: `All (${vehicles.length})` },
          { key: 'transit', label: `In Transit (${vehicles.filter(v => v.status === 'transit').length})` },
          { key: 'terminal', label: `At Terminal (${vehicles.filter(v => v.status === 'terminal').length})` },
          { key: 'maintenance', label: `Service (${vehicles.filter(v => v.status === 'maintenance').length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-3 py-1.5 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.key
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'bg-white text-[#787571] hover:text-[#1D1D22] border border-[#EAE5DC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Fleet Map Deck */}
      <div className="relative w-full h-[240px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1]">
        <LeafletMap
          center={[19.9977, 73.7803]}
          zoom={12}
          fleetVehicles={filteredVehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={(veh) => setSelectedVehicleId(veh.id)}
          height="240px"
        />
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-1.5 text-xs font-semibold text-[#1D1D22]">
            <span className="w-2 h-2 rounded-full bg-[#1D1D22]"></span>
            <span>Tracking Vehicle {selectedVehicleId || 'V1'}</span>
          </div>
        </div>
      </div>

      {/* Fleet Metrics Strip */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-[24px] p-4 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col">
          <span className="text-[11px] font-medium text-[#787571] uppercase">Average Speed</span>
          <span className="text-[22px] font-bold text-[#1D1D22] mt-0.5">{avgSpeed} km/h</span>
          <span className="text-[11px] text-[#787571]">Cruising in transit flow</span>
        </div>
        <div className="bg-white rounded-[24px] p-4 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col">
          <span className="text-[11px] font-medium text-[#787571] uppercase">Fleet Utilization</span>
          <span className="text-[22px] font-bold text-[#1D1D22] mt-0.5">{utilization}%</span>
          <span className="text-[11px] text-[#787571]">Optimal seat allocation</span>
        </div>
      </div>

      {/* Vehicle Cards Roster */}
      <div className="flex flex-col gap-3">
        {filteredVehicles.map((v) => {
          const isSelected = selectedVehicleId === v.id;
          return (
            <div
              key={v.id}
              onClick={() => setSelectedVehicleId(v.id)}
              className={`bg-white rounded-[24px] p-5 border transition-all cursor-pointer flex flex-col gap-3 shadow-[0_4px_20px_rgba(29,29,34,0.06)] ${
                isSelected ? 'border-2 border-[#1D1D22]' : 'border border-[#EAE5DC]'
              }`}
            >
              <div className="flex items-start justify-between pb-2 border-b border-[#EAE5DC]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22]">
                    <span className="material-symbols-outlined text-[20px]">electric_car</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-[15px] font-bold text-[#1D1D22]">Vehicle {v.id}</h3>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
                      )}
                    </div>
                    <span className="text-[11px] text-[#787571]">
                      {v.driver} · {v.model} ({v.license})
                    </span>
                  </div>
                </div>

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                  v.status === 'transit'
                    ? 'bg-[#F5C451]/20 text-[#1D1D22] border border-[#F5C451]/40'
                    : v.status === 'terminal'
                    ? 'bg-[#FAF7F2] text-[#787571] border border-[#EAE5DC]'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {v.statusLabel || v.status}
                </span>
              </div>

              {/* Status details */}
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex flex-col">
                  <span className="text-[10px] uppercase text-[#787571]">Speed</span>
                  <span className="text-[13px] font-bold text-[#1D1D22] mt-0.5">{v.speed}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex flex-col">
                  <span className="text-[10px] uppercase text-[#787571]">Seats</span>
                  <span className="text-[13px] font-bold text-[#1D1D22] mt-0.5">{v.seatsOccupied}/{v.seatsTotal}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] flex flex-col">
                  <span className="text-[10px] uppercase text-[#787571]">Battery</span>
                  <span className="text-[13px] font-bold text-[#1D1D22] mt-0.5">{v.soc}</span>
                </div>
              </div>

              <div className="text-[11px] text-[#787571] flex items-center gap-1.5 px-1">
                <span className="material-symbols-outlined text-[14px] text-[#1D1D22]">turn_sharp_right</span>
                <span className="truncate">{v.routeVector}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
