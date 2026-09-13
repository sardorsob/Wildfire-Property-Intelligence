import type { RefObject } from 'react'
import { cn } from '../lib/utils'
import {
    type ComparisonResult,
    type ComparisonSummary,
    type FeatureDist,
    type SelectedPair,
} from './model'

interface ComparisonPanelProps {
    comparisonRef: RefObject<HTMLDivElement | null>
    selectedPair: SelectedPair
    comparisonResult: ComparisonResult | null
    summary: ComparisonSummary
    usePooled: boolean
    expanded: boolean
    propertyColors: Record<string, string>
    colorGroupNames: Set<string>
    onToggle: () => void
    onClose: () => void
}

export function ComparisonPanel({
    comparisonRef,
    selectedPair,
    comparisonResult,
    summary,
    usePooled,
    expanded,
    propertyColors,
    colorGroupNames,
    onToggle,
    onClose,
}: ComparisonPanelProps) {
    const { displayClrA, displayClrB, maxProportion, uniqueToA, uniqueToB, sharedColors, vocabOverlap } = summary

    return (
        <div
            ref={comparisonRef}
            className={cn(
                'absolute bottom-0 left-0 right-0 bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.15)] z-40 transition-all duration-300',
                expanded ? 'h-[85%] sm:h-[65%]' : 'h-auto'
            )}
        >
            {/* Panel Header - Always visible */}
            <div
                className="px-3 sm:px-5 py-3 sm:py-4 border-b border-border flex items-center justify-between cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={onToggle}
            >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-6 min-w-0">
                    <h3 className="font-semibold text-sm sm:text-base truncate">
                        {selectedPair.county_a} vs {selectedPair.county_b}
                    </h3>
                    {comparisonResult?.jsd && (
                        <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-sm flex-wrap">
                            <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-muted rounded font-medium">JSD: {comparisonResult.jsd.original.toFixed(4)}</span>
                            {comparisonResult.jsd.merged !== undefined && (
                                <>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-blue-50 rounded font-medium">{comparisonResult.jsd.merged.toFixed(4)}</span>
                                    <span className={cn(
                                        'px-2 sm:px-3 py-0.5 sm:py-1 rounded font-semibold',
                                        comparisonResult.jsd.reduction! > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    )}>
                                        {comparisonResult.jsd.reduction! > 0 ? '-' : '+'}
                                        {Math.abs(comparisonResult.jsd.reduction_pct!).toFixed(1)}%
                                    </span>
                                </>
                            )}
                            <span className="hidden sm:inline text-muted-foreground">|</span>
                            <span className="hidden sm:inline text-muted-foreground">
                                Overlap: {(vocabOverlap * 100).toFixed(0)}% ({sharedColors.length} colors)
                            </span>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    <button
                        className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                        onClick={(e) => { e.stopPropagation(); onToggle() }}
                    >
                        {expanded ? 'Collapse' : 'Expand'}
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted rounded text-xl leading-none"
                        onClick={(e) => { e.stopPropagation(); onClose() }}
                    >
                        ×
                    </button>
                </div>
            </div>

            {/* Panel Content - Expandable */}
            {expanded && (
                <div className="h-[calc(100%-55px)] sm:h-[calc(100%-65px)] overflow-y-auto p-3 sm:p-6">
                    {comparisonResult && !comparisonResult.error && (
                        <div className="space-y-4 sm:space-y-6">
                            {(comparisonResult.county_a.total_count < 100 || comparisonResult.county_b.total_count < 100) && (
                                <div className="px-3 sm:px-4 py-2 sm:py-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-xs sm:text-sm">
                                    Warning: Small sample size. {comparisonResult.county_a.name} has {comparisonResult.county_a.total_count} records, {comparisonResult.county_b.name} has {comparisonResult.county_b.total_count} records.
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="border border-border rounded-lg p-3 sm:p-4">
                                    <h3 className="font-semibold text-sm sm:text-base mb-1">{comparisonResult.county_a.name}</h3>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        {comparisonResult.county_a.total_count.toLocaleString()} records | {displayClrA?.vocab_size} {usePooled ? 'groups' : 'colors'}
                                    </div>
                                    <div className="space-y-1.5">
                                        {displayClrA?.distribution.slice(0, 15).map((d: FeatureDist) => (
                                            <div key={d.value} className={cn('flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm', d.unique && 'bg-blue-50 -mx-2 px-2 py-1 rounded')}>
                                                <span className="w-20 sm:w-28 flex items-center gap-1 sm:gap-2 truncate">
                                                    {d.value === 'foo' || d.value === 'bar' ? (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">?</span>
                                                    ) : colorGroupNames.has(d.value) ? (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm shrink-0" style={{ backgroundColor: propertyColors[d.value] ?? '#ccc' }} />
                                                    ) : (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: propertyColors[d.value] || '#ccc' }} />
                                                    )}
                                                    {colorGroupNames.has(d.value)
                                                        ? <span className="px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">{d.value}</span>
                                                        : <span className="text-xs sm:text-sm truncate">{d.value}</span>
                                                    }
                                                </span>
                                                <div className="flex-1 h-2.5 sm:h-3 bg-muted rounded overflow-hidden">
                                                    <div
                                                        className="h-full rounded"
                                                        style={{
                                                            width: `${(d.proportion / maxProportion) * 100}%`,
                                                            backgroundColor: d.unique ? '#0077BB' : '#6b7280'
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-12 sm:w-14 text-right text-muted-foreground">{(d.proportion * 100).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg p-3 sm:p-4">
                                    <h3 className="font-semibold text-sm sm:text-base mb-1">{comparisonResult.county_b.name}</h3>
                                    <div className="text-xs text-muted-foreground mb-3">
                                        {comparisonResult.county_b.total_count.toLocaleString()} records | {displayClrB?.vocab_size} {usePooled ? 'groups' : 'colors'}
                                    </div>
                                    <div className="space-y-1.5">
                                        {displayClrB?.distribution.slice(0, 15).map((d: FeatureDist) => (
                                            <div key={d.value} className={cn('flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm', d.unique && 'bg-orange-50 -mx-2 px-2 py-1 rounded')}>
                                                <span className="w-20 sm:w-28 flex items-center gap-1 sm:gap-2 truncate">
                                                    {d.value === 'foo' || d.value === 'bar' ? (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold text-muted-foreground shrink-0">?</span>
                                                    ) : colorGroupNames.has(d.value) ? (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-sm shrink-0" style={{ backgroundColor: propertyColors[d.value] ?? '#ccc' }} />
                                                    ) : (
                                                        <span className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border border-border shrink-0" style={{ backgroundColor: propertyColors[d.value] || '#ccc' }} />
                                                    )}
                                                    {colorGroupNames.has(d.value)
                                                        ? <span className="px-1 py-0.5 rounded text-[10px] sm:text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">{d.value}</span>
                                                        : <span className="text-xs sm:text-sm truncate">{d.value}</span>
                                                    }
                                                </span>
                                                <div className="flex-1 h-2.5 sm:h-3 bg-muted rounded overflow-hidden">
                                                    <div
                                                        className="h-full rounded"
                                                        style={{
                                                            width: `${(d.proportion / maxProportion) * 100}%`,
                                                            backgroundColor: d.unique ? '#EE7733' : '#6b7280'
                                                        }}
                                                    />
                                                </div>
                                                <span className="w-12 sm:w-14 text-right text-muted-foreground">{(d.proportion * 100).toFixed(1)}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="border border-border rounded-lg p-3 sm:p-4">
                                    <h4 className="text-xs sm:text-sm font-semibold mb-2">Unique to {comparisonResult.county_a.name} ({uniqueToA.length})</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uniqueToA.length > 0
                                            ? uniqueToA.map((c: string) => (
                                                <span key={c} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">{c}</span>
                                            ))
                                            : <span className="text-sm text-muted-foreground">None</span>
                                        }
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg p-3 sm:p-4">
                                    <h4 className="text-xs sm:text-sm font-semibold mb-2">Unique to {comparisonResult.county_b.name} ({uniqueToB.length})</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {uniqueToB.length > 0
                                            ? uniqueToB.map((c: string) => (
                                                <span key={c} className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded">{c}</span>
                                            ))
                                            : <span className="text-sm text-muted-foreground">None</span>
                                        }
                                    </div>
                                </div>

                                <div className="border border-border rounded-lg p-3 sm:p-4">
                                    <h4 className="text-xs sm:text-sm font-semibold mb-2">Shared {usePooled ? 'Groups' : 'Colors'} ({sharedColors.length})</h4>
                                    <div className="flex flex-wrap gap-1.5">
                                        {sharedColors.map((c: string) => (
                                            <span key={c} className="px-2 py-1 text-xs bg-muted text-foreground rounded">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {comparisonResult?.error && (
                        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded text-red-800 text-sm">
                            {comparisonResult.error}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
