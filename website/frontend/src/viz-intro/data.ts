import type { SummaryRow } from '../lib/conditionalPooling'

const SD_FIPS = [6025, 6059, 6065, 6073]

export interface ComparisonData {
    county_a: { name: string; total_count: number; clr: { distribution: { value: string; proportion: number; count: number }[] } }
    county_b: { name: string; total_count: number; clr: { distribution: { value: string; proportion: number; count: number }[] } }
    jsd: { original: number; pooled?: { weighted_jsd: number; mean_jsd: number } }
}

export interface CaseStudyData {
    sd_vs_neighbors?: Record<string, Omit<Partial<ComparisonData>, 'jsd'> & { jsd?: { pooled?: { weighted_jsd: number; mean_jsd: number } } }>
}

interface SelectedFipsPair {
    fips_a: string
    fips_b: string
}

export function processPooledJsdByFips(
    pooled: Record<string, { weighted_jsd: number; mean_jsd?: number }>
): Record<string, number> {
    const byFips: Record<string, number[]> = {}
    Object.entries(pooled).forEach(([key, v]) => {
        const [a, b] = key.split('-')
        if (!byFips[a]) byFips[a] = []
        if (!byFips[b]) byFips[b] = []
        byFips[a].push(v.weighted_jsd)
        byFips[b].push(v.weighted_jsd)
    })
    const out: Record<string, number> = {}
    Object.entries(byFips).forEach(([fips, vals]) => {
        out[fips] = Math.max(...vals)
    })
    return out
}

export function processKLByFipsSdOnly(rows: Pick<SummaryRow, 'fips' | 'kl_div'>[]): Record<string, number> {
    const byFips: Record<number, number[]> = {}
    rows.forEach((r) => {
        if (!SD_FIPS.includes(r.fips)) return
        if (!byFips[r.fips]) byFips[r.fips] = []
        byFips[r.fips].push(r.kl_div)
    })
    const out: Record<string, number> = {}
    Object.entries(byFips).forEach(([fips, vals]) => {
        out[String(parseInt(fips, 10)).padStart(5, '0')] =
            vals.reduce((a, b) => a + b, 0) / vals.length
    })
    return out
}

export function selectComparisonData({
    pairComparisons,
    caseStudyData,
    selectedPair,
}: {
    pairComparisons: Record<string, ComparisonData>
    caseStudyData: CaseStudyData | null
    selectedPair: SelectedFipsPair | null
}): ComparisonData | null {
    const sdNeighbors = caseStudyData?.sd_vs_neighbors
    const sdKeys = ['06073-06025', '06073-06059', '06073-06065', '06059-06073', '06025-06073', '06065-06073']
    const isSDPair = (k1: string, k2: string) => sdKeys.includes(k1) || sdKeys.includes(k2)
    if (!selectedPair) {
        const fromCase = sdNeighbors?.['06073-06059']
        if (fromCase?.jsd?.pooled) return fromCase as ComparisonData
        const base = pairComparisons['06059-06073'] ?? pairComparisons['06073-06059'] ?? null
        if (base && sdNeighbors) {
            const sdEntry = sdNeighbors['06073-06059'] ?? sdNeighbors['06059-06073']
            if (sdEntry?.jsd?.pooled)
                return { ...base, jsd: { ...base.jsd, pooled: sdEntry.jsd.pooled } }
        }
        return base
    }
    const key1 = `${selectedPair.fips_a}-${selectedPair.fips_b}`
    const key2 = `${selectedPair.fips_b}-${selectedPair.fips_a}`
    if (sdNeighbors && isSDPair(key1, key2)) {
        const fromCase = sdNeighbors[key1] ?? sdNeighbors[key2]
        if (fromCase?.jsd?.pooled) return fromCase as ComparisonData
    }
    const base = pairComparisons[key1] ?? pairComparisons[key2] ?? null
    if (base && sdNeighbors) {
        const sdEntry = sdNeighbors[key1] ?? sdNeighbors[key2]
        if (sdEntry?.jsd?.pooled)
            return { ...base, jsd: { ...base.jsd, pooled: sdEntry.jsd.pooled } }
    }
    return base
}
