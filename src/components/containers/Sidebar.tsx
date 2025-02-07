import { ChevronsUpDown, FolderClosed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { User } from "next-auth";
import React from "react";

import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/Sidebar";

interface ISidebarProps {
  user: User;
}

export default async function Sidebar({ user }: ISidebarProps) {
  return (
    <SidebarComponent collapsible="icon" variant="floating">
      <SidebarHeader>
        <Link href="/dashboard">
          <div className="flex items-center space-x-2">
            <Image src="/logo.svg" width={40} height={40} alt="" />
            <span className="truncate font-semibold text-xl">АВС Просмотр</span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/dashboard/files">
                <SidebarMenuButton tooltip="Файлы">
                  <FolderClosed />
                  Файлы
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">АЧ</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </SidebarComponent>
  );
}
