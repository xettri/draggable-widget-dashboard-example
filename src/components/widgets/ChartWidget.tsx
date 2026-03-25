import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Generate some dummy stock data
const generateData = () => {
  const data = [];
  let price = 23000;
  for (let i = 0; i < 60; i++) {
    price = price + (Math.random() - 0.48) * 200;
    data.push({
      time: `10:${i < 10 ? '0' + i : i}`,
      price: Math.round(price)
    });
  }
  return data;
};

const data = generateData();

export const ChartWidget = () => {
  return (
    <div className="w-full text-zinc-800 h-full flex flex-col bg-white">
      <div className="flex-1 p-4 relative overflow-hidden" style={{ minHeight: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
            <XAxis dataKey="time" stroke="#a1a1aa" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis
              domain={['auto', 'auto']}
              stroke="#a1a1aa"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
              orientation="right"
            />
            <Tooltip
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorPrice)"
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
