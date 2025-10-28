/**
 * TimeSeriesChart Component
 *
 * A sophisticated time-series chart with smooth curves, gradient fills, and normal range indicators.
 * Features smooth Bezier curves, grid lines, and interactive data points.
 * Optimized with React.memo for performance.
 */

import React from "react";

interface TimeSeriesChartProps {
  data: number[];
  dates: string[];
  color?: string;
  height?: number;
  normalRange?: { min: number; max: number };
}

const TimeSeriesChart: React.FC<TimeSeriesChartProps> = React.memo(
  ({ data, dates, color = "#6366f1", height = 120, normalRange }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const paddingLeft = 5;
    const paddingRight = 2; // Minimal right padding to extend to edge
    const paddingY = 10;
    const chartHeight = height - paddingY * 2;
    const chartWidth = 100 - paddingLeft - paddingRight;

    // Calculate points for smooth curve
    const points = data.map((value, index) => {
      const x = paddingLeft + (index / (data.length - 1)) * chartWidth;
      const y = paddingY + chartHeight - ((value - min) / range) * chartHeight;
      return { x, y, value };
    });

    // Create smooth path using Bezier curves
    const createSmoothPath = (points: { x: number; y: number }[]) => {
      if (points.length < 2) return "";

      let path = `M ${points[0].x} ${points[0].y}`;

      for (let i = 1; i < points.length; i++) {
        const current = points[i];
        const previous = points[i - 1];

        if (i === 1) {
          // First curve - start with quadratic
          const controlX = previous.x + (current.x - previous.x) * 0.5;
          const controlY = previous.y;
          path += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
        } else {
          // Subsequent curves - use cubic Bezier for smoothness
          const prev2 = points[i - 2];
          const controlPoint1X = previous.x + (current.x - prev2.x) * 0.2;
          const controlPoint1Y = previous.y;
          const controlPoint2X = current.x - (current.x - previous.x) * 0.2;
          const controlPoint2Y = current.y;

          path += ` C ${controlPoint1X} ${controlPoint1Y} ${controlPoint2X} ${controlPoint2Y} ${current.x} ${current.y}`;
        }
      }

      return path;
    };

    const smoothPath = createSmoothPath(points);
    const pointsString = points.map((p) => `${p.x},${p.y}`).join(" ");

    return (
      <div className="w-full relative" style={{ height: height + 40 }}>
        <svg
          width="100%"
          height={height}
          className="absolute inset-0"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                opacity="0.1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Normal range background */}
          {normalRange && (
            <rect
              x={paddingLeft}
              y={
                paddingY +
                chartHeight -
                ((normalRange.max - min) / range) * chartHeight
              }
              width={chartWidth}
              height={
                ((normalRange.max - normalRange.min) / range) * chartHeight
              }
              fill="#10b981"
              fillOpacity="0.1"
              stroke="#10b981"
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.3"
            />
          )}

          {/* Gradient fill */}
          <defs>
            <linearGradient
              id={`timeseriesGradient-${color.replace("#", "")}`}
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor={color} stopOpacity="0.4" />
              <stop offset="100%" stopColor={color} stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Area under smooth curve */}
          <path
            d={`${smoothPath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`}
            fill={`url(#timeseriesGradient-${color.replace("#", "")})`}
          />

          {/* Smooth thin line */}
          <path
            d={smoothPath}
            fill="none"
            stroke={color}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="drop-shadow-sm"
          />

          {/* Minimal data points - only show current */}
          {points.map((point, index) => {
            const isLatest = index === points.length - 1;
            const isHigh = normalRange ? point.value > normalRange.max : false;

            // Only show the latest point, make others invisible
            if (!isLatest) return null;

            return (
              <g key={index}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="2"
                  fill={isHigh ? "#ef4444" : color}
                  stroke="white"
                  strokeWidth="1"
                  className="drop-shadow-sm"
                />
                {/* Subtle pulse for current value */}
                <circle
                  cx={point.x}
                  cy={point.y}
                  r="4"
                  fill="none"
                  stroke={color}
                  strokeWidth="1"
                  opacity="0.3"
                  className="animate-pulse"
                />
              </g>
            );
          })}

          {/* Current value extension line to edge */}
          {points.length > 0 && (
            <line
              x1={points[points.length - 1].x}
              y1={points[points.length - 1].y}
              x2={98}
              y2={points[points.length - 1].y}
              stroke={color}
              strokeWidth="1"
              strokeDasharray="3,3"
              opacity="0.4"
            />
          )}
        </svg>

        {/* Date labels */}
        <div className="flex justify-between text-xs text-muted-foreground mt-2 px-2">
          {dates.map((date, index) => (
            <span
              key={index}
              className={
                index === dates.length - 1 ? "font-medium text-foreground" : ""
              }
            >
              {date}
            </span>
          ))}
        </div>

        {/* Value labels */}
        <div className="flex justify-between text-xs font-medium mt-1 px-2">
          {data.map((value, index) => (
            <span
              key={index}
              className={`${index === data.length - 1 ? "text-foreground font-bold" : "text-muted-foreground"}`}
            >
              {value}
            </span>
          ))}
        </div>
      </div>
    );
  },
);

TimeSeriesChart.displayName = "TimeSeriesChart";

export default TimeSeriesChart;
