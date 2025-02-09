import Link from "next/link";
import { redirect } from "next/navigation";
import React from "react";

import { auth } from "@/auth";
import FileUploader from "@/components/containers/FileUploader";
import Sidebar from "@/components/containers/Sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
} from "@/components/ui/Breadcrumb";
import { Separator } from "@/components/ui/Separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/Sidebar";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  if (!session || !session.user) return redirect("/sign-in");

  return (
    <SidebarProvider>
      <Sidebar user={session.user} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center w-full gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <Link href="/dashboard">Главная</Link>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            <FileUploader />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
