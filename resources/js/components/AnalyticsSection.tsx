import React from 'react';
import { Activity, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

export const AnalyticsSection: React.FC = () => {
  // Ledger Row Stat Component
  const LedgerStat = ({
    index,
    label,
    value,
    trend,
    isNegative,
  }: {
    index: string;
    label: string;
    value: string;
    trend: string;
    isNegative: boolean;
  }) => (
    <div className="flex items-baseline justify-between border-b border-[var(--gray-200)] py-4 first:pt-0 last:border-b-0">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[11px] text-[var(--gray-400)]">{index}</span>
        <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-500)]">{label}</span>
      </div>
      <div className="flex items-baseline gap-4">
        <span
          className={`flex items-center gap-0.5 font-mono text-[11px] ${
            isNegative ? 'text-[var(--gray-400)]' : 'text-[var(--ink)]'
          }`}
        >
          {isNegative ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
          {trend}
        </span>
        <span className="font-mono text-2xl font-semibold tabular-nums text-[var(--ink)]">
          {value}
        </span>
      </div>
    </div>
  );

  // Ruler Tick Meter (Signature bryl-minimal design element)
  const RulerMeter = ({ completionRate = 84 }: { completionRate?: number }) => {
    const totalTicks = 40;
    const filledTicks = Math.round((completionRate / 100) * totalTicks);

    return (
      <div className="flex h-full flex-col border border-[var(--gray-200)] bg-[var(--bg)] p-6 rounded-xl shadow-2xs">
        <div className="mb-6 flex items-baseline justify-between">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
            Sprint Completion Rate
          </h3>
          <span className="font-mono text-3xl font-semibold tabular-nums text-[var(--ink)]">
            {completionRate}
            <span className="text-sm text-[var(--gray-400)]">%</span>
          </span>
        </div>

        <div className="flex flex-1 flex-col justify-center my-4">
          <div className="flex h-14 items-end gap-[3px]">
            {Array.from({ length: totalTicks }).map((_, i) => {
              const filled = i < filledTicks;
              const major = i % 5 === 0;
              return (
                <div
                  key={i}
                  className={`flex-1 transition-all duration-300 ${
                    major ? 'h-full' : 'h-2/3'
                  } ${filled ? 'bg-[var(--ink)]' : 'bg-[var(--gray-200)]'}`}
                />
              );
            })}
          </div>
          <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--gray-400)]">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--gray-200)] grid grid-cols-3 gap-2 font-mono">
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[var(--gray-400)]">Delivered</p>
            <p className="text-base font-semibold tabular-nums text-[var(--ink)]">148</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[var(--gray-400)]">In Flight</p>
            <p className="text-base font-semibold tabular-nums text-[var(--ink)]">26</p>
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-widest text-[var(--gray-400)]">Queued</p>
            <p className="text-base font-semibold tabular-nums text-[var(--ink)]">12</p>
          </div>
        </div>
      </div>
    );
  };

  const monthlyData = [
    { name: 'Jan', success: 24, failed: 4 },
    { name: 'Feb', success: 32, failed: 3 },
    { name: 'Mar', success: 28, failed: 5 },
    { name: 'Apr', success: 42, failed: 2 },
    { name: 'May', success: 48, failed: 4 },
    { name: 'Jun', success: 56, failed: 3 },
    { name: 'Jul', success: 64, failed: 2 },
    { name: 'Aug', success: 72, failed: 4 },
    { name: 'Sep', success: 80, failed: 3 },
    { name: 'Oct', success: 88, failed: 2 },
    { name: 'Nov', success: 94, failed: 3 },
    { name: 'Dec', success: 108, failed: 2 },
  ];

  return (
    <section id="analytics" className="py-24 bg-[var(--bg)] relative border-b border-[var(--gray-200)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Title Bar */}
        <div className="mb-12 border-b border-[var(--gray-200)] pb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <Activity className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--gray-500)]">
                04 — Operations & Analytics Engine
              </span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-[var(--ink)] font-sans tracking-tight">
              Data-Driven Execution Clarity
            </h2>
          </div>
          <div className="flex items-center gap-6 font-mono text-[11px] uppercase tracking-widest text-[var(--gray-500)]">
            <span>Cycle Time: <span className="text-[var(--ink)] font-bold">2.4d</span></span>
            <span>Reliability: <span className="text-[var(--ink)] font-bold">99.8%</span></span>
          </div>
        </div>

        {/* 3 Column Grid: Ledger Stats, Ruler Meter, Throughput Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Col 1: Ledger Stats */}
          <div className="bg-[var(--bg)] border border-[var(--gray-200)] p-6 rounded-xl shadow-2xs flex flex-col justify-between">
            <div>
              <h3 className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
                01 / Operational Ledger
              </h3>
              <LedgerStat index="01" label="Total Tasks" value="186" trend="14%" isNegative={false} />
              <LedgerStat index="02" label="Completed" value="148" trend="18%" isNegative={false} />
              <LedgerStat index="03" label="In Development" value="26" trend="5%" isNegative={false} />
              <LedgerStat index="04" label="Overdue Rate" value="2%" trend="1.2%" isNegative={true} />
            </div>

            <div className="mt-6 pt-4 border-t border-[var(--gray-200)] flex items-center justify-between text-xs font-mono text-[var(--gray-500)]">
              <span>AUTOMATED AUDIT</span>
              <span className="text-[var(--ink)] font-bold">PASSED</span>
            </div>
          </div>

          {/* Col 2: Ruler Tick Gauge */}
          <div>
            <RulerMeter completionRate={84} />
          </div>

          {/* Col 3: Monthly Throughput Chart */}
          <div className="bg-[var(--bg)] border border-[var(--gray-200)] p-6 rounded-xl shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--gray-400)]">
                    03 / Monthly Throughput
                  </h3>
                  <div className="mt-2 flex items-baseline gap-3">
                    <span className="font-mono text-3xl font-semibold tabular-nums text-[var(--ink)]">
                      108
                    </span>
                    <span className="flex items-center gap-0.5 font-mono text-[11px] text-[var(--ink)]">
                      <ArrowUpRight size={12} />
                      +14.8%
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1 font-mono text-[10px] text-[var(--gray-400)]">
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-3 bg-[var(--ink)]" /> completed
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-[2px] w-3 border-t border-dashed border-[var(--gray-400)]" /> blocked
                  </span>
                </div>
              </div>

              <div className="h-[180px] w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyData} margin={{ left: -25, right: 5, top: 5, bottom: 0 }}>
                    <CartesianGrid vertical={false} stroke="var(--gray-200)" strokeDasharray="2 4" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--gray-400)', fontSize: 10, fontFamily: 'monospace' }}
                      dy={6}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'var(--gray-400)', fontSize: 10, fontFamily: 'monospace' }}
                      domain={[0, 'auto']}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--ink)',
                        border: '1px solid var(--gray-200)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        color: 'var(--bg)',
                      }}
                    />
                    <Line
                      type="linear"
                      dataKey="success"
                      stroke="var(--ink)"
                      strokeWidth={1.5}
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--ink)' }}
                    />
                    <Line
                      type="linear"
                      dataKey="failed"
                      stroke="var(--gray-400)"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                      activeDot={{ r: 4, fill: 'var(--gray-400)' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--gray-200)] flex items-center justify-between text-xs font-mono text-[var(--gray-500)]">
              <span>SYSTEM PERFORMANCE</span>
              <span className="text-[var(--ink)] font-bold">OPTIMAL</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};


