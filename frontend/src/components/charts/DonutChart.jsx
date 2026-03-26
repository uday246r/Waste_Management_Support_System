import React from "react";

const DonutChart = ({ segments, size = 220, radius = 70, strokeWidth = 18, centerTitle = "", centerSubtitle = "" }) => {
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(1, segments.reduce((sum, s) => sum + (s.value || 0), 0));
  let offsetAccumulator = 0;

  return (
    <div className="flex items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="mx-auto">
        <g transform={`translate(${size / 2},${size / 2})`}>
          <circle r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth={strokeWidth}></circle>
          {segments.map((s) => {
            const fraction = (s.value || 0) / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const circle = (
              <circle
                key={s.label}
                r={radius}
                fill="transparent"
                stroke={s.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-offsetAccumulator}
                transform="rotate(-90)"
              />
            );
            offsetAccumulator += dash;
            return circle;
          })}
          {centerTitle && (
            <text x="0" y="5" textAnchor="middle" className="fill-teal-700" style={{ fontSize: 20, fontWeight: 700 }}>
              {centerTitle}
            </text>
          )}
          {centerSubtitle && (
            <text x="0" y="28" textAnchor="middle" className="fill-gray-500" style={{ fontSize: 12 }}>
              {centerSubtitle}
            </text>
          )}
        </g>
      </svg>
      <div className="ml-6 space-y-2">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center text-sm text-gray-700">
            <span className="inline-block w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: s.color }}></span>
            <span className="w-28">{s.label}</span>
            <span className="font-medium mr-2">{s.value}</span>
            <span className="text-gray-500">({Math.round(((s.value || 0) / total) * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;



