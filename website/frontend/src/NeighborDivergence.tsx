import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { cn } from './lib/utils'
import { DASHBOARD_MAP_STYLE } from './lib/dashboardMap'
import { PROPERTY_COLORS } from './lib/propertyColors'
import { ComparisonPanel } from './neighbor-divergence/ComparisonPanel'
import {
    COLOR_GROUP_NAMES,
    deriveComparisonSummary,
    type ComparisonResult,
    type DivergenceData,
    type SelectedPair,
} from './neighbor-divergence/model'

export function NeighborDivergence() {
    const mapContainer = useRef<HTMLDivElement>(null)
    const mergedMapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<maplibregl.Map | null>(null)
    const mergedMap = useRef<maplibregl.Map | null>(null)
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<DivergenceData | null>(null)
    const [mergedData, setMergedData] = useState<DivergenceData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [controlsOpen, setControlsOpen] = useState(() => typeof window !== 'undefined' && window.innerWidth >= 640)
    const [showEdges, setShowEdges] = useState(true)

    // Selected pair for comparison
    const [selectedPair, setSelectedPair] = useState<SelectedPair | null>(null)

    // Comparison state
    const [pairComparisons, setPairComparisons] = useState<Record<string, Omit<ComparisonResult, 'conditioning'>>>({})
    const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null)

    const [usePooled, setUsePooled] = useState(false)

    // Map comparison state
    const [showMergedMap, setShowMergedMap] = useState(false)
    const [showColorGroups, setShowColorGroups] = useState(false)
    const [mergedMapLoading, setMergedMapLoading] = useState(false)
    const [mainMapReady, setMainMapReady] = useState(false)

    const [showComparisonPanel, setShowComparisonPanel] = useState(false)



    const [hoveredEdge, setHoveredEdge] = useState<{ fips_a: string; fips_b: string; sourceMap: 'original' | 'merged'; lngLat: [number, number] } | null>(null)
    const originalPopupRef = useRef<maplibregl.Popup | null>(null)
    const mergedPopupRef = useRef<maplibregl.Popup | null>(null)
    const isSyncingRef = useRef(false)

    const comparisonRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        async function fetchData() {
            try {
                const [divergenceRes, pairsRes] = await Promise.all([
                    fetch('/data/neighbor-divergence-map.json'),
                    fetch('/data/county-pair-comparisons.json')
                ])
                if (!divergenceRes.ok) throw new Error('Failed to load divergence data')
                const result = await divergenceRes.json()
                const pairs = await pairsRes.json()
                setData(result)
                setPairComparisons(pairs)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error')
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    useEffect(() => {
        if (!mapContainer.current || map.current) return

        const isMobile = window.innerWidth < 640
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: DASHBOARD_MAP_STYLE,
            center: [-119.5, 37.5],
            zoom: isMobile ? 4.5 : 5.5,
        })

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right')
        map.current.on('load', () => setMainMapReady(true))

        return () => {
            map.current?.remove()
            map.current = null
            setMainMapReady(false)
        }
    }, [])

    const [mergedMapReady, setMergedMapReady] = useState(false)

    useEffect(() => {
        if (!mergedMapContainer.current || !showMergedMap || mergedMap.current) return

        const isMobile = window.innerWidth < 640
        const newMap = new maplibregl.Map({
            container: mergedMapContainer.current,
            style: DASHBOARD_MAP_STYLE,
            center: [-119.5, 37.5],
            zoom: isMobile ? 4.5 : 5.5,
        })

        newMap.addControl(new maplibregl.NavigationControl(), 'top-right')

        newMap.on('load', () => {
            setMergedMapReady(true)
        })

        mergedMap.current = newMap

        return () => {
            mergedMap.current?.remove()
            mergedMap.current = null
            setMergedMapReady(false)
        }
    }, [showMergedMap])

    useEffect(() => {
        if (!showMergedMap || !map.current || !mergedMap.current || !mergedMapReady) return

        const syncCamera = (source: maplibregl.Map, target: maplibregl.Map) => {
            if (isSyncingRef.current) return
            isSyncingRef.current = true

            target.jumpTo({
                center: source.getCenter(),
                zoom: source.getZoom(),
                bearing: source.getBearing(),
                pitch: source.getPitch()
            })

            isSyncingRef.current = false
        }

        const onOriginalMove = () => syncCamera(map.current!, mergedMap.current!)
        const onMergedMove = () => syncCamera(mergedMap.current!, map.current!)

        map.current.on('move', onOriginalMove)
        mergedMap.current.on('move', onMergedMove)

        syncCamera(map.current, mergedMap.current)

        return () => {
            map.current?.off('move', onOriginalMove)
            mergedMap.current?.off('move', onMergedMove)
        }
    }, [showMergedMap, mergedMapReady])

    const addLayersToMap = useCallback((mapInstance: maplibregl.Map, mapData: DivergenceData, isOriginal: boolean) => {
        const sourceId = isOriginal ? 'counties' : 'merged-counties'
        const edgeSourceId = isOriginal ? 'edges' : 'merged-edges'

        if (mapInstance.getLayer(`${sourceId}-fill`)) mapInstance.removeLayer(`${sourceId}-fill`)
        if (mapInstance.getLayer(`${sourceId}-outline`)) mapInstance.removeLayer(`${sourceId}-outline`)
        if (mapInstance.getLayer(`${edgeSourceId}-line`)) mapInstance.removeLayer(`${edgeSourceId}-line`)
        if (mapInstance.getLayer('selected-edge')) mapInstance.removeLayer('selected-edge')
        if (mapInstance.getSource(sourceId)) mapInstance.removeSource(sourceId)
        if (mapInstance.getSource(edgeSourceId)) mapInstance.removeSource(edgeSourceId)

        mapInstance.addSource(sourceId, {
            type: 'geojson',
            data: mapData.counties
        })

        mapInstance.addSource(edgeSourceId, {
            type: 'geojson',
            data: mapData.edges
        })

        mapInstance.addLayer({
            id: `${sourceId}-fill`,
            type: 'fill',
            source: sourceId,
            paint: {
                'fill-color': '#f5f5f5',
                'fill-opacity': 0.3,
            },
        })

        mapInstance.addLayer({
            id: `${sourceId}-outline`,
            type: 'line',
            source: sourceId,
            paint: {
                'line-color': '#999',
                'line-width': 0.5,
            },
        })

        const edgeColorExpr: maplibregl.ExpressionSpecification = [
            'interpolate',
            ['linear'],
            ['to-number', ['get', 'weighted_jsd'], 0],
            0.0, '#fde725',
            0.25, '#22a884',
            0.5, '#2a788e',
            0.75, '#414487',
            1.0, '#440154',
        ]

        mapInstance.addLayer({
            id: `${edgeSourceId}-line`,
            type: 'line',
            source: edgeSourceId,
            paint: {
                'line-color': edgeColorExpr,
                'line-width': 4,
                'line-opacity': 0.9,
            },
        })

        const edgePopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })
        if (isOriginal) {
            originalPopupRef.current = edgePopup
        } else {
            mergedPopupRef.current = edgePopup
        }

        const layerId = `${edgeSourceId}-line`

        mapInstance.on('mousemove', layerId, (e) => {
            if (!e.features || e.features.length === 0) return
            mapInstance.getCanvas().style.cursor = 'pointer'
            const props = e.features[0].properties
            const fips_a = props.fips_a
            const fips_b = props.fips_b

            setHoveredEdge({
                fips_a,
                fips_b,
                sourceMap: isOriginal ? 'original' : 'merged',
                lngLat: [e.lngLat.lng, e.lngLat.lat]
            })

            const countyA = props.county_a || 'Unknown'
            const countyB = props.county_b || 'Unknown'
            const jsd = props.weighted_jsd?.toFixed(3) || 'N/A'
            const nLc = props.n_shared_lc || 0
            const support = props.total_support?.toLocaleString() || '0'
            const clickHint = '<div style="margin-top: 6px; font-size: 10px; color: #666;">Click to compare</div>'
            const mapLabel = isOriginal ? '<div style="font-size: 10px; color: #666; margin-bottom: 4px;">ORIGINAL</div>' : '<div style="font-size: 10px; color: #2166ac; margin-bottom: 4px;">MERGED COLORS</div>'
            const html = `
                <div style="font-size: 12px; line-height: 1.4;">
                    ${mapLabel}
                    <div style="font-weight: bold; margin-bottom: 4px;">${countyA} - ${countyB}</div>
                    <div>Avg JSD: <strong>${jsd}</strong></div>
                    <div>Shared Land Cover Types: ${nLc}</div>
                    <div>Total Support: ${support}</div>
                    ${clickHint}
                </div>
            `
            edgePopup.setLngLat(e.lngLat).setHTML(html).addTo(mapInstance)
        })

        mapInstance.on('mouseleave', layerId, () => {
            mapInstance.getCanvas().style.cursor = ''
            edgePopup.remove()
            setHoveredEdge(null)
        })

        if (isOriginal) {
            mapInstance.addLayer({
                id: 'selected-edge',
                type: 'line',
                source: edgeSourceId,
                paint: {
                    'line-color': '#8839ef',
                    'line-width': 4,
                    'line-opacity': 1,
                },
                filter: ['==', ['get', 'fips_a'], '']
            })
        }

        mapInstance.on('click', layerId, (e) => {
            if (!e.features || e.features.length === 0) return
            const props = e.features[0].properties
            const pair: SelectedPair = {
                fips_a: props.fips_a,
                fips_b: props.fips_b,
                county_a: props.county_a,
                county_b: props.county_b
            }
            setSelectedPair(pair)
            setShowComparisonPanel(window.innerWidth >= 640)

            if (isOriginal) {
                mapInstance.setFilter('selected-edge', [
                    'all',
                    ['==', ['get', 'fips_a'], props.fips_a],
                    ['==', ['get', 'fips_b'], props.fips_b]
                ])
            }

            setTimeout(() => {
                comparisonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }, 100)
        })
    }, [])

    useEffect(() => {
        if (!mainMapReady || !map.current || !data) return
        addLayersToMap(map.current, data, true)
    }, [mainMapReady, data, addLayersToMap])

    useEffect(() => {
        if (!mergedMap.current || !mergedData || !mergedMapReady) return
        addLayersToMap(mergedMap.current, mergedData, false)
    }, [mergedData, mergedMapReady, addLayersToMap])

    useEffect(() => {
        if (!hoveredEdge || !showMergedMap) {
            if (hoveredEdge === null) {
                originalPopupRef.current?.remove()
                mergedPopupRef.current?.remove()
            }
            return
        }

        const { fips_a, fips_b, sourceMap, lngLat } = hoveredEdge

        const showTooltipOnMap = (
            mapInstance: maplibregl.Map | null,
            mapData: DivergenceData | null,
            popup: maplibregl.Popup | null,
            isOriginal: boolean
        ) => {
            if (!mapInstance || !mapData || !popup) return

            const edgeFeature = mapData.edges.features.find(f =>
                f.properties?.fips_a === fips_a && f.properties?.fips_b === fips_b
            )

            if (!edgeFeature) return

            const props = edgeFeature.properties || {}
            const countyA = props.county_a || 'Unknown'
            const countyB = props.county_b || 'Unknown'
            const jsd = props.weighted_jsd?.toFixed(3) || 'N/A'
            const nLc = props.n_shared_lc || 0
            const support = props.total_support?.toLocaleString() || '0'
            const mapLabel = isOriginal ? '<div style="font-size: 10px; color: #666; margin-bottom: 4px;">ORIGINAL</div>' : '<div style="font-size: 10px; color: #2166ac; margin-bottom: 4px;">MERGED COLORS</div>'

            const html = `
                <div style="font-size: 12px; line-height: 1.4;">
                    ${mapLabel}
                    <div style="font-weight: bold; margin-bottom: 4px;">${countyA} - ${countyB}</div>
                    <div>Avg JSD: <strong>${jsd}</strong></div>
                    <div>Shared Land Cover Types: ${nLc}</div>
                    <div>Total Support: ${support}</div>
                </div>
            `

            popup.setLngLat(lngLat).setHTML(html).addTo(mapInstance)
        }

        if (sourceMap === 'original') {

            showTooltipOnMap(mergedMap.current, mergedData, mergedPopupRef.current, false)
        } else {
            showTooltipOnMap(map.current, data, originalPopupRef.current, true)
        }

        return () => {
            if (sourceMap === 'original') {
                mergedPopupRef.current?.remove()
            } else {
                originalPopupRef.current?.remove()
            }
        }
    }, [hoveredEdge, showMergedMap, data, mergedData])

    // Load comparison from static data when pair changes
    useEffect(() => {
        if (!selectedPair) return
        const key = `${selectedPair.fips_a}-${selectedPair.fips_b}`
        const entry = pairComparisons[key]
        if (entry) {
            setComparisonResult({
                county_a: entry.county_a,
                county_b: entry.county_b,
                conditioning: { conditions: [], total_conditions: 0 },
                jsd: entry.jsd,
            })
        } else {
            setComparisonResult(null)
        }
    }, [selectedPair, pairComparisons])

    useEffect(() => {
        if (!map.current) return
        const visibility = showEdges ? 'visible' : 'none'
        try {
            if (map.current.getLayer('edges-line')) {
                map.current.setLayoutProperty('edges-line', 'visibility', visibility)
            }
            if (map.current.getLayer('selected-edge')) {
                map.current.setLayoutProperty('selected-edge', 'visibility', visibility)
            }
        } catch {
            // Layer might not be ready
        }
    }, [showEdges])

    const toggleFullscreen = () => {
        setIsFullscreen(!isFullscreen)
    }

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isFullscreen) {
                setIsFullscreen(false)
            }
            if (e.key === 'e' || e.key === 'E') {
                setShowEdges(prev => !prev)
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [isFullscreen])

    useEffect(() => {
        setTimeout(() => {
            map.current?.resize()
            mergedMap.current?.resize()
        }, 100)
    }, [isFullscreen, showMergedMap])

    useEffect(() => {
        if (!usePooled) {
            setShowMergedMap(false)
            setMergedData(null)
            return
        }
        setMergedMapLoading(true)
        setShowMergedMap(true)
        fetch('/data/neighbor-divergence-map-pooled.json')
            .then(r => r.json())
            .then(result => setMergedData(result))
            .catch(err => console.error('Failed to load pooled data:', err))
            .finally(() => setMergedMapLoading(false))
    }, [usePooled])

    const comparisonSummary = useMemo(
        () => deriveComparisonSummary(comparisonResult, usePooled),
        [comparisonResult, usePooled]
    )

    return (
        <div className={cn(
            'relative flex-1 min-h-0',
            isFullscreen && 'fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] bg-background'
        )}>
            {/* Maps Container - 50/50 split when merged map is shown */}
            <div className={cn(
                'absolute inset-0 flex',
                showMergedMap ? 'gap-1' : ''
            )}>
                {/* Original Map */}
                <div className={cn(
                    'relative h-full',
                    showMergedMap ? 'w-1/2' : 'w-full'
                )}>
                    <div ref={mapContainer} className="w-full h-full" />

                    {/* Loading/Error overlays */}
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                            Loading divergence data...
                        </div>
                    )}
                    {error && (
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-50 border border-red-200 rounded text-red-600 text-sm z-10">
                            {error}
                        </div>
                    )}

                    {/* Map Label when split view */}
                    {showMergedMap && (
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-card/95 rounded shadow-elevated text-xs font-semibold uppercase tracking-wide z-10">
                            Original
                        </div>
                    )}

                    {/* Map Controls - Top Left */}
                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-2 bg-card/95 rounded p-2 sm:p-3 shadow-elevated z-10 w-40 sm:w-52">
                        <div className="relative pr-4">
                            <div className="text-[10px] sm:text-xs text-muted-foreground leading-snug text-left">Compares color distributions between neighboring counties using JSD. 0 = identical, 1 = completely different.</div>
                            <button onClick={() => setControlsOpen(v => !v)} className="absolute -top-1 -right-1 text-[9px] text-muted-foreground cursor-pointer hover:text-foreground">{controlsOpen ? '▲' : '▼'}</button>
                        </div>
                        {controlsOpen && <>
                        {/* Stats Summary */}
                        {data && (
                            <div className="pb-2 mb-1 border-b border-border">
                                <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Statistics</div>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <span className="text-muted-foreground">Pairs:</span>
                                    <span className="font-semibold text-foreground">{data.stats.total_pairs}</span>
                                    <span className="text-muted-foreground">Mean JSD:</span>
                                    <span className="font-semibold text-foreground">{data.stats.mean_jsd.toFixed(3)}</span>
                                    <span className="text-muted-foreground">Range:</span>
                                    <span className="font-semibold text-foreground">{data.stats.min_jsd.toFixed(3)} - {data.stats.max_jsd.toFixed(3)}</span>
                                </div>
                            </div>
                        )}
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Display</span>
                            <div className="flex rounded-sm overflow-hidden border border-border">
                                <button
                                    className={cn(
                                        'px-3 py-1.5 border-none bg-muted text-xs font-medium text-muted-foreground cursor-pointer transition-all duration-150',
                                        'hover:bg-[var(--button-accent)]/10 hover:text-[var(--button-accent)]',
                                        showEdges && 'bg-[var(--button-accent)] text-white hover:opacity-90'
                                    )}
                                    onClick={() => setShowEdges(true)}
                                >
                                    Show Edges
                                </button>
                                <button
                                    className={cn(
                                        'px-3 py-1.5 border-none border-l border-border bg-muted text-xs font-medium text-muted-foreground cursor-pointer transition-all duration-150',
                                        'hover:bg-[var(--button-accent)]/10 hover:text-[var(--button-accent)]',
                                        !showEdges && 'bg-[var(--button-accent)] text-white hover:opacity-90'
                                    )}
                                    onClick={() => setShowEdges(false)}
                                >
                                    Hide Edges
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <button
                                className={cn(
                                    'px-3 py-1.5 border rounded-sm text-[11px] font-medium cursor-pointer uppercase tracking-wide transition-all duration-150',
                                    usePooled
                                        ? 'border-[var(--button-accent)] bg-[var(--button-accent)] text-white hover:opacity-90'
                                        : 'border-[var(--button-accent)] bg-muted/50 text-[var(--button-accent)] hover:bg-[var(--button-accent)]/10'
                                )}
                                onClick={() => setUsePooled(p => !p)}
                            >
                                {usePooled ? 'Pooled Colors' : 'Raw Colors'}
                            </button>
                            <button
                                className="px-3 py-1 border border-[var(--button-accent)] rounded-sm bg-muted/50 text-[10px] font-medium text-[var(--button-accent)] cursor-pointer tracking-wide transition-all duration-150 hover:bg-[var(--button-accent)]/10 flex items-center justify-between gap-2"
                                onClick={() => setShowColorGroups(v => !v)}
                            >
                                <span>Color Groups</span>
                                <span>{showColorGroups ? '▲' : '▼'}</span>
                            </button>
                            {showColorGroups && (
                                <div className="bg-card border border-border rounded p-2 space-y-1.5 text-[11px]">
                                    {[
                                        { name: 'Red', members: 'azure, blue, crimson, foo, indigo, purple, red, scarlet', color: '#FF0000' },
                                        { name: 'Navy', members: 'aqua, aquamarine, lavender, lilac, navy', color: '#000080' },
                                        { name: 'Alabaster', members: 'alabaster, gray, grey, ivory', color: '#F2F0E6' },
                                        { name: 'Amber', members: 'amber, gold, lemon, yellow', color: '#FFBF00' },
                                        { name: 'Cocoa', members: 'beige, brown, cocoa, coffee', color: '#D2691E' },
                                        { name: 'Olive', members: 'green, olive, sage, verde', color: '#808000' },
                                        { name: 'Orange', members: 'orange, sienna, terracotta', color: '#FFA500' },
                                    ].map(g => (
                                        <div key={g.name} className="flex items-start gap-1.5">
                                            <span className="mt-0.5 shrink-0 w-2.5 h-2.5 rounded-sm" style={{ background: g.color }} />
                                            <div className="leading-snug">
                                                <span className="font-semibold text-foreground">{g.name}:</span>
                                                <span className="text-muted-foreground"> {g.members}</span>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-muted-foreground pt-1 border-t border-border">All other colors kept as-is</div>
                                </div>
                            )}
                        </div>
                        <button
                            className="px-3 py-1.5 border border-[var(--button-accent)] rounded-sm bg-muted/50 text-[11px] font-medium text-[var(--button-accent)] cursor-pointer uppercase tracking-wide transition-all duration-150 hover:bg-[var(--button-accent)]/10"
                            onClick={toggleFullscreen}
                        >
                            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                        </button>
                        {showMergedMap && (
                            <button
                                className="px-3 py-1.5 border border-red-300 rounded-sm bg-red-50 text-[11px] font-medium text-red-600 cursor-pointer uppercase tracking-wide transition-all duration-150 hover:bg-red-100 hover:border-red-400"
                                onClick={() => setShowMergedMap(false)}
                            >
                                Close Comparison
                            </button>
                        )}
                        </>}
                    </div>

                    {/* Stats badge when split view */}
                    {showMergedMap && data && (
                        <div className={cn(
                            "absolute left-1/2 -translate-x-1/2 z-10 bg-card rounded-lg shadow-elevated px-2 sm:px-4 py-2 sm:py-3 text-center",
                            selectedPair ? 'bottom-20' : 'bottom-4'
                        )}>
                            <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Original</div>
                            <div className="text-lg font-bold text-foreground">{data.stats.mean_jsd.toFixed(3)}</div>
                            <div className="text-[10px] text-muted-foreground">Mean JSD</div>
                        </div>
                    )}

                    {/* Legend - Bottom Right (only when not split) */}
                    {!showMergedMap && (
                        <div className={cn(
                            'absolute right-2.5 bg-card/95 p-2 sm:p-3 rounded shadow-elevated text-xs z-10 transition-all duration-300',
                            selectedPair ? 'bottom-32' : 'bottom-20 sm:bottom-24'
                        )}>
                            <div className="font-semibold mb-1 sm:mb-2 text-foreground text-[10px] sm:text-xs">Avg JSD (Divergence)</div>
                            <div
                                className="w-28 sm:w-44 h-2 sm:h-2.5 rounded-sm"
                                style={{ background: 'linear-gradient(to right, #fde725, #22a884, #2a788e, #414487, #440154)' }}
                            />
                            <div className="flex justify-between mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                                <span>0</span>
                                <span>0.5</span>
                                <span>1</span>
                            </div>
                            <div className="flex justify-between mt-1 text-[9px] sm:text-[10px] text-muted-foreground">
                                <span>Similar</span>
                                <span>Different</span>
                            </div>
                        </div>
                    )}

                    {/* Keybind Hints - Bottom Left (only when not split, hidden on mobile) */}
                    {!showMergedMap && (
                        <div className={cn(
                            'absolute left-2.5 hidden sm:flex flex-col gap-1 z-10 transition-all duration-300',
                            selectedPair ? 'bottom-20' : 'bottom-2.5'
                        )}>
                            {isFullscreen && (
                                <span className="bg-card/95 px-2.5 py-1.5 rounded text-xs text-muted-foreground">
                                    Press <kbd className="bg-sage-100 border border-sage-300 rounded px-1.5 py-0.5 font-semibold text-foreground">Esc</kbd> to exit fullscreen
                                </span>
                            )}
                            <span className="bg-card/95 px-2.5 py-1.5 rounded text-xs text-muted-foreground">
                                Press <kbd className="bg-sage-100 border border-sage-300 rounded px-1.5 py-0.5 font-semibold text-foreground">E</kbd> to {showEdges ? 'hide' : 'show'} edges
                            </span>
                            {!selectedPair && (
                                <span className="bg-card/95 px-2.5 py-1.5 rounded text-xs text-muted-foreground">
                                    Click edge to compare counties
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Merged Map - 50% width side by side */}
                {showMergedMap && (
                    <div className="relative w-1/2 h-full">
                        <div ref={mergedMapContainer} className="w-full h-full" />

                        {/* Loading overlay */}
                        {mergedMapLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-20">
                                Recalculating...
                            </div>
                        )}

                        {/* Map Label */}
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-blue-100 text-blue-800 rounded shadow-elevated text-xs font-semibold uppercase tracking-wide z-10">
                            Merged Colors
                        </div>

                        {/* Stats badge */}
                        {mergedData && data && (
                            <div className={cn(
                                "absolute left-1/2 -translate-x-1/2 z-10 bg-card rounded-lg shadow-elevated px-2 sm:px-4 py-2 sm:py-3 text-center",
                                selectedPair ? 'bottom-20' : 'bottom-4'
                            )}>
                                <div className="text-[10px] font-semibold text-blue-600 uppercase tracking-wide mb-1">Merged</div>
                                <div className="text-lg font-bold text-foreground">{mergedData.stats.mean_jsd.toFixed(3)}</div>
                                <div className="text-[10px] text-muted-foreground">Mean JSD</div>
                            </div>
                        )}

                        {/* Legend */}
                        <div className={cn(
                            'absolute right-2.5 bg-card/95 p-2 sm:p-3 rounded shadow-elevated text-xs z-10',
                            selectedPair ? 'bottom-20' : 'bottom-24 sm:bottom-7'
                        )}>
                            <div className="font-semibold mb-1 sm:mb-2 text-foreground text-[10px] sm:text-xs">Avg JSD (Divergence)</div>
                            <div
                                className="w-24 sm:w-36 h-2 sm:h-2.5 rounded-sm"
                                style={{ background: 'linear-gradient(to right, #fde725, #22a884, #2a788e, #414487, #440154)' }}
                            />
                            <div className="flex justify-between mt-1 text-muted-foreground">
                                <span>0</span>
                                <span>1</span>
                            </div>
                            <div className="flex justify-between mt-1 text-muted-foreground">
                                <span>Similar</span>
                                <span>Different</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>



            {/* Comparison Panel - Bottom Sheet */}
            {selectedPair && (
                <ComparisonPanel
                    comparisonRef={comparisonRef}
                    selectedPair={selectedPair}
                    comparisonResult={comparisonResult}
                    summary={comparisonSummary}
                    usePooled={usePooled}
                    expanded={showComparisonPanel}
                    propertyColors={PROPERTY_COLORS}
                    colorGroupNames={COLOR_GROUP_NAMES}
                    onToggle={() => setShowComparisonPanel(!showComparisonPanel)}
                    onClose={() => { setSelectedPair(null); setShowComparisonPanel(false) }}
                />
            )}
        </div>
    )
}
