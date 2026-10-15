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
        iconAnchor: [70, 36]
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
        iconAnchor: [70, 36]
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
    const vehicleType = vehicleCoord.vehicleType || 'ev'; // 'auto' | 'sedan' | 'small_car' | 'ev'

    // Render vehicle SVG based on type (Auto Rickshaw, Sedan, Small Car, EV)
    const isAuto = vehicleType === 'auto';
    const isSedan = vehicleType === 'sedan';
    const isSmallCar = vehicleType === 'small_car';
    const isEv = vehicleType === 'ev' || (!isAuto && !isSedan && !isSmallCar);

    const skinTone = '#FDDCB1';
    const hairBrown = '#3F2E23';
    const hairDark = '#1E293B';
    const uniformColor = isEv ? '#0F766E' : isSedan ? '#1E3A8A' : '#334155';

    const vehicleSvg = isAuto ? `
      <svg width="22" height="44" viewBox="0 0 24 46" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Front Wheel (Single 3-Wheeler Wheel at nose) -->
        <rect x="11.1" y="2" width="1.8" height="5" rx="0.9" fill="#18181B"/>
        <rect x="10.4" y="3.5" width="3.2" height="1.2" rx="0.6" fill="#64748B"/>
        
        <!-- Rear Wheels -->
        <rect x="0.5" y="28" width="1.8" height="6.5" rx="0.8" fill="#18181B"/>
        <rect x="21.7" y="28" width="1.8" height="6.5" rx="0.8" fill="#18181B"/>

        <!-- Auto Rickshaw Iconic Chassis (Tapered front, open sides, yellow & green body) -->
        <path d="M7 11 L10.5 4.5 Q12 3 13.5 4.5 L17 11 L21 14 L21 38 Q21 41 18 42 L6 42 Q3 41 3 38 L3 14 Z" fill="#F5C451" stroke="#FFFFFF" stroke-width="1.2"/>
        
        <!-- Classic Green Lower Apron / Mudguards in India -->
        <path d="M3 33 L21 33 L21 40 Q21 42 18 42 L6 42 Q3 42 3 40 Z" fill="#15803D"/>

        <!-- Single Front Headlight -->
        <circle cx="12" cy="4.2" r="1.3" fill="#FFFFFF"/>
        <circle cx="12" cy="4.2" r="0.6" fill="#FEF08A"/>

        <!-- Open Cab Interior Floor (Deep Charcoal) -->
        <path d="M5.5 12 L18.5 12 L19.5 37 L4.5 37 Z" fill="#18181B"/>

        <!-- Open Side Safety Rails (Black Cutouts) -->
        <rect x="2.5" y="15" width="2" height="14" rx="0.5" fill="#18181B"/>
        <rect x="19.5" y="15" width="2" height="14" rx="0.5" fill="#18181B"/>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- AUTO DRIVER (Center Front): Khaki Uniform & Handlebar       -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- Handlebar Steering Controls -->
        <path d="M8.8 14.5 L15.2 14.5" stroke="#CBD5E1" stroke-width="1.2" stroke-linecap="round"/>
        <rect x="8.0" y="13.9" width="1.6" height="1.2" rx="0.4" fill="#09090B"/>
        <rect x="14.4" y="13.9" width="1.6" height="1.2" rx="0.4" fill="#09090B"/>

        <!-- Driver Hands on Handlebar -->
        <circle cx="8.8" cy="14.5" r="0.65" fill="${skinTone}"/>
        <circle cx="15.2" cy="14.5" r="0.65" fill="${skinTone}"/>

        <!-- Driver Khaki Uniform Shoulders -->
        <path d="M9.4 20.8 Q12 19.6 14.6 20.8 L14.6 22.4 Q12 21.4 9.4 22.4 Z" fill="#926328"/>
        <path d="M11 19.8 L12 21.0 L13 19.8" stroke="#B8860B" stroke-width="0.5" fill="none"/>

        <!-- Driver Head & Khaki Cap -->
        <circle cx="12.0" cy="17.8" r="2.0" fill="${skinTone}"/>
        <circle cx="9.9" cy="17.8" r="0.5" fill="${skinTone}"/>
        <circle cx="14.1" cy="17.8" r="0.5" fill="${skinTone}"/>
        ${isDriverFemale ? `
          <path d="M10.8 19.4 Q12 20.8 13.2 19.4" fill="${hairBrown}" stroke="${hairBrown}" stroke-width="0.5"/>
        ` : ''}
        <!-- Khaki Cap with Forward Peak -->
        <ellipse cx="12.0" cy="17.8" rx="2.0" ry="1.6" fill="#704810"/>
        <path d="M10.4 16.8 Q12.0 15.5 13.6 16.8 Z" fill="#452C06"/>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- REAR PASSENGER BENCH (3 Riders Max in Auto Rickshaw)        -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <rect x="4.8" y="27.5" width="14.4" height="6.5" rx="1.5" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.45"/>

        <!-- Rider 1 (Rear Left: Amber Co-Rider) -->
        ${coRidersCount >= 1 ? `
          <path d="M5.4 32.2 Q7.5 31.0 9.6 32.2 L9.6 33.6 Q7.5 32.8 5.4 33.6 Z" fill="#D97706"/>
          <circle cx="7.5" cy="29.2" r="1.8" fill="${skinTone}"/>
          <path d="M5.9 29.4 Q5.9 27.4 7.5 27.4 Q9.1 27.4 9.1 29.4 Q7.5 28.6 5.9 29.4 Z" fill="${hairBrown}"/>
        ` : ''}

        <!-- Rider 2 (Rear Right: Emerald User) -->
        ${coRidersCount >= 2 ? `
          <path d="M14.4 32.2 Q16.5 31.0 18.6 32.2 L18.6 33.6 Q16.5 32.8 14.4 33.6 Z" fill="#059669"/>
          <circle cx="16.5" cy="29.2" r="1.8" fill="${skinTone}"/>
          <path d="M14.9 29.4 Q14.9 27.4 16.5 27.4 Q18.1 27.4 18.1 29.4 Q16.5 28.6 14.9 29.4 Z" fill="${hairDark}"/>
        ` : ''}

        <!-- Rider 3 (Rear Center: Blue Co-Rider - 3 Riders Max) -->
        ${coRidersCount >= 3 ? `
          <path d="M10.0 32.2 Q12.0 31.0 14.0 32.2 L14.0 33.6 Q12.0 32.8 10.0 33.6 Z" fill="#2563EB"/>
          <circle cx="12.0" cy="29.2" r="1.8" fill="${skinTone}"/>
          <path d="M10.4 29.4 Q10.4 27.4 12.0 27.4 Q13.6 27.4 13.6 29.4 Q12.0 28.6 10.4 29.4 Z" fill="#374151"/>
        ` : ''}

        <!-- Rear Taillights -->
        <rect x="4.5" y="41" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
        <rect x="16.5" y="41" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
      </svg>
    ` : `
      <svg width="22" height="44" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Front Wheels -->
        <rect x="0.5" y="8" width="1.8" height="6" rx="0.8" fill="#18181B"/>
        <rect x="21.7" y="8" width="1.8" height="6" rx="0.8" fill="#18181B"/>
        <!-- Rear Wheels -->
        <rect x="0.5" y="32" width="1.8" height="6" rx="0.8" fill="#18181B"/>
        <rect x="21.7" y="32" width="1.8" height="6" rx="0.8" fill="#18181B"/>

        <!-- Chassis Outline customized by vehicle type -->
        ${isSedan ? `
          <!-- Executive Sedan Chassis (Elongated trunk & chrome accents) -->
          <path d="M5 2 C8 0.5 16 0.5 19 2 C21 4 22 8 22 13 L23 16 C23.8 17 23.8 19 22.5 20 L22 21 L22 42 C22 46.5 20 47.5 18 47.5 L6 47.5 C4 47.5 2 46.5 2 42 L2 21 L1.5 20 C0.2 19 0.2 17 1 16 L2 13 C2 8 3 4 5 2 Z" fill="#F5C451" stroke="#FFFFFF" stroke-width="1.2"/>
          <line x1="4.5" y1="41" x2="19.5" y2="41" stroke="#D97706" stroke-width="0.8"/>
        ` : isSmallCar ? `
          <!-- City Hatchback Chassis (Compact rounded body & short rear) -->
          <path d="M5 4 C8 2 16 2 19 4 C21 6 22 10 22 14 L22.8 17 C23.5 18 23.5 19.5 22.5 20.5 L22 21.5 L22 39 C22 43 20 45 18 45 L6 45 C4 45 2 43 2 39 L2 21.5 L1.5 20.5 C0.5 19.5 0.5 18 1.2 17 L2 14 C2 10 3 6 5 4 Z" fill="#F59E0B" stroke="#FFFFFF" stroke-width="1.2"/>
        ` : `
          <!-- EV Chassis (Aerodynamic dark body with electric cyan glow) -->
          <path d="M5 3 C8 1 16 1 19 3 C21 5 22 10 22 14 L23 17 C23.8 18 23.8 20 22.5 21 L22 22 L22 41 C22 45 20 47 18 47 L6 47 C4 47 2 45 2 41 L2 22 L1.5 21 C0.2 20 0.2 18 1 17 L2 14 C2 10 3 5 5 3 Z" fill="#0F172A" stroke="#06B6D4" stroke-width="1.2"/>
          <rect x="9" y="46.5" width="6" height="1.2" rx="0.4" fill="#10B981"/>
        `}

        <!-- Front Headlights (White Forward Beams) -->
        <circle cx="5" cy="3.5" r="1.1" fill="#FFFFFF"/>
        <circle cx="19" cy="3.5" r="1.1" fill="#FFFFFF"/>
        
        <!-- Front Windshield -->
        <path d="M4.5 11 Q12 9 19.5 11 L18 15 Q12 13.5 6 15 Z" fill="#18181B"/>

        <!-- Panoramic Cabin Glass Interior (Deep Charcoal Floor) -->
        <rect x="4.5" y="15" width="15" height="21" rx="3" fill="#18181B" stroke="#27272A" stroke-width="0.7"/>

        <!-- Empty Front-Right Passenger Seat Contour -->
        <rect x="13.4" y="17.0" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.35"/>
        <rect x="14.0" y="16.0" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.35"/>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- DRIVER (Front-LEFT Steering Side with Uniform & Hands)      -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- Steering Wheel in front of Driver -->
        <circle cx="8.2" cy="16.5" r="2.0" stroke="#FFFFFF" stroke-width="0.9" fill="none"/>
        <line x1="8.2" y1="16.5" x2="8.2" y2="18.5" stroke="#CBD5E1" stroke-width="0.7"/>
        <line x1="6.2" y1="16.5" x2="10.2" y2="16.5" stroke="#CBD5E1" stroke-width="0.7"/>
        <circle cx="8.2" cy="16.5" r="0.6" fill="#64748B"/>

        <!-- Driver Hands on Steering Wheel (10 and 2 o'clock) -->
        <circle cx="6.7" cy="15.8" r="0.65" fill="${skinTone}"/>
        <circle cx="9.7" cy="15.8" r="0.65" fill="${skinTone}"/>

        <!-- Driver Uniform Shoulders -->
        <path d="M5.4 22.2 Q8.2 21.0 11.0 22.2 L11.0 23.8 Q8.2 22.8 5.4 23.8 Z" fill="${uniformColor}"/>
        <path d="M7.4 21.4 L8.2 22.6 L9.0 21.4" stroke="#FFFFFF" stroke-width="0.6" fill="none"/>

        <!-- Driver Head Base & Ears -->
        <circle cx="8.2" cy="19.2" r="2.1" fill="${skinTone}"/>
        <circle cx="6.0" cy="19.2" r="0.55" fill="${skinTone}"/>
        <circle cx="10.4" cy="19.2" r="0.55" fill="${skinTone}"/>

        ${isDriverFemale ? `
          <path d="M6.8 21.0 Q8.2 22.6 9.6 21.0" fill="${hairBrown}" stroke="${hairBrown}" stroke-width="0.6"/>
        ` : ''}

        <!-- Peaked Pilot / Chauffeur Cap with Visor -->
        <ellipse cx="8.2" cy="19.2" rx="2.1" ry="1.7" fill="#0F172A"/>
        <path d="M6.3 18.4 Q8.2 17.5 10.1 18.4" stroke="#F5C451" stroke-width="0.55" fill="none"/>
        <path d="M6.6 18.0 Q8.2 16.4 9.8 18.0 Z" fill="#020617" stroke="#0F172A" stroke-width="0.4"/>

        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- REAR SEATS: RIDERS ON THE BACK SEAT                         -->
        <!-- ═══════════════════════════════════════════════════════════ -->
        <!-- Rear Left Seat (Co-Rider 1: Warm Amber) -->
        ${coRidersCount >= 1 ? `
          <path d="M5.9 32.2 Q8.5 31.0 11.1 32.2 L11.1 33.6 Q8.5 32.6 5.9 33.6 Z" fill="#D97706" opacity="0.95"/>
          <circle cx="8.5" cy="29.0" r="2.0" fill="${skinTone}"/>
          <circle cx="6.4" cy="29.0" r="0.5" fill="${skinTone}"/>
          <circle cx="10.6" cy="29.0" r="0.5" fill="${skinTone}"/>
          <path d="M6.6 29.2 Q6.6 27.0 8.5 27.0 Q10.4 27.0 10.4 29.2 Q8.5 28.3 6.6 29.2 Z" fill="${hairBrown}"/>
        ` : `
          <rect x="5.8" y="27.5" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.35"/>
          <rect x="6.4" y="26.5" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.35"/>
        `}

        <!-- Rear Right Seat (User Rider: Emerald Green) -->
        ${coRidersCount >= 2 ? `
          <path d="M13.2 32.2 Q15.8 31.0 18.4 32.2 L18.4 33.6 Q15.8 32.6 13.2 33.6 Z" fill="#059669" opacity="0.95"/>
          <circle cx="15.8" cy="29.0" r="2.0" fill="${skinTone}"/>
          <circle cx="13.7" cy="29.0" r="0.5" fill="${skinTone}"/>
          <circle cx="17.9" cy="29.0" r="0.5" fill="${skinTone}"/>
          <path d="M13.9 29.2 Q13.9 27.0 15.8 27.0 Q17.7 27.0 17.7 29.2 Q15.8 28.3 13.9 29.2 Z" fill="${hairDark}"/>
        ` : `
          <rect x="13.4" y="27.5" width="4.8" height="5.0" rx="1.2" fill="#27272A" stroke="#3F3F46" stroke-width="0.5" opacity="0.35"/>
          <rect x="14.0" y="26.5" width="3.6" height="1.2" rx="0.6" fill="#3F3F46" opacity="0.35"/>
        `}

        <!-- Rear Windshield -->
        <path d="M5.5 37 Q12 39 18.5 37 L19 41 Q12 43 5 41 Z" fill="#18181B"/>

        <!-- Rear Taillights (Red LED Strips) -->
        <rect x="4.5" y="45.5" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
        <rect x="16.5" y="45.5" width="3" height="1.2" rx="0.5" fill="#EF4444"/>
      </svg>
    `;

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

          <!-- Pure Vehicle Cutout Container (Sleek Compact Size) -->
          <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
            ${isAtPickup ? `
              <!-- Green Arrival Ripple Wave (Zomato/Blinkit arrival alert) -->
              <div style="position: absolute; width: 42px; height: 42px; border-radius: 50%; border: 2.5px solid #10B981; animation: cabPingWave 1.4s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position: absolute; width: 30px; height: 30px; border-radius: 50%; background: rgba(16,185,129,0.25); animation: cabGlowPulse 1.4s infinite;"></div>
            ` : ''}

            <!-- Compact Pure Vehicle Cutout Rotated to Road Bearing -->
            <div style="transform: rotate(${bearing}deg); transition: transform 0.1s linear; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.4));">
              ${vehicleSvg}
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
