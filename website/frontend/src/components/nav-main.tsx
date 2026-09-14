import type { Icon } from "@tabler/icons-react"
import type { Page } from "@/lib/dashboardNavigation"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type NavItem = { title: string; href: string; id?: Page; icon?: Icon }
type NavGroup = { label: string; items: NavItem[] }

interface NavMainProps {
  items: NavGroup[]
  currentPage: Page
  onPageChange: (page: Page) => void
}

export function NavMain({ items, currentPage, onPageChange }: NavMainProps) {
  const { setOpenMobile } = useSidebar()

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.label}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => {
                const page = item.id
                if (!page) {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton asChild tooltip={item.title} className="[&_span]:text-[var(--button-accent)] [&_svg]:text-[var(--button-accent)] [&_a:hover_span]:text-[var(--button-accent)] [&_a:hover_svg]:text-[var(--button-accent)]">
                        <a href={item.href}>
                          {item.icon && <item.icon />}
                          <span>{item.title}</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                }
                return (
                  <SidebarMenuItem key={page}>
                    <SidebarMenuButton asChild tooltip={item.title} isActive={currentPage === page} className="[&_span]:text-[var(--button-accent)] [&_svg]:text-[var(--button-accent)] data-[active=true]:[&_span]:text-[var(--button-accent)] data-[active=true]:[&_svg]:text-[var(--button-accent)] hover:[&_span]:text-[var(--button-accent)] hover:[&_svg]:text-[var(--button-accent)]">
                      <a href={item.href} onClick={(event) => {
                        event.preventDefault()
                        onPageChange(page)
                        setOpenMobile(false)
                      }}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}
