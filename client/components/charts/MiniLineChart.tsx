/**
 * MiniLineChart Component
 *
 * A lightweight line chart component for displaying mini trend visualizations.
 * Used in dashboard metric cards to show quick visual trends.
 * Optimized with React.memo to prevent unnecessary re-renders.
 */

import React from "react";

interface MiniLineChartProps {
  data: number[];
  color?: string;
  height?: number;
}

const MiniLineChart: React.FC<MiniLineChartProps> = React.memo(
  ({ data, color = "#6366f1", height = 60 }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;

    const points = data
      .map((value, index) => {
        const x = (index / (data.length - 1)) * 100;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <div className="w-full h-16 relative">
        <svg width="100%" height={height} className="absolute inset-0">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="2"
            points={points}
            className="drop-shadow-sm"
          />
          <defs>
            <linearGradient
              id={`gradient-${color.replace("#", "")}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <polygon
            fill={`url(#gradient-${color.replace("#", "")})`}
            points={`0,${height} ${points} 100,${height}`}
          />
        </svg>
      </div>
    );
  },
);

MiniLineChart.displayName = "MiniLineChart";

export default MiniLineChart;
