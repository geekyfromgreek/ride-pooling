import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

/**
 * PoolIQ Leaflet Map — Warm Humanist Cartography
 * Utilizes high-clarity daytime light canvas tiles with warm amber accents,
 * smooth route casings, and clean tactile markers without visual noise.
 */
export default function LeafletMap({
  center = [19.9977, 73.7803],
  zoom = 13,
  pickup = null,
  drop = null,
  sharedOrigin = null,
  approachRouteCoords = [],
  routeCoords = [],
  vehicleCoord = null,
  corridors = [],
  selectedCorridorId = null,
  fleetVehicles = [],
  selectedVehicleId = null,
  onVehicleSelect = null,
  diffPolyline = null,
  diffMode = 'after', // 'before' | 'after'
  showRadar = false,
  radarCoords = null,
  searchRadiusMeters = 450,
  onMapClick = null,
  height = "320px",
  className = ""
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dynamicLayersRef = useRef([]);
  const vehicleMarkerRef = useRef(null);

  // Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: center,
        zoom: zoom,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true,
        touchZoom: true
      });

      // Esri Light Gray Canvas: Daytime clean cartography
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        subdomains: ['server', 'services'],
        attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors'
      }).addTo(map);

      // Light Reference layer: Crisp road names, highways, and landmarks
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        subdomains: ['server', 'services']
      }).addTo(map);

      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick(e.latlng);
        });
      }

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    
    // Invalidate size on container resize
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize();
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 200);

    const timer2 = setTimeout(() => {
      map.invalidateSize();
    }, 500);

    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      resizeObserver.disconnect();
      if (vehicleMarkerRef.current) {
        try { vehicleMarkerRef.current.remove(); } catch (e) {}
        vehicleMarkerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const lastRouteKeyRef = useRef('');
  const lastFitCorridorRef = useRef(null);
  const lastFitVehicleRef = useRef(null);

  // Update map layers on prop changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    // Clear previous dynamic layers
    dynamicLayersRef.current.forEach((layer) => layer.remove());
    dynamicLayersRef.current = [];

    const addLayer = (layer) => {
      layer.addTo(map);
      dynamicLayersRef.current.push(layer);
      return layer;
    };

    // ─────────────────────────────────────────────────────────────
    // 1. CORRIDORS (Routes Mode)
    // ─────────────────────────────────────────────────────────────
    if (corridors && corridors.length > 0) {
      const bounds = [];
      let selectedCorrBounds = [];

      corridors.forEach((corr) => {
        if (corr.path && corr.path.length > 1) {
          const isSelected = selectedCorridorId && (corr.id === selectedCorridorId || corr.name.includes(selectedCorridorId));
          if (isSelected) {
            selectedCorrBounds = corr.path;
          }

          // Outer casing for selected
          if (isSelected) {
            addLayer(
              L.polyline(corr.path, {
                color: '#FFFFFF',
                weight: 7,
                opacity: 0.95,
                lineCap: 'round',
                lineJoin: 'round'
              })
            );
          }

          // Corridor line
          addLayer(
            L.polyline(corr.path, {
              color: isSelected ? '#1D1D22' : (corr.color || '#807663'),
              weight: isSelected ? 4 : 3,
              opacity: isSelected ? 1.0 : 0.45,
              lineCap: 'round',
              lineJoin: 'round'
            })
          );

          // Corridor stop nodes
          corr.path.forEach((pt, idx) => {
            bounds.push(pt);
            const stopName = corr.stops && corr.stops[idx] ? corr.stops[idx] : `Stop ${idx + 1}`;
            
            if (isSelected) {
              const stopBadgeIcon = L.divIcon({
                className: 'custom-stop-badge',
                html: `
                  <div style="display: flex; align-items: center; gap: 5px; pointer-events: none;">
                    <div style="width: 10px; height: 10px; border-radius: 50%; background: #1D1D22; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.15);"></div>
                    <div style="background: #FFFFFF; border: 1px solid #EAE5DC; color: #1D1D22; padding: 2px 7px; border-radius: 9999px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10.5px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                      ${stopName}
                    </div>
                  </div>
                `,
                iconSize: [110, 22],
                iconAnchor: [5, 11]
              });
              addLayer(L.marker(pt, { icon: stopBadgeIcon }));
            } else {
              const dotIcon = L.divIcon({
                className: 'custom-stop-dot',
                html: `
                  <div style="width: 6px; height: 6px; border-radius: 50%; background: #807663; border: 1px solid #FFFFFF; opacity: 0.6;"></div>
                `,
                iconSize: [6, 6],
                iconAnchor: [3, 3]
              });
              addLayer(L.marker(pt, { icon: dotIcon }));
            }
          });
        }
      });

      const corridorsSig = corridors.map(c => c.id).sort().join(',');
      const signatureChanged = lastRouteKeyRef.current !== corridorsSig;
      
      if (signatureChanged) {
        lastRouteKeyRef.current = corridorsSig;
        lastFitCorridorRef.current = selectedCorridorId;
        if (bounds.length > 0) {
          try {
            map.fitBounds(bounds, { padding: [35, 35], maxZoom: 14 });
          } catch (e) {}
        }
      } else if (selectedCorrBounds.length > 0 && lastFitCorridorRef.current !== selectedCorridorId) {
        lastFitCorridorRef.current = selectedCorridorId;
        try {
          map.flyToBounds(selectedCorrBounds, { padding: [45, 45], duration: 1.0 });
        } catch (e) {}
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 2. FLEET VEHICLES
    // ─────────────────────────────────────────────────────────────
    if (fleetVehicles && fleetVehicles.length > 0) {
      const bounds = [];
      let targetVehCoord = null;

      fleetVehicles.forEach((v) => {
        if (!v.lat || !v.lon) return;
        bounds.push([v.lat, v.lon]);

        const isSelected = selectedVehicleId && v.id === selectedVehicleId;
        if (isSelected) {
          targetVehCoord = [v.lat, v.lon];
        }

        const isTransit = v.status === 'transit';
        const statusBg = isTransit ? '#F5C451' : '#FFFFFF';

        const fleetMarkerIcon = L.divIcon({
          className: 'custom-fleet-marker',
          html: `
            <div style="display: flex; align-items: center; gap: 5px; cursor: pointer; transform: ${isSelected ? 'scale(1.12)' : 'scale(1.0)'}; transition: transform 0.2s;">
              <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #FFFFFF; border: 1.5px solid #EAE5DC; box-shadow: 0 4px 12px rgba(29,29,34,0.1); display: flex; align-items: center; justify-content: center;">
                <span class="material-symbols-outlined" style="font-size: 17px; color: #1D1D22;">directions_car</span>
                <span style="position: absolute; top: -1px; right: -1px; width: 8px; height: 8px; border-radius: 50%; background: ${statusBg}; border: 1.5px solid #FFFFFF;"></span>
              </div>
              <div style="background: #FFFFFF; border: 1px solid #EAE5DC; color: #1D1D22; padding: 2px 7px; border-radius: 9999px; font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                ${v.id} · ${v.speed}
              </div>
            </div>
          `,
          iconSize: [95, 32],
          iconAnchor: [16, 16]
        });

        const m = addLayer(L.marker([v.lat, v.lon], { icon: fleetMarkerIcon }));
        if (onVehicleSelect) {
          m.on('click', () => onVehicleSelect(v));
        }

        m.bindPopup(`
          <div style="background: #FFFFFF; color: #1D1D22; padding: 12px; border-radius: 16px; font-family: 'Plus Jakarta Sans', sans-serif; min-width: 190px;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #EAE5DC; padding-bottom: 6px; margin-bottom: 8px;">
              <strong style="color: #1D1D22; font-size: 13px;">Vehicle ${v.id}</strong>
              <span style="font-size: 10px; font-weight: 600; text-transform: uppercase; background: #F4EFEB; color: #787571; padding: 2px 6px; border-radius: 9999px;">${v.status}</span>
            </div>
            <div style="font-size: 11.5px; color: #787571; line-height: 1.5;">
              <div><strong style="color: #1D1D22;">Driver:</strong> ${v.driver || 'Assigned Driver'}</div>
              <div><strong style="color: #1D1D22;">Speed:</strong> ${v.speed || '0 km/h'}</div>
              <div><strong style="color: #1D1D22;">Occupancy:</strong> ${v.seatsOccupied || 0}/${v.seatsTotal || 4} seats</div>
              <div><strong style="color: #1D1D22;">EV Battery:</strong> ${v.soc || '82%'}</div>
            </div>
          </div>
        `);
      });

      if (targetVehCoord && lastFitVehicleRef.current !== selectedVehicleId) {
        lastFitVehicleRef.current = selectedVehicleId;
        try {
          map.flyTo(targetVehCoord, 14, { duration: 1.0 });
        } catch (e) {}
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 3. DIFF POLYLINE
    // ─────────────────────────────────────────────────────────────
    if (diffPolyline && diffPolyline.length > 1) {
      const isBefore = diffMode === 'before';
      const poly = addLayer(
        L.polyline(diffPolyline, {
          color: isBefore ? '#787571' : '#1D1D22',
          weight: 4.5,
          opacity: 0.95,
          dashArray: isBefore ? '6, 6' : undefined,
          lineCap: 'round',
          lineJoin: 'round'
        })
      );
      try {
        map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 15 });
      } catch (e) {}
    }

    // ─────────────────────────────────────────────────────────────
    // 3.5 APPROACH ROUTE (Shared Ride Leg)
    // ─────────────────────────────────────────────────────────────
    if (approachRouteCoords && approachRouteCoords.length > 1) {
      addLayer(
        L.polyline(approachRouteCoords, {
          color: '#F5C451',
          weight: 4,
          opacity: 0.95,
          dashArray: '6, 6',
          lineCap: 'round',
          lineJoin: 'round'
        })
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 3.6 SHARED ORIGIN MARKER (Offset neatly to side to prevent overlap)
    // ─────────────────────────────────────────────────────────────
    if (sharedOrigin) {
      const sharedName = sharedOrigin.shortName || sharedOrigin.name || 'Co-Rider Stop';
      const sharedIcon = L.divIcon({
        className: 'custom-shared-node',
        html: `
          <div style="display: flex; align-items: center; gap: 5px; pointer-events: none;">
            <div style="width: 18px; height: 18px; border-radius: 50%; background: #F5C451; border: 2px solid #FFFFFF; box-shadow: 0 2px 6px rgba(0,0,0,0.15); display: flex; align-items: center; justify-content: center; shrink-0;">
              <div style="width: 5px; height: 5px; border-radius: 50%; background: #1D1D22;"></div>
            </div>
            <div style="background: rgba(255,255,255,0.95); backdrop-filter: blur(4px); padding: 2px 7px; border-radius: 9999px; border: 1px solid #EAE5DC; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; color: #1D1D22; white-space: nowrap;">
              Co-Rider · ${sharedName}
            </div>
          </div>
        `,
        iconSize: [150, 20],
        iconAnchor: [9, 10]
      });
      addLayer(L.marker([sharedOrigin.lat, sharedOrigin.lon], { icon: sharedIcon, zIndexOffset: 400 }));
    }

    // ─────────────────────────────────────────────────────────────
    // 3.7 POOLING CATCHMENT PERIMETER (Max 1.5 km Diameter Boundary)
    // ─────────────────────────────────────────────────────────────
    if (pickup && sharedOrigin) {
      addLayer(
        L.circle([pickup.lat, pickup.lon], {
          radius: 1500,
          color: '#EAE5DC',
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: '#F5C451',
          fillOpacity: 0.05
        })
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. MAIN ACTIVE ROUTE (Charcoal with White Casing)
    // ─────────────────────────────────────────────────────────────
    if (!diffPolyline && routeCoords && routeCoords.length > 1) {
      // White casing
      addLayer(
        L.polyline(routeCoords, {
          color: '#FFFFFF',
          weight: 7,
          opacity: 0.95,
          lineCap: 'round',
          lineJoin: 'round'
        })
      );
      // Main route
      const poly = addLayer(
        L.polyline(routeCoords, {
          color: '#1D1D22',
          weight: 3.5,
          opacity: 1.0,
          lineCap: 'round',
          lineJoin: 'round'
        })
      );
      const routeKey = `${sharedOrigin?.id || 'none'}-${pickup?.lat},${pickup?.lon}->${drop?.lat},${drop?.lon}-${routeCoords.length}`;
      if (lastRouteKeyRef.current !== routeKey) {
        lastRouteKeyRef.current = routeKey;
        try {
          if (approachRouteCoords && approachRouteCoords.length > 1) {
            const allPoints = [...approachRouteCoords, ...routeCoords];
            map.fitBounds(L.latLngBounds(allPoints), { padding: [50, 50], maxZoom: 15 });
          } else {
            map.fitBounds(poly.getBounds(), { padding: [50, 50], maxZoom: 15 });
          }
        } catch (e) {}
      }
    } else if (!diffPolyline && pickup && drop && (!routeCoords || routeCoords.length <= 1)) {
      const line = addLayer(
        L.polyline([[pickup.lat, pickup.lon], [drop.lat, drop.lon]], {
          color: '#1D1D22',
          weight: 3.5,
          opacity: 0.85,
          dashArray: '5, 5'
        })
      );
      try {
        map.fitBounds(line.getBounds(), { padding: [50, 50], maxZoom: 15 });
      } catch (e) {}
    } else if (center && !fleetVehicles.length && !corridors.length && !diffPolyline && (!routeCoords || routeCoords.length <= 1)) {
      map.setView(center, zoom);
    }

    // ─────────────────────────────────────────────────────────────
    // 5. PICKUP MARKER (Solid Charcoal Circle with White Inner Dot)
    // ─────────────────────────────────────────────────────────────
    if (pickup) {
      const pickupName = pickup.shortName || pickup.name || 'Pickup';
      const pickupIcon = L.divIcon({
        className: 'custom-pickup-node',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background: rgba(255,255,255,0.96); backdrop-filter: blur(4px); padding: 2.5px 8px; border-radius: 9999px; border: 1px solid #EAE5DC; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; color: #1D1D22; margin-bottom: 3px; white-space: nowrap;">
              ${pickupName}
            </div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #1D1D22; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center;">
              <div style="width: 7px; height: 7px; border-radius: 50%; background: #FFFFFF;"></div>
            </div>
          </div>
        `,
        iconSize: [140, 48],
        iconAnchor: [70, 42]
      });
      addLayer(L.marker([pickup.lat, pickup.lon], { icon: pickupIcon, zIndexOffset: 500 }));
    }

    // ─────────────────────────────────────────────────────────────
    // 6. DROP MARKER (Warm Golden Amber Circle with Pin Glyph)
    // ─────────────────────────────────────────────────────────────
    if (drop) {
      const dropName = drop.shortName || drop.name || 'Drop-off';
      const dropIcon = L.divIcon({
        className: 'custom-drop-node',
        html: `
          <div style="display: flex; flex-direction: column; align-items: center; pointer-events: none;">
            <div style="background: rgba(255,255,255,0.96); backdrop-filter: blur(4px); padding: 2.5px 8px; border-radius: 9999px; border: 1px solid #EAE5DC; box-shadow: 0 2px 8px rgba(0,0,0,0.06); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 11px; font-weight: 700; color: #1D1D22; margin-bottom: 3px; white-space: nowrap;">
              ${dropName}
            </div>
            <div style="width: 24px; height: 24px; border-radius: 50%; background: #F5C451; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 10px rgba(0,0,0,0.18); display: flex; align-items: center; justify-content: center;">
              <span class="material-symbols-outlined" style="font-size: 14px; font-weight: bold; color: #1D1D22;">location_on</span>
            </div>
          </div>
        `,
        iconSize: [140, 48],
        iconAnchor: [70, 42]
      });
      addLayer(L.marker([drop.lat, drop.lon], { icon: dropIcon, zIndexOffset: 600 }));
    }

  }, [center, zoom, pickup, drop, sharedOrigin, approachRouteCoords, routeCoords, corridors, selectedCorridorId, fleetVehicles, selectedVehicleId, diffPolyline, diffMode, showRadar, radarCoords, searchRadiusMeters]);

  // ─────────────────────────────────────────────────────────────
  // 7. REAL-TIME SMOOTH ANIMATED CAB MARKER (Zomato/Blinkit Style)
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!vehicleCoord || typeof vehicleCoord.lat !== 'number' || typeof vehicleCoord.lon !== 'number') {
      if (vehicleMarkerRef.current) {
        try { vehicleMarkerRef.current.remove(); } catch (e) {}
        vehicleMarkerRef.current = null;
      }
      return;
    }

    const bearing = typeof vehicleCoord.bearing === 'number' ? vehicleCoord.bearing : 0;
    const isAtPickup = Boolean(vehicleCoord.isAtPickup);
    const isCompleted = Boolean(vehicleCoord.isCompleted);
    const label = vehicleCoord.label || (vehicleCoord.isApproaching ? 'Approaching Pickup' : 'Tata Tigor EV');
    
    // Co-riders count: 0 (driver only), 1 (driver + 1 co-rider), 2 (driver + 2 co-riders)
    const coRidersCount = typeof vehicleCoord.coRidersCount === 'number' 
      ? vehicleCoord.coRidersCount 
      : (vehicleCoord.isApproaching ? 1 : 2);

    const isDriverFemale = Boolean(vehicleCoord.isDriverFemale || vehicleCoord.driverGender === 'female');

    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-moving-node',
      html: `
        <style>
          @keyframes cabPingWave {
            0% { transform: scale(0.8); opacity: 0.95; }
            75%, 100% { transform: scale(2.5); opacity: 0; }
          }
          @keyframes cabGlowPulse {
            0%, 100% { opacity: 0.35; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.15); }
          }
        </style>
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
          <!-- Floating Status Pill like Zomato/Blinkit (Clean without 3/4 text) -->
          <div style="background: rgba(29,29,34,0.96); backdrop-filter: blur(8px); padding: 3px 9px; border-radius: 9999px; border: 1.5px solid #F5C451; box-shadow: 0 4px 12px rgba(0,0,0,0.22); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; color: #FFFFFF; margin-bottom: 4px; white-space: nowrap; display: flex; align-items: center; gap: 5px;">
            <span style="width: 6.5px; height: 6.5px; border-radius: 50%; background: ${isAtPickup ? '#10B981' : isCompleted ? '#3B82F6' : '#F5C451'}; ${isAtPickup ? 'box-shadow: 0 0 7px #10B981;' : 'box-shadow: 0 0 5px #F5C451;'}"></span>
            <span>${label}</span>
          </div>

          <!-- Pure Car Cutout Container -->
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            ${isAtPickup ? `
              <!-- Green Arrival Ripple Wave (Zomato/Blinkit arrival alert) -->
              <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; border: 2.5px solid #10B981; animation: cabPingWave 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(16,185,129,0.25); animation: cabGlowPulse 1.4s infinite;"></div>
            ` : ''}

            <!-- Compact Pure Car Cutout Rotated to Road Bearing -->
            <div style="transform: rotate(${bearing}deg); transition: transform 0.1s linear; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
              <svg width="22" height="44" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <!-- Front Wheels -->
                <rect x="0.5" y="8" width="1.8" height="6" rx="0.8" fill="#18181B"/>
                <rect x="21.7" y="8" width="1.8" height="6" rx="0.8" fill="#18181B"/>
                <!-- Rear Wheels -->
                <rect x="0.5" y="32" width="1.8" height="6" rx="0.8" fill="#18181B"/>
                <rect x="21.7" y="32" width="1.8" height="6" rx="0.8" fill="#18181B"/>

                <!-- Aerodynamic Car Chassis Cutout Body -->
                <path d="M5 3 C8 1 16 1 19 3 C21 5 22 10 22 14 L23 17 C23.8 18 23.8 20 22.5 21 L22 22 L22 41 C22 45 20 47 18 47 L6 47 C4 47 2 45 2 41 L2 22 L1.5 21 C0.2 20 0.2 18 1 17 L2 14 C2 10 3 5 5 3 Z" fill="#F5C451" stroke="#FFFFFF" stroke-width="1.2"/>

                <!-- Front Headlights (White Forward Beams) -->
                <circle cx="5" cy="3.5" r="1.1" fill="#FFFFFF"/>
                <circle cx="19" cy="3.5" r="1.1" fill="#FFFFFF"/>
                
                <!-- Front Windshield (Dark Curved Glass) -->
                <path d="M4.5 11 Q12 9 19.5 11 L18 15 Q12 13.5 6 15 Z" fill="#18181B"/>

                <!-- Panoramic Cabin Glass Interior (Deep Charcoal Floor) -->
                <rect x="4.5" y="15" width="15" height="21" rx="3" fill="#18181B" stroke="#27272A" stroke-width="0.7"/>

                <!-- Front Left Passenger Seat (Empty Contour) -->
                <rect x="5.8" y="17.0" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.4"/>
                <rect x="6.4" y="16.0" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.4"/>

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- DRIVER (Front Right - India RHD): Human with Driver Cap    -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- Steering Wheel in front of Driver -->
                <path d="M14.2 16.2 A1.8 1.4 0 0 1 17.4 16.2" stroke="#CBD5E1" stroke-width="0.8" fill="none" stroke-linecap="round"/>
                
                <!-- Driver Uniform Shoulders -->
                <path d="M13.2 22.2 Q15.8 21.0 18.4 22.2 L18.4 23.6 Q15.8 22.6 13.2 23.6 Z" fill="#334155"/>
                
                <!-- Driver Head Base & Ears -->
                <circle cx="15.8" cy="19.2" r="2.1" fill="#FDDCB1"/>
                <circle cx="13.6" cy="19.2" r="0.55" fill="#FDDCB1"/>
                <circle cx="18.0" cy="19.2" r="0.55" fill="#FDDCB1"/>
                
                ${isDriverFemale ? `
                  <!-- Female Driver Hair Strands / Low Bun at back -->
                  <path d="M14.2 21.0 Q15.8 22.6 17.4 21.0" fill="#3F2E23" stroke="#3F2E23" stroke-width="0.6"/>
                ` : ''}

                <!-- Driver Cap (Peaked Chauffeur / Pilot Cap) -->
                <ellipse cx="15.8" cy="19.2" rx="2.1" ry="1.7" fill="#0F172A"/>
                <!-- Gold Driver Cap Emblem Band -->
                <path d="M13.9 18.4 Q15.8 17.5 17.7 18.4" stroke="#F5C451" stroke-width="0.55" fill="none"/>
                <!-- Cap Visor / Peak extending forward toward windshield -->
                <path d="M14.2 18.0 Q15.8 16.4 17.4 18.0 Z" fill="#020617" stroke="#0F172A" stroke-width="0.4"/>

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- CO-RIDER 1 (Rear Left): Normal Human (Head + Shoulders)     -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                ${coRidersCount >= 1 ? `
                  <!-- Passenger Shoulders (Warm Amber) -->
                  <path d="M5.9 32.2 Q8.5 31.0 11.1 32.2 L11.1 33.6 Q8.5 32.6 5.9 33.6 Z" fill="#D97706" opacity="0.95"/>
                  <!-- Passenger Head Base & Ears -->
                  <circle cx="8.5" cy="29.0" r="2.0" fill="#FDDCB1"/>
                  <circle cx="6.4" cy="29.0" r="0.5" fill="#FDDCB1"/>
                  <circle cx="10.6" cy="29.0" r="0.5" fill="#FDDCB1"/>
                  <!-- Normal Human Hair (Natural Haircut, No Cap) -->
                  <path d="M6.6 29.2 Q6.6 27.0 8.5 27.0 Q10.4 27.0 10.4 29.2 Q8.5 28.3 6.6 29.2 Z" fill="#3F2E23"/>
                ` : `
                  <!-- Empty Rear Left Seat Contour -->
                  <rect x="5.8" y="27.5" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.35"/>
                  <rect x="6.4" y="26.5" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.35"/>
                `}

                <!-- ═══════════════════════════════════════════════════════════ -->
                <!-- USER RIDER (Rear Right): Normal Human (Head + Shoulders)    -->
                <!-- ═══════════════════════════════════════════════════════════ -->
                ${coRidersCount >= 2 ? `
                  <!-- User Shoulders (Emerald Green) -->
                  <path d="M13.2 32.2 Q15.8 31.0 18.4 32.2 L18.4 33.6 Q15.8 32.6 13.2 33.6 Z" fill="#059669" opacity="0.95"/>
                  <!-- User Head Base & Ears -->
                  <circle cx="15.8" cy="29.0" r="2.0" fill="#FDDCB1"/>
                  <circle cx="13.7" cy="29.0" r="0.5" fill="#FDDCB1"/>
                  <circle cx="17.9" cy="29.0" r="0.5" fill="#FDDCB1"/>
                  <!-- Normal Human Hair (Natural Dark Haircut, No Cap) -->
                  <path d="M13.9 29.2 Q13.9 27.0 15.8 27.0 Q17.7 27.0 17.7 29.2 Q15.8 28.3 13.9 29.2 Z" fill="#1E293B"/>
                ` : `
                  <!-- Empty Rear Right Seat Contour -->
                  <rect x="13.4" y="27.5" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.35"/>
                  <rect x="14.0" y="26.5" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.35"/>
                `}

                <!-- Rear Windshield -->
                <path d="M5.5 37 Q12 39 18.5 37 L19 41 Q12 43 5 41 Z" fill="#18181B"/>

                <!-- Rear Taillights (Red LED Strips) -->
                <rect x="4.5" y="45.5" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
                <rect x="16.5" y="45.5" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
              </svg>
            </div>
          </div>
        </div>
      `,
      iconSize: [140, 72],
      iconAnchor: [70, 46]
    });

    if (!vehicleMarkerRef.current || !map.hasLayer(vehicleMarkerRef.current)) {
      vehicleMarkerRef.current = L.marker([vehicleCoord.lat, vehicleCoord.lon], {
        icon: vehicleIcon,
        zIndexOffset: 3000
      }).addTo(map);
    } else {
      vehicleMarkerRef.current.setLatLng([vehicleCoord.lat, vehicleCoord.lon]);
      vehicleMarkerRef.current.setIcon(vehicleIcon);
    }
  }, [vehicleCoord]);

  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ height: height || '100%' }}>
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Warm Ambient Map Vignette */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF7F2]/30 via-transparent to-[#FAF7F2]/80 pointer-events-none" />
    </div>
  );
}
