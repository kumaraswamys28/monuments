import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

export default function Analytics() {
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
          <div className="bg-muted/75 min-h-[100vh] border border-red-600 bg-green-400 flex-1 rounded-xl md:min-h-min flex flex-row h-full">
  
  {/* Left panel - 20% */}
  <div className="w-[20%] h-full bg-blue-200 border-r border-red-400 rounded-l-xl">
    Left Panel
  </div>

  {/* Center panel - 60% */}
  <div className="w-[60%] h-full bg-yellow-100 border-r border-red-400">
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
