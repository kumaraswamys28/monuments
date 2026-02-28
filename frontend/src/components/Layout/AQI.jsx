import React, { useImperativeHandle, forwardRef, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const AqiChart = forwardRef((props, ref) => {
  // We keep a local history of data for the chart
  const [history, setHistory] = useState([]);
  const historyLimit = 10; // Number of data points to show

  const chartConfig = {
    AQI: {
      label: "aqi",
      color: "hsl(var(--chart-1))",
    },
    humidity: {
      label: "Humidity",
      color: "hsl(var(--chart-2))",
    },
  };

  useImperativeHandle(ref, () => ({
    update: (newData) => {
      if (!newData) return;

      setHistory((prev) => {
        const timestamp = new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const newPoint = {
          time: timestamp,
          aqi: newData.aqi,
          humidity: newData.humidity,
        };

        const updatedHistory = [...prev, newPoint];
        // Keep only the last N points to prevent memory leaks
        return updatedHistory.slice(-historyLimit);
      });
    },
  }));

  return (
    

    <div className="bg-muted/50 flex-1 border border-blue-500 rounded-xl overflow-hidden flex flex-col min-h-0">
      <Card className="bg-transparent border-none shadow-none flex flex-col h-full min-h-0">
        <CardHeader className=" mt-[-15px] mb-0">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div>
              
              <CardTitle className="text-lg font-bold leading-none">
                Environmental Quality Analysis
              </CardTitle>
              <CardDescription className="text-sm font-medium">
                Real-time aqi vs Humidity
              </CardDescription>
            </div>
            {/* Right side */}
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              
              Live Sync
              <TrendingUp className="h-4 w-4 text-green-500" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="mt-[-25px] mb-[-10px] flex-1 min-h-0">
          
          <ChartContainer config={chartConfig} className="h-full p-0.5 w-full">
            <AreaChart
              data={history}
              margin={{ left: -15, right: 15, top: 0, bottom: 0 }}
            >
              <CartesianGrid
                vertical={false}
                strokeDasharray="3 3"
                opacity={0.2}
              />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickMargin={10}
                hide={history.length < 2}
              />
              <YAxis
                tickLine={true}
                axisLine={true}
                fontSize={12}
                tickMargin={10}
                ticks={[0, 25, 50, 75]}
                domain={[0, 125]}
                interval={0}
              />
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              <Area
                dataKey="humidity"
                type="monotone"
               fill="hsl(213, 94%, 68%)"
            fillOpacity={0.18}
            stroke="hsl(213, 94%, 68%)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                dataKey="aqi"
                type="monotone"
                 fill="hsl(217, 91%, 60%)"
            fillOpacity={0.35}
            stroke="hsl(217, 91%, 60%)"
            strokeWidth={2}
                isAnimationActive={false}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>

    
  );
});

AqiChart.displayName = "AqiChart";
export default AqiChart;
