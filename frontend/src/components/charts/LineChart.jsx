import React, { useMemo } from "react";

// points: array of { x: Date|string|number, y: number }
const LineChart = ({ points, width = 600, height = 260, stroke = "#14b8a6", fill = "rgba(20,184,166,0.12)", gridColor = "#e5e7eb" }) => {
  const padding = { top: 16, right: 16, bottom: 24, left: 32 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const { minX, maxX, minY, maxY, d, areaD, xTicks } = useMemo(() => {
    if (!points || points.length === 0) {
      return { minX: 0, maxX: 1, minY: 0, maxY: 1, d: "", areaD: "", xTicks: [] };
    }
    const sorted = [...points].sort((a, b) => new Date(a.x) - new Date(b.x));
    const xs = sorted.map(p => new Date(p.x).getTime());
    const ys = sorted.map(p => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(0, ...ys);
    const maxY = Math.max(1, ...ys);

    const xScale = (x) => {
      if (maxX === minX) return padding.left;
      return padding.left + ((x - minX) / (maxX - minX)) * innerWidth;
    };
    const yScale = (y) => padding.top + innerHeight - ((y - minY) / (maxY - minY)) * innerHeight;

    const path = sorted.map((p, i) => `${i === 0 ? "M" : "L"}${xScale(new Date(p.x).getTime())},${yScale(p.y)}`).join(" ");
    const area = `M${xScale(xs[0])},${yScale(0)} ` +
                 sorted.map((p) => `L${xScale(new Date(p.x).getTime())},${yScale(p.y)}`).join(" ") +
                 ` L${xScale(xs[xs.length - 1])},${yScale(0)} Z`;

    // Simple 4 ticks including ends
    const xTicks = [0, 0.33, 0.66, 1].map(t => new Date(minX + t * (maxX - minX)));

    return { minX, maxX, minY, maxY, d: path, areaD: area, xTicks };
  }, [points, height, width]);

  return (
    <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <rect x="0" y="0" width={width} height={height} fill="#ffffff" rx="12" />

      {/* grid lines */}
      {[0.25, 0.5, 0.75].map((t) => (
        <line key={t} x1={padding.left} x2={width - padding.right} y1={padding.top + (1 - t) * (height - padding.top - padding.bottom)} y2={padding.top + (1 - t) * (height - padding.top - padding.bottom)} stroke={gridColor} strokeWidth="1" />
      ))}

      {/* area */}
      <path d={areaD} fill={fill} />

      {/* line */}
      <path d={d} fill="none" stroke={stroke} strokeWidth="2.5" />

      {/* x-axis labels */}
      {xTicks.map((t, i) => {
        const xPos = padding.left + (i / (xTicks.length - 1)) * (width - padding.left - padding.right);
        const label = new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
        return (
          <text key={i} x={xPos} y={height - 6} textAnchor="middle" className="fill-gray-500" style={{ fontSize: 10 }}>{label}</text>
        );
      })}
    </svg>
  );
};

export default LineChart;



