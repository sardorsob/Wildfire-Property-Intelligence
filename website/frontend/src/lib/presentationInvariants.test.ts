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
