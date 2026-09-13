export const COLOR_GROUPS_MAP: Record<string, string> = {
    azure: 'red', blue: 'red', crimson: 'red', foo: 'red', indigo: 'red', purple: 'red', red: 'red', scarlet: 'red',
    aqua: 'navy', aquamarine: 'navy', lavender: 'navy', lilac: 'navy', navy: 'navy',
    alabaster: 'alabaster', gray: 'alabaster', grey: 'alabaster', ivory: 'alabaster',
    amber: 'amber', gold: 'amber', lemon: 'amber', yellow: 'amber',
    beige: 'cocoa', brown: 'cocoa', cocoa: 'cocoa', coffee: 'cocoa',
    green: 'olive', olive: 'olive', sage: 'olive', verde: 'olive',
    orange: 'orange', sienna: 'orange', terracotta: 'orange',
}

export const COLOR_GROUP_NAMES = new Set(Object.values(COLOR_GROUPS_MAP))

export function formatColorLabel(value: string): string {
    return COLOR_GROUP_NAMES.has(value) ? value.replace('_', ' / ') : value
}

export interface DivergenceData {
    counties: GeoJSON.FeatureCollection
    edges: GeoJSON.FeatureCollection
    stats: {
        total_pairs: number
        total_counties: number
        mean_jsd: number
        max_jsd: number
        min_jsd: number
    }
}

export interface SelectedPair {
    fips_a: string
    fips_b: string
    county_a: string
    county_b: string
}

export interface FeatureDist {
    value: string
    count: number
    proportion: number
    unique: boolean
    is_group?: boolean
}

export interface FeatureData {
    distribution: FeatureDist[]
    vocab_size: number
}

export interface AppliedCondition {
    column: string
    value: string
}

export interface JsdData {
    original: number
    merged?: number
    reduction?: number
    reduction_pct?: number
}

export interface ComparisonResult {
    county_a: {
        fips: string
        name: string
        total_count: number
        clr: FeatureData
        clr_merged?: FeatureData
        bldgtype: FeatureData
        st_damcat: FeatureData
    }
    county_b: {
        fips: string
        name: string
        total_count: number
        clr: FeatureData
        clr_merged?: FeatureData
        bldgtype: FeatureData
        st_damcat: FeatureData
    }
    conditioning: {
        conditions: AppliedCondition[]
        total_conditions: number
    }
    jsd?: JsdData
    error?: string
}

export interface ComparisonSummary {
    displayClrA: FeatureData | null
    displayClrB: FeatureData | null
    maxProportion: number
    uniqueToA: string[]
    uniqueToB: string[]
    sharedColors: string[]
    vocabOverlap: number
}

export function poolDistributions(distA: FeatureDist[], distB: FeatureDist[]): [FeatureDist[], FeatureDist[]] {
    const merge = (dist: FeatureDist[]) => {
        const acc: Record<string, { count: number; proportion: number }> = {}
        for (const d of dist) {
            const key = COLOR_GROUPS_MAP[d.value] ?? d.value
            if (!acc[key]) acc[key] = { count: 0, proportion: 0 }
            acc[key].count += d.count
            acc[key].proportion += d.proportion
        }
        return acc
    }
    const mA = merge(distA)
    const mB = merge(distB)
    const toList = (m: typeof mA, other: typeof mA): FeatureDist[] =>
        Object.entries(m)
            .filter(([, v]) => v.count > 0)
            .map(([key, v]) => ({
                value: key,
                count: v.count,
                proportion: v.proportion,
                unique: (other[key]?.count ?? 0) === 0,
            }))
            .sort((a, b) => b.count - a.count)
    return [toList(mA, mB), toList(mB, mA)]
}

export function deriveComparisonSummary(
    comparisonResult: ComparisonResult | null,
    usePooled: boolean
): ComparisonSummary {
    if (!comparisonResult || comparisonResult.error) {
        return {
            displayClrA: null,
            displayClrB: null,
            maxProportion: 0,
            uniqueToA: [],
            uniqueToB: [],
            sharedColors: [],
            vocabOverlap: 0,
        }
    }

    let displayClrA = comparisonResult.county_a.clr
    let displayClrB = comparisonResult.county_b.clr
    if (usePooled) {
        const [pooledA, pooledB] = poolDistributions(
            comparisonResult.county_a.clr.distribution,
            comparisonResult.county_b.clr.distribution
        )
        displayClrA = { distribution: pooledA, vocab_size: pooledA.length }
        displayClrB = { distribution: pooledB, vocab_size: pooledB.length }
    }

    const maxProportion = Math.max(
        ...displayClrA.distribution.map((d) => d.proportion),
        ...displayClrB.distribution.map((d) => d.proportion)
    )
    const uniqueToA = displayClrA.distribution.filter((d) => d.unique).map((d) => d.value)
    const uniqueToB = displayClrB.distribution.filter((d) => d.unique).map((d) => d.value)
    const sharedColors = displayClrA.distribution.filter((d) => !d.unique && d.count > 0).map((d) => d.value)
    const unionSize = displayClrA.vocab_size + displayClrB.vocab_size - sharedColors.length
    const vocabOverlap = unionSize > 0 ? sharedColors.length / unionSize : 0

    return { displayClrA, displayClrB, maxProportion, uniqueToA, uniqueToB, sharedColors, vocabOverlap }
}
