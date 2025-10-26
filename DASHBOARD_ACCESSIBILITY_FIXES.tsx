/**
 * WCAG 2.1 AA Accessibility Fixes for Dashboard.tsx
 *
 * This file contains corrected versions of components from Dashboard.tsx
 * with full accessibility compliance.
 *
 * CRITICAL FIXES INCLUDED:
 * 1. ARIA labels for charts
 * 2. Icons + text for color-only indicators
 * 3. Keyboard navigation support
 * 4. aria-live regions for dynamic content
 * 5. Proper semantic HTML
 * 6. Screen reader announcements
 */

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  ArrowUp,
  ArrowDown,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
} from "lucide-react";

// ============================================================================
// ACCESSIBLE CHART COMPONENTS
// ============================================================================

/**
 * MiniLineChart - Now fully accessible
 *
 * FIXES:
 * - Added role="img" for chart container
 * - Added aria-labelledby and aria-describedby
 * - Screen reader text describes data trend
 * - SVG marked as aria-hidden (decorative)
 */
const AccessibleMiniLineChart = ({
  data,
  color = "#6366f1",
  height = 60,
  metricName,
}: {
  data: number[];
  color?: string;
  height?: number;
  metricName: string;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const latestValue = data[data.length - 1];
  const previousValue = data[data.length - 2];
  const change = latestValue - previousValue;
  const changePercent =
    previousValue !== 0 ? ((change / previousValue) * 100).toFixed(1) : "0";
  const trend =
    change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable";

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  const chartId = `chart-${metricName.toLowerCase().replace(/\s+/g, "-")}`;
  const titleId = `${chartId}-title`;
  const descId = `${chartId}-desc`;

  return (
    <div
      className="w-full h-16 relative"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <span id={titleId} className="sr-only">
        {metricName} Trend Chart
      </span>
      <span id={descId} className="sr-only">
        Line chart showing {metricName} over {data.length} data points. Range
        from {min} to {max}. Current value: {latestValue}. Trend: {trend} by{" "}
        {Math.abs(Number(changePercent))}%.
      </span>
      <svg
        width="100%"
        height={height}
        className="absolute inset-0"
        aria-hidden="true"
        focusable="false"
      >
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          points={points}
          className="drop-shadow-sm"
        />
        <defs>
          <linearGradient
            id={`gradient-${chartId}`}
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
          fill={`url(#gradient-${chartId})`}
          points={`0,${height} ${points} 100,${height}`}
        />
      </svg>
    </div>
  );
};

/**
 * DoughnutChart - Now fully accessible
 *
 * FIXES:
 * - Added descriptive ARIA labels
 * - Data table alternative for screen readers
 * - Proper semantic structure
 */
const AccessibleDoughnutChart = ({
  data,
  size = 80,
  strokeWidth = 8,
  chartName,
}: {
  data: { label: string; value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
  chartName: string;
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercentage = 0;

  const chartId = `doughnut-${chartName.toLowerCase().replace(/\s+/g, "-")}`;
  const titleId = `${chartId}-title`;
  const descId = `${chartId}-desc`;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <span id={titleId} className="sr-only">
        {chartName} Distribution Chart
      </span>
      <span id={descId} className="sr-only">
        Doughnut chart showing {chartName} distribution. Total: {total}.
        {data
          .map((item) => {
            const percentage = ((item.value / total) * 100).toFixed(0);
            return `${item.label}: ${item.value} (${percentage}%). `;
          })
          .join("")}
      </span>

      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20"
        />
        {data.map((item, index) => {
          const percentage = (item.value / total) * 100;
          const strokeDasharray = `${(percentage / 100) * circumference} ${circumference}`;
          const strokeDashoffset = -(
            (accumulatedPercentage / 100) *
            circumference
          );

          accumulatedPercentage += percentage;

          return (
            <circle
              key={index}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-300"
            />
          );
        })}
      </svg>
      <div
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden="true"
      >
        <div className="text-center">
          <div className="text-lg font-bold text-foreground">{total}</div>
          <div className="text-xs text-muted-foreground">Total</div>
        </div>
      </div>
    </div>
  );
};

/**
 * TimeSeriesChart - Now fully accessible
 *
 * FIXES:
 * - Comprehensive data description for screen readers
 * - All visual data conveyed in text
 * - Proper semantic structure
 */
const AccessibleTimeSeriesChart = ({
  data,
  dates,
  color = "#6366f1",
  height = 120,
  normalRange,
  metricName,
  unit,
}: {
  data: number[];
  dates: string[];
  color?: string;
  height?: number;
  normalRange?: { min: number; max: number };
  metricName: string;
  unit: string;
}) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const paddingLeft = 5;
  const paddingRight = 2;
  const paddingY = 10;
  const chartHeight = height - paddingY * 2;
  const chartWidth = 100 - paddingLeft - paddingRight;

  const latestValue = data[data.length - 1];
  const isOutOfRange = normalRange
    ? latestValue > normalRange.max || latestValue < normalRange.min
    : false;

  const chartId = `timeseries-${metricName.toLowerCase().replace(/\s+/g, "-")}`;
  const titleId = `${chartId}-title`;
  const descId = `${chartId}-desc`;

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
        const controlX = previous.x + (current.x - previous.x) * 0.5;
        const controlY = previous.y;
        path += ` Q ${controlX} ${controlY} ${current.x} ${current.y}`;
      } else {
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

  return (
    <div
      className="w-full relative"
      style={{ height: height + 40 }}
      role="img"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <span id={titleId} className="sr-only">
        {metricName} Over Time Chart
      </span>
      <span id={descId} className="sr-only">
        Time series chart showing {metricName} from {dates[0]} to{" "}
        {dates[dates.length - 1]}.
        {normalRange &&
          ` Normal range: ${normalRange.min} to ${normalRange.max} ${unit}.`}
        Data points:{" "}
        {data
          .map((value, index) => `${dates[index]}: ${value} ${unit}`)
          .join(", ")}
        . Latest value: {latestValue} {unit}
        {isOutOfRange && `, which is outside the normal range`}.
      </span>

      <svg
        width="100%"
        height={height}
        className="absolute inset-0"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        {/* Grid lines */}
        <defs>
          <pattern
            id={`grid-${chartId}`}
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
        <rect width="100%" height="100%" fill={`url(#grid-${chartId})`} />

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
            height={((normalRange.max - normalRange.min) / range) * chartHeight}
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
            id={`timeseriesGradient-${chartId}`}
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
          fill={`url(#timeseriesGradient-${chartId})`}
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

        {/* Latest data point */}
        {points.map((point, index) => {
          const isLatest = index === points.length - 1;
          const isHigh = normalRange ? point.value > normalRange.max : false;

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

        {/* Current value extension line */}
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
      <div
        className="flex justify-between text-xs text-muted-foreground mt-2 px-2"
        aria-hidden="true"
      >
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
      <div
        className="flex justify-between text-xs font-medium mt-1 px-2"
        aria-hidden="true"
      >
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
};

// ============================================================================
// ACCESSIBLE STATUS INDICATORS
// ============================================================================

/**
 * Lab Status Indicator - Now accessible without color alone
 *
 * FIXES:
 * - Icons provide visual distinction beyond color
 * - Screen reader text announces status
 * - Maintains color for sighted users
 */
export const AccessibleLabStatus = ({
  status,
  value,
  unit,
}: {
  status: "high" | "low" | "normal" | "borderline";
  value: string;
  unit?: string;
}) => {
  const statusConfig = {
    high: {
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      label: "High",
      srText: "High - Abnormal result, above normal range",
    },
    low: {
      icon: AlertCircle,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      label: "Low",
      srText: "Low - Abnormal result, below normal range",
    },
    normal: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      label: "Normal",
      srText: "Normal - Within normal range",
    },
    borderline: {
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      label: "Borderline",
      srText: "Borderline - Near upper or lower limit of normal range",
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-md border ${config.bgColor} ${config.borderColor}`}
      role="status"
      aria-label={`Lab result status: ${config.label}`}
    >
      <Icon className={`h-4 w-4 ${config.color}`} aria-hidden="true" />
      <span className="sr-only">{config.srText}: </span>
      <span className={`text-sm font-medium ${config.color}`}>
        {value} {unit && unit}
      </span>
      <span className={`text-xs font-normal ${config.color}`}>
        ({config.label})
      </span>
    </div>
  );
};

/**
 * Trend Indicator - Accessible trend visualization
 *
 * FIXES:
 * - Icon indicates direction
 * - Text describes trend
 * - Color is supplementary, not primary
 */
export const AccessibleTrendIndicator = ({
  trend,
  value,
}: {
  trend: "up" | "down" | "neutral";
  value: string;
}) => {
  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: "text-green-600",
      label: "Increasing",
      ariaLabel: `Trending up by ${value}`,
    },
    down: {
      icon: TrendingDown,
      color: "text-red-600",
      label: "Decreasing",
      ariaLabel: `Trending down by ${value}`,
    },
    neutral: {
      icon: Activity,
      color: "text-gray-600",
      label: "Stable",
      ariaLabel: `Trend stable at ${value}`,
    },
  };

  const config = trendConfig[trend];
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1 ${config.color}`}
      role="status"
      aria-label={config.ariaLabel}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span className="text-sm font-medium">{value}</span>
      <span className="sr-only"> ({config.label})</span>
    </div>
  );
};

// ============================================================================
// ACCESSIBLE FORM COMPONENTS
// ============================================================================

/**
 * Accessible Select Dropdown
 *
 * FIXES:
 * - Proper label association
 * - ARIA attributes for state
 * - Keyboard navigation support
 */
export const AccessibleSelect = ({
  id,
  label,
  value,
  onChange,
  options,
  required = false,
  error,
  helpText,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  helpText?: string;
}) => {
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="text-red-500 ml-1" aria-label="required">
            *
          </span>
        )}
      </label>

      {helpText && !error && (
        <p id={helpId} className="text-xs text-muted-foreground">
          {helpText}
        </p>
      )}

      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-required={required}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? errorId : helpText ? helpId : undefined}
        className={`w-full px-3 py-2 border rounded-md bg-background text-foreground
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          ${error ? "border-red-500" : "border-input"}`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p id={errorId} role="alert" className="text-sm text-red-600">
          <span className="sr-only">Error: </span>
          {error}
        </p>
      )}
    </div>
  );
};

// ============================================================================
// ACCESSIBLE DYNAMIC CONTENT
// ============================================================================

/**
 * Loading Announcement
 *
 * FIXES:
 * - aria-live region announces loading state
 * - Proper roles for status updates
 */
export const AccessibleLoadingState = ({
  isLoading,
  loadingText = "Loading...",
}: {
  isLoading: boolean;
  loadingText?: string;
}) => {
  if (!isLoading) return null;

  return (
    <div role="status" aria-live="polite" aria-atomic="true">
      <span className="sr-only">{loadingText}</span>
      <div className="flex items-center justify-center p-4" aria-hidden="true">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-muted-foreground">{loadingText}</span>
      </div>
    </div>
  );
};

/**
 * Success/Error Announcement
 *
 * FIXES:
 * - aria-live="assertive" for important messages
 * - Proper alert role
 * - Icon + text + color
 */
export const AccessibleAlert = ({
  type,
  message,
  onDismiss,
}: {
  type: "success" | "error" | "warning" | "info";
  message: string;
  onDismiss?: () => void;
}) => {
  const alertConfig = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-800",
      iconColor: "text-green-600",
    },
    error: {
      icon: AlertTriangle,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-800",
      iconColor: "text-red-600",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-800",
      iconColor: "text-orange-600",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-800",
      iconColor: "text-blue-600",
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={`flex items-start gap-3 p-4 rounded-lg border ${config.bgColor} ${config.borderColor}`}
    >
      <Icon
        className={`h-5 w-5 ${config.iconColor} flex-shrink-0 mt-0.5`}
        aria-hidden="true"
      />
      <div className="flex-1">
        <span className="sr-only">{type}: </span>
        <p className={`text-sm ${config.textColor}`}>{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss alert"
          className={`${config.textColor} hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary`}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

// ============================================================================
// USAGE EXAMPLES
// ============================================================================

/**
 * Example: Accessible Lab Results Display
 */
export const ExampleAccessibleLabResults = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Recent Lab Results</h2>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Total Cholesterol</h3>
            <p className="text-sm text-muted-foreground">
              Tested: Jun 20, 2024
            </p>
          </div>
          <AccessibleLabStatus status="high" value="245" unit="mg/dL" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">HDL Cholesterol</h3>
            <p className="text-sm text-muted-foreground">
              Tested: Jun 20, 2024
            </p>
          </div>
          <AccessibleLabStatus status="low" value="38" unit="mg/dL" />
        </div>

        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h3 className="font-medium">Glucose</h3>
            <p className="text-sm text-muted-foreground">
              Tested: Jun 15, 2024
            </p>
          </div>
          <AccessibleLabStatus status="normal" value="95" unit="mg/dL" />
        </div>
      </div>
    </div>
  );
};

/**
 * Example: Accessible Health Metrics with Charts
 */
export const ExampleAccessibleHealthMetrics = () => {
  const healthScoreData = [82, 84, 83, 85, 87, 85, 88];

  return (
    <div className="p-6 border rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold">Health Score</h3>
          <p className="text-2xl font-bold">88</p>
        </div>
        <AccessibleTrendIndicator trend="up" value="+3%" />
      </div>

      <AccessibleMiniLineChart
        data={healthScoreData}
        color="#10b981"
        metricName="Health Score"
      />
    </div>
  );
};

export {
  AccessibleMiniLineChart,
  AccessibleDoughnutChart,
  AccessibleTimeSeriesChart,
};
