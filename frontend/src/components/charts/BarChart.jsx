import React from "react";

const BarChart = ({ data, maxValue: maxValueProp, height = 220 }) => {
  const maxValue = Math.max(1, maxValueProp ?? Math.max(...data.map(d => d.value)));

  return (
    <div className="relative" style={{ height }}>
      {/* subtle horizontal grid */}
      <div className="absolute inset-0">
        {[0.25, 0.5, 0.75].map((t) => (
          <div key={t} className="absolute left-0 right-0 border-t border-gray-200" style={{ top: `${t * 100}%` }}></div>
        ))}
      </div>
      <div className="grid grid-cols-5 gap-6 items-end h-full relative">
        {data.map((d) => (
          <div key={d.label} className="flex flex-col items-center justify-end h-full">
            {/* value badge */}
            <div className="mb-1 text-xs text-gray-700 font-semibold px-2 py-0.5 bg-gray-50 rounded-full shadow-sm">
              {d.value}
            </div>
            <div className="w-10 sm:w-14 flex items-end" title={`${d.label}: ${d.value}`}>
              <div className={`${d.colorClass} w-full rounded-t-md`} style={{ height: `${(d.value / maxValue) * 100}%` }}></div>
            </div>
            <div className="mt-2 text-xs text-gray-600 text-center leading-tight">
              <div>{d.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;


