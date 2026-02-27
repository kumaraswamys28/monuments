import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { useEffect, useRef, useState } from "react"
import { Outlet, useParams } from "react-router-dom"
import Renderer from "../Rendering/Renderer"
import Cards from "../ui/cards"

export default function Layouts() {
 const {id}=useParams();
  const [data,setdata]=useState([]);
  const [res,setRes]=useState([]);
  const cardsRef = useRef();
  
  useEffect(() => {
    if (!id) return

    const fetchModel = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/models/${id}`
        )
        const model = await response.json()

        console.log(model);
        
        setdata(model)
      } catch (err) {
        console.error("Failed to fetch model:", err)
      }
    }

    fetchModel()
  }, [id])

  useEffect(() => {
    if (!data?.iot_data || !data?.api_key) return

    const fetchIoTData = async () => {
      try {
        const response = await fetch(data.iot_data, {
          headers: {
            apikey: data.api_key,
            Authorization: `Bearer ${data.api_key}`,
          },
        })

        const result = await response.json()

        if (Array.isArray(result) && result.length > 0) {
          // const latest = result[0]

          // setRes({
          //   vibration: latest.vibration,
          //   temperature: latest.temperature,
          //   aqi: latest.aqi,
          //   visitor_count: latest.visitor_count,
          //   rainfall: latest.rainfall,
          //   humidity: latest.humidity,
          // })
          console.log(result[0],"log 000000000000000000000000");
          
cardsRef.current?.update(result[0]);

        }
      } catch (err) {
        console.error("Error fetching IoT data:", err)
      }
    }

    fetchIoTData()
    const interval = setInterval(fetchIoTData, 5000)

    return () => clearInterval(interval)
  }, [data])

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
         
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" ><Renderer data={data} res={res}/></div>
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
        </div> */}
        <SidebarInset className="flex flex-col h-[98vh] min-h-0 overflow-hidden">
  <header className="flex h-16 shrink-0 items-center gap-2">
    <div className="flex items-center gap-1 px-2">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
    </div>
  </header>

  <div className="flex flex-1 p-2 gap-4 min-h-0 overflow-hidden">
    <div className="flex-1 bg-muted/50 rounded-xl overflow-hidden">
      <Renderer data={data} res={res} />
    </div>

    <div className="w-[30%] min-w-[280px] flex flex-col gap-4 min-h-0">
      <Cards 
      ref={cardsRef}
      // data={res}
      />
      <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden" />
      <div className="bg-muted/50 flex-1 rounded-xl overflow-hidden" />
    </div>
  </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
