import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface ChartPoint {
  time: string;
  latency: number;
}

export default function PerformanceChart({ points }: { points: ChartPoint[] }) {
  const data = points.length > 0 ? points : [{ time: '—', latency: 0 }];
  return (
    <div className="bg-[#FFFFFF] border border-[#E5E5E5] rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.04)] p-6">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-[#111111]">Response Time Trend</h3>
        <p className="text-xs text-[#6B6B6B] mt-1">Recorded latency across recent checks</p>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E5E5" />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6B6B6B' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6B6B6B' }} 
              dx={-10}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E5E5', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', fontSize: '12px' }}
              itemStyle={{ color: '#3154FF', fontWeight: 600 }}
              labelStyle={{ color: '#6B6B6B', marginBottom: '4px' }}
              cursor={{ stroke: '#E5E5E5', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            <Line 
              type="monotone" 
              dataKey="latency" 
              name="Latency (ms)"
              stroke="#3154FF" 
              strokeWidth={2}
              dot={{ r: 3, fill: '#FFFFFF', stroke: '#3154FF', strokeWidth: 2 }}
              activeDot={{ r: 5, fill: '#3154FF', stroke: '#FFFFFF', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
