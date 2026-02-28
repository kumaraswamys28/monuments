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

const ClimateChart = forwardRef((props, ref) => {
  // We keep a local history of data for the chart
  const [history, setHistory] = useState([]);
  const historyLimit = 10; // Number of data points to show

  const chartConfig = {
    temperature: {
      label: "Temperature",
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
          temperature: newData.temperature,
          humidity: newData.humidity,
        };

        const updatedHistory = [...prev, newPoint];
        // Keep only the last N points to prevent memory leaks
        return updatedHistory.slice(-historyLimit);
      });
    },
  }));

  return (
    //  <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden" >

    //     <Card className="bg-muted/50 border-none shadow-none">
    //       <CardHeader className="p-4 pb-2">
    //         <CardTitle className="text-sm font-bold">Climate Analysis</CardTitle>
    //         <CardDescription className="text-xs">
    //           Real-time Temperature vs Humidity
    //         </CardDescription>
    //       </CardHeader>
    //       <CardContent className="p-2">
    //         <ChartContainer config={chartConfig} className="h-[200px] w-full">
    //           <AreaChart
    //             data={history}
    //             margin={{ left: -20, right: 12, top: 10 }}
    //           >
    //             <CartesianGrid vertical={false} strokeDasharray="3 3" opacity={0.3} />
    //             <XAxis
    //               dataKey="time"
    //               tickLine={false}
    //               axisLine={false}
    //               tickMargin={8}
    //               fontSize={10}
    //               hide={history.length < 2}
    //             />
    //             <YAxis
    //               tickLine={false}
    //               axisLine={false}
    //               tickMargin={8}
    //               fontSize={10}
    //               domain={[0, 100]}
    //             />
    //             <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
    //             <Area
    //               dataKey="humidity"
    //               type="monotone"
    //               fill="var(--chart-2)"
    //               fillOpacity={0.2}
    //               stroke="var(--chart-2)"
    //               stackId="a"
    //               isAnimationActive={false} // Disable animation for better performance
    //             />
    //             <Area
    //               dataKey="temperature"
    //               type="monotone"
    //               fill="var(--chart-1)"
    //               fillOpacity={0.4}
    //               stroke="var(--chart-1)"
    //               stackId="a"
    //               isAnimationActive={false}
    //             />
    //           </AreaChart>
    //         </ChartContainer>
    //       </CardContent>
    //       <CardFooter className="p-4 pt-0">
    //         <div className="flex items-center gap-2 text-xs font-medium leading-none">
    //           Live Sensor Sync <TrendingUp className="h-3 w-3 text-green-500" />
    //         </div>
    //       </CardFooter>
    //     </Card>
    //     </div>

    <div className="bg-muted/50 flex-1 border border-blue-500 rounded-xl overflow-hidden flex flex-col min-h-0">
      <Card className="bg-transparent border-none shadow-none flex flex-col h-full min-h-0">
        <CardHeader className=" mt-[-15px] mb-0">
  <div className="flex items-center justify-between">
    {/* Left side */}
    <div>
      <CardTitle className="text-lg font-bold leading-none">
        Climate Analysis
      </CardTitle>
      <CardDescription className="text-sm font-medium">
        Real-time Temperature vs Humidity
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
              // Removed top margin to kill the white space
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
                fontSize={12} // Increased font size
                tickMargin={10}
                hide={history.length < 2}
              />
              <YAxis
                tickLine={true}
                axisLine={true}
                fontSize={12}
                tickMargin={10}
                // Define exactly which numbers to show
                ticks={[0, 25, 50, 75]}
                // Force the chart to start and end exactly at these points
                domain={[0, 125]}
                interval={0}
              />
              <ChartTooltip cursor={true} content={<ChartTooltipContent />} />
              <Area
                dataKey="humidity"
                type="monotone"
                fill="var(--chart-2)"
                fillOpacity={0.3}
                stroke="var(--chart-2)"
                strokeWidth={2}
                isAnimationActive={false}
              />
              <Area
                dataKey="temperature"
                type="monotone"
                fill="var(--chart-1)"
                fillOpacity={0.5}
                stroke="var(--chart-1)"
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

ClimateChart.displayName = "ClimateChart";
export default ClimateChart;
