import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect,useState } from "react";
import { useParams } from "react-router-dom";
import LeftPanel from "./LeftPanel";


export default function Analytics() {
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
        <div className="flex  flex-1 flex-col gap-4 p-2 pt-0">
          {/* <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>  */}
          {/* <div className="bg-muted/75 min-h-[100vh] border border-red-600 bg-green-400 flex-1 rounded-xl md:min-h-min" >this is a Analytics page test</div> */}
          <div className="bg-muted/75 min-h-[100vh]  bg-green-400 flex-1 rounded-xl md:min-h-min flex flex-row h-full">
  
  {/* Left panel - 20% */}
  <div className="w-[20%] h-full bg-blue-200  rounded-l-xl">
    {data && <LeftPanel res={res} data={data}/>}
  </div>

  {/* Center panel - 60% */}
  <div className="w-[60%] h-full bg-yellow-100 ">
    Center Panel
  </div>

  {/* Right panel - 20% */}
  <div className="w-[20%] h-full bg-purple-200 rounded-r-xl">
    Right Panel
  </div>

</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
