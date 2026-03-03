import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

function aqiStatus(aqi) {
  if (aqi <= 50)  return { label: "GOOD",         color: "text-emerald-500", dot: "bg-emerald-500" };
  if (aqi <= 100) return { label: "MODERATE",     color: "text-yellow-500",  dot: "bg-yellow-500"  };
  if (aqi <= 150) return { label: "UNHEALTHY·SG", color: "text-orange-500",  dot: "bg-orange-500"  };
  if (aqi <= 200) return { label: "UNHEALTHY",    color: "text-red-500",     dot: "bg-red-500"     };
  return                 { label: "HAZARDOUS",    color: "text-rose-700",    dot: "bg-rose-700"    };
}
function vibrationStatus(v) {
  if (v < 0.3) return { label: "LOW",      color: "text-emerald-500", dot: "bg-emerald-500" };
  if (v < 0.7) return { label: "MODERATE", color: "text-yellow-500",  dot: "bg-yellow-500"  };
  return               { label: "HIGH",    color: "text-red-500",     dot: "bg-red-500"     };
}
function humidityStatus(h) {
  if (h < 30) return { label: "DRY",     color: "text-orange-400", dot: "bg-orange-400" };
  if (h < 60) return { label: "NOMINAL", color: "text-emerald-500",dot: "bg-emerald-500"};
  return              { label: "HUMID",  color: "text-blue-500",   dot: "bg-blue-500"   };
}
function visitorStatus(v) {
  if (v < 50)  return { label: "QUIET",    color: "text-emerald-500", dot: "bg-emerald-500" };
  if (v < 200) return { label: "BUSY",     color: "text-violet-500",  dot: "bg-violet-500"  };
  return               { label: "CROWDED", color: "text-red-500",     dot: "bg-red-500"     };
}
function rainfallStatus(r) {
  if (r < 0.1) return { label: "TRACE", color: "text-cyan-500", dot: "bg-cyan-500" };
  if (r < 5)   return { label: "LIGHT", color: "text-cyan-600", dot: "bg-cyan-600" };
  return               { label: "HEAVY", color: "text-blue-700", dot: "bg-blue-700" };
}
function fmtTime(ts) {
  if (!ts) return "--";
  try { return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }); }
  catch { return "--"; }
}

function MetricCard({ status, label, value, unit, valueColor, min, max, minUnit }) {
  return (
    <Card className="border-slate-200 rounded-xl shadow-sm h-full">
      <CardContent className="px-3 py-3 flex flex-col justify-between h-full">
        {/* Top: status + label + value */}
        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${status.dot}`} />
            <span className={`text-[10px] font-bold tracking-widest ${status.color}`}
              style={{ fontFamily: "'DM Mono', monospace" }}>{status.label}</span>
          </div>
          <div className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-1"
            style={{ fontFamily: "'DM Mono', monospace" }}>{label}</div>
          <div className="flex items-baseline gap-1">
            <span className={`text-2xl font-bold tabular-nums leading-none ${valueColor}`}
              style={{ fontFamily: "'DM Mono', monospace" }}>{value}</span>
            {unit && <span className="text-xs text-slate-400">{unit}</span>}
          </div>
        </div>

        {/* Bottom: min/max */}
        <div className="flex gap-3 mt-2 pt-2 border-t border-slate-100">
          <div className="flex-1">
            <div className="text-[9px] tracking-widest text-slate-300 uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}>Min</div>
            <span className="text-sm font-bold text-blue-400 tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {min}<span className="text-[10px] font-normal text-slate-300 ml-px">{minUnit}</span>
            </span>
          </div>
          <div className="flex-1">
            <div className="text-[9px] tracking-widest text-slate-300 uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}>Max</div>
            <span className="text-sm font-bold text-red-400 tabular-nums"
              style={{ fontFamily: "'DM Mono', monospace" }}>
              {max}<span className="text-[10px] font-normal text-slate-300 ml-px">{minUnit}</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LeftPanel({ data = null }) {
  const d = data ?? {};
  const aqi  = aqiStatus(d.aqi ?? 0);
  const vib  = vibrationStatus(d.vibration ?? 0);
  const hum  = humidityStatus(d.humidity ?? 0);
  const vis  = visitorStatus(d.visitor_count ?? 0);
  const rain = rainfallStatus(d.rainfall ?? 0);
  const tempStatus = { label: "NOMINAL", color: "text-emerald-500", dot: "bg-emerald-500" };

  const alerts = [];
  if (d.aqi         > 150) alerts.push({ msg: `AQI critical: ${d.aqi}`,                      color: "bg-red-50 border-red-200 text-red-600"          });
  if (d.vibration   > 0.7) alerts.push({ msg: `High vibration: ${d.vibration?.toFixed(3)}g`,  color: "bg-orange-50 border-orange-200 text-orange-600" });
  if (d.temperature > 40)  alerts.push({ msg: `High temp: ${d.temperature?.toFixed(1)}°C`,    color: "bg-yellow-50 border-yellow-200 text-yellow-700" });

  const metrics = [
    { status: tempStatus, label: "Temperature", value: d.temperature != null ? d.temperature.toFixed(1) : "--", unit: "°C", valueColor: "text-orange-500", min: "0", max: d.temperature != null ? d.temperature.toFixed(1) : "--", minUnit: "°" },
    { status: hum,        label: "Humidity",    value: d.humidity     != null ? d.humidity.toFixed(1)     : "--", unit: "%",  valueColor: "text-blue-500",   min: "0", max: d.humidity     != null ? d.humidity.toFixed(1)     : "--", minUnit: "%" },
    { status: vib,        label: "Vibration",   value: d.vibration    != null ? d.vibration.toFixed(3)    : "--", unit: "g",  valueColor: vib.color,         min: "0", max: d.vibration    != null ? d.vibration.toFixed(3)    : "--", minUnit: "g" },
    { status: vis,        label: "Visitors",    value: d.visitor_count != null ? String(d.visitor_count)  : "--", unit: "/hr",valueColor: "text-violet-500", min: "0", max: d.visitor_count != null ? String(d.visitor_count)  : "--", minUnit: "/hr" },
    { status: aqi,        label: "AQI",         value: d.aqi           != null ? String(d.aqi)            : "--", unit: "",   valueColor: aqi.color,         min: "0", max: d.aqi           != null ? String(d.aqi)            : "--", minUnit: "" },
    { status: rain,       label: "Rainfall",    value: d.rainfall      != null ? d.rainfall.toFixed(2)    : "--", unit: "mm", valueColor: "text-cyan-500",   min: "0", max: d.rainfall      != null ? d.rainfall.toFixed(2)    : "--", minUnit: "mm" },
  ];

  return (
    <div
      className="w-full h-full overflow-y-auto bg-white border-r border-slate-200 flex flex-col gap-3 p-3"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between px-1 pt-1">
        <div>
          <h1 className="text-base font-bold text-slate-900 leading-tight">Heritage Digital Twin</h1>
          <p className="text-[11px] text-slate-400 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            {d.device_id ?? "SIM_DEVICE_01"}
          </p>
          <p className="text-[10px] text-slate-300 mt-0.5" style={{ fontFamily: "'DM Mono', monospace" }}>
            {fmtTime(d.timestamp)}
          </p>
        </div>
        <Badge variant="outline"
          className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700 border-slate-300 px-2.5 py-1 rounded-full shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
          LIVE
        </Badge>
      </div>

      <Separator className="bg-slate-100" />

      {/* 2-col grid — rows stretch equally */}
      <div className="grid grid-cols-2 gap-2" style={{ gridAutoRows: "1fr" }}>
        {metrics.map((m) => (
          <MetricCard key={m.label} {...m} />
        ))}
      </div>

      {/* Alerts */}
      <Card className="border-slate-200 rounded-xl shadow-sm">
        <CardContent className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase"
              style={{ fontFamily: "'DM Mono', monospace" }}>Alerts</span>
            {alerts.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                {alerts.length}
              </span>
            )}
          </div>
          {alerts.length === 0 ? (
            <p className="text-xs text-slate-400">All systems nominal.</p>
          ) : (
            alerts.map((a, i) => (
              <div key={i} className={`text-xs font-medium px-3 py-2 rounded-lg border ${a.color}`}
                style={{ fontFamily: "'DM Mono', monospace" }}>
                ⚠ {a.msg}
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}