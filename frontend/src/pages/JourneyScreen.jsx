import React, { useState, useEffect, useMemo, useRef } from 'react';
import LeafletMap from '../components/LeafletMap';
import { NASHIK_HUBS, getSharedRideOrigin, getRandomDriver } from '../data/nashikLocations';
import { fetchRoadRoute, getAccurateDistance } from '../utils/routing';

// Calculate bearing between two coordinates in degrees (0 = North, 90 = East)
function calculateBearing(startLat, startLng, destLat, destLng) {
  const startLatRad = (startLat * Math.PI) / 180;
  const startLngRad = (startLng * Math.PI) / 180;
  const destLatRad = (destLat * Math.PI) / 180;
  const destLngRad = (destLng * Math.PI) / 180;

  const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
  const x =
    Math.cos(startLatRad) * Math.sin(destLatRad) -
    Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
  const brng = (Math.atan2(y, x) * 180) / Math.PI;
  return (brng + 360) % 360;
}

// Interpolate point along a polyline given fractional progress 0 <= t <= 1
function getInterpolatedPoint(polyline, t) {
  if (!polyline || polyline.length === 0) return null;
  if (polyline.length === 1 || t <= 0) {
    return { lat: polyline[0][0], lon: polyline[0][1], bearing: 0 };
  }
  if (t >= 1) {
    const last = polyline[polyline.length - 1];
    const prev = polyline[polyline.length - 2] || last;
    return {
      lat: last[0],
      lon: last[1],
      bearing: calculateBearing(prev[0], prev[1], last[0], last[1])
    };
  }

  let totalDist = 0;
  const segDists = [];
  for (let i = 0; i < polyline.length - 1; i++) {
    const d = Math.hypot(polyline[i + 1][0] - polyline[i][0], polyline[i + 1][1] - polyline[i][1]);
    segDists.push(d);
    totalDist += d;
  }

  if (totalDist === 0) {
    return { lat: polyline[0][0], lon: polyline[0][1], bearing: 0 };
  }

  const targetDist = Math.max(0, Math.min(1, t)) * totalDist;
  let accumulated = 0;

  for (let i = 0; i < segDists.length; i++) {
    const nextAcc = accumulated + segDists[i];
    if (targetDist <= nextAcc || i === segDists.length - 1) {
      const segT = segDists[i] > 0 ? (targetDist - accumulated) / segDists[i] : 0;
      const p1 = polyline[i];
      const p2 = polyline[i + 1];
      const lat = p1[0] + (p2[0] - p1[0]) * segT;
      const lon = p1[1] + (p2[1] - p1[1]) * segT;
      const bearing = calculateBearing(p1[0], p1[1], p2[0], p2[1]);
      return { lat, lon, bearing };
    }
    accumulated = nextAcc;
  }

  return { lat: polyline[0][0], lon: polyline[0][1], bearing: 0 };
}

/**
 * My Shared Journey — Warm Humanist Interface
 * Features continuous 60fps cab tracking from approach to drop-off (Zomato/Blinkit style),
 * live co-rider waypoint sequence, and authentic ride booking details.
 */
export default function JourneyScreen({
  activeRide = null,
  assignedVehicle = null,
  onCancelRide = null,
  onBackToRides = null
}) {
  if (!activeRide) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-12 max-w-md mx-auto text-center select-none animate-fade-in my-auto">
        <div className="w-20 h-20 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center mb-5 shadow-xs">
          <span className="material-symbols-outlined text-[36px] text-[#1D1D22]">
            directions_car
          </span>
        </div>

        <h2 className="text-[22px] font-bold text-[#1D1D22] tracking-tight mb-2">
          Start your shared journey
        </h2>

        <p className="text-[13.5px] text-[#787571] leading-relaxed max-w-xs mb-8">
          You don't have an active pooled ride right now. Book a ride to save up to 35% on solo fares and track your journey in real time.
        </p>

        <button
          onClick={onBackToRides}
          className="w-full max-w-xs h-13 py-3.5 bg-[#1D1D22] hover:bg-black active:scale-[0.98] text-white font-semibold text-[15px] rounded-full shadow-[0_4px_14px_rgba(29,29,34,0.18)] transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[20px] text-[#F5C451]">near_me</span>
          <span>Book a Ride</span>
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </button>
      </div>
    );
  }

  // Origin Hub: defaults to PVG COE (Mhasrul) or active ride pickup
  const origin = useMemo(() => {
    if (activeRide?.origin) return activeRide.origin;
    const pvg = NASHIK_HUBS.find((h) => h.id === 'pvg_coe');
    return pvg || NASHIK_HUBS[0];
  }, [activeRide?.origin]);

  // Destination Hub: defaults to Gangapur Road or active ride drop
  const dest = useMemo(() => {
    if (activeRide?.dest) return activeRide.dest;
    return NASHIK_HUBS[2]; // Gangapur Road
  }, [activeRide?.dest]);

  const [randomSeed, setRandomSeed] = useState(() => Math.floor(Math.random() * 10000));
  const sharedOrigin = useMemo(() => {
    if (activeRide?.sharedOrigin) return activeRide.sharedOrigin;
    return getSharedRideOrigin(origin, dest, randomSeed);
  }, [activeRide?.sharedOrigin, origin, dest, randomSeed]);

  const accurate = getAccurateDistance(origin, dest);
  const directDistanceKm = accurate.km;
  const directTimeMin = accurate.min;

  const approachAccurate = getAccurateDistance(sharedOrigin, origin);
  const approachDistanceKm = approachAccurate.km;

  const detourMinutes = 2.1;

  // Active Fare computation
  const soloFare = activeRide?.soloFare || Math.round(30 + directDistanceKm * 11);
  const pooledFare = activeRide?.pooledFare || Math.round(soloFare * 0.65);
  const netSaved = soloFare - pooledFare;

  // Co-Rider Harmony preferences
  const harmony = activeRide?.harmonyPrefs || {
    quietCommute: true,
    womenVerified: false,
    bootSpace: true,
    cabinTemp: 23
  };

  // Assigned Unique Driver for this booking
  const driver = useMemo(() => {
    if (activeRide?.driver) return activeRide.driver;
    return getRandomDriver(harmony?.womenVerified, randomSeed);
  }, [activeRide?.driver, harmony?.womenVerified, randomSeed]);

  // Road Routing state
  const [routeCoords, setRouteCoords] = useState([]);
  const [approachRouteCoords, setApproachRouteCoords] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (sharedOrigin && origin) {
      fetchRoadRoute(sharedOrigin, origin).then((res) => {
        if (mounted && res && res.polyline && res.polyline.length > 1) {
          setApproachRouteCoords(res.polyline);
        }
      });
    }
    return () => { mounted = false; };
  }, [sharedOrigin, origin]);

  useEffect(() => {
    let mounted = true;
    if (origin && dest) {
      fetchRoadRoute(origin, dest).then((res) => {
        if (mounted && res && res.polyline && res.polyline.length > 1) {
          setRouteCoords(res.polyline);
        }
      });
    }
    return () => { mounted = false; };
  }, [origin, dest]);

  // Smooth fallback polylines with realistic road curves
  const effectiveApproachCoords = useMemo(() => {
    if (approachRouteCoords.length > 1) return approachRouteCoords;
    if (!sharedOrigin || !origin) return [];
    const coords = [];
    const steps = 18;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curveOffset = Math.sin(frac * Math.PI) * 0.004 * (i % 2 === 0 ? 1 : -0.7);
      coords.push([
        sharedOrigin.lat + (origin.lat - sharedOrigin.lat) * frac + curveOffset,
        sharedOrigin.lon + (origin.lon - sharedOrigin.lon) * frac - curveOffset
      ]);
    }
    return coords;
  }, [approachRouteCoords, sharedOrigin, origin]);

  const effectiveRouteCoords = useMemo(() => {
    if (routeCoords.length > 1) return routeCoords;
    if (!origin || !dest) return [];
    const coords = [];
    const steps = 24;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curveOffset = Math.sin(frac * Math.PI) * 0.005 * (i % 2 === 0 ? 0.8 : -0.5);
      coords.push([
        origin.lat + (dest.lat - origin.lat) * frac + curveOffset,
        origin.lon + (dest.lon - origin.lon) * frac - curveOffset
      ]);
    }
    return coords;
  }, [routeCoords, origin, dest]);

  // ─────────────────────────────────────────────────────────────
  // 60FPS CONTINUOUS CAB SIMULATION ENGINE (Zomato / Blinkit Style)
  // Phases: 'approaching' -> 'arrived_pickup' -> 'in_transit' -> 'completed'
  // ─────────────────────────────────────────────────────────────
  const [simPhase, setSimPhase] = useState('approaching');
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [simPlaying, setSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1, 2, or 3
  const [boardingCountdown, setBoardingCountdown] = useState(3);
  const [cancelIsConfirm, setCancelIsConfirm] = useState(false);

  // 60fps Animation Loop
  useEffect(() => {
    if (!simPlaying) return;

    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setSimProgress((prev) => {
        if (simPhase === 'approaching') {
          // Approach takes ~7.5 seconds at 1x
          const delta = dt * 0.13 * simSpeed;
          const next = prev + delta;
          if (next >= 1) {
            setSimPhase('arrived_pickup');
            setBoardingCountdown(3);
            return 1;
          }
          return next;
        }

        if (simPhase === 'in_transit') {
          // Main trip takes ~13 seconds at 1x
          const delta = dt * 0.08 * simSpeed;
          const next = prev + delta;
          if (next >= 1) {
            setSimPhase('completed');
            return 1;
          }
          return next;
        }

        return prev;
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [simPlaying, simPhase, simSpeed]);

  // Boarding countdown timer when cab reaches pickup (Zomato/Blinkit arrival ripple moment)
  useEffect(() => {
    if (simPhase !== 'arrived_pickup' || !simPlaying) return;

    const timer = setInterval(() => {
      setBoardingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setSimPhase('in_transit');
          setSimProgress(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000 / simSpeed);

    return () => clearInterval(timer);
  }, [simPhase, simPlaying, simSpeed]);

  // Simulation Controls Handlers
  const handleReplaySimulation = () => {
    setSimPhase('approaching');
    setSimProgress(0);
    setSimPlaying(true);
    setBoardingCountdown(3);
  };

  const handleTogglePlayPause = () => {
    setSimPlaying((prev) => !prev);
  };

  const handleCycleSpeed = () => {
    setSimSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 3 : 1));
  };

  const handleImmediateBoarding = () => {
    setSimPhase('in_transit');
    setSimProgress(0);
    setBoardingCountdown(0);
  };

  // Interpolated cab coordinate and heading vector for the Leaflet map
  const currentVehicleCoord = useMemo(() => {
    const isFemale = driver?.gender === 'female';
    const vehicleType = driver?.vehicleType || 'ev';

    if (simPhase === 'approaching') {
      const pt = getInterpolatedPoint(effectiveApproachCoords, simProgress);
      if (!pt) return null;
      const minsLeft = Math.max(1, Math.ceil((1 - simProgress) * 2));
      return {
        lat: pt.lat,
        lon: pt.lon,
        bearing: pt.bearing,
        isApproaching: true,
        isAtPickup: false,
        isCompleted: false,
        vehicleType,
        coRidersCount: 1, // Driver + 1 co-rider already onboard
        isDriverFemale: isFemale,
        driverGender: driver?.gender || 'male',
        label: `${driver.model} · Arriving in ~${minsLeft}m`
      };
    }

    if (simPhase === 'arrived_pickup') {
      const firstBearing = effectiveRouteCoords.length > 1
        ? calculateBearing(effectiveRouteCoords[0][0], effectiveRouteCoords[0][1], effectiveRouteCoords[1][0], effectiveRouteCoords[1][1])
        : 0;
      return {
        lat: origin.lat,
        lon: origin.lon,
        bearing: firstBearing,
        isApproaching: false,
        isAtPickup: true,
        isCompleted: false,
        vehicleType,
        coRidersCount: 1, // At pickup, boarding user
        isDriverFemale: isFemale,
        driverGender: driver?.gender || 'male',
        label: `${driver.name} at Pickup · Boarding (${boardingCountdown}s)`
      };
    }

    if (simPhase === 'in_transit') {
      const pt = getInterpolatedPoint(effectiveRouteCoords, simProgress);
      if (!pt) return null;
      const minsLeft = Math.max(1, Math.ceil((1 - simProgress) * directTimeMin));
      return {
        lat: pt.lat,
        lon: pt.lon,
        bearing: pt.bearing,
        isApproaching: false,
        isAtPickup: false,
        isCompleted: false,
        vehicleType,
        coRidersCount: vehicleType === 'auto' ? 2 : 2, // In transit, co-rider + user onboard
        isDriverFemale: isFemale,
        driverGender: driver?.gender || 'male',
        label: `${driver.model} · On Trip (~${minsLeft}m left)`
      };
    }

    // Completed phase
    return {
      lat: dest.lat,
      lon: dest.lon,
      bearing: 0,
      isApproaching: false,
      isAtPickup: false,
      isCompleted: true,
      vehicleType,
      coRidersCount: 2,
      isDriverFemale: isFemale,
      driverGender: driver?.gender || 'male',
      label: 'Destination Reached · ₹Saved!'
    };
  }, [simPhase, simProgress, effectiveApproachCoords, effectiveRouteCoords, origin, dest, boardingCountdown, directTimeMin, driver]);

  const hasArrivedAtPickup = simPhase === 'arrived_pickup' || simPhase === 'in_transit' || simPhase === 'completed';

  const handleActiveCancel = () => {
    if (!cancelIsConfirm) {
      setCancelIsConfirm(true);
      setTimeout(() => setCancelIsConfirm(false), 5000);
      return;
    }
    if (onCancelRide) onCancelRide();
  };

  const rideCode = activeRide?.id ? (activeRide.id.startsWith('#') ? activeRide.id : `#${activeRide.id}`) : '#R_29e43c';

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* ─────────────────────────────────────────────────────────────
          1. HEADER TITLE & RIDE ID BADGE (Matching Screenshot 3)
      ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            My Shared Journey
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Real-time approach and continuous shared route
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-full bg-[#1D1D22] text-white text-[11px] font-semibold shadow-xs">
            Ride {rideCode}
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          2. SHARED TRIP STATUS BANNER (Matching Screenshot 3)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[20px] p-4 border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${simPhase === 'arrived_pickup' ? 'bg-[#10B981] animate-ping' : 'bg-[#F5C451]'}`}></span>
            <span className="text-[13px] font-bold text-[#1D1D22]">
              3-Stop Shared Trip
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#787571] px-2.5 py-0.5 bg-[#FAF7F2] rounded-full border border-[#EAE5DC]">
            Max 1.5 km Radius
          </span>
        </div>
        <p className="text-[12.5px] text-[#787571] leading-relaxed">
          {simPhase === 'approaching' && (
            `Vehicle started at ${sharedOrigin.shortName} (${approachDistanceKm} km away) with co-rider 1 and is approaching your pickup at ${origin.shortName}.`
          )}
          {simPhase === 'arrived_pickup' && (
            `Vehicle has arrived at ${origin.shortName}! Board now with your co-rider (${driver.model} · ${driver.plate}).`
          )}
          {simPhase === 'in_transit' && (
            `En route to ${dest.shortName} with co-rider onboard. Clean electric drive with optimized detour cap satisfied.`
          )}
          {simPhase === 'completed' && (
            `Successfully arrived at ${dest.shortName}! You pooled this trip and saved ₹${netSaved} while avoiding 0.6 kg CO₂.`
          )}
        </p>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAP VIEWPORT WITH ZOMATO/BLINKIT LIVE CAB ANIMATION
      ───────────────────────────────────────────────────────────── */}
      <div className="relative w-full h-[270px] rounded-[24px] overflow-hidden border border-[#EAE5DC] shadow-[0_4px_16px_rgba(29,29,34,0.06)] bg-[#EDE9E1]">
        <LeafletMap
          center={[origin.lat, origin.lon]}
          pickup={origin}
          drop={dest}
          sharedOrigin={sharedOrigin}
          approachRouteCoords={effectiveApproachCoords}
          routeCoords={effectiveRouteCoords}
          vehicleCoord={currentVehicleCoord}
          height="270px"
        />

        {/* Floating Live Status Pill (Top-Left) */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-2 text-xs font-semibold text-[#1D1D22]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                simPhase === 'arrived_pickup'
                  ? 'bg-[#10B981] animate-ping'
                  : simPhase === 'completed'
                  ? 'bg-[#3B82F6]'
                  : 'bg-[#F5C451] animate-pulse'
              }`}
            ></span>
            <span>
              {simPhase === 'approaching' && `Approaching pickup: ~${Math.max(1, Math.ceil((1 - simProgress) * 2))} min`}
              {simPhase === 'arrived_pickup' && `Vehicle at pickup (${boardingCountdown}s)`}
              {simPhase === 'in_transit' && `In transit to drop-off: ~${Math.max(1, Math.ceil((1 - simProgress) * directTimeMin))} min`}
              {simPhase === 'completed' && 'Arrived at drop-off'}
            </span>
          </div>
        </div>

        {/* Floating Simulation Controls Toolbar (Bottom-Right) */}
        <div className="absolute bottom-3 right-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md p-1 rounded-full border border-[#EAE5DC] shadow-md">
          {simPhase === 'arrived_pickup' && (
            <button
              onClick={handleImmediateBoarding}
              className="px-2.5 py-1 rounded-full bg-[#10B981] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-[#059669] cursor-pointer shadow-xs"
            >
              <span className="material-symbols-outlined text-[14px]">login</span>
              <span>Board Now</span>
            </button>
          )}

          <button
            onClick={handleTogglePlayPause}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D22] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
            title={simPlaying ? 'Pause simulation' : 'Play simulation'}
          >
            <span className="material-symbols-outlined text-[16px]">
              {simPlaying ? 'pause' : 'play_arrow'}
            </span>
          </button>

          <button
            onClick={handleCycleSpeed}
            className="px-2 h-7 rounded-full bg-[#FAF7F2] text-[#1D1D22] hover:bg-[#F0ECE4] text-[11px] font-bold flex items-center justify-center cursor-pointer transition-colors"
            title="Cycle simulation speed"
          >
            {simSpeed}x
          </button>

          <button
            onClick={handleReplaySimulation}
            className="w-7 h-7 rounded-full flex items-center justify-center text-[#1D1D22] hover:bg-[#FAF7F2] cursor-pointer transition-colors"
            title="Replay journey from approach"
          >
            <span className="material-symbols-outlined text-[16px]">replay</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. DRIVER & VEHICLE DETAILS CARD (Matching Screenshot 1)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-4">
        {/* Driver Profile Row */}
        <div className="flex items-center justify-between pb-3.5 border-b border-[#F0ECE4]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center font-bold text-[#1D1D22] text-sm">
                {driver.initials}
              </div>
              <div className="absolute -bottom-1 -right-1 bg-white border border-[#EAE5DC] rounded-full px-1.5 py-0.2 flex items-center gap-0.5 shadow-xs">
                <span className="material-symbols-outlined text-[11px] text-[#F5C451]">star</span>
                <span className="text-[10px] font-bold text-[#1D1D22]">{driver.rating}</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-[15px] font-bold text-[#1D1D22] leading-tight">
                  {driver.name}
                </h4>
                <span className="text-xs text-[#787571]">· {driver.model}</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-bold text-[#1D1D22] bg-[#FAF7F2] border border-[#EAE5DC] px-2 py-0.5 rounded-md">
                  {driver.plate}
                </span>
                <span className="text-[11px] text-[#787571]">
                  {simPhase === 'approaching' && 'Arriving in ~2 mins'}
                  {simPhase === 'arrived_pickup' && 'Arrived at your pickup'}
                  {simPhase === 'in_transit' && 'On trip to drop-off'}
                  {simPhase === 'completed' && 'Trip completed'}
                </span>
              </div>
            </div>
          </div>
          <a
            href="tel:+919876543210"
            className="w-10 h-10 rounded-full border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] hover:bg-[#FAF7F2] transition-colors cursor-pointer shadow-xs"
            title="Call Driver"
          >
            <span className="material-symbols-outlined text-[18px]">call</span>
          </a>
        </div>

        {/* 2-Column Telematics Summary (Matching Screenshot 1) */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-[#EAE5DC] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] shrink-0">
              <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#787571] uppercase block tracking-wider">
                Pickup Wait
              </span>
              <span className="text-[14px] font-bold text-[#1D1D22]">
                {simPhase === 'approaching' ? '~2 mins' : simPhase === 'arrived_pickup' ? 'At Pickup' : 'Boarded'}
              </span>
            </div>
          </div>

          <div className="bg-[#FAF7F2] rounded-2xl p-3 border border-[#EAE5DC] flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] shrink-0">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#787571] uppercase block tracking-wider">
                Co-Riders
              </span>
              <span className="text-[14px] font-bold text-[#1D1D22]">
                1 Matched
              </span>
            </div>
          </div>
        </div>

        {/* ─────────────────────────────────────────────────────────────
            5. FARE COMPARISON & SAVINGS CARD (Matching Screenshot 1)
        ───────────────────────────────────────────────────────────── */}
        <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#EAE5DC] flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#787571] uppercase tracking-wider">
              Fare Comparison
            </span>
            <div className="bg-[#F5C451]/25 border border-[#F5C451]/50 text-[#1D1D22] px-2.5 py-0.5 rounded-full flex items-center gap-1 text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">savings</span>
              <span>You saved ₹{netSaved}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Pooled Fare Box */}
            <div className="flex-1 bg-white rounded-xl p-2.5 border-2 border-[#1D1D22] flex items-center justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-medium text-[#787571] block">Pooled Fare</span>
                <span className="text-[18px] font-bold text-[#1D1D22]">₹{pooledFare}</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-[#F5C451]">check_circle</span>
            </div>

            {/* Solo Direct Reference Box */}
            <div className="flex-1 bg-white/70 rounded-xl p-2.5 border border-[#EAE5DC] flex items-center justify-between opacity-85">
              <div>
                <span className="text-[11px] font-medium text-[#787571] block">Solo Direct</span>
                <span className="text-[16px] font-semibold text-[#787571] line-through">₹{soloFare}</span>
              </div>
              <span className="text-[10px] font-medium text-[#787571]">Baseline</span>
            </div>
          </div>
        </div>

        {/* Cancel Ride Action Button */}
        <div className="pt-1">
          <button
            onClick={handleActiveCancel}
            className={`w-full h-11 rounded-full border transition-all flex items-center justify-center gap-1.5 shadow-xs font-semibold text-[13.5px] cursor-pointer ${
              cancelIsConfirm
                ? 'bg-red-50 border-red-300 text-red-600'
                : 'border-[#EAE5DC] bg-white text-[#1D1D22] hover:bg-[#FAF7F2]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px] text-[#787571]">
              {cancelIsConfirm ? 'warning' : 'close'}
            </span>
            <span>{cancelIsConfirm ? 'Confirm Cancellation?' : 'Cancel Ride'}</span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          6. STOP SEQUENCE CARD (Matching Screenshot 3)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-4">
        <span className="text-[12px] font-bold text-[#787571] uppercase tracking-wide">
          Stop Sequence
        </span>

        <div className="flex items-stretch gap-3.5">
          <div className="flex flex-col items-center py-1 shrink-0">
            {/* Step 1 Node */}
            <div className="w-3.5 h-3.5 rounded-full bg-[#787571] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div className="w-[1.5px] flex-1 bg-[#EAE5DC] my-1"></div>
            {/* Step 2 Node */}
            <div className="w-4 h-4 rounded-full bg-[#1D1D22] flex items-center justify-center shadow-xs">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div className="w-[1.5px] flex-1 bg-[#EAE5DC] my-1"></div>
            {/* Step 3 Node */}
            <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F5C451]"></div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 text-sm">
            {/* Stop 1 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-semibold text-[#787571] uppercase block">
                  1. Co-Rider Inbound
                </span>
                <span className="text-[13.5px] font-bold text-[#1D1D22]">
                  {sharedOrigin.name || sharedOrigin.shortName}
                </span>
              </div>
              <span className="text-[11px] font-medium text-[#787571] bg-[#FAF7F2] px-2.5 py-0.5 rounded-full border border-[#EAE5DC]">
                Onboard
              </span>
            </div>

            {/* Stop 2 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-bold text-[#1D1D22] uppercase block">
                  2. Your Pickup
                </span>
                <span className="text-[13.5px] font-bold text-[#1D1D22]">
                  {origin.name || origin.shortName}
                </span>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                  hasArrivedAtPickup
                    ? 'bg-[#10B981]/15 text-[#059669] border-[#10B981]/30'
                    : 'bg-[#F5C451]/20 text-[#1D1D22] border-[#F5C451]/40'
                }`}
              >
                {simPhase === 'approaching' && 'Next Stop'}
                {simPhase === 'arrived_pickup' && 'Boarding Now'}
                {simPhase === 'in_transit' && 'Boarded'}
                {simPhase === 'completed' && 'Completed'}
              </span>
            </div>

            {/* Stop 3 */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10.5px] font-semibold text-[#787571] uppercase block">
                  3. Your Drop-off
                </span>
                <span className="text-[13.5px] font-bold text-[#1D1D22]">
                  {dest.name || dest.shortName}
                </span>
              </div>
              <span className="text-[12px] font-bold text-[#1D1D22]">
                {directDistanceKm} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          7. CO-RIDER HARMONY PREFERENCES (Matching Screenshot 3)
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#787571] uppercase tracking-wide">
            Co-Rider Harmony Preferences
          </span>
          <span className="text-[11px] font-semibold text-[#059669] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
            Pool Agreement Active
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#1D1D22]">volume_off</span>
            <span className="font-semibold text-[#1D1D22]">Quiet Commute Lock</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#1D1D22]">luggage</span>
            <span className="font-semibold text-[#1D1D22]">Boot Space (1 Bag)</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#1D1D22]">ac_unit</span>
            <span className="font-semibold text-[#1D1D22]">Cabin AC: {harmony.cabinTemp || 23}°C</span>
          </div>

          <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#EAE5DC] flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px] text-[#1D1D22]">verified</span>
            <span className="font-semibold text-[#1D1D22]">Verified Profiles</span>
          </div>
        </div>
      </div>
    </div>
  );
}
