"use client";

import { useEffect, useState } from "react";
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Sun,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavProjects } from "@/components/nav-projects";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

export function AppSidebar({ ...props }) {
  const [data, setdata] = useState({
    navMain: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/api/models`,
        );
        const models = await response.json();

        const modelSections = models.map((model, index) => ({
          title: model.title,
          url: `/model/${model.id}`,
          icon: index % 2 === 0 ? Sun : BookOpen,
          isActive: index === 0,
          items: model.items.map((item) => {
            const pathSegment =
              item.url !== "#"
                ? item.url.startsWith("/")
                  ? item.url
                  : `/${item.url}`
                : `/${item.title.toLowerCase().replace(/\s+/g, "-")}`;

            return {
              ...item,
              url: `/model/${model.id}${pathSegment}`,
            };
          }),
        }));

        setdata({
          navMain: modelSections,
        });
      } catch (error) {
        console.error("Failed to fetch sidebar data:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-lg leading-tight">
                  <span className="truncate font-medium">Acme Inc</span>
                  <span className="truncate text-xs">Enterprise</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.navSecondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
