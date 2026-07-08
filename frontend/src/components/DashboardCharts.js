import React from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area
} from 'recharts';

const STATUS_COLORS = {
  pending: 'var(--warning)',
  approved: 'var(--success)',
  rejected: 'var(--danger)',
};

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-head">
        <h4>{title}</h4>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="chart-card-body">{children}</div>
    </div>
  );
}

export default function DashboardCharts({ stats }) {
  const pieData = [
    { name: 'Pending', key: 'pending', value: stats.pending },
    { name: 'Approved', key: 'approved', value: stats.approved },
    { name: 'Rejected', key: 'rejected', value: stats.rejected },
  ].filter(d => d.value > 0);

  const barData = (stats.byProgram || []).slice(0, 6);
  const trendData = (stats.trend || []).map(t => ({
    ...t,
    label: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
  }));

  return (
    <div className="charts-grid">
      <ChartCard title="Status Breakdown" subtitle={`${stats.total} total`}>
        {pieData.length === 0 ? (
          <div className="chart-empty">No applications yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
              >
                {pieData.map(d => <Cell key={d.key} fill={STATUS_COLORS[d.key]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
        )}
        <div className="chart-legend">
          {pieData.map(d => (
            <div key={d.key} className="chart-legend-item">
              <span className="chart-dot" style={{ background: STATUS_COLORS[d.key] }} />
              {d.name} ({d.value})
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Applications by Program" subtitle="Top 6">
        {barData.length === 0 ? (
          <div className="chart-empty">No applications yet</div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} layout="vertical" margin={{ left: 10, right: 16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="program"
                width={100}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'var(--surface-alt)' }}
                contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
              />
              <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <ChartCard title="Applications Trend" subtitle="Last 14 days">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trendData} margin={{ left: -20, right: 10, top: 10 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--divider)" vertical={false} />
            <XAxis dataKey="label" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
            <YAxis allowDecimals={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }} />
            <Area type="monotone" dataKey="count" stroke="var(--primary)" strokeWidth={2} fill="url(#trendFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  );
}
