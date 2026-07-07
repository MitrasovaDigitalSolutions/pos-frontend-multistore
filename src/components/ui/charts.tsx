"use client";

import React, { useMemo } from "react";

// ─── 1. Sparkline Component ──────────────────────────────────────────────────
interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
}

export function Sparkline({
  data,
  width = 100,
  height = 40,
  color = "#4f46e5", // emerald-600
  fillColor: _fillColor = "rgba(79, 70, 229, 0.1)",
}: SparklineProps) {
  const points = useMemo(() => {
    if (!data || data.length < 2) return "";
    const max = Math.max(...data) || 1;
    const min = Math.min(...data);
    const range = max - min || 1;

    return data
      .map((val, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 6) - 3; // padding top/bottom
        return `${x},${y}`;
      })
      .join(" ");
  }, [data, width, height]);

  const fillPoints = useMemo(() => {
    if (!points) return "";
    return `0,${height} ${points} ${width},${height}`;
  }, [points, width, height]);

  if (!data || data.length < 2) return null;

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#sparkline-grad)" />
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── 2. BarChart Component ────────────────────────────────────────────────────
interface BarChartItem {
  label: string;
  value: number;
  pattern?: boolean; // If true, uses a diagonal stripe pattern
}

interface BarChartProps {
  data: BarChartItem[];
  height?: number;
  barColor?: string;
}

export function BarChart({ data, height = 180, barColor: _barColor = "#0f172a" }: BarChartProps) {
  const max = useMemo(() => {
    return Math.max(...data.map((d) => d.value)) || 1;
  }, [data]);

  return (
    <div className="w-full flex flex-col justify-end" style={{ height: `${height}px` }}>
      {/* Pattern definition inside a self-contained SVG */}
      <svg className="w-0 h-0 absolute">
        <defs>
          <pattern
            id="diagonal-stripes"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="#e2e8f0"
              strokeWidth="4"
              className="dark:stroke-slate-800"
            />
          </pattern>
        </defs>
      </svg>

      <div className="flex items-end justify-between h-full w-full gap-2 px-1">
        {data.map((item, index) => {
          const percentage = (item.value / max) * 100;
          // Minimum height of 8% if value > 0 so the bar is always visible
          const barHeight = item.value > 0 ? Math.max(8, percentage) : 0;

          return (
            <div key={index} className="flex flex-col items-center flex-grow group gap-1.5 h-full justify-end">
              <div className="w-full relative flex flex-col justify-end items-center h-full">
                {/* Value tooltip on hover */}
                <span className="absolute -top-7 scale-0 group-hover:scale-100 transition-all bg-slate-900 text-white text-[9px] font-bold py-1 px-1.5 rounded shadow z-10 whitespace-nowrap">
                  {item.value.toLocaleString("id-ID")}
                </span>

                {/* Bar */}
                <div
                  style={{ height: `${barHeight}%` }}
                  className={`w-8 sm:w-10 rounded-t-lg transition-all duration-500 relative overflow-hidden`}
                >
                  {item.pattern ? (
                    <div className="absolute inset-0 bg-[url(#diagonal-stripes)] border-x border-t border-slate-200 rounded-t-lg h-full" style={{ backgroundImage: "repeating-linear-gradient(45deg, #e2e8f0, #e2e8f0 4px, transparent 4px, transparent 8px)" }}></div>
                  ) : (
                    <div className="absolute inset-0 bg-slate-900 rounded-t-lg h-full"></div>
                  )}
                  {/* Subtle value label inside the bar if tall enough */}
                  {barHeight > 25 && (
                    <span className={`absolute bottom-2 left-0 right-0 text-[8px] font-bold text-center ${item.pattern ? 'text-slate-500' : 'text-white/80'}`}>
                      {item.value >= 1000 ? `${(item.value / 1000).toFixed(1)}k` : item.value}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 3. DoughnutChart Component ───────────────────────────────────────────────
interface DoughnutSegment {
  label: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  data: DoughnutSegment[];
  size?: number;
  strokeWidth?: number;
  centerValue?: string;
  centerLabel?: string;
  centerBadge?: string;
}

export function DoughnutChart({
  data,
  size = 160,
  strokeWidth = 18,
  centerValue,
  centerLabel,
  centerBadge,
}: DoughnutChartProps) {
  const total = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  }, [data]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const segments = useMemo(() => {
    return data.map((seg, index) => {
      const percentage = seg.value / total;
      const strokeLength = percentage * circumference;
      
      const previousTotalLength = data
        .slice(0, index)
        .reduce((sum, s) => sum + (s.value / total) * circumference, 0);
        
      const strokeOffset = circumference - strokeLength - previousTotalLength;
 
      return {
        ...seg,
        strokeLength,
        strokeOffset,
      };
    });
  }, [data, total, circumference]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth={strokeWidth}
        />
        {/* Segment circles */}
        {segments.map((seg, idx) => (
          <circle
            key={idx}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={seg.strokeOffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        ))}
      </svg>

      {/* Center text overlay */}
      <div className="absolute flex flex-col items-center text-center px-4">
        {centerValue && (
          <span className="text-xl font-extrabold text-slate-900 leading-none tracking-tight">
            {centerValue}
          </span>
        )}
        {centerBadge && (
          <span className="mt-1 bg-emerald-50 text-emerald-600 text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            {centerBadge}
          </span>
        )}
        {centerLabel && (
          <span className="text-[9px] font-semibold text-slate-400 mt-1 uppercase tracking-wider">
            {centerLabel}
          </span>
        )}
      </div>
    </div>
  );
}
