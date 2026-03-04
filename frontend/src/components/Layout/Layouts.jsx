import { AppSidebar } from "@/components/app-sidebar";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useEffect, useRef, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import Renderer from "../Rendering/Renderer";
import Cards from "./cards";
import ClimateChart from "./Climate";
import AqiChart from "./AQI";

export default function Layouts() {
  const { id } = useParams();
  const [data, setdata] = useState([]);
  const cardsRef = useRef();
  const chartRef = useRef();
  const aqiRef = useRef();

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

        if (Array.isArray(result) && result.length > 0) {
          

          cardsRef.current?.update(result[0]);
          chartRef.current?.update(result[0]);
          aqiRef.current?.update(result[0]);
        }
      } catch (err) {
        console.error("Error fetching IoT data:", err);
      }
    };

    fetchIoTData();
    const interval = setInterval(fetchIoTData, 5000);

    return () => clearInterval(interval);
  }, [data]);

  return (
    <SidebarProvider>
      <AppSidebar />
     
      <SidebarInset className="flex flex-col border border-black h-[98vh] min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-1 px-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
          </div>
        </header>

        <div className="flex flex-col md:flex-row flex-1 p-2 md:p-4 gap-4 min-h-0 overflow-auto md:overflow-hidden">
  
  {/* Main Content: Full width on mobile, flexible on desktop */}
  <div className="flex-1 bg-muted/50 rounded-xl overflow-hidden min-h-[300px] md:min-h-0">
    <Renderer data={data} />
  </div>

  {/* Sidebar: Full width on mobile, 30% width on desktop */}
  <div className="w-full md:w-[30%] md:min-w-[280px] flex flex-col gap-4">
    <Cards ref={cardsRef} />
    <ClimateChart ref={chartRef} />
    <AqiChart  ref={aqiRef} />
  </div>

</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
