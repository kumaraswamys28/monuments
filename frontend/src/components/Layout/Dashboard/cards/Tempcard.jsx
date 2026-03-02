import React, { useEffect, useRef } from 'react';
import GaugeChart from 'react-gauge-component';

function Tempcard({ res }) {
  // 1. Initialize refs to store Min and Max
  // We use null initially to handle the first data point correctly
  const minRef = useRef(res);
  const maxRef = useRef(res);

  // 2. Update Min and Max whenever 'res' changes
  useEffect(() => {
    if (res < minRef.current || minRef.current === undefined) {
      minRef.current = res;
    }
    if (res > maxRef.current || maxRef.current === undefined) {
      maxRef.current = res;
    }
  }, [res]);

  // Normalize for gauge (assuming 0-100 range for the chart)
  const gaugePercent = res / 100;

  return (
    <div className="bg-muted/50 rounded-xl p-4 flex flex-row items-center justify-between border border-blue-500 w-full">
      
      {/* Left Side: Temperature Stats */}
      <div className="flex flex-col justify-center space-y-1 w-1/2">
        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          Temperature
        </p>
        <h2 className="text-4xl font-bold text-foreground">{res}°C</h2>
        
        <div className="flex gap-4 pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Min</span>
            <span className="text-sm font-semibold text-blue-400">
              {minRef.current}°
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] text-muted-foreground uppercase">Max</span>
            <span className="text-sm font-semibold text-red-400">
              {maxRef.current}°
            </span>
          </div>
        </div>
      </div>

      {/* Right Side: Gauge */}
      <div className="w-1/2 flex justify-end items-center">
        <GaugeChart 
          id="temp-gauge"
          nrOfLevels={30}
          colors={["#3b82f6", "#ef4444"]}
          arcWidth={0.2}
          percent={gaugePercent}
          animate={true}
          animDelay={0}
          animateDuration={500} 
          textColor="transparent"
          needleColor="#94a3b8"
          needleBaseColor="#64748b"
          style={{ width: '140px' }} // Keeps it contained
        />
      </div>
    </div>
  );
}

export default Tempcard;