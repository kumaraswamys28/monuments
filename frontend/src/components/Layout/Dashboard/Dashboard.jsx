import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import Tempcard from "./cards/Tempcard";
import Humiditycard from "./cards/Humid";
import Vibrationcard from "./cards/Vibration";
import Visitorcard from "./cards/Visitor";
import AQIcard from "./cards/AQI";
import Rainfallcard from "./cards/Rain";
import DeviceIDcard from "./cards/Device";
import LastUpdateCard from "./cards/LastUpdateCard.jsx"
import Renderer from "../../Rendering/Rendering-home/Renderer.jsx";
// import { Outlet } from "react-router-dom"


export default function Dashboard() {
  const { id } = useParams();
  const [data, setdata] = useState(null);
  const [res, setRes] = useState({}); // Initialize as object
  useEffect(() => {
      
    if (!id) return;

    const fetchModel = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/models/${id}`,
        );
        const model = await response.json();

        console.log(model);

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
{data && <Renderer data={data} />}    </div>
    <Tempcard res={res.temperature}/>

<Humiditycard res={res.humidity}/>
  <Vibrationcard res={res.vibration}/>
    <Visitorcard res={res.visitor_count} />

   <AQIcard res={res.aqi} />

   <Rainfallcard res={res.rainfall}/>

    <DeviceIDcard res={res.device_id}/>

    <LastUpdateCard timestamp={res.timestamp}/>

  </div>
</div>
      </SidebarInset>
    </SidebarProvider>
  )
}
