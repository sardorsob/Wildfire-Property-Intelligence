import { useReducer, useCallback, useRef, useEffect, useState } from 'react'
import { IconArrowLeft } from '@tabler/icons-react'
import { ThemeToggle } from './components/ThemeToggle'
import { HeroSection } from './viz-intro/HeroSection'
import { StickyGraphic, type MapApi, type SelectedPair } from './viz-intro/StickyGraphic'
import { ScrollNarration } from './viz-intro/ScrollNarration'
import type { SceneId } from './viz-intro/constants'
import { buildCountyDetailAllLandcover, type SummaryRow, type DetailRow, type CountyDetail } from './lib/conditionalPooling'
import { processKLByFipsSdOnly, processPooledJsdByFips, selectComparisonData, type CaseStudyData, type ComparisonData } from './viz-intro/data'

const SD_FIPS_NUM = 6073

function goToDashboard() {
    window.location.href = '/'
}

interface State {
    activeScene: SceneId
    progress: number
    direction: 'up' | 'down'
}

type Action =
    | { type: 'SCENE_ENTER'; scene: SceneId; direction: 'up' | 'down' }
    | { type: 'PROGRESS'; scene: SceneId; progress: number }

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case 'SCENE_ENTER':
            return { ...state, activeScene: action.scene, direction: action.direction }
        case 'PROGRESS':
            if (action.scene !== state.activeScene) return state
            return { ...state, progress: action.progress }
        default:
            return state
    }
}

function applyScene(
    api: MapApi,
    scene: SceneId,
    progress: number,
    klByFips: Record<string, number> | null,
    jsdByFips: Record<string, number> | null,
    onCountySelect: (fips: string) => void
) {
    switch (scene) {
        case 'hero':
            api.showCounties()
            break
        case 'counties':
            api.revealChoropleth(progress)
            break
        case 'distributions':
            if (klByFips && api.showKLChoropleth) {
                api.showKLChoropleth(klByFips, onCountySelect)
            } else {
                api.spotlightCounties()
            }
            break
        case 'spotlight':
        case 'solution':
            api.spotlightCounties()
            break
        case 'postPooling':
            if (jsdByFips && api.showPostPoolingChoropleth) {
                api.showPostPoolingChoropleth(jsdByFips)
            } else {
                api.spotlightCounties()
            }
            break
        case 'conclusion':
            api.spotlightCounties()
            break
    }
}

export function VizIntroduction() {
    const [state, dispatch] = useReducer(reducer, {
        activeScene: 'hero',
        progress: 0,
        direction: 'down',
    })

    useEffect(() => {
        document.title = 'Wildfire Property Intelligence | Case Study'
    }, [])

    const mapApi = useRef<MapApi | null>(null)
    const stateRef = useRef(state)
    stateRef.current = state

    const [pairComparisons, setPairComparisons] = useState<Record<string, ComparisonData>>({})
    const [caseStudyData, setCaseStudyData] = useState<Record<string, unknown> | null>(null)
    const [selectedPair, setSelectedPair] = useState<SelectedPair | null>(null)
    const [klByFips, setKlByFips] = useState<Record<string, number>>({})
    const [jsdByFips, setJsdByFips] = useState<Record<string, number>>({})
    const [countyKlDetail, setCountyKlDetail] = useState<CountyDetail | null>(null)

    const cpSummaryRef = useRef<SummaryRow[]>([])
    const cpDetailRef = useRef<DetailRow[]>([])
    const geoFeaturesRef = useRef<GeoJSON.Feature[]>([])

    useEffect(() => {
        Promise.all([
            fetch('/data/county-pair-comparisons.json').then((r) => r.json()),
            fetch('/data/case_study_sd_region.json').then((r) => r.json()),
            fetch('/data/conditional-pooling-summary.json').then((r) => r.json()),
            fetch('/data/conditional-pooling-detail.json').then((r) => r.json()),
            fetch('/data/group-divergence.json').then((r) => r.json()),
            fetch('/data/neighbor-jsd-pooled-greedy.json').then((r) => r.json()),
        ])
            .then(
                ([
                    all,
                    caseStudy,
                    cpSummary,
                    cpDetail,
                    gd,
                    pooledJsd,
                ]: [
                    Record<string, ComparisonData>,
                    Record<string, unknown>,
                    SummaryRow[],
                    DetailRow[],
                    { map: { features: GeoJSON.Feature[] } },
                    Record<string, { weighted_jsd: number; mean_jsd?: number }>,
                ]) => {
                    setPairComparisons(all)
                    setCaseStudyData(caseStudy)
                    setSelectedPair(null)
                    cpSummaryRef.current = cpSummary
                    cpDetailRef.current = cpDetail
                    geoFeaturesRef.current = gd.map.features
                    setKlByFips(processKLByFipsSdOnly(cpSummary))
                    setJsdByFips(processPooledJsdByFips(pooledJsd))
                    setCountyKlDetail(buildCountyDetailAllLandcover(SD_FIPS_NUM, cpDetail, gd.map.features))
                }
            )
            .catch((e) => console.error('Failed to load viz data', e))
    }, [])

    const handleEdgeSelect = useCallback((pair: SelectedPair) => setSelectedPair(pair), [])

    const handleCountySelect = useCallback((fips: string) => {
        const fipsNum = parseInt(fips, 10)
        const detail = buildCountyDetailAllLandcover(
            fipsNum,
            cpDetailRef.current,
            geoFeaturesRef.current
        )
        setCountyKlDetail(detail)
    }, [])

    const comparisonData = selectComparisonData({
        pairComparisons,
        caseStudyData: caseStudyData as CaseStudyData | null,
        selectedPair,
    })

    const handleMapReady = useCallback(
        (api: MapApi) => {
            mapApi.current = api
            applyScene(
                api,
                stateRef.current.activeScene,
                stateRef.current.progress,
                Object.keys(klByFips).length ? klByFips : null,
                Object.keys(jsdByFips).length ? jsdByFips : null,
                handleCountySelect
            )
        },
        [klByFips, jsdByFips, handleCountySelect]
    )

    const handleSceneEnter = useCallback(
        (scene: SceneId, direction: 'up' | 'down') => {
            dispatch({ type: 'SCENE_ENTER', scene, direction })
            if (scene === 'distributions') {
            // Default to San Diego when first entering (countyDetail not yet set)
            setCountyKlDetail((prev) =>
                prev ??
                buildCountyDetailAllLandcover(
                    SD_FIPS_NUM,
                    cpDetailRef.current,
                    geoFeaturesRef.current
                )
            )
        }

            const api = mapApi.current
            if (!api) return

            switch (scene) {
                case 'hero':
                    if (direction === 'up') {
                        api.resetFromSpotlight()
                        api.showCounties()
                    }
                    break
                case 'counties':
                    if (direction === 'up') {
                        api.resetFromSpotlight()
                    }
                    api.revealChoropleth(0)
                    break
                case 'distributions':
                    if (Object.keys(klByFips).length && api.showKLChoropleth) {
                        api.showKLChoropleth(klByFips, handleCountySelect)
                    } else {
                        api.spotlightCounties()
                    }
                    break
                case 'spotlight':
                case 'solution':
                    api.spotlightCounties()
                    break
                case 'postPooling':
                    if (Object.keys(jsdByFips).length && api.showPostPoolingChoropleth) {
                        api.showPostPoolingChoropleth(jsdByFips)
                    } else {
                        api.spotlightCounties()
                    }
                    break
                case 'conclusion':
                    api.spotlightCounties()
                    break
            }
        },
        [klByFips, jsdByFips, handleCountySelect]
    )

    const handleSceneProgress = useCallback((scene: SceneId, progress: number) => {
        dispatch({ type: 'PROGRESS', scene, progress })
        if (scene === 'counties') {
            mapApi.current?.revealChoropleth(progress)
        }
    }, [])

    // Re-apply post-pooling choropleth when data loads while user is on postPooling (handles race)
    useEffect(() => {
        if (
            state.activeScene === 'postPooling' &&
            Object.keys(jsdByFips).length > 0 &&
            mapApi.current?.showPostPoolingChoropleth
        ) {
            mapApi.current.showPostPoolingChoropleth(jsdByFips)
        }
    }, [state.activeScene, jsdByFips])

    // Escape key exits to dashboard
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                goToDashboard()
            }
        }
        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [])

    return (
        <div className="bg-background min-h-screen">
            {/* Exit button — fixed top-left, always visible */}
            <a
                href="/"
                onClick={(e) => {
                    e.preventDefault()
                    goToDashboard()
                }}
                className="fixed left-4 top-4 z-[100] flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground shadow-md transition-colors hover:bg-accent"
                style={{ textDecoration: 'none' }}
            >
                <IconArrowLeft size={18} stroke={2} />
                <span>Back to Dashboard</span>
                <span className="ml-1 text-xs text-muted-foreground">(Esc)</span>
            </a>
            {/* Theme toggle — fixed top-right */}
            <div className="fixed right-4 top-4 z-[100] rounded-lg border border-border bg-card p-1 shadow-md">
                <ThemeToggle />
            </div>
            {/* Part 1: Editorial intro — no map */}
            <HeroSection />

            {/* Part 2: Scrollytelling with sticky map */}
            <div className="relative">
                <StickyGraphic
                    scene={state.activeScene}
                    progress={state.progress}
                    onReady={handleMapReady}
                    onEdgeSelect={handleEdgeSelect}
                    comparisonData={comparisonData}
                />
                <ScrollNarration
                    onSceneEnter={handleSceneEnter}
                    onSceneProgress={handleSceneProgress}
                    comparisonData={comparisonData}
                    caseStudyData={caseStudyData}
                    countyKlDetail={countyKlDetail}
                    selectedPair={selectedPair}
                    activeScene={state.activeScene}
                />
            </div>
        </div>
    )
}
