const pages = [
    'home',
    'conditional-probability',
    'empirical-bayes',
    'neighbor-divergence',
    'c2st',
    'morans-i',
    'group-divergence',
    'color-map',
] as const

export type Page = typeof pages[number]

export function pageFromPathname(pathname: string): Page {
    const segment = pathname.replace(/^\/|\/$/g, '')
    return pages.find((page) => page === segment) ?? 'home'
}

export function pagePath(page: Page): string {
    return page === 'home' ? '/' : `/${page}`
}
