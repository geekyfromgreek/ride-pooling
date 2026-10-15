import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from '../components/LeafletMap';
import { NASHIK_HUBS, getSharedRideOrigin } from '../data/nashikLocations';
import { fetchRoadRoute, getAccurateDistance } from '../utils/routing';

/**
 * My Shared Journey — Warm Humanist Interface
 * Clean, tactile, passenger-centric shared ride experience.
 */
export default function JourneyScreen({ activeRide = null, assignedVehicle = null }) {
  const origin = activeRide?.origin || NASHIK_HUBS[0]; // CBS Chowk or user's pickup
  const dest = activeRide?.dest || NASHIK_HUBS[2];     // Gangapur Road or user's drop

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
  const pooledRideTimeMin = Math.round(directTimeMin + detourMinutes);

  const [routeCoords, setRouteCoords] = useState([]);
  const [approachRouteCoords, setApproachRouteCoords] = useState([]);
  const [vehicleIdx, setVehicleIdx] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);
  const [etaRemainingSeconds, setEtaRemainingSeconds] = useState(90);

  useEffect(() => {
    let mounted = true;
    if (sharedOrigin && origin) {
      fetchRoadRoute(sharedOrigin, origin).then((res) => {
        if (mounted && res && res.polyline) {
          setApproachRouteCoords(res.polyline);
        }
      });
    }
    return () => { mounted = false; };
  }, [sharedOrigin, origin]);

  useEffect(() => {
    let mounted = true;
    fetchRoadRoute(origin, dest).then((res) => {
      if (mounted && res && res.polyline) {
        setRouteCoords(res.polyline);
      }
    });
    return () => { mounted = false; };
  }, [origin, dest]);

  const effectiveApproachCoords = useMemo(() => {
    if (approachRouteCoords.length > 1) return approachRouteCoords;
    if (!sharedOrigin || !origin) return [];
    const coords = [];
    const steps = 14;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curveOffset = Math.sin(frac * Math.PI) * 0.005 * (i % 2 === 0 ? 1 : -0.6);
      coords.push([
        sharedOrigin.lat + (origin.lat - sharedOrigin.lat) * frac + curveOffset,
        sharedOrigin.lon + (origin.lon - sharedOrigin.lon) * frac - curveOffset
      ]);
    }
    return coords;
  }, [approachRouteCoords, sharedOrigin, origin]);

  useEffect(() => {
    if (!effectiveApproachCoords || effectiveApproachCoords.length === 0) return;
    if (hasArrived) return;

    const timer = setInterval(() => {
      const totalSteps = effectiveApproachCoords.length;
      const step = Math.max(1, Math.floor(totalSteps / 10));

      setVehicleIdx((prev) => {
        const next = prev + step;
        if (next >= totalSteps - 1) {
          setHasArrived(true);
          setEtaRemainingSeconds(0);
          clearInterval(timer);
          return totalSteps - 1;
        }
        return next;
      });

      setEtaRemainingSeconds((prev) => (prev > 10 ? prev - 10 : 0));
    }, 1500);

    return () => clearInterval(timer);
  }, [effectiveApproachCoords, hasArrived]);

  const currentVehicleCoord = useMemo(() => {
    if (effectiveApproachCoords && effectiveApproachCoords.length > 0) {
      const safeIdx = Math.min(vehicleIdx, effectiveApproachCoords.length - 1);
      return {
        lat: effectiveApproachCoords[safeIdx][0],
        lon: effectiveApproachCoords[safeIdx][1],
        isApproaching: !hasArrived,
        label: hasArrived
          ? `Arrived at ${origin.shortName}`
          : `Approaching from ${sharedOrigin.shortName}`
      };
    }
    return {
      lat: hasArrived ? origin.lat : sharedOrigin.lat,
      lon: hasArrived ? origin.lon : sharedOrigin.lon,
      isApproaching: !hasArrived,
      label: hasArrived ? `Arrived at ${origin.shortName}` : 'Approaching'
    };
  }, [effectiveApproachCoords, vehicleIdx, hasArrived, origin, sharedOrigin]);

  const handleReplayApproach = () => {
    setVehicleIdx(0);
    setHasArrived(false);
    setEtaRemainingSeconds(90);
  };

  const handleShuffleOrigin = () => {
    setRandomSeed(Math.floor(Math.random() * 10000));
    setVehicleIdx(0);
    setHasArrived(false);
    setEtaRemainingSeconds(90);
  };

  const soloFare = Math.round(30 + directDistanceKm * 11);
  const pooledFare = Math.round(soloFare * 0.65);
  const netSaved = soloFare - pooledFare;

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-8 max-w-md mx-auto select-none gap-4 animate-fade-in">
      {/* Header Info Banner */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-none">
            My Shared Journey
          </h2>
          <p className="text-[12px] text-[#787571] mt-1">
            Real-time approach and continuous shared route
          </p>
        </div>
        <div className="flex items-center gap-2">
          {!activeRide && (
            <button
              onClick={handleShuffleOrigin}
              className="px-2.5 py-1 rounded-full bg-white border border-[#EAE5DC] text-[#1D1D22] text-[11px] font-semibold flex items-center gap-1 shadow-xs hover:bg-[#F4EFEB] transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px] text-[#F5C451]">shuffle</span>
              <span>New Origin</span>
            </button>
          )}
          <span className="px-2.5 py-1 rounded-full bg-[#1D1D22] text-white text-[11px] font-semibold shadow-xs">
            Ride #{activeRide?.id || 'PJ-4821'}
          </span>
        </div>
      </div>

      {/* Shared Ride Corridor Info Card */}
      <div className="bg-white rounded-[20px] p-4 border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#F5C451]"></span>
            <span className="text-[12px] font-bold text-[#1D1D22]">
              3-Stop Shared Trip
            </span>
          </div>
          <span className="text-[11px] font-semibold text-[#787571] px-2 py-0.5 bg-[#FAF7F2] rounded-full border border-[#EAE5DC]">
            Max 1.5 km Radius
          </span>
        </div>
        <p className="text-[13px] text-[#787571] leading-relaxed">
          {hasArrived
            ? `Vehicle has arrived at ${origin.shortName} from ${sharedOrigin.shortName} (${approachDistanceKm} km). Board now with your co-rider!`
            : `Vehicle started at ${sharedOrigin.shortName} (${approachDistanceKm} km away) with co-rider 1 and is approaching your pickup at ${origin.shortName}.`}
        </p>
      </div>

      {/* Map Viewport Card */}
      <div className="relative w-full h-[260px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1]">
        <LeafletMap
          center={[origin.lat, origin.lon]}
          pickup={origin}
          drop={dest}
          sharedOrigin={sharedOrigin}
          approachRouteCoords={effectiveApproachCoords}
          routeCoords={routeCoords}
          vehicleCoord={currentVehicleCoord}
          height="260px"
        />
        {/* Floating Arrival Indicator */}
        <div className="absolute top-3 left-3 z-[400] pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-2 text-xs font-semibold text-[#1D1D22]">
            <span className={`w-2 h-2 rounded-full ${hasArrived ? 'bg-[#1D1D22]' : 'bg-[#F5C451] animate-pulse'}`}></span>
            <span>
              {hasArrived
                ? 'Vehicle at pickup'
                : `Approaching pickup: ~${Math.max(1, Math.ceil(etaRemainingSeconds / 60))} min`}
            </span>
          </div>
        </div>

        {hasArrived && (
          <button
            onClick={handleReplayApproach}
            className="absolute bottom-3 right-3 z-[400] bg-white px-3 py-1.5 rounded-full border border-[#EAE5DC] shadow-sm text-xs font-semibold text-[#1D1D22] flex items-center gap-1 hover:bg-[#FAF7F2] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[14px]">replay</span>
            <span>Replay</span>
          </button>
        )}
      </div>

      {/* Route Stops Breakdown Card */}
      <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col gap-4">
        <span className="text-[12px] font-semibold text-[#787571] uppercase tracking-wide">
          Stop Sequence
        </span>

        <div className="flex items-stretch gap-3.5">
          <div className="flex flex-col items-center py-1 shrink-0">
            <div className="w-3 h-3 rounded-full bg-[#787571] flex items-center justify-center">
              <div className="w-1 h-1 rounded-full bg-white"></div>
            </div>
            <div className="w-[1.5px] flex-1 bg-[#EAE5DC] my-1"></div>
            <div className="w-3.5 h-3.5 rounded-full bg-[#1D1D22] flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div className="w-[1.5px] flex-1 bg-[#EAE5DC] my-1"></div>
            <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F5C451]"></div>
          </div>

          <div className="flex-1 flex flex-col justify-between gap-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#787571] uppercase block">1. Co-rider Inbound</span>
                <span className="text-[14px] font-semibold text-[#1D1D22]">{sharedOrigin.name || sharedOrigin.shortName}</span>
              </div>
              <span className="text-[11px] font-medium text-[#787571] bg-[#FAF7F2] px-2 py-0.5 rounded-full border border-[#EAE5DC]">
                Onboard
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#1D1D22] uppercase font-bold block">2. Your Pickup</span>
                <span className="text-[14px] font-bold text-[#1D1D22]">{origin.name || origin.shortName}</span>
              </div>
              <span className="text-[11px] font-semibold text-[#1D1D22] bg-[#F5C451]/20 px-2 py-0.5 rounded-full border border-[#F5C451]/40">
                {hasArrived ? 'Board Now' : 'Next Stop'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-medium text-[#787571] uppercase block">3. Your Drop-off</span>
                <span className="text-[14px] font-semibold text-[#1D1D22]">{dest.name || dest.shortName}</span>
              </div>
              <span className="text-[12px] font-semibold text-[#1D1D22]">{directDistanceKm} km</span>
            </div>
          </div>
        </div>

        {/* 2-Column Metrics */}
        <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-[#F0ECE4]">
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex flex-col">
            <span className="text-[11px] font-medium text-[#787571] uppercase">Est. Detour</span>
            <span className="text-[16px] font-bold text-[#1D1D22] mt-0.5">+{detourMinutes} min</span>
          </div>
          <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex flex-col">
            <span className="text-[11px] font-medium text-[#787571] uppercase">You Saved</span>
            <span className="text-[16px] font-bold text-[#1D1D22] mt-0.5">₹{netSaved} (35%)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
