import React, { useState, useEffect, useMemo } from 'react';
import LeafletMap from '../components/LeafletMap';
import { fetchRoadRoute, getAccurateDistance } from '../utils/routing';
import { NASHIK_HUBS, getSharedRideOrigin, getRandomDriver } from '../data/nashikLocations';

// Calculate bearing between two coordinates in degrees
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

// Interpolate point along a polyline given a fractional progress 0 <= t <= 1
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
    const d = Math.hypot(polyline[i+1][0] - polyline[i][0], polyline[i+1][1] - polyline[i][1]);
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

export default function PoolScreen({
  poolStage,
  setPoolStage,
  onRequestRide,
  onCancelRide,
  onNavigateToJourney = null,
  backendWindow = null,
  assignedVehicle = null,
  preselectedHubs = null
}) {
  // Hubs selection: Default to PVG COE or CBS Chowk
  const [originIndex, setOriginIndex] = useState(() => {
    const saved = localStorage.getItem('pooliq_preferred_hub');
    if (saved) {
      const idx = NASHIK_HUBS.findIndex((h) => h.id === saved);
      if (idx !== -1) return idx;
    }
    const pvgIdx = NASHIK_HUBS.findIndex((h) => h.id === 'pvg_coe');
    return pvgIdx !== -1 ? pvgIdx : 0;
  });
  const [destIndex, setDestIndex] = useState(2); // Gangapur Road

  // User Live Geolocation State
  const [useLiveLocation, setUseLiveLocation] = useState(false);
  const [liveLocation, setLiveLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationStatus, setLocationStatus] = useState('');
  const [outsideNashikAlert, setOutsideNashikAlert] = useState(null);

  // Search Modal / Popover State for Hubs
  const [searchModalType, setSearchModalType] = useState(null); // 'pickup' | 'drop' | null
  const [searchQuery, setSearchQuery] = useState('');

  // Filtered hubs for the quick location search modal
  const filteredHubs = useMemo(() => {
    if (!searchQuery.trim()) return NASHIK_HUBS;
    const q = searchQuery.toLowerCase().trim();
    return NASHIK_HUBS.filter(
      (h) =>
        h.name.toLowerCase().includes(q) ||
        h.shortName.toLowerCase().includes(q) ||
        (h.tag && h.tag.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // 1-Click Set to PVG's College of Engineering (Dindori Road, Mhasrul)
  const selectPvgAsPickup = () => {
    const pvgIdx = NASHIK_HUBS.findIndex((h) => h.id === 'pvg_coe');
    if (pvgIdx !== -1) {
      const pvg = NASHIK_HUBS[pvgIdx];
      setOriginIndex(pvgIdx);
      setLiveLocation({
        id: 'pvg_coe',
        name: pvg.name,
        shortName: pvg.shortName,
        lat: pvg.lat,
        lon: pvg.lon,
        accuracy: 5,
        isLiveGps: true,
        isWithinService: true
      });
      setUseLiveLocation(true);
      setOutsideNashikAlert(null);
      localStorage.setItem('pooliq_preferred_hub', 'pvg_coe');
      setLocationStatus("📍 Pickup set to PVG's College of Engineering (Dindori Rd, Mhasrul)");
      setTimeout(() => setLocationStatus(''), 4500);
    }
  };

  // Handle map click to set custom pinpoint pickup anywhere in Nashik
  const handleMapClick = (latlng) => {
    if (!latlng) return;
    const clickLat = Number(latlng.lat.toFixed(6));
    const clickLon = Number(latlng.lng.toFixed(6));

    let nearestHub = NASHIK_HUBS[0];
    let minDis = 999999;
    for (const h of NASHIK_HUBS) {
      const d = Math.hypot((h.lat - clickLat) * 111, (h.lon - clickLon) * 104);
      if (d < minDis) {
        minDis = d;
        nearestHub = h;
      }
    }
    const distM = Math.round(minDis * 1000);
    const distToPvg = Math.hypot((20.0369 - clickLat) * 111, (73.8007 - clickLon) * 104) * 1000;
    const shortDesc = distToPvg < 400
      ? 'PVG Campus'
      : distM < 250
        ? nearestHub.shortName
        : `${distM}m from ${nearestHub.shortName}`;

    const customPinHub = {
      id: 'user_map_pin',
      name: `Pinned Pickup (${shortDesc})`,
      shortName: shortDesc,
      lat: clickLat,
      lon: clickLon,
      accuracy: 5,
      isLiveGps: true
    };

    setLiveLocation(customPinHub);
    setUseLiveLocation(true);
    setOutsideNashikAlert(null);
    setLocationStatus(`📍 Pickup pinned near ${nearestHub.shortName}`);
    setTimeout(() => setLocationStatus(''), 4000);
  };

  const handleFetchLiveLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocationStatus('Acquiring GPS fix...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const rawLat = Number(pos.coords.latitude.toFixed(6));
        const rawLon = Number(pos.coords.longitude.toFixed(6));
        const accuracy = Math.round(pos.coords.accuracy || 15);

        const dLat = (rawLat - 19.9977) * 111.0;
        const dLon = (rawLon - 73.7803) * 104.0;
        const distFromNashikKm = Math.round(Math.hypot(dLat, dLon));
        const isWithinNashik = distFromNashikKm <= 35;

        if (isWithinNashik) {
          let nearestHub = NASHIK_HUBS[0];
          let minDis = 999999;
          for (const h of NASHIK_HUBS) {
            const d = Math.hypot((h.lat - rawLat) * 111, (h.lon - rawLon) * 104);
            if (d < minDis) {
              minDis = d;
              nearestHub = h;
            }
          }
          const distM = Math.round(minDis * 1000);
          const distToPvg = Math.hypot((20.0369 - rawLat) * 111, (73.8007 - rawLon) * 104) * 1000;
          const shortDesc = distToPvg < 500
            ? 'PVG Campus'
            : distM < 250
              ? nearestHub.shortName
              : `${distM}m from ${nearestHub.shortName}`;

          const userGpsHub = {
            id: 'user_live_gps',
            name: `Live Location (${shortDesc})`,
            shortName: shortDesc,
            lat: rawLat,
            lon: rawLon,
            accuracy,
            isLiveGps: true,
            isWithinService: true
          };

          setLiveLocation(userGpsHub);
          setUseLiveLocation(true);
          setIsLocating(false);
          setOutsideNashikAlert(null);
          setLocationStatus(`📍 GPS locked: ${shortDesc}`);
          setTimeout(() => setLocationStatus(''), 4000);
        } else {
          setIsLocating(false);
          setOutsideNashikAlert({ distanceKm: distFromNashikKm });
          setLocationStatus('');
        }
      },
      (err) => {
        setIsLocating(false);
        setLocationStatus('Could not determine current location.');
        setTimeout(() => setLocationStatus(''), 4000);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (preselectedHubs) {
      if (typeof preselectedHubs.originIdx === 'number') {
        setOriginIndex(preselectedHubs.originIdx);
        setUseLiveLocation(false);
      }
      if (typeof preselectedHubs.destIdx === 'number') setDestIndex(preselectedHubs.destIdx);
    }
  }, [preselectedHubs]);

  const originHub = useMemo(() => {
    if (useLiveLocation && liveLocation) {
      return liveLocation;
    }
    return NASHIK_HUBS[originIndex] || NASHIK_HUBS[0];
  }, [useLiveLocation, liveLocation, originIndex]);

  const destHub = NASHIK_HUBS[destIndex] || NASHIK_HUBS[2];

  // Upstream Shared Ride Origin
  const [sharedOriginSeed, setSharedOriginSeed] = useState(() => Math.floor(Math.random() * 1000000));

  useEffect(() => {
    setSharedOriginSeed(Math.floor(Math.random() * 1000000));
  }, [originHub?.lat, originHub?.lon, destHub?.lat, destHub?.lon]);

  const sharedOriginHub = useMemo(() => {
    return getSharedRideOrigin(originHub, destHub, sharedOriginSeed);
  }, [originHub, destHub, sharedOriginSeed]);

  // Real OSRM Approach Geometry
  const [approachRoadRoute, setApproachRoadRoute] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadApproachPath() {
      if (!sharedOriginHub || !originHub) return;
      const res = await fetchRoadRoute(sharedOriginHub, originHub);
      if (mounted && res && res.polyline) {
        setApproachRoadRoute(res);
      }
    }
    loadApproachPath();
    return () => {
      mounted = false;
    };
  }, [sharedOriginHub, originHub]);

  const approachRouteCoords = useMemo(() => {
    if (approachRoadRoute && approachRoadRoute.polyline && approachRoadRoute.polyline.length > 1) {
      return approachRoadRoute.polyline;
    }
    if (!sharedOriginHub || !originHub) return [];
    const coords = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curveOffset = Math.sin(frac * Math.PI) * 0.005 * (i % 2 === 0 ? 1 : -0.6);
      coords.push([
        sharedOriginHub.lat + (originHub.lat - sharedOriginHub.lat) * frac + curveOffset,
        sharedOriginHub.lon + (originHub.lon - sharedOriginHub.lon) * frac - curveOffset
      ]);
    }
    return coords;
  }, [approachRoadRoute, sharedOriginHub, originHub]);

  const approachDistanceKm = useMemo(() => {
    if (!sharedOriginHub || !originHub) return 0.8;
    return getAccurateDistance(sharedOriginHub, originHub).km;
  }, [sharedOriginHub, originHub]);

  // Real OSRM Road Geometry for User's Trip
  const [roadRoute, setRoadRoute] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function loadRoadPath() {
      const res = await fetchRoadRoute(originHub, destHub);
      if (mounted && res && res.polyline) {
        setRoadRoute(res);
      }
    }
    loadRoadPath();
    return () => {
      mounted = false;
    };
  }, [originHub, destHub]);

  const accurateMetrics = useMemo(() => {
    return getAccurateDistance(originHub, destHub);
  }, [originHub, destHub]);

  const tripDistance = useMemo(() => {
    if (roadRoute && roadRoute.distanceKm && roadRoute.distanceKm > 0.5) {
      return roadRoute.distanceKm;
    }
    return accurateMetrics.km;
  }, [roadRoute, accurateMetrics]);

  const estTimeMin = useMemo(() => {
    if (roadRoute && roadRoute.durationMin && roadRoute.durationMin > 0) {
      return roadRoute.durationMin;
    }
    return accurateMetrics.min;
  }, [roadRoute, accurateMetrics]);

  const soloFare = Math.round(25 + tripDistance * 10);
  const pooledMin = Math.round(soloFare * 0.72);
  const pooledMax = Math.round(soloFare * 0.81);
  const dynamicPoolPrice = Math.round(soloFare * 0.65);
  const pooledSavings = soloFare - dynamicPoolPrice;

  const activeRouteCoords = useMemo(() => {
    if (roadRoute && roadRoute.polyline && roadRoute.polyline.length > 1) {
      return roadRoute.polyline;
    }
    const coords = [];
    const steps = 12;
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const curveOffset = Math.sin(frac * Math.PI) * 0.006 * (i % 2 === 0 ? 1 : -0.6);
      coords.push([
        originHub.lat + (destHub.lat - originHub.lat) * frac + curveOffset,
        originHub.lon + (destHub.lon - originHub.lon) * frac - curveOffset
      ]);
    }
    return coords;
  }, [originHub, destHub, roadRoute]);

  // Matching Stage Progression
  const [assignedDriver, setAssignedDriver] = useState(() => getRandomDriver(false, 101));
  const [progressPercent, setProgressPercent] = useState(45);
  const [matchingStatusIdx, setMatchingStatusIdx] = useState(0);

  const matchingStatuses = [
    'Looking nearby...',
    'Matching route co-riders...',
    'Locking in your fare...',
    'Almost there...'
  ];

  useEffect(() => {
    if (poolStage !== 'matching') {
      setProgressPercent(45);
      setMatchingStatusIdx(0);
      return;
    }

    const timer = setInterval(() => {
      setProgressPercent((prev) => {
        const next = prev + 6;
        if (next >= 100) {
          clearInterval(timer);
          setPoolStage('active');
          if (onNavigateToJourney) {
            setTimeout(() => {
              onNavigateToJourney();
            }, 350);
          }
          return 100;
        }
        const sIdx = Math.min(matchingStatuses.length - 1, Math.floor((next / 100) * matchingStatuses.length));
        setMatchingStatusIdx(sIdx);
        return next;
      });
    }, 300);

    return () => clearInterval(timer);
  }, [poolStage, setPoolStage, onNavigateToJourney]);

  // Co-Rider Harmony Preferences (from Screenshot 3)
  const [harmonyPrefs, setHarmonyPrefs] = useState({
    quietCommute: true,
    womenVerified: false,
    bootSpace: true,
    cabinTemp: 23
  });

  // Continuous Cab Flow Simulation State
  // Phases: 'approaching' -> 'arrived_pickup' -> 'in_transit' -> 'completed'
  const [simPhase, setSimPhase] = useState('approaching');
  const [simProgress, setSimProgress] = useState(0); // 0 to 1
  const [simPlaying, setSimPlaying] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1, 2, or 3
  const [boardingCountdown, setBoardingCountdown] = useState(3);

  // Reset simulation when entering active stage
  useEffect(() => {
    if (poolStage === 'active') {
      setSimPhase('approaching');
      setSimProgress(0);
      setSimPlaying(true);
      setBoardingCountdown(3);
    }
  }, [poolStage]);

  // Continuous 60fps animation loop using requestAnimationFrame
  useEffect(() => {
    if (poolStage !== 'active' || !simPlaying) return;

    let animId;
    let lastTime = performance.now();

    const loop = (currentTime) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      setSimProgress((prev) => {
        if (simPhase === 'approaching') {
          // Approach progress ~ 8 seconds at 1x
          const delta = dt * 0.12 * simSpeed;
          const next = prev + delta;
          if (next >= 1) {
            setSimPhase('arrived_pickup');
            setBoardingCountdown(3);
            return 1;
          }
          return next;
        }

        if (simPhase === 'in_transit') {
          // Trip progress ~ 14 seconds at 1x
          const delta = dt * 0.075 * simSpeed;
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
  }, [poolStage, simPlaying, simPhase, simSpeed]);

  // Boarding countdown timer when cab reaches pickup
  useEffect(() => {
    if (poolStage !== 'active' || simPhase !== 'arrived_pickup') return;

    const boardingTimer = setInterval(() => {
      setBoardingCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(boardingTimer);
          setSimPhase('in_transit');
          setSimProgress(0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000 / simSpeed);

    return () => clearInterval(boardingTimer);
  }, [poolStage, simPhase, simSpeed]);

  // Replay simulation handler
  const handleReplaySimulation = () => {
    setSimPhase('approaching');
    setSimProgress(0);
    setSimPlaying(true);
    setBoardingCountdown(3);
  };

  const hasArrivedAtPickup = simPhase === 'arrived_pickup' || simPhase === 'in_transit' || simPhase === 'completed';

  const currentVehicleCoord = useMemo(() => {
    const isFemale = assignedDriver?.gender === 'female';

    if (simPhase === 'approaching') {
      const poly = approachRouteCoords.length > 1 ? approachRouteCoords : [
        [sharedOriginHub.lat, sharedOriginHub.lon],
        [originHub.lat, originHub.lon]
      ];
      const pt = getInterpolatedPoint(poly, simProgress);
      const minsLeft = Math.max(1, Math.ceil((1 - simProgress) * 3));
      return {
        lat: pt.lat,
        lon: pt.lon,
        bearing: pt.bearing,
        isApproaching: true,
        isAtPickup: false,
        isCompleted: false,
        coRidersCount: 1, // Driver + Co-rider 1 already onboard
        isDriverFemale: isFemale,
        driverGender: assignedDriver?.gender || 'male',
        label: `${assignedDriver.model || 'Tata Tigor EV'} · Arriving in ~${minsLeft}m`
      };
    }

    if (simPhase === 'arrived_pickup') {
      const poly = approachRouteCoords.length > 1 ? approachRouteCoords : [];
      const last = poly.length > 1 ? poly[poly.length - 1] : [originHub.lat, originHub.lon];
      const prev = poly.length > 1 ? poly[poly.length - 2] : [originHub.lat, originHub.lon];
      return {
        lat: originHub.lat,
        lon: originHub.lon,
        bearing: calculateBearing(prev[0], prev[1], last[0], last[1]),
        isApproaching: false,
        isAtPickup: true,
        isCompleted: false,
        coRidersCount: 1, // At pickup, boarding user
        isDriverFemale: isFemale,
        driverGender: assignedDriver?.gender || 'male',
        label: `${assignedDriver.name || 'Driver'} at Pickup · Boarding (${boardingCountdown}s)`
      };
    }

    if (simPhase === 'in_transit') {
      const poly = activeRouteCoords.length > 1 ? activeRouteCoords : [
        [originHub.lat, originHub.lon],
        [destHub.lat, destHub.lon]
      ];
      const pt = getInterpolatedPoint(poly, simProgress);
      const estMin = Math.max(1, Math.ceil((1 - simProgress) * estTimeMin));
      return {
        lat: pt.lat,
        lon: pt.lon,
        bearing: pt.bearing,
        isApproaching: false,
        isAtPickup: false,
        isCompleted: false,
        coRidersCount: 2, // Driver + Co-rider 1 + User
        isDriverFemale: isFemale,
        driverGender: assignedDriver?.gender || 'male',
        label: `En Route to ${destHub.shortName} · ${estMin}m`
      };
    }

    // Completed
    const poly = activeRouteCoords.length > 1 ? activeRouteCoords : [];
    const last = poly.length > 1 ? poly[poly.length - 1] : [destHub.lat, destHub.lon];
    const prev = poly.length > 1 ? poly[poly.length - 2] : [destHub.lat, destHub.lon];
    return {
      lat: destHub.lat,
      lon: destHub.lon,
      bearing: calculateBearing(prev[0], prev[1], last[0], last[1]),
      isApproaching: false,
      isAtPickup: false,
      isCompleted: true,
      coRidersCount: 2,
      isDriverFemale: isFemale,
      driverGender: assignedDriver?.gender || 'male',
      label: 'Arrived at Destination'
    };
  }, [simPhase, simProgress, approachRouteCoords, activeRouteCoords, sharedOriginHub, originHub, destHub, boardingCountdown, estTimeMin, assignedDriver]);

  // Cancel flow with confirmation state
  const [cancelIsConfirm, setCancelIsConfirm] = useState(false);

  const handleActiveCancel = () => {
    if (!cancelIsConfirm) {
      setCancelIsConfirm(true);
      setTimeout(() => setCancelIsConfirm(false), 3500);
    } else {
      setCancelIsConfirm(false);
      setPoolStage('request');
      if (onCancelRide) onCancelRide();
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full px-4 pt-1 pb-6 max-w-md mx-auto select-none">
      {/* ─────────────────────────────────────────────────────────────
          STAGE 1: REQUEST A RIDE
      ───────────────────────────────────────────────────────────── */}
      {poolStage === 'request' && (
        <div className="flex flex-col w-full animate-fade-in">
          {/* Out-of-Nashik ISP Alert Banner if IP resolved outside */}
          {outsideNashikAlert && (
            <div className="bg-white border border-[#EAE5DC] p-3 rounded-2xl flex flex-col gap-2 shadow-xs mb-3">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-[#1D1D22]">
                  Telecom IP detected outside Nashik
                </span>
                <button
                  type="button"
                  onClick={() => setOutsideNashikAlert(null)}
                  className="text-[#787571] hover:text-[#1D1D22] text-xs font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
              <p className="text-[11px] text-[#787571] leading-relaxed">
                If you are at PVG Nashik Campus, tap below to lock your exact pickup:
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={selectPvgAsPickup}
                  className="px-3 py-1.5 rounded-full bg-[#1D1D22] text-white text-xs font-semibold hover:bg-black transition-all cursor-pointer"
                >
                  📍 Lock PVG Nashik
                </button>
              </div>
            </div>
          )}

          {/* Pickup & Drop Input Card */}
          <div className="bg-white rounded-[20px] p-3.5 border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] mb-4">
            <div className="relative flex flex-col gap-2">
              {/* Connecting Line */}
              <div className="absolute left-[17px] top-[26px] bottom-[26px] w-[2px] bg-[#EAE5DC] z-0 pointer-events-none"></div>

              {/* Pickup Node */}
              <div
                onClick={() => {
                  setSearchModalType('pickup');
                  setSearchQuery('');
                }}
                className="relative flex items-center bg-[#F4EFEB] rounded-2xl px-3.5 py-3 transition-colors hover:bg-[#eee8e2] cursor-pointer"
              >
                <div className="w-4 flex justify-center items-center mr-3 z-10 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#1D1D22]"></div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-[#787571] uppercase tracking-wider">Pickup</span>
                  <span className="text-[14px] font-semibold text-[#1D1D22] truncate mt-0.5">
                    {originHub.name || originHub.shortName}
                  </span>
                </div>
                <span className="text-[12px] font-medium text-[#787571] px-2.5 py-0.5 bg-white/80 rounded-full border border-[#EAE5DC]">
                  {useLiveLocation ? 'GPS' : 'Current'}
                </span>
              </div>

              {/* Destination Node */}
              <div
                onClick={() => {
                  setSearchModalType('drop');
                  setSearchQuery('');
                }}
                className="relative flex items-center bg-[#F4EFEB] rounded-2xl px-3.5 py-3 transition-colors hover:bg-[#eee8e2] cursor-pointer"
              >
                <div className="w-4 flex justify-center items-center mr-3 z-10 shrink-0">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5C451] ring-2 ring-[#F5C451]/30"></div>
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-[11px] font-medium text-[#787571] uppercase tracking-wider">Drop-off</span>
                  <span className="text-[14px] font-semibold text-[#1D1D22] truncate mt-0.5">
                    {destHub.name || destHub.shortName}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[18px] text-[#787571] pr-1">edit_location</span>
              </div>
            </div>

            {locationStatus && (
              <div className="mt-2 text-[11px] font-medium text-[#1D1D22] bg-[#FAF7F2] px-3 py-1.5 rounded-xl border border-[#EAE5DC] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#F5C451]">info</span>
                <span>{locationStatus}</span>
              </div>
            )}
          </div>

          {/* Map Viewport */}
          <div className="w-full relative h-[240px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1] mb-4">
            <LeafletMap
              center={[originHub.lat, originHub.lon]}
              pickup={originHub}
              drop={destHub}
              routeCoords={activeRouteCoords}
              height="240px"
              onMapClick={handleMapClick}
            />
            {/* Floating Trip Chip */}
            <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-2 z-[400] pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-[#1D1D22]"></span>
              <span className="text-[12px] font-semibold text-[#1D1D22]">
                {tripDistance} km · Fastest route
              </span>
            </div>
          </div>

          {/* Generous Bottom Summary Card */}
          <div className="bg-white rounded-[24px] p-5 border border-[#EAE5DC] shadow-[0_4px_20px_rgba(29,29,34,0.06)] flex flex-col">
            {/* Distance & Duration Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#EAE5DC]">
              <div>
                <span className="text-[12px] font-medium text-[#787571] uppercase tracking-wide">Trip Details</span>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[16px] font-semibold text-[#1D1D22]">{tripDistance} km</span>
                  <span className="text-[#787571]">•</span>
                  <span className="text-[16px] font-semibold text-[#1D1D22]">~{estTimeMin} mins</span>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full bg-[#F5C451]/20 text-[#1D1D22] text-[12px] font-semibold border border-[#F5C451]/40 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                <span>Save ~25%</span>
              </div>
            </div>

            {/* Fare Comparison Options */}
            <div className="pt-4 pb-2 flex flex-col gap-2.5">
              {/* Pooled Ride Option (Selected) */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#F4EFEB] border-2 border-[#1D1D22] transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1D1D22] text-[#F5C451] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">group</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[14px] font-bold text-[#1D1D22]">Pooled Ride</span>
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F5C451]"></span>
                    </div>
                    <span className="text-[12px] text-[#787571]">Max 2 pickups on route</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[17px] font-bold text-[#1D1D22]">₹{pooledMin}–{pooledMax}</div>
                  <span className="text-[11px] text-[#787571] line-through">₹{soloFare}</span>
                </div>
              </div>

              {/* Solo Ride Option (Reference) */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-white border border-[#EAE5DC] opacity-75 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F4EFEB] text-[#787571] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div>
                    <span className="text-[14px] font-semibold text-[#1D1D22]">Solo Direct</span>
                    <div className="text-[12px] text-[#787571]">No stops · Direct drop</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[15px] font-semibold text-[#1D1D22]">₹{soloFare}</span>
                </div>
              </div>
            </div>

            {/* Co-Rider Harmony Preferences Card (Matching Screenshot 3) */}
            <div className="mt-4 pt-3.5 border-t border-[#EAE5DC] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-[15px] font-bold text-[#1D1D22]">Co-Rider Harmony</h4>
                  <p className="text-[11.5px] text-[#787571]">Matched with compatible passengers</p>
                </div>
                <span className="material-symbols-outlined text-[#787571] text-[20px]">tune</span>
              </div>

              {/* 1. Quiet Commute Lock */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
                <div className="flex items-center gap-3 pr-2">
                  <span className="material-symbols-outlined text-[#1D1D22] text-[21px] shrink-0">volume_off</span>
                  <div>
                    <div className="text-[13px] font-bold text-[#1D1D22]">Quiet Commute Lock</div>
                    <div className="text-[11px] text-[#787571]">Matched with silent co-riders (no speaker calls)</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHarmonyPrefs(p => ({ ...p, quietCommute: !p.quietCommute }))}
                  className={`w-12 h-7 rounded-full transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    harmonyPrefs.quietCommute ? 'bg-[#1D1D22] justify-end' : 'bg-[#E5E0D8] justify-start'
                  }`}
                  aria-label="Toggle Quiet Commute Lock"
                >
                  <span className="w-6 h-6 bg-white rounded-full shadow-sm"></span>
                </button>
              </div>

              {/* 2. Women-Verified Pool */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
                <div className="flex items-center gap-3 pr-2">
                  <span className="material-symbols-outlined text-[#1D1D22] text-[21px] shrink-0">verified_user</span>
                  <div>
                    <div className="text-[13px] font-bold text-[#1D1D22]">Women-Verified Pool</div>
                    <div className="text-[11px] text-[#787571]">Exclusive matching with verified women riders</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHarmonyPrefs(p => ({ ...p, womenVerified: !p.womenVerified }))}
                  className={`w-12 h-7 rounded-full transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    harmonyPrefs.womenVerified ? 'bg-[#1D1D22] justify-end' : 'bg-[#E5E0D8] justify-start'
                  }`}
                  aria-label="Toggle Women-Verified Pool"
                >
                  <span className="w-6 h-6 bg-white rounded-full shadow-sm"></span>
                </button>
              </div>

              {/* 3. Boot Space Reservation */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
                <div className="flex items-center gap-3 pr-2">
                  <span className="material-symbols-outlined text-[#1D1D22] text-[21px] shrink-0">luggage</span>
                  <div>
                    <div className="text-[13px] font-bold text-[#1D1D22]">Boot Space Reservation</div>
                    <div className="text-[11px] text-[#787571]">Guarantees 1 large suitcase capacity in vehicle boot</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setHarmonyPrefs(p => ({ ...p, bootSpace: !p.bootSpace }))}
                  className={`w-12 h-7 rounded-full transition-colors p-0.5 flex items-center cursor-pointer shrink-0 ${
                    harmonyPrefs.bootSpace ? 'bg-[#1D1D22] justify-end' : 'bg-[#E5E0D8] justify-start'
                  }`}
                  aria-label="Toggle Boot Space Reservation"
                >
                  <span className="w-6 h-6 bg-white rounded-full shadow-sm"></span>
                </button>
              </div>

              {/* 4. Cabin Climate Consensus */}
              <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-between">
                <div className="flex items-center gap-3 pr-2">
                  <span className="material-symbols-outlined text-[#1D1D22] text-[21px] shrink-0">ac_unit</span>
                  <div>
                    <div className="text-[13px] font-bold text-[#1D1D22]">Cabin Climate Consensus</div>
                    <div className="text-[11px] text-[#787571]">Fleet-standard cabin temperature</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-full border border-[#EAE5DC] shrink-0">
                  <button
                    type="button"
                    onClick={() => setHarmonyPrefs(p => ({ ...p, cabinTemp: Math.max(18, p.cabinTemp - 1) }))}
                    className="w-6 h-6 rounded-full bg-[#FAF7F2] hover:bg-[#EAE5DC] text-[#1D1D22] font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    -
                  </button>
                  <span className="text-xs font-bold text-[#1D1D22] min-w-[34px] text-center">
                    {harmonyPrefs.cabinTemp}°C
                  </span>
                  <button
                    type="button"
                    onClick={() => setHarmonyPrefs(p => ({ ...p, cabinTemp: Math.min(28, p.cabinTemp + 1) }))}
                    className="w-6 h-6 rounded-full bg-[#FAF7F2] hover:bg-[#EAE5DC] text-[#1D1D22] font-bold text-xs flex items-center justify-center cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Helper Notice */}
            <p className="text-[12px] text-[#787571] text-center my-3">
              Fair pricing based on active co-passengers. Never detours &gt; 4 mins.
            </p>

            {/* Primary Action CTA */}
            <button
              id="request-pool-btn"
              onClick={() => {
                const freshSeed = Math.floor(Math.random() * 10000);
                setSharedOriginSeed(freshSeed);
                const freshSharedOrigin = getSharedRideOrigin(originHub, destHub, freshSeed);
                const freshDriver = getRandomDriver(harmonyPrefs?.womenVerified, freshSeed);
                setAssignedDriver(freshDriver);
                setPoolStage('matching');
                if (onRequestRide) {
                  onRequestRide({
                    origin: originHub,
                    dest: destHub,
                    sharedOrigin: freshSharedOrigin,
                    soloFare,
                    pooledFare: dynamicPoolPrice,
                    harmonyPrefs,
                    driver: freshDriver
                  });
                }
              }}
              className="w-full h-13 py-3.5 bg-[#1D1D22] hover:bg-black active:scale-[0.98] text-white font-semibold text-[15px] rounded-full shadow-[0_4px_14px_rgba(29,29,34,0.18)] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm Pooled Ride</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 2: MATCHING / FINDING YOUR POOL RIDE
      ───────────────────────────────────────────────────────────── */}
      {poolStage === 'matching' && (
        <div className="flex flex-col w-full animate-fade-in">
          {/* Clean Map Region */}
          <div className="relative w-full h-[250px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1] mb-4">
            <LeafletMap
              center={[originHub.lat, originHub.lon]}
              pickup={originHub}
              drop={destHub}
              sharedOrigin={sharedOriginHub}
              approachRouteCoords={approachRouteCoords}
              height="250px"
            />
            {/* Friendly Corner Badge */}
            <div className="absolute top-3 left-3 z-[400] pointer-events-none">
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-1.5 text-xs text-[#787571] font-semibold">
                <span className="material-symbols-outlined text-[14px] text-[#F5C451]">schedule</span>
                <span>Pickup in ~4 mins</span>
              </div>
            </div>
          </div>

          {/* Main White Primary Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#EAE5DC] flex flex-col">
            {/* Header & Status */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-[#FAF7F2] text-[#787571] px-2.5 py-1 rounded-full text-[11px] font-medium mb-2 border border-[#EAE5DC]">
                  <span className="material-symbols-outlined text-[13px] text-[#1D1D22]">group</span>
                  <span>Shared Ride Pool</span>
                </div>
                <h2 className="text-[20px] font-bold text-[#1D1D22] tracking-tight leading-tight">
                  Finding your pool ride
                </h2>
                <p className="text-[13px] text-[#787571] mt-1">
                  Matching you with co-riders along your route
                </p>
              </div>
              <div className="w-11 h-11 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[#1D1D22] text-[22px] animate-pulse">
                  directions_car
                </span>
              </div>
            </div>

            {/* Humanist Progress Bar */}
            <div className="mb-4 bg-[#F4EFEB] p-3 rounded-2xl border border-[#EAE5DC]">
              <div className="flex items-center justify-between text-xs font-medium mb-2">
                <span className="text-[#787571]">Optimizing route match</span>
                <span className="text-[#1D1D22] font-semibold">
                  {matchingStatuses[matchingStatusIdx]}
                </span>
              </div>
              <div className="w-full h-2 bg-[#EAE5DC] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#F5C451] rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

            {/* Route Itinerary Section */}
            <div className="py-3 px-1 border-t border-b border-[#F0ECE4] flex items-stretch gap-3.5">
              <div className="flex flex-col items-center py-1 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#1D1D22] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white"></div>
                </div>
                <div className="w-[1.5px] flex-1 bg-[#EAE5DC] my-1"></div>
                <div className="w-3 h-3 rounded-[3px] bg-[#F5C451]"></div>
              </div>
              <div className="flex-1 flex flex-col justify-between gap-3 text-sm">
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#787571] block">Pickup point</span>
                    <span className="text-[14px] font-semibold text-[#1D1D22]">{originHub.shortName}</span>
                  </div>
                  <span className="text-xs text-[#787571]">Pickup stop</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#787571] block">Destination</span>
                    <span className="text-[14px] font-semibold text-[#1D1D22]">{destHub.shortName}</span>
                  </div>
                  <span className="text-xs font-medium text-[#787571]">{tripDistance} km</span>
                </div>
              </div>
            </div>

            {/* Fare Breakdown Pill */}
            <div className="mt-4 bg-[#F4EFEB] rounded-2xl p-3.5 border border-[#EAE5DC] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#F5C451]/30 flex items-center justify-center text-[#1D1D22]">
                  <span className="material-symbols-outlined text-[18px]">payments</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#1D1D22] block">Shared Fare</span>
                  <span className="text-[11px] text-[#787571]">
                    Standard solo was <span className="line-through">₹{soloFare}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 bg-[#1D1D22] text-white text-[13px] font-bold px-3 py-1 rounded-full shadow-sm">
                  ₹{dynamicPoolPrice}
                </span>
              </div>
            </div>

            {/* Harmony Preferences Applied Pill */}
            <div className="mt-3 bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 border border-[#EAE5DC] flex items-center justify-between text-xs">
              <span className="text-[#787571] font-medium">Harmony Filter</span>
              <span className="text-[#1D1D22] font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span>
                  {harmonyPrefs.quietCommute ? 'Quiet Commute · ' : ''}
                  {harmonyPrefs.cabinTemp}°C AC
                  {harmonyPrefs.bootSpace ? ' · Boot Reserved' : ''}
                  {harmonyPrefs.womenVerified ? ' · Women-Verified' : ''}
                </span>
              </span>
            </div>

            {/* Cancel Button */}
            <button
              id="cancel-btn"
              onClick={() => {
                setPoolStage('request');
                if (onCancelRide) onCancelRide();
              }}
              className="mt-4 w-full h-[50px] rounded-full bg-[#1D1D22] text-white font-medium text-[14px] tracking-tight hover:bg-black active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">close</span>
              <span>Cancel Request</span>
            </button>
          </div>

          <div className="text-center px-4 py-2 mt-1">
            <p className="text-xs text-[#787571]">You won't be charged if you cancel before matching</p>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          STAGE 3: ACTIVE RIDE
      ───────────────────────────────────────────────────────────── */}
      {poolStage === 'active' && (
        <div className="flex flex-col w-full animate-fade-in">
          {/* Map Viewport with Moving Vehicle */}
          <div className="relative w-full h-[280px] rounded-[20px] overflow-hidden border border-[#EAE5DC] shadow-[0_2px_12px_rgba(29,29,34,0.04)] bg-[#EDE9E1] mb-4">
            <LeafletMap
              center={[currentVehicleCoord.lat, currentVehicleCoord.lon]}
              pickup={originHub}
              drop={destHub}
              sharedOrigin={sharedOriginHub}
              approachRouteCoords={approachRouteCoords}
              routeCoords={activeRouteCoords}
              vehicleCoord={currentVehicleCoord}
              height="280px"
            />

            {/* Quick floating Status Pill */}
            <div className="absolute top-3 left-3 z-[400] pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-[#EAE5DC] shadow-sm flex items-center gap-1.5 text-xs text-[#1D1D22] font-semibold">
                <span className="material-symbols-outlined text-[15px] text-[#F5C451]">
                  {simPhase === 'completed' ? 'check_circle' : simPhase === 'arrived_pickup' ? 'person_pin_circle' : 'schedule'}
                </span>
                <span>
                  {simPhase === 'approaching' && 'Approaching Pickup (~2 mins)'}
                  {simPhase === 'arrived_pickup' && `Driver Arrived · Boarding (${boardingCountdown}s)`}
                  {simPhase === 'in_transit' && `In Transit to ${destHub.shortName}`}
                  {simPhase === 'completed' && 'Arrived at Destination'}
                </span>
              </div>
            </div>

            {/* Continuous Cab Simulation Controls Overlay */}
            <div className="absolute top-3 right-3 z-[400] flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-full border border-[#EAE5DC] shadow-sm">
              <button
                type="button"
                onClick={() => setSimPlaying(!simPlaying)}
                className="text-[#1D1D22] hover:text-black flex items-center justify-center cursor-pointer p-0.5"
                title={simPlaying ? "Pause simulation" : "Play simulation"}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {simPlaying ? 'pause' : 'play_arrow'}
                </span>
              </button>
              <button
                type="button"
                onClick={handleReplaySimulation}
                className="text-[#787571] hover:text-[#1D1D22] flex items-center justify-center cursor-pointer p-0.5"
                title="Replay from start"
              >
                <span className="material-symbols-outlined text-[15px]">replay</span>
              </button>
              <button
                type="button"
                onClick={() => setSimSpeed(s => (s === 1 ? 2 : s === 2 ? 3 : 1))}
                className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FAF7F2] border border-[#EAE5DC] text-[#1D1D22] hover:bg-[#EAE5DC] cursor-pointer"
                title="Cycle simulation speed"
              >
                {simSpeed}x
              </button>
            </div>
          </div>

          {/* Floating Pure White Ride Card */}
          <div className="bg-white rounded-[24px] p-5 shadow-[0_8px_30px_rgba(29,29,34,0.06)] border border-[#EAE5DC] flex flex-col gap-4">
            {/* Driver & Vehicle Information Row */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#F0ECE4]">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden border border-[#EAE5DC] bg-[#FAF7F2] flex items-center justify-center font-bold text-sm text-[#1D1D22]">
                    {assignedDriver.initials}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-white border border-[#EAE5DC] rounded-full px-1 py-0.2 flex items-center gap-0.5 text-[10px] font-bold text-[#1D1D22] shadow-xs">
                    <span className="material-symbols-outlined text-[11px] text-[#F5C451]">star</span>
                    {assignedDriver.rating}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-[15px] font-bold text-[#1D1D22]">{assignedDriver.name}</h3>
                    <span className="text-xs text-[#787571]">• {assignedDriver.model}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] font-semibold text-[#1D1D22] bg-[#F4EFEB] px-2 py-0.5 rounded tracking-wide border border-[#EAE5DC]">
                      {assignedDriver.plate}
                    </span>
                    <span className="text-xs text-[#787571]">
                      {simPhase === 'approaching' && 'Approaching pickup point'}
                      {simPhase === 'arrived_pickup' && `Ready for boarding at ${originHub.shortName}`}
                      {simPhase === 'in_transit' && `In transit to ${destHub.shortName}`}
                      {simPhase === 'completed' && 'Ride completed'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="tel:9876543210"
                  aria-label="Call driver"
                  className="w-9 h-9 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] hover:bg-[#F4EFEB] transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">call</span>
                </a>
              </div>
            </div>

            {/* Co-Rider Harmony Preferences Active Badges */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {harmonyPrefs.quietCommute && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shrink-0">
                  <span className="material-symbols-outlined text-[13px] text-[#10B981]">volume_off</span>
                  Quiet Commute
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shrink-0">
                <span className="material-symbols-outlined text-[13px] text-[#3B82F6]">ac_unit</span>
                Cabin {harmonyPrefs.cabinTemp}°C
              </span>
              {harmonyPrefs.bootSpace && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shrink-0">
                  <span className="material-symbols-outlined text-[13px] text-[#D97706]">luggage</span>
                  Boot Reserved
                </span>
              )}
              {harmonyPrefs.womenVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#EAE5DC] text-[11px] font-semibold text-[#1D1D22] shrink-0">
                  <span className="material-symbols-outlined text-[13px] text-[#10B981]">verified_user</span>
                  Women-Verified
                </span>
              )}
            </div>

            {/* Key Trip Metrics */}
            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-[#787571] uppercase tracking-wider block">Pickup Wait</span>
                  <span className="text-[14px] font-bold text-[#1D1D22]">
                    {simPhase === 'approaching' ? '~2 mins' : simPhase === 'arrived_pickup' ? 'Board Now' : simPhase === 'in_transit' ? 'In Transit' : 'Completed'}
                  </span>
                </div>
              </div>
              <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#EAE5DC] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#1D1D22] shrink-0">
                  <span className="material-symbols-outlined text-[18px]">group</span>
                </div>
                <div>
                  <span className="text-[11px] font-medium text-[#787571] uppercase tracking-wider block">Co-riders</span>
                  <span className="text-[14px] font-bold text-[#1D1D22]">1 Matched</span>
                </div>
              </div>
            </div>

            {/* Clean Fare Comparison Section */}
            <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#EAE5DC] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-semibold text-[#787571] uppercase tracking-wide">Fare Comparison</span>
                <span className="inline-flex items-center gap-1 bg-[#F5C451] text-[#1D1D22] text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                  <span className="material-symbols-outlined text-[13px]">savings</span>
                  You saved ₹{pooledSavings}
                </span>
              </div>
              <div className="flex items-center gap-2 pt-0.5">
                {/* Pooled Fare (Active) */}
                <div className="flex-1 bg-white rounded-xl p-2.5 border-2 border-[#1D1D22] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-semibold text-[#787571] block">Pooled Fare</span>
                    <span className="text-[16px] font-bold text-[#1D1D22]">₹{dynamicPoolPrice}</span>
                  </div>
                  <span className="material-symbols-outlined text-[18px] text-[#F5C451]">check_circle</span>
                </div>
                {/* Solo Standard Fare (Reference) */}
                <div className="flex-1 bg-white/60 rounded-xl p-2.5 border border-[#EAE5DC] flex items-center justify-between opacity-80">
                  <div>
                    <span className="text-[11px] font-medium text-[#787571] block">Solo Direct</span>
                    <span className="text-[15px] font-semibold text-[#787571] line-through">₹{soloFare}</span>
                  </div>
                  <span className="text-[10px] font-medium text-[#787571]">Baseline</span>
                </div>
              </div>
            </div>

            {/* Primary Actions: View Journey & Cancel Ride */}
            <div className="pt-1 flex flex-col gap-2">
              {onNavigateToJourney && (
                <button
                  id="view-journey-btn"
                  onClick={onNavigateToJourney}
                  className="w-full h-12 rounded-full bg-[#1D1D22] hover:bg-black text-white font-semibold text-[14px] flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[17px] text-[#F5C451]">near_me</span>
                  <span>Track Live Shared Journey</span>
                  <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                </button>
              )}
              <button
                id="cancel-active-btn"
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

          <div className="text-center pt-2.5">
            <p className="text-[11px] text-[#787571]">Free cancellation within 3 minutes of vehicle dispatch</p>
          </div>
        </div>
      )}

      {/* Hub Location Search Popover */}
      {searchModalType && (
        <div 
          className="fixed inset-0 z-[1200] bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSearchModalType(null)}
        >
          <div 
            className="bg-white w-full max-w-md rounded-[24px] border border-[#EAE5DC] shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#EAE5DC] flex items-center justify-between">
              <span className="text-sm font-bold text-[#1D1D22]">
                Select {searchModalType === 'pickup' ? 'Pickup Location' : 'Drop-off Destination'}
              </span>
              <button 
                onClick={() => setSearchModalType(null)}
                className="text-[#787571] hover:text-[#1D1D22] text-sm font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] border-b border-[#EAE5DC]">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-[#787571] text-[18px]">search</span>
                <input
                  type="text"
                  autoFocus
                  placeholder="Search CBS, College Rd, PVG, Gangapur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-xl text-sm text-[#1D1D22] border border-[#EAE5DC] focus:outline-none focus:border-[#1D1D22] font-body-md"
                />
              </div>
            </div>

            <div className="overflow-y-auto p-2 flex flex-col gap-1 max-h-[350px]">
              {filteredHubs.map((hub) => {
                const isSelected = searchModalType === 'pickup'
                  ? originHub.id === hub.id
                  : destHub.id === hub.id;
                return (
                  <button
                    key={hub.id}
                    onClick={() => {
                      const hubIdx = NASHIK_HUBS.findIndex(h => h.id === hub.id);
                      if (searchModalType === 'pickup') {
                        if (hubIdx !== -1) setOriginIndex(hubIdx);
                        setUseLiveLocation(false);
                        localStorage.setItem('pooliq_preferred_hub', hub.id);
                      } else {
                        if (hubIdx !== -1) setDestIndex(hubIdx);
                      }
                      setSearchModalType(null);
                    }}
                    className={`w-full p-3 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#1D1D22] text-white'
                        : 'hover:bg-[#F4EFEB] text-[#1D1D22]'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold truncate">{hub.name}</span>
                        {hub.id === 'pvg_coe' && (
                          <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-[#F5C451] text-[#1D1D22]'
                          }`}>
                            CAMPUS
                          </span>
                        )}
                      </div>
                      <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-[#787571]'}`}>
                        {hub.tag || 'Nashik Corridor'}
                      </span>
                    </div>
                    {isSelected && (
                      <span className="material-symbols-outlined text-[16px] text-[#F5C451]">check_circle</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
