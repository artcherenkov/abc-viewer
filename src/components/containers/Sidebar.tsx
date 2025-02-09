import { FolderClosed } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { User } from "next-auth";
import React from "react";

import { SidebarUser } from "@/components/containers/SidebarUser";
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
import { signout } from "@/lib/actions/authentication/signout";

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
        <SidebarUser signOutAction={signout} user={user} />
      </SidebarFooter>
    </SidebarComponent>
  );
}
