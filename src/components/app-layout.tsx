
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Users,
  FileText,
  LayoutDashboard,
  PlusCircle,
  BarChart3,
  Scale,
  CircleDollarSign,
  Wrench,
  Ticket,
  ClipboardList,
  Settings,
  LogOut,
  Shield,
  User
} from "lucide-react"

import { cn } from "@/lib/utils"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { Button } from "./ui/button"
import { signOut } from "firebase/auth"
import { auth } from "../firebase/config"
import { useAuth } from "@/hooks/useAuth"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/escalations", label: "Escalations", icon: ClipboardList },
  { href: "/escalations/new", label: "New Escalation", icon: PlusCircle },
  { href: "/employees", label: "Employees", icon: Users, adminOnly: true },
  { href: "/settings", label: "Settings", icon: Settings, adminOnly: true },
]

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, loading, employeeName } = useAuth();

  const handleSignOut = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/');
    }
  }

  // Filter navigation items based on admin status
  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && !isAdmin) {
      return false;
    }
    return true;
  });
  
  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center flex-col gap-2 p-2">
            <h1 className="text-xl font-bold text-primary-foreground">MANIT</h1>
            <h2 className="text-sm font-semibold text-primary-foreground group-data-[collapsible=icon]:hidden">
              Hostel Escalation System
            </h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {filteredNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={item.label}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                {user && (
                  <SidebarMenuItem>
                    <div className="flex items-center gap-2 px-2 py-1.5 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      <span className="group-data-[collapsible=icon]:hidden">
                        {employeeName || user.displayName || user.email?.split('@')[0] || 'User'}
                      </span>
                    </div>
                  </SidebarMenuItem>
                )}
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleSignOut} tooltip="Sign Out">
                        <LogOut />
                        <span>Sign Out</span>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <div className="flex items-center justify-between gap-2 p-4 border-b sticky top-0 z-20 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <SidebarTrigger className="md:hidden h-10 w-10" />
            <h2 className="text-lg md:text-xl font-semibold">
                {filteredNavItems.find(item => pathname.startsWith(item.href))?.label || 'MANIT Hostel Escalation System'}
            </h2>
            <div className="flex items-center gap-2">
              {user && (
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md">
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {employeeName || user.displayName || user.email?.split('@')[0] || 'User'}
                  </span>
                </div>
              )}
              <button onClick={handleSignOut} className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted">
                <LogOut />
                <span className="sr-only">Sign Out</span>
              </button>
            </div>
        </div>
        <main className="flex-1 p-4 overflow-auto pb-24 md:pb-4 min-w-0">
            {children}
        </main>
        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 [padding-bottom:env(safe-area-inset-bottom)]">
          <ul className="grid grid-cols-4 gap-0">
            {filteredNavItems
              .filter((item) => ["/dashboard","/escalations","/escalations/new","/settings"].includes(item.href) || (!isAdmin && item.href !== "/employees"))
              .slice(0,4)
              .map((item) => {
                const Icon = item.icon
                const active = pathname.startsWith(item.href)
                return (
                  <li key={item.href}>
                    <Link href={item.href} className={cn("flex flex-col items-center justify-center py-2.5 gap-1 text-xs", active ? "text-primary" : "text-muted-foreground hover:text-foreground")}> 
                      <Icon className="h-5 w-5" />
                      <span className="text-[11px] leading-none">{item.label}</span>
                    </Link>
                  </li>
                )
              })}
          </ul>
        </nav>
      </SidebarInset>
    </SidebarProvider>
  )
}
