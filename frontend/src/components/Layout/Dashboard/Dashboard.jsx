import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import Tempcard from "./cards/Tempcard";
// import { Outlet } from "react-router-dom"


export default function Dashboard() {
  const { id } = useParams();
  const [data, setdata] = useState(null);
  const [res, setRes] = useState({}); // Initialize as object
         useEffect(() => {
    if (!id) return;
    const fetchModel = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/models/${id}`);
        const model = await response.json();
        setdata(model);
      } catch (err) {
        console.error("Failed to fetch model:", err);
      }
    };
    fetchModel();
  }, [id]);

  useEffect(() => {
    if (!data?.iot_data || !data?.api_key) return;

    const fetchIoTData = async () => {
      try {
        const response = await fetch(data.iot_data, {
          headers: {
            apikey: data.api_key,
            Authorization: `Bearer ${data.api_key}`,
          },
        });

        const result = await response.json();
        
        // Handle both Array and Single Object responses
        const latestData = Array.isArray(result) ? result[0] : result;
        setRes(latestData || {}); 
        
      } catch (err) {
        console.error("Error fetching IoT data:", err);
      }
    };

    fetchIoTData();
    const interval = setInterval(fetchIoTData, 1000);
    return () => clearInterval(interval);
  }, [data]);
  
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="flex flex-col border border-black h-[98vh] min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />        
          </div>
        </header>
        <div className="flex  flex-1 flex-col p-4 pt-0 h-screen overflow-hidden">
  {/* Parent Container: Forces a 3x3 grid that fills 100% of the remaining height */}
  <div className="grid grid-cols-3 grid-rows-3 gap-4 h-full min-h-0">
    
    {/* Card 1: Hampi Chariot / Monument Image */}
    <div className="bg-muted/50 rounded-xl border border-primary/10 flex flex-col items-center justify-center border border-blue-500 p-2">
       <span className="text-xs opacity-50 uppercase tracking-widest">Live View</span>
       {/* Your Image or Canvas goes here */}
    </div>

    {/* Card 2: Temperature */}
    <Tempcard res={res.temperature}/>

    {/* Card 3: Humidity */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Humidity</p>
      <h2 className="text-2xl font-bold">{res.humidity}</h2>
    </div>

    {/* Card 4: Vibration (Structural Health) */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Structural Vibration</p>
      <h2 className="text-2xl font-bold">{res.vibration} <span className="text-xs">Hz</span></h2>
    </div>

    {/* Card 5: Visitor Count */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Current Visitors</p>
      <h2 className="text-2xl font-bold">{res.visitor_count}</h2>
    </div>

    {/* Card 6: Air Quality Index */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">AQI Status</p>
      <h2 className="text-2xl font-bold text-yellow-500">{res.aqi}</h2>
    </div>

    {/* Card 7: Rainfall */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Rainfall</p>
      <h2 className="text-2xl font-bold">{res.humidity} <span className="text-xs text-muted-foreground">mm</span></h2>
    </div>

    {/* Card 8: Device Information */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Device ID</p>
      <code className="text-xs font-mono text-primary">SIM_DEVICE_01</code>
    </div>

    {/* Card 9: Last Heartbeat */}
    <div className="bg-muted/50 rounded-xl p-4 flex flex-col justify-center border border-blue-500">
      <p className="text-sm text-muted-foreground">Last Update</p>
      <p className="text-xs font-mono">{res.timestamp}</p>
    </div>

  </div>
</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
