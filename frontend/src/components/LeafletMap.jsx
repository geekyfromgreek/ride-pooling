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
  // 7. REAL-TIME SMOOTH ANIMATED CAB MARKER (Dedicated Ref)
  // ─────────────────────────────────────────────────────────────
  const vehicleMarkerRef = useRef(null);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (!vehicleCoord || typeof vehicleCoord.lat !== 'number' || typeof vehicleCoord.lon !== 'number') {
      if (vehicleMarkerRef.current) {
        vehicleMarkerRef.current.remove();
        vehicleMarkerRef.current = null;
      }
      return;
    }

    const bearing = typeof vehicleCoord.bearing === 'number' ? vehicleCoord.bearing : 0;
    const isAtPickup = Boolean(vehicleCoord.isAtPickup);
    const isCompleted = Boolean(vehicleCoord.isCompleted);
    const label = vehicleCoord.label || (vehicleCoord.isApproaching ? 'Approaching Pickup' : 'Tata Tigor EV');

    const vehicleIcon = L.divIcon({
      className: 'custom-vehicle-moving-node',
      html: `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; pointer-events: none;">
          <!-- Floating Status Pill -->
          <div style="background: rgba(255,255,255,0.96); backdrop-filter: blur(6px); padding: 3px 9px; border-radius: 9999px; border: 1px solid #EAE5DC; box-shadow: 0 4px 12px rgba(29,29,34,0.12); font-family: 'Plus Jakarta Sans', sans-serif; font-size: 10px; font-weight: 700; color: #1D1D22; margin-bottom: 4px; white-space: nowrap; display: flex; align-items: center; gap: 5px;">
            <span style="width: 7px; height: 7px; border-radius: 50%; background: ${isAtPickup ? '#10B981' : isCompleted ? '#3B82F6' : '#F5C451'}; ${isAtPickup ? 'box-shadow: 0 0 6px #10B981;' : ''}"></span>
            <span>${label}</span>
          </div>

          <!-- Cab Marker Container with Directional Rotation -->
          <div style="position: relative; width: 38px; height: 38px;">
            ${isAtPickup ? `
              <!-- Small cab arrival pulse animation when pickup arrives -->
              <div style="position: absolute; inset: -7px; border-radius: 50%; border: 2.5px solid #10B981; opacity: 0.85; animation: ping 1.2s cubic-bezier(0,0,0.2,1) infinite;"></div>
              <div style="position: absolute; inset: -3px; border-radius: 50%; background: rgba(16,185,129,0.15); animation: pulse 1.5s infinite;"></div>
            ` : ''}
            <div style="width: 38px; height: 38px; border-radius: 50%; background: #1D1D22; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 16px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center; transform: rotate(${bearing}deg); transition: transform 0.12s ease;">
              <!-- Sleek Top-down Cab Vector -->
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="6.5" y="3" width="11" height="18" rx="3.5" fill="#1D1D22" stroke="#FFFFFF" stroke-width="1.3"/>
                <path d="M7.5 7.5H16.5L15.5 10.5H8.5L7.5 7.5Z" fill="#F5C451"/>
                <path d="M8 17H16L15.5 18.5H8.5L8 17Z" fill="#F5C451" opacity="0.8"/>
                <circle cx="8" cy="4.2" r="1" fill="#FDE047"/>
                <circle cx="16" cy="4.2" r="1" fill="#FDE047"/>
              </svg>
            </div>
            <!-- Active Indicator Badge -->
            <div style="position: absolute; top: -1px; right: -1px; width: 10px; height: 10px; border-radius: 50%; background: ${isAtPickup ? '#10B981' : isCompleted ? '#3B82F6' : '#F5C451'}; border: 2px solid #FFFFFF; box-shadow: 0 1px 4px rgba(0,0,0,0.15);"></div>
          </div>
        </div>
      `,
      iconSize: [140, 62],
      iconAnchor: [70, 50]
    });

    if (!vehicleMarkerRef.current) {
      vehicleMarkerRef.current = L.marker([vehicleCoord.lat, vehicleCoord.lon], {
        icon: vehicleIcon,
        zIndexOffset: 1200
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
