import * as React from "react"
import {
    IconBook,
    IconBrain,
    IconChartBar,
    IconFlame,
    IconGitCompare,
    IconGraph,
    IconHome,
    IconMathFunction,
    IconMap,
    IconPalette,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { pagePath, type Page } from "@/lib/dashboardNavigation"
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"

const navItems = [
    {
        label: "Story",
        items: [
            { title: "Overview", id: "home" as Page, href: pagePath('home'), icon: IconHome },
            { title: "Guided Case Study", href: "/viz", icon: IconBook },
        ],
    },
    {
        label: "Explore & Stabilize",
        items: [
            { title: "Color Distribution", id: "color-map" as Page, href: pagePath('color-map'), icon: IconPalette },
            { title: "Empirical Bayes Shrinkage", id: "empirical-bayes" as Page, href: pagePath('empirical-bayes'), icon: IconChartBar },
            { title: "Conditional Pooling", id: "conditional-probability" as Page, href: pagePath('conditional-probability'), icon: IconMathFunction },
        ],
    },
    {
        label: "Detect Divergence",
        items: [
            { title: "Neighbor Pairs (JSD)", id: "neighbor-divergence" as Page, href: pagePath('neighbor-divergence'), icon: IconGraph },
            { title: "Statewide Baseline (JSD)", id: "group-divergence" as Page, href: pagePath('group-divergence'), icon: IconGitCompare },
        ],
    },
    {
        label: "Validate",
        items: [
            { title: "Classifier Test (C2ST)", id: "c2st" as Page, href: pagePath('c2st'), icon: IconBrain },
            { title: "Spatial Clustering (Moran's I)", id: "morans-i" as Page, href: pagePath('morans-i'), icon: IconMap },
        ],
    },
]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    currentPage: Page
    onPageChange: (page: Page) => void
}

export function AppSidebar({ currentPage, onPageChange, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:!p-1.5 [&_span]:text-[var(--button-accent)] [&_svg]:text-[var(--button-accent)]"
                        >
                            <a href="#">
                                <IconFlame className="!size-5" />
                                <span className="text-base font-semibold">Wildfire Property Intelligence: Finding Outliers Before Fire Finds Them First</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain
                    items={navItems}
                    currentPage={currentPage}
                    onPageChange={onPageChange}
                />
            </SidebarContent>
        </Sidebar>
    )
}
