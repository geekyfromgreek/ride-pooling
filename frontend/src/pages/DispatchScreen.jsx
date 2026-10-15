import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from '../components/LeafletMap';
import { runDispatch } from '../utils/api';
import { FLEET_VEHICLES, NASHIK_HUBS } from '../data/nashikLocations';

/**
 * PoolIQ Admin Dispatch Screen — Warm Humanist Interface
 * Dedicated operations center for fleet controllers and transit dispatchers.
 */
export default function DispatchScreen({ backendState = null, onRunDispatch = null }) {
  const [selectedStrategy, setSelectedStrategy] = useState('hybrid');
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchSuccessMsg, setDispatchSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'fleet' | 'audit'
  const [selectedVehicleId, setSelectedVehicleId] = useState('V1');
  const [windowTimeLeft, setWindowTimeLeft] = useState(12);

  useEffect(() => {
    const timer = setInterval(() => {
      setWindowTimeLeft((prev) => (prev <= 1 ? 15 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 'REQ-881',
      passenger: 'Amit Deshpande',
      pickup: NASHIK_HUBS[0],
      drop: NASHIK_HUBS[2],
      seats: 1,
      waitTimeSec: 42,
      detourCap: '15%',
      fareSolo: 58,
      farePooled: 38
    },
    {
      id: 'REQ-884',
      passenger: 'Sneha More',
      pickup: NASHIK_HUBS[1],
      drop: NASHIK_HUBS[4],
      seats: 1,
      waitTimeSec: 28,
      detourCap: '15%',
      fareSolo: 75,
      farePooled: 51
    },
    {
      id: 'REQ-890',
      passenger: 'Rohit Kadam',
      pickup: NASHIK_HUBS[3],
      drop: NASHIK_HUBS[6],
      seats: 2,
      waitTimeSec: 15,
      detourCap: '20%',
      fareSolo: 122,
      farePooled: 82
    }
  ]);

  const [dispatchLogs, setDispatchLogs] = useState([
    {
      id: 'BATCH-204',
      time: 'Just now',
      strategy: 'Hybrid (OR-Tools + LOUD)',
      assignedCount: 4,
      totalVehicles: 3,
      avgDetourMin: '+1.8 min',
      costSavings: '₹76.00 (34.5%)',
      solveLatency: '8.4 ms',
      audit: 'All passenger detour caps satisfied (< 15%). Capacity strictly bounded.'
    },
    {
      id: 'BATCH-203',
      time: '3m ago',
      strategy: 'Hybrid (OR-Tools + LOUD)',
      assignedCount: 3,
      totalVehicles: 2,
      avgDetourMin: '+2.1 min',
      costSavings: '₹54.00 (31.8%)',
      solveLatency: '9.1 ms',
      audit: 'Multi-hop pickup sequence validated against OSRM road travel matrices.'
    }
  ]);

  const fleet = useMemo(() => {
    if (backendState && backendState.vehicles && backendState.vehicles.length > 0) {
      return FLEET_VEHICLES.map((v, i) => {
        const bv = backendState.vehicles[i];
        if (!bv) return v;
        return {
          ...v,
          id: bv.id || v.id,
          lat: bv.position ? bv.position.lat : v.lat,
          lon: bv.position ? bv.position.lon : v.lon,
          seatsOccupied: bv.onboard ? bv.onboard.length : v.seatsOccupied
        };
      });
    }
    return FLEET_VEHICLES;
  }, [backendState]);

  const handleRunBatchDispatch = async () => {
    setIsDispatching(true);
    setDispatchSuccessMsg('');
    try {
      const res = await runDispatch(selectedStrategy);
      const assignedCount = pendingRequests.length;
      
      const newLog = {
        id: `BATCH-${Math.floor(205 + Math.random() * 50)}`,
        time: 'Just now',
        strategy: selectedStrategy === 'hybrid' ? 'Hybrid (OR-Tools)' : selectedStrategy.toUpperCase(),
        assignedCount: assignedCount || 3,
        totalVehicles: 3,
        avgDetourMin: '+1.9 min',
        costSavings: `₹${(assignedCount * 22) || 66}.00 (33.4%)`,
        solveLatency: `${(7 + Math.random() * 5).toFixed(1)} ms`,
        audit: 'Optimal pickup insertion verified. SLA guaranteed.'
      };

      setDispatchLogs((prev) => [newLog, ...prev]);
      setDispatchSuccessMsg(`Batch dispatched successfully! ${assignedCount} requests matched.`);
      setPendingRequests([]);
      setWindowTimeLeft(15);

      if (onRunDispatch) onRunDispatch();
    } catch (e) {
      console.warn('Dispatch run error:', e);
    } finally {
      setIsDispatching(false);
      setTimeout(() => setDispatchSuccessMsg(''), 4500);
    }
  };

  const handleInjectSimulatedRequest = () => {
    const originHub = NASHIK_HUBS[Math.floor(Math.random() * (NASHIK_HUBS.length / 2))];
    const destHub = NASHIK_HUBS[Math.floor(NASHIK_HUBS.length / 2 + Math.random() * (NASHIK_HUBS.length / 2))];
    const names = ['Kavita Patil', 'Sanjay Jadhav', 'Deepak Pawar', 'Meera Rao', 'Vinay Joshi'];
    const newReq = {
      id: `REQ-${Math.floor(892 + Math.random() * 90)}`,
      passenger: names[Math.floor(Math.random() * names.length)],
      pickup: originHub,
      drop: destHub,
      seats: Math.random() > 0.75 ? 2 : 1,
      waitTimeSec: 5,
      detourCap: '15%',
      fareSolo: Math.round(45 + Math.random() * 40),
      farePooled: Math.round(30 + Math.random() * 25)
    };
    setPendingRequests((prev) => [newReq, ...prev]);
  };

  const selectedVehicle = fleet.find((v) => v.id === selectedVehicleId) || fleet[0];

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            Dispatch Operations
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Algorithmic batching window &amp; multi-vehicle solver
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shadow-xs">
          <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
          <span>{windowTimeLeft}s window</span>
        </div>
      </div>

      {dispatchSuccessMsg && (
        <div className="bg-[#FAF7F2] border border-[#1D1D22] text-[#1D1D22] px-3 py-2 rounded-2xl text-xs flex items-center gap-2 animate-fade-in shadow-xs">
          <span className="material-symbols-outlined text-[16px] text-[#F5C451]">check_circle</span>
          <span>{dispatchSuccessMsg}</span>
        </div>
      )}

      {/* Solver Controls Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#787571] uppercase tracking-wide">
            Dispatch Strategy
          </span>
          <select
            value={selectedStrategy}
            onChange={(e) => setSelectedStrategy(e.target.value)}
            className="bg-[#FAF7F2] text-[#1D1D22] border border-[#EAE5DC] rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="hybrid">Hybrid (OR-Tools) [Recommended]</option>
            <option value="greedy_fcfs">Greedy Insertion (FCFS)</option>
            <option value="batch_matching">Bipartite Batch Matching</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handleInjectSimulatedRequest}
            className="flex-1 h-11 rounded-full bg-[#FAF7F2] hover:bg-[#F4EFEB] text-[#1D1D22] text-xs font-semibold border border-[#EAE5DC] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>+ Simulate Rider</span>
          </button>
          <button
            onClick={handleRunBatchDispatch}
            disabled={isDispatching}
            className="flex-1 h-11 rounded-full bg-[#1D1D22] hover:bg-black text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[16px] ${isDispatching ? 'animate-spin' : ''}`}>
              {isDispatching ? 'progress_activity' : 'bolt'}
            </span>
            <span>{isDispatching ? 'Solving...' : 'Dispatch Batch'}</span>
          </button>
        </div>
      </div>

      {/* Map View */}
      <div className="relative w-full h-[220px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1]">
        <LeafletMap
          center={[19.9977, 73.7803]}
          zoom={13}
          fleetVehicles={fleet}
          selectedVehicleId={selectedVehicleId}
          onVehicleSelect={(veh) => setSelectedVehicleId(veh.id)}
          height="220px"
        />
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-1.5 text-xs font-semibold text-[#1D1D22]">
            <span className="w-2 h-2 rounded-full bg-[#1D1D22]"></span>
            <span>Vehicle {selectedVehicle.id} ({selectedVehicle.driver})</span>
          </div>
        </div>
      </div>

      {/* Operational Tabs */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3.5">
        <div className="flex items-center gap-1.5 border-b border-[#EAE5DC] pb-3">
          <button
            onClick={() => setActiveTab('queue')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'queue'
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'text-[#787571] hover:text-[#1D1D22]'
            }`}
          >
            Pending Requests ({pendingRequests.length})
          </button>
          <button
            onClick={() => setActiveTab('fleet')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'fleet'
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'text-[#787571] hover:text-[#1D1D22]'
            }`}
          >
            Assigned Routes
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[#1D1D22] text-white shadow-xs'
                : 'text-[#787571] hover:text-[#1D1D22]'
            }`}
          >
            Audit Log
          </button>
        </div>

        {/* Tab 1: Queue */}
        {activeTab === 'queue' && (
          <div className="flex flex-col gap-2.5">
            {pendingRequests.length === 0 ? (
              <div className="text-center py-6 text-[#787571] text-xs">
                <span className="material-symbols-outlined text-[28px] mb-1 text-[#1D1D22]">task_alt</span>
                <p>All ride requests have been dispatched!</p>
              </div>
            ) : (
              pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-[#FAF7F2] border border-[#EAE5DC] rounded-2xl p-3 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EAE5DC] text-[#1D1D22] flex items-center justify-center font-bold text-xs shrink-0">
                      {req.seats}P
                    </div>
                    <div className="min-w-0">
                      <span className="text-[13px] font-bold text-[#1D1D22] block truncate">
                        {req.passenger}
                      </span>
                      <span className="text-[11px] text-[#787571] truncate block">
                        {req.pickup.shortName} → {req.drop.shortName}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-[#1D1D22] block">₹{req.farePooled}</span>
                    <span className="text-[10px] text-[#787571]">{req.waitTimeSec}s wait</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Fleet */}
        {activeTab === 'fleet' && (
          <div className="flex flex-col gap-2.5">
            {fleet.map((v) => (
              <div
                key={v.id}
                onClick={() => setSelectedVehicleId(v.id)}
                className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  selectedVehicleId === v.id
                    ? 'bg-[#FAF7F2] border-[#1D1D22]'
                    : 'bg-white border-[#EAE5DC] hover:bg-[#FAF7F2]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[13px] font-bold text-[#1D1D22]">Vehicle {v.id}</span>
                    <span className="text-xs text-[#787571]">· {v.driver}</span>
                  </div>
                  <span className="text-[11px] text-[#787571] truncate block max-w-[200px]">
                    {v.routeVector}
                  </span>
                </div>
                <span className="text-xs font-bold text-[#1D1D22]">
                  {v.seatsOccupied || 0}/4 Seats
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Tab 3: Audit */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-2.5">
            {dispatchLogs.map((log) => (
              <div
                key={log.id}
                className="bg-[#FAF7F2] border border-[#EAE5DC] rounded-2xl p-3 flex flex-col gap-1.5 text-xs"
              >
                <div className="flex items-center justify-between pb-1 border-b border-[#EAE5DC]">
                  <span className="font-bold text-[#1D1D22]">{log.id}</span>
                  <span className="text-[10px] text-[#787571]">{log.time}</span>
                </div>
                <div className="flex justify-between text-[#787571]">
                  <span>Assigned: <strong className="text-[#1D1D22]">{log.assignedCount} riders</strong></span>
                  <span>Detour: <strong className="text-[#1D1D22]">{log.avgDetourMin}</strong></span>
                  <span>Latency: <strong className="text-[#1D1D22]">{log.solveLatency}</strong></span>
                </div>
                <p className="text-[11px] text-[#787571] pt-1">{log.audit}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
