import { useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';

interface Region {
  id: string;
  name: string;
  coordinates: [number, number];
  status: 'operational' | 'degraded' | 'outage';
}

const regions: Region[] = [
  { id: 'us-west', name: 'US West', coordinates: [-120.5, 43.8], status: 'operational' },
  { id: 'us-east', name: 'US East', coordinates: [-77.0, 38.9], status: 'operational' },
  { id: 'sa-east', name: 'São Paulo', coordinates: [-46.6, -23.5], status: 'operational' },
  { id: 'eu-west', name: 'London', coordinates: [-0.1, 51.5], status: 'outage' },
  { id: 'eu-central', name: 'Frankfurt', coordinates: [8.6, 50.1], status: 'degraded' },
  { id: 'ap-south', name: 'Mumbai', coordinates: [72.8, 19.0], status: 'operational' },
  { id: 'ap-southeast', name: 'Singapore', coordinates: [103.8, 1.3], status: 'operational' },
  { id: 'ap-northeast', name: 'Tokyo', coordinates: [139.6, 35.6], status: 'operational' },
  { id: 'ap-sydney', name: 'Sydney', coordinates: [151.2, -33.8], status: 'operational' },
];

export default function GlobalIncidentMap() {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Failed to load map data", err));
  }, []);

  const width = 800;
  const height = 400;

  const projection = useMemo(() => {
    return d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.5]);
  }, [width, height]);

  const pathGenerator = useMemo(() => {
    return d3.geoPath().projection(projection);
  }, [projection]);

  if (!geoData) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center bg-[#F7F8FA] rounded-2xl border border-[#E6E8EC] mb-10 shadow-premium animate-pulse">
        <span className="text-[#667085] font-mono text-sm font-semibold tracking-widest uppercase">Initializing Map...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E6E8EC] rounded-2xl shadow-premium mb-10 overflow-hidden">
      <div className="px-6 py-5 border-b border-[#E6E8EC] flex items-center justify-between">
        <h3 className="text-base font-semibold">Global Incident Map</h3>
        <div className="flex gap-4 text-xs font-medium text-[#667085]">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#16A67A]"></span> Operational</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Degraded</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500"></span> Outage</span>
        </div>
      </div>
      <div className="w-full p-4 bg-[#F7F8FA] grid-bg">
         <div className="max-w-4xl mx-auto relative overflow-x-auto overflow-y-hidden">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[600px] drop-shadow-sm">
               <g className="map-paths">
                 {geoData.features.map((feature: any, i: number) => (
                    <path
                      key={i}
                      d={pathGenerator(feature) || ''}
                      fill="#FFFFFF"
                      stroke="#E6E8EC"
                      strokeWidth={1}
                      className="transition-colors hover:fill-[#f1f3f5]"
                    />
                 ))}
               </g>
               <g className="nodes">
                 {regions.map((region) => {
                    const coords = projection(region.coordinates);
                    if (!coords) return null;
                    const [x, y] = coords;
                    
                    const isOutage = region.status === 'outage';
                    const isDegraded = region.status === 'degraded';
                    const color = isOutage ? '#EF4444' : isDegraded ? '#F59E0B' : '#16A67A';
                    
                    return (
                       <g key={region.id} transform={`translate(${x}, ${y})`}>
                          {/* Background pulse for active incidents */}
                          {(isOutage || isDegraded) && (
                            <circle 
                              r="12" 
                              fill={color} 
                              opacity="0.2" 
                              className="animate-ping" 
                              style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                            />
                          )}
                          {/* Inner static dot */}
                          <circle 
                            r={isOutage || isDegraded ? "5" : "4"} 
                            fill={color} 
                            stroke="#FFFFFF" 
                            strokeWidth={1.5} 
                            className="shadow-sm"
                          />
                          <text 
                            y="-12" 
                            textAnchor="middle" 
                            className={`text-[10px] font-mono font-bold ${isOutage || isDegraded ? 'fill-[#0B1220]' : 'fill-[#667085]'}`}
                          >
                            {region.name}
                          </text>
                       </g>
                    );
                 })}
               </g>
            </svg>
         </div>
      </div>
    </div>
  );
}
