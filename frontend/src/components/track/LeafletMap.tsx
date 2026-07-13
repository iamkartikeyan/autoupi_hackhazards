'use client';
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────
interface MilestoneMeta {
  id: string;
  label: string;
  country: string;
  description: string;
  lat: number;
  lng: number;
  icon: string;
  wsStep: string;
}

interface MilestoneStatus {
  step: string;
  status: 'pending' | 'active' | 'completed';
  timestamp?: string;
}

interface Props {
  milestones: MilestoneMeta[];
  milestoneStates: MilestoneStatus[];
  onHover: (id: string | null) => void;
}

const STATUS_COLORS = {
  pending: '#6B7280',
  active: '#2563EB',
  completed: '#10B981',
};

// ──────────────────────────────────────────────
// LeafletMap — rendered only on client
// ──────────────────────────────────────────────
export default function LeafletMap({ milestones, milestoneStates, onHover }: Props) {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const polylineRef = useRef<L.Polyline | null>(null);
  const animPolylineRef = useRef<L.Polyline | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const animProgressRef = useRef(0);

  // ── Build Leaflet divIcon for a milestone ──
  const buildIcon = useCallback((meta: MilestoneMeta, status: MilestoneStatus['status']) => {
    const color = STATUS_COLORS[status];
    const isActive = status === 'active';
    const isDone = status === 'completed';

    const pulse = isActive ? `
      <div style="
        position:absolute; inset:-6px; border-radius:50%;
        border:2px solid ${color}; opacity:0.6;
        animation:markerPulse 1.4s ease-out infinite;
      "></div>` : '';

    const ring = isActive ? `
      <div style="
        position:absolute; inset:-12px; border-radius:50%;
        border:2px solid ${color}; opacity:0.3;
        animation:markerPulse 1.4s ease-out infinite 0.4s;
      "></div>` : '';

    const inner = isDone
      ? `<div style="font-size:14px; line-height:1;">✓</div>`
      : `<div style="font-size:18px; line-height:1;">${meta.icon}</div>`;

    return L.divIcon({
      className: '',
      html: `
        <div style="position:relative; display:flex; align-items:center; justify-content:center;">
          ${ring}
          ${pulse}
          <div style="
            width:44px; height:44px; border-radius:50%;
            background:${isDone ? color : '#0f172a'};
            border:2px solid ${color};
            display:flex; align-items:center; justify-content:center;
            box-shadow: 0 0 ${isActive ? '20px' : '8px'} ${color}55;
            transition: all 0.4s ease;
          ">
            ${inner}
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });
  }, []);

  // ── Initialize map ──────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [23, 55],
      zoom: 4,
      zoomControl: false,
      attributionControl: false,
    });

    // Dark map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(map);

    // Add custom zoom control
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Subtle attribution
    L.control.attribution({ position: 'bottomleft', prefix: '' }).addTo(map);

    // Inject keyframes for pulse animation
    if (!document.getElementById('leaflet-anim-styles')) {
      const style = document.createElement('style');
      style.id = 'leaflet-anim-styles';
      style.innerHTML = `
        @keyframes markerPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2); opacity: 0; }
        }
        @keyframes dashMove {
          to { stroke-dashoffset: -20; }
        }
      `;
      document.head.appendChild(style);
    }

    // Draw the route polyline (grey, dashed)
    const coords: L.LatLngExpression[] = milestones.map(m => [m.lat, m.lng]);
    const basePolyline = L.polyline(coords, {
      color: '#374151',
      weight: 2,
      dashArray: '8 6',
      opacity: 0.7,
    }).addTo(map);
    polylineRef.current = basePolyline;

    // Animated "glow" polyline (starts empty)
    const glowLine = L.polyline([], {
      color: '#2563EB',
      weight: 3,
      opacity: 0.9,
    }).addTo(map);
    animPolylineRef.current = glowLine;

    // Place initial markers
    milestones.forEach(meta => {
      const ms = { step: meta.id, status: 'pending' as const };
      const marker = L.marker([meta.lat, meta.lng], { icon: buildIcon(meta, 'pending') })
        .addTo(map);

      // Tooltip
      marker.bindTooltip(`<div style="background:#1e293b;color:#fff;border:1px solid #334155;border-radius:8px;padding:6px 10px;font-size:12px;font-weight:600;">${meta.icon} ${meta.label}</div>`, {
        permanent: false,
        direction: 'top',
        offset: [0, -24],
        className: 'leaflet-track-tooltip',
        opacity: 1,
      });

      marker.on('mouseover', () => onHover(meta.id));
      marker.on('mouseout', () => onHover(null));
      marker.on('click', () => {
        map.setView([meta.lat, meta.lng], 6, { animate: true, duration: 0.8 });
      });

      markersRef.current.set(meta.id, marker);
    });

    // Fit bounds
    map.fitBounds(L.latLngBounds(coords).pad(0.3));
    mapRef.current = map;

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Update markers when state changes ──────
  useEffect(() => {
    if (!mapRef.current) return;

    milestones.forEach(meta => {
      const ms = milestoneStates.find(s => s.step === meta.id);
      if (!ms) return;
      const marker = markersRef.current.get(meta.id);
      if (!marker) return;
      marker.setIcon(buildIcon(meta, ms.status));
    });

    // Animate the progress polyline
    const completedCount = milestoneStates.filter(s => s.status === 'completed').length;
    const activeIndex = milestoneStates.findIndex(s => s.status === 'active');
    const targetIndex = activeIndex >= 0 ? activeIndex : completedCount;

    if (targetIndex === 0) return;

    // Build coords up to targetIndex (+ partial toward next if active)
    const allCoords = milestones.map(m => L.latLng(m.lat, m.lng));
    const progressCoords: L.LatLng[] = allCoords.slice(0, targetIndex + 1);

    if (animPolylineRef.current) {
      animPolylineRef.current.setLatLngs(progressCoords);
    }
  }, [milestoneStates, milestones, buildIcon]);

  return (
    <>
      <style>{`
        .leaflet-track-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-track-tooltip::before { display: none !important; }
        .leaflet-container { background: #020617 !important; }
      `}</style>
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: '400px' }} />
    </>
  );
}
