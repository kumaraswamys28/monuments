import { AppSidebar } from "@/components/app-sidebar"

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import MediaViewer from "./slides.jsx"

export default function Home() {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar />
      <SidebarInset className="flex flex-col border border-black h-[98vh] min-h-0 overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />        
          </div>
        </header>
        <div className="flex  flex-1 flex-col gap-4 p-4 pt-0">
          <div className="bg-muted/75 min-h-[100vh] bg-green-400 flex-1 rounded-xl md:min-h-min" >
          <MediaViewer />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
