/// <reference types="node" />

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const readSource = (file: string) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

test('Moran legend labels negative values as dispersion and positive values as clustering', () => {
    const source = readSource('MoransIMap.tsx')

    assert.match(source, /<span>Dispersion<\/span><span>Clustering<\/span>/)
})

test('Neighbor comparison sheet uses the card theme surface', () => {
    const source = readSource('neighbor-divergence/ComparisonPanel.tsx')

    assert.match(source, /bottom-0 left-0 right-0 bg-card/)
    assert.doesNotMatch(source, /bottom-0 left-0 right-0 bg-white/)
})

test('Neighbor keycap surfaces use semantic theme tokens', () => {
    const source = readSource('NeighborDivergence.tsx')

    assert.match(source, /<kbd className="bg-muted border border-border rounded px-1\.5 py-0\.5 font-semibold text-foreground">/)
    assert.doesNotMatch(source, /<kbd className="bg-sage-100 border border-sage-300/)
})

test('Home method links keep the dashboard accent in both themes', () => {
    const source = readSource('HomePage.tsx')

    assert.match(source, /className="text-\[var\(--button-accent\)\] hover:text-\[var\(--button-accent\)\] hover:underline"/)
})

test('Neighbor merged badge uses a semantic theme-aware foreground', () => {
    const source = readSource('NeighborDivergence.tsx')

    assert.match(source, /text-\[10px\] font-semibold text-foreground uppercase tracking-wide mb-1">Merged/)
    assert.doesNotMatch(source, /font-semibold text-blue-600 uppercase tracking-wide mb-1">Merged/)
})
