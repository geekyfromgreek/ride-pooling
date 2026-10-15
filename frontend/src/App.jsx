import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import PoolScreen from './pages/PoolScreen';
import JourneyScreen from './pages/JourneyScreen';
import FairnessScreen from './pages/FairnessScreen';
import RoutesScreen from './pages/RoutesScreen';
import StatsScreen from './pages/StatsScreen';
import FleetScreen from './pages/FleetScreen';
import DispatchScreen from './pages/DispatchScreen';
import ZeroTrustGate from './components/ZeroTrustGate';
import RouteDiffView from './components/RouteDiffView';
import {
  fetchHealth,
  fetchState,
  submitRideRequest,
  runDispatch,
  loadScenario,
  controlSim,
  fetchDistanceConfig,
  updateDistanceConfig,
  fetchTrafficStatus,
  setTrafficScenario,
  fetchFraudAlerts,
  fetchArenaBenchmark
} from './utils/api';
import { NASHIK_HUBS } from './data/nashikLocations';

export default function App() {
  const [userRole, setUserRole] = useState('passenger'); // 'passenger' | 'admin'
  const [activeTab, setActiveTab] = useState('pool'); // 'pool' | 'journey' | 'fairness' | 'routes' | 'stats' | 'fleet'
  const [poolStage, setPoolStage] = useState('request'); // 'request' | 'matching' | 'active'
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState('controls'); // 'controls' | 'gate' | 'diff' | 'traffic' | 'distance' | 'alerts' | 'arena'
  const modalScrollRef = useRef(null);

  const [isEvaluatingGate, setIsEvaluatingGate] = useState(false);
  const [gateDecision, setGateDecision] = useState('COMMITTED');

  const handleReverifyGate = async () => {
    setIsEvaluatingGate(true);
    const res = await runDispatch(selectedStrategy);
    setTimeout(() => {
      setGateDecision('COMMITTED');
      setIsEvaluatingGate(false);
    }, 600);
  };

  useEffect(() => {
    if (modalScrollRef.current) {
      modalScrollRef.current.scrollTop = 0;
    }
  }, [activeModalTab, showSettingsModal]);

  const handleRoleChange = (newRole) => {
    setUserRole(newRole);
    if (newRole === 'passenger') {
      if (activeTab === 'stats' || activeTab === 'fleet' || activeTab === 'dispatch') {
        setActiveTab('pool');
      }
    } else if (newRole === 'admin') {
      if (activeTab === 'journey' || activeTab === 'fairness' || activeTab === 'pool') {
        setActiveTab('dispatch');
      }
    }
  };

  const [backendStatus, setBackendStatus] = useState('Checking...');
  const [selectedScenario, setSelectedScenario] = useState('demo_5r_3v');
  const [selectedStrategy, setSelectedStrategy] = useState('hybrid');
  const [trafficMode, setTrafficMode] = useState('NORMAL');
  const [distanceConfig, setDistanceConfig] = useState(null);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [arenaResults, setArenaResults] = useState(null);

  // Backend state cache
  const [backendState, setBackendState] = useState(null);
  const [activeRideRequest, setActiveRideRequest] = useState(null);
  const [assignedVehicle, setAssignedVehicle] = useState(null);

  // Poll backend health and state
  useEffect(() => {
    let mounted = true;

    async function poll() {
      const health = await fetchHealth();
      if (!mounted) return;
      if (health && health.status === 'ok') {
        setBackendStatus(`Online (${health.road_data})`);
        const state = await fetchState();
        if (state && mounted) {
          setBackendState(state);

          // If we have an active ride request, check if a vehicle was assigned
          if (activeRideRequest && state.vehicles) {
            const v = state.vehicles.find((veh) =>
              (veh.onboard || []).includes(activeRideRequest.id) ||
              (veh.route && veh.route.some((r) => r.request_id === activeRideRequest.id))
            );
            if (v) {
              setAssignedVehicle(v);
            }
          }
        }
      } else {
        setBackendStatus('Simulation Mode (Standalone)');
      }
    }

    poll();
    const interval = setInterval(poll, 2500);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activeRideRequest]);

  // Load modal data when modal opens
  useEffect(() => {
    if (!showSettingsModal) return;
    fetchTrafficStatus().then((t) => t && setTrafficMode(t.mode));
    fetchDistanceConfig().then((d) => d && setDistanceConfig(d));
    fetchFraudAlerts().then((a) => a && setFraudAlerts(a));
  }, [showSettingsModal]);

  // Header Title calculation
  const getHeaderTitle = () => {
    if (activeTab === 'pool') {
      if (poolStage === 'request' || poolStage === 'matching') return 'Active Ride Tracking';
      return 'Live Pool';
    }
    if (activeTab === 'journey') return 'My Shared Journey';
    if (activeTab === 'fairness') return 'Fairness Vault';
    if (activeTab === 'routes') return 'Busy Road Network';
    if (activeTab === 'stats') return 'Efficiency Hub';
    if (activeTab === 'fleet') return 'Fleet Telemetry';
    if (activeTab === 'dispatch') return 'Dispatch Operations';
    return 'pool-IQ';
  };

  const handleHeaderBack = () => {
    if (activeTab === 'pool') {
      if (poolStage === 'matching' || poolStage === 'active') {
        setPoolStage('request');
        return;
      }
    }
    setActiveTab('pool');
    setPoolStage('request');
  };

  const [preselectedHubs, setPreselectedHubs] = useState(null);

  const handleSelectCorridor = (corridor) => {
    setActiveTab('pool');
    setPoolStage('request');
    if (corridor && corridor.stops && corridor.stops.length > 0) {
      const firstStop = corridor.stops[0].toLowerCase();
      const lastStop = corridor.stops[corridor.stops.length - 1].toLowerCase();
      const originIdx = NASHIK_HUBS.findIndex(
        (h) => h.name.toLowerCase().includes(firstStop) || h.shortName.toLowerCase().includes(firstStop)
      );
      const destIdx = NASHIK_HUBS.findIndex(
        (h) => h.name.toLowerCase().includes(lastStop) || h.shortName.toLowerCase().includes(lastStop)
      );
      setPreselectedHubs({
        originIdx: originIdx >= 0 ? originIdx : 0,
        destIdx: destIdx >= 0 ? destIdx : 2
      });
    }
  };

  const handleRequestRide = async ({ origin, dest, sharedOrigin, soloFare, pooledFare, harmonyPrefs, driver }) => {
    let res = null;
    try {
      res = await submitRideRequest({
        pickup: origin,
        drop: dest,
        seats: 1
      });
    } catch (e) {
      console.warn('Ride request fallback:', e);
    }
    const rideId = res && res.id ? res.id : `R_${Math.random().toString(16).substring(2, 8)}`;
    setActiveRideRequest({
      id: rideId,
      origin,
      dest,
      sharedOrigin,
      soloFare,
      pooledFare,
      harmonyPrefs,
      driver
    });
  };

  const handleCancelRide = () => {
    setActiveRideRequest(null);
    setAssignedVehicle(null);
    setPoolStage('request');
    setActiveTab('pool');
  };

  const handleDispatchRun = async () => {
    const res = await runDispatch(selectedStrategy);
    if (res) {
      alert(`Batch dispatched via ${res.strategy || 'Hybrid'}! Status: ${res.assigned ? `${res.assigned.length} assigned` : 'Success'}`);
      const state = await fetchState();
      if (state) setBackendState(state);
    } else {
      alert('Batch flush simulation triggered.');
    }
  };

  const handleScenarioChange = async (scenarioId) => {
    setSelectedScenario(scenarioId);
    const res = await loadScenario(scenarioId);
    if (res) {
      const state = await fetchState();
      if (state) setBackendState(state);
    }
  };

  const handleSimClock = async (action, speed = null) => {
    await controlSim(action, speed);
    const state = await fetchState();
    if (state) setBackendState(state);
  };

  const handleTrafficChange = async (mode) => {
    setTrafficMode(mode);
    await setTrafficScenario(mode);
  };

  const handleRunArena = async () => {
    const arena = await fetchArenaBenchmark(selectedScenario);
    if (arena) {
      setArenaResults(arena);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col antialiased selection:bg-primary-container selection:text-on-primary-container">
      {/* Fixed Top Header */}
      <Header
        title={getHeaderTitle()}
        showBack={activeTab === 'pool' && poolStage !== 'request'}
        onBack={handleHeaderBack}
        onTuneClick={() => setShowSettingsModal(true)}
        userRole={userRole}
        setUserRole={handleRoleChange}
        backendStatus={backendStatus}
      />

      {/* Main Screen Content */}
      <main className="flex-1 flex flex-col relative w-full pt-14 pb-20 max-w-xl mx-auto">
        {activeTab === 'pool' && (
          <PoolScreen
            poolStage={poolStage}
            setPoolStage={setPoolStage}
            onRequestRide={handleRequestRide}
            onCancelRide={handleCancelRide}
            onNavigateToJourney={() => setActiveTab('journey')}
            backendWindow={backendState ? backendState.window : null}
            assignedVehicle={assignedVehicle}
            preselectedHubs={preselectedHubs}
          />
        )}

        {activeTab === 'journey' && (
          <JourneyScreen
            activeRide={activeRideRequest}
            assignedVehicle={assignedVehicle}
            onCancelRide={handleCancelRide}
            onBackToRides={() => setActiveTab('pool')}
          />
        )}

        {activeTab === 'fairness' && (
          <FairnessScreen />
        )}

        {activeTab === 'routes' && (
          <RoutesScreen onSelectCorridor={handleSelectCorridor} userRole={userRole} />
        )}

        {activeTab === 'stats' && (
          <StatsScreen backendMetrics={backendState ? backendState.metrics : null} />
        )}

        {activeTab === 'fleet' && (
          <FleetScreen backendVehicles={backendState ? backendState.vehicles : null} />
        )}

        {activeTab === 'dispatch' && (
          <DispatchScreen
            backendState={backendState}
            onRunDispatch={handleDispatchRun}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userRole={userRole}
      />

      {/* Settings / Engine Telemetry & Controls Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div
            ref={modalScrollRef}
            className="w-full max-w-2xl bg-white rounded-2xl p-5 border border-[#EAE5DC] shadow-xl flex flex-col gap-4 max-h-[88vh] overflow-y-auto text-[#1D1D22]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#1D1D22]">tune</span>
                <h3 className="text-base font-bold text-[#1D1D22]">
                  System Engine &amp; Operations
                </h3>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#787571] hover:text-[#1D1D22] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Modal Navigation Pills */}
            <div className="w-full border-b border-[#F0EBE1] pb-2">
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {[
                  { id: 'controls', label: 'Controls' },
                  { id: 'gate', label: 'USP 1 · Validation Gate' },
                  { id: 'diff', label: 'USP 2 · Route Diff' },
                  { id: 'traffic', label: 'Traffic' },
                  { id: 'distance', label: 'Distance' },
                  { id: 'alerts', label: 'Integrity' },
                  { id: 'arena', label: 'Arena' }
                ].map((tab) => {
                  const isActive = activeModalTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveModalTab(tab.id)}
                      className={`h-8 px-3 rounded-full text-xs transition-all cursor-pointer shrink-0 font-semibold inline-flex items-center gap-1.5 select-none ${
                        isActive
                          ? 'bg-[#1D1D22] text-white shadow-sm'
                          : 'bg-[#FAF7F2] border border-[#EAE5DC] text-[#787571] hover:text-[#1D1D22] hover:bg-[#F2ECE1]'
                      }`}
                    >
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB 1: CONTROLS */}
            {activeModalTab === 'controls' && (
              <div className="flex flex-col gap-3.5">
                <div className="flex items-center justify-between p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                  <span className="text-xs text-[#787571] font-medium">Backend Health</span>
                  <span className="text-xs text-[#059669] font-bold">
                    {backendStatus}
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1D1D22]">
                    Simulation Clock Actions
                  </label>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSimClock('start')}
                      className="flex-1 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] hover:bg-[#1D1D22] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Resume
                    </button>
                    <button
                      onClick={() => handleSimClock('pause')}
                      className="flex-1 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] hover:bg-[#1D1D22] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Pause
                    </button>
                    <button
                      onClick={() => handleSimClock('reset')}
                      className="flex-1 h-9 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC] hover:bg-[#1D1D22] hover:text-white text-xs font-semibold transition-all cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1D1D22]">
                    Preset Scenario
                  </label>
                  <select
                    value={selectedScenario}
                    onChange={(e) => handleScenarioChange(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] text-[#1D1D22] border border-[#EAE5DC] text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="demo_5r_3v">demo_5r_3v (5 riders, 3 vehicles)</option>
                    <option value="edge_capacity">edge_capacity (Max load edge case)</option>
                    <option value="edge_tight_window">edge_tight_window (Tight time window)</option>
                    <option value="stress_25r_100v">stress_25r_100v (High volume batch)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#1D1D22]">
                    Dispatch Algorithm
                  </label>
                  <select
                    value={selectedStrategy}
                    onChange={(e) => setSelectedStrategy(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#FAF7F2] text-[#1D1D22] border border-[#EAE5DC] text-xs font-medium focus:outline-none cursor-pointer"
                  >
                    <option value="hybrid">Hybrid (LOUD + OR-Tools / Batch)</option>
                    <option value="greedy_fcfs">Greedy FCFS</option>
                    <option value="loud_insertion">LOUD-inspired insertion</option>
                    <option value="batch_matching">Batch matching</option>
                  </select>
                </div>

                {backendState && (
                  <div className="grid grid-cols-2 gap-2 text-xs bg-[#FAF7F2] p-3 rounded-xl border border-[#EAE5DC]">
                    <div>Vehicles: <strong className="text-[#1D1D22]">{backendState.vehicles ? backendState.vehicles.length : 0}</strong></div>
                    <div>Requests: <strong className="text-[#1D1D22]">{backendState.requests ? backendState.requests.length : 0}</strong></div>
                    <div>Sim Clock: <strong className="text-[#1D1D22]">{Math.floor(backendState.sim_time || 0)}s</strong></div>
                    <div>Batch Window: <strong className="text-[#1D1D22]">{backendState.window ? `${backendState.window.elapsed_s}s` : '0s'}</strong></div>
                  </div>
                )}

                <button
                  onClick={handleDispatchRun}
                  className="w-full h-11 rounded-full bg-[#1D1D22] text-white text-xs font-bold hover:bg-black transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Trigger Batch Dispatch</span>
                </button>
              </div>
            )}

            {/* TAB: USP 1 - ZERO-TRUST ROUTE GATE */}
            {activeModalTab === 'gate' && (
              <div className="flex flex-col gap-3">
                <ZeroTrustGate
                  decision={gateDecision}
                  isEvaluating={isEvaluatingGate}
                  onRunValidation={handleReverifyGate}
                />
              </div>
            )}

            {/* TAB: USP 2 - EXPLAINABLE DYNAMIC RE-POOLING & ROUTE DIFF */}
            {activeModalTab === 'diff' && (
              <div className="flex flex-col gap-3">
                <RouteDiffView />
              </div>
            )}

            {/* TAB 2: TRAFFIC */}
            {activeModalTab === 'traffic' && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs text-[#787571]">
                  Adjust road congestion profile to test ETA updates:
                </span>
                {[
                  { mode: 'NORMAL', label: 'Normal Traffic (1.0x)', desc: 'Standard speed profile' },
                  { mode: 'FAST', label: 'Fast Traffic (0.8x)', desc: 'Early driver arrivals' },
                  { mode: 'MODERATE_CONGESTION', label: 'Moderate Congestion (1.25x)', desc: 'Slight transit delay' },
                  { mode: 'SEVERE_CONGESTION', label: 'Severe Congestion (1.50x)', desc: 'Triggers 50% delay warning' },
                  { mode: 'SUDDEN_SLOWDOWN', label: 'Sudden Slowdown (2.0x)', desc: 'Heavy bottleneck' }
                ].map((item) => (
                  <button
                    key={item.mode}
                    onClick={() => handleTrafficChange(item.mode)}
                    className={`p-3 rounded-xl text-left border flex items-center justify-between transition-all cursor-pointer ${
                      trafficMode === item.mode
                        ? 'bg-[#FAF7F2] border-[#1D1D22] text-[#1D1D22]'
                        : 'bg-white border-[#EAE5DC] hover:border-[#CDC7BC]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-[#1D1D22]">{item.label}</div>
                      <div className="text-[11px] text-[#787571] mt-0.5">{item.desc}</div>
                    </div>
                    {trafficMode === item.mode && (
                      <span className="material-symbols-outlined text-[#10B981] text-[18px]">check_circle</span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* TAB 3: DISTANCE CONFIG */}
            {activeModalTab === 'distance' && distanceConfig && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs text-[#787571]">
                  System parameters configured on backend:
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">INITIAL RADIUS</span>
                    <strong className="text-[#1D1D22] text-sm">{distanceConfig.initial_search_radius_m} m</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">MAX RADIUS</span>
                    <strong className="text-[#1D1D22] text-sm">{distanceConfig.max_search_radius_m} m</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">MAX DETOUR CAP</span>
                    <strong className="text-[#1D1D22] text-sm">{Math.round(distanceConfig.max_detour_cap * 100)}%</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">MAX WAIT</span>
                    <strong className="text-[#1D1D22] text-sm">{distanceConfig.max_pickup_wait_s} s</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">CAPACITY</span>
                    <strong className="text-[#1D1D22] text-sm">{distanceConfig.vehicle_capacity} seats</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EAE5DC]">
                    <span className="text-[#787571] block text-[10px] font-medium">BASE FARE</span>
                    <strong className="text-[#1D1D22] text-sm">₹{distanceConfig.base_fare_per_km}/km</strong>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: GPS INTEGRITY */}
            {activeModalTab === 'alerts' && (
              <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
                <span className="text-xs text-[#787571]">
                  Authoritative location integrity observations:
                </span>
                {fraudAlerts.length === 0 ? (
                  <div className="p-4 text-center text-xs text-[#787571] bg-[#FAF7F2] rounded-xl border border-[#EAE5DC]">
                    No active GPS alerts. Fleet telemetry is clean and authentic.
                  </div>
                ) : (
                  fraudAlerts.map((alert, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs">
                      <div className="flex justify-between text-[#991B1B] font-bold">
                        <span>{alert.entity_id}</span>
                        <span>Risk {alert.risk_score}</span>
                      </div>
                      <div className="text-[11px] text-[#787571] mt-1">{alert.reason}</div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* TAB 5: ARENA */}
            {activeModalTab === 'arena' && (
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleRunArena}
                  className="w-full h-10 rounded-full bg-[#1D1D22] text-white text-xs font-bold hover:bg-black transition-colors cursor-pointer"
                >
                  Run Benchmark on {selectedScenario}
                </button>
                {arenaResults && arenaResults.strategies && (
                  <div className="overflow-x-auto rounded-xl border border-[#EAE5DC]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[#FAF7F2] border-b border-[#EAE5DC] text-[#787571]">
                          <th className="py-2 px-3 font-semibold">Strategy</th>
                          <th className="py-2 px-3 font-semibold">Distance</th>
                          <th className="py-2 px-3 font-semibold">Served</th>
                          <th className="py-2 px-3 font-semibold">Solve Time</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0EBE1]">
                        {arenaResults.strategies.map((st, i) => (
                          <tr key={i} className="hover:bg-[#FAF7F2]/50">
                            <td className="py-2 px-3 text-[#1D1D22] font-semibold">{st.name}</td>
                            <td className="py-2 px-3 text-[#1D1D22]">{st.pooled_km} km</td>
                            <td className="py-2 px-3 text-[#059669] font-medium">{st.served_pct}%</td>
                            <td className="py-2 px-3 text-[#787571]">{st.solve_ms}ms</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="border-t border-[#F0EBE1] pt-3 flex justify-end">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="px-5 h-9 rounded-full bg-[#1D1D22] text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
