"use client"
import { BookCheck, Boxes, ContactRound, Crown, GraduationCap, IndianRupee, LayoutDashboard, Menu, Tv, X } from "lucide-react"

import UserMenu from "@/components/navbar-components/user-menu"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { SessionProvider } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

// Navigation links array
const navigationLinks = [
  { href: "/", label: "Certificates", icon: GraduationCap },
  { href: "/video-upload", label: "Video Upload", icon: Tv },
  {
    href: "/#", label: "Course Management", icon: BookCheck,
    children: [
      { href: "/category", label: "Category", icon: BookCheck, description: "Manage categories" },
      { href: "/course", label: "Course", icon: BookCheck, description: "Manage courses" },
      { href: "/module", label: "Module", icon: BookCheck, description: "Manage modules" },
      { href: "/lesson", label: "Lesson", icon: BookCheck, description: "Manage lessons" },
    ]
  },
  {
    href: "/#", label: "User Management", icon: Crown,
    children: [
      { href: "/trainer", label: "Trainer", icon: ContactRound, description: "Manage trainers" },
      { href: "/user", label: "Admin Management", icon: Crown, description: "Manage admins" },
    ]
  },
  {
    href: "/subscription-management", label: "Subscription Management", icon: IndianRupee,
    children: [
      { href: "/plan/category", label: "Category Plan", icon: LayoutDashboard, description: "Manage categories" },
      { href: "/plan/app", label: "App Plan", icon: Boxes, description: "Manage whole app plans" },
      { href: "/plan/user-subscription", label: "Subscription Management", icon: LayoutDashboard, description: "Manage user subscriptions" },
    ]
  },

]

export default function Component() {
  const pathname = usePathname()

  console.log("navbar pathname ==> ", pathname)
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed z-50 top-0 inset-x-0 border-b bg-gradient-to-r from-purple-50/50 via-pink-50/30 to-transparent backdrop-blur-sm px-4 md:px-6 shadow-lg shadow-purple-500/10">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left side */}
        <div className="flex flex-1 items-center gap-2 ">
          {/* Mobile Navigation */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button className="md:hidden" variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetHeader className="border-b bg-gradient-to-r from-purple-50/50 to-pink-50/30 p-6">
                <SheetTitle className="text-left text-gradient-brand">Navigation</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-2 p-4">
                {navigationLinks.map((link, index) => {
                  const Icon = link.icon
                  const isActive = pathname === link.href

                  if (link.children) {
                    return (
                      <div key={index} className="space-y-2">
                        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium ${isActive
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : "text-foreground"
                          }`}>
                          <Icon size={18} className={isActive ? "text-white" : "text-muted-foreground"} />
                          <span>{link.label}</span>
                        </div>
                        <div className="ml-4 space-y-1 border-l-2 border-purple-200 pl-4">
                          {link.children.map((child, i) => {
                            const ChildIcon = child.icon
                            const isChildActive = pathname === child.href
                            return (
                              <Link
                                key={i}
                                href={child.href}
                                onClick={() => setOpen(false)}
                                className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-colors ${isChildActive
                                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                                  : "hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100"
                                  }`}
                              >
                                <ChildIcon size={16} className={`mt-0.5 shrink-0 ${isChildActive ? "text-white" : "text-muted-foreground"}`} />
                                <div className="flex flex-col gap-1">
                                  <span className={`text-sm font-medium ${isChildActive ? "text-white" : ""}`}>
                                    {child.label}
                                  </span>
                                  <span className={`text-xs ${isChildActive ? "text-white/90" : "text-muted-foreground"}`}>
                                    {child.description}
                                  </span>
                                </div>
                              </Link>
                            )
                          })}
                        </div>
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={index}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${isActive
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100"
                        }`}
                    >
                      <Icon size={18} className={isActive ? "text-white" : "text-muted-foreground"} />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>

          <NavigationMenu viewport={false} className="max-md:hidden">
            <NavigationMenuList className="gap-2">
              {navigationLinks.map((link, index) => {
                const Icon = link.icon
                const isActive = (pathname === "/" && link.href === "/") || link?.children?.some(child => pathname === child.href) || (pathname === link.href && link.href !== "/")
                return (
                  link.children ?
                    <NavigationMenuItem key={index} >
                      <NavigationMenuTrigger className={`flex-row bg-transparent items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 relative ${isActive
                        ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                        : "text-foreground hover:bg-linear-to-r hover:from-purple-100 hover:to-pink-100 "
                        }`} >
                        <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                        <span className={`font-medium ${isActive ? "text-white" : ""}`}>{link.label}</span>
                      </NavigationMenuTrigger>
                      <NavigationMenuContent >
                        <ul className="grid gap-2 sm:w-[400px] md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                          {link.children.map((component, i) => {
                            const ChildIcon = component.icon
                            const isChildActive = (pathname === "/" && component.href === "/") || (pathname === component.href && link.href !== "/")
                            return (
                              <li key={`menu-${i}`}>
                                <NavigationMenuLink asChild>
                                  <Link
                                    href={component.href}
                                    className={`${isChildActive
                                      ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                                      : "text-foreground hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100 "
                                      }`} >
                                    <div className="flex items-center gap-2">
                                      <ChildIcon size={14} className={isChildActive ? "text-white" : "text-muted-foreground/80"} />
                                      <div className={`text-sm font-medium leading-none ${isChildActive ? "text-white" : ""}`}>
                                        {component.label}
                                      </div>
                                    </div>
                                    <p className={`line-clamp-2 text-sm leading-snug ${isChildActive ? "text-white" : "text-muted-foreground"}`}>
                                      {component.description}
                                    </p>
                                  </Link>
                                </NavigationMenuLink>
                              </li>
                            )
                          })}
                        </ul>
                      </NavigationMenuContent>
                    </NavigationMenuItem> :
                    < NavigationMenuItem key={index} >
                      <NavigationMenuLink
                        active={isActive}
                        href={link.href}
                        className={`flex-row items-center gap-2 py-2 px-4 font-medium rounded-lg transition-all duration-200 ${isActive
                          ? "bg-linear-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                          : "text-foreground hover:bg-linear-to-r hover:from-purple-100 hover:to-pink-100 "
                          }`}>
                        <Icon size={16} className={isActive ? "text-white" : "text-muted-foreground/80"} aria-hidden="true" />
                        <span className={isActive ? "text-white" : ""}>{link.label}</span>
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>


        {/* Right side: Actions */}
        <div className="flex tems-center justify-end gap-4">
          {/* User menu */}
          <SessionProvider>
            <UserMenu />
          </SessionProvider>
        </div>
      </div>
    </header >
  );
}
