/**
 * DoughnutChart Component
 *
 * A doughnut/pie chart component for displaying segmented data.
 * Shows multiple data segments with different colors in a circular format.
 * Optimized with React.memo for performance.
 */

import React from "react";

interface DoughnutChartData {
  label: string;
  value: number;
  color: string;
}

interface DoughnutChartProps {
  data: DoughnutChartData[];
  size?: number;
  strokeWidth?: number;
}

const DoughnutChart: React.FC<DoughnutChartProps> = React.memo(
  ({ data, size = 80, strokeWidth = 8 }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPercentage = 0;

    return (
      <div className="relative inline-flex items-center justify-center">
        <svg width={size} height={size} className="transform -rotate-90">
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
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold text-foreground">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
    );
  },
);

DoughnutChart.displayName = "DoughnutChart";

export default DoughnutChart;
