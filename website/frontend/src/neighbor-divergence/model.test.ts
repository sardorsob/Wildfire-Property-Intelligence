const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import {
    deriveComparisonSummary,
    formatColorLabel,
    poolDistributions,
    type ComparisonResult,
    type FeatureDist,
} from './model.ts'

test('poolDistributions preserves grouped totals, normalized proportions, order, and unique flags', () => {
    const countyA: FeatureDist[] = [
        { value: 'azure', count: 2, proportion: 0.2, unique: true },
        { value: 'foo', count: 3, proportion: 0.3, unique: true },
        { value: 'bar', count: 1, proportion: 0.1, unique: false },
        { value: 'navy', count: 4, proportion: 0.4, unique: false },
    ]
    const countyB: FeatureDist[] = [
        { value: 'scarlet', count: 1, proportion: 0.1, unique: true },
        { value: 'bar', count: 0, proportion: 0, unique: false },
        { value: 'aqua', count: 9, proportion: 0.9, unique: true },
    ]

    assert.deepEqual(poolDistributions(countyA, countyB), [
        [
            { value: 'red', count: 5, proportion: 0.5, unique: false },
            { value: 'navy', count: 4, proportion: 0.4, unique: false },
            { value: 'bar', count: 1, proportion: 0.1, unique: true },
        ],
        [
            { value: 'navy', count: 9, proportion: 0.9, unique: false },
            { value: 'red', count: 1, proportion: 0.1, unique: false },
        ],
    ])
})

test('deriveComparisonSummary returns the current raw unique, shared, scale, and overlap values', () => {
    const comparison: ComparisonResult = {
        county_a: {
            fips: '06001',
            name: 'Alpha',
            total_count: 10,
            clr: {
                distribution: [
                    { value: 'red', count: 6, proportion: 0.6, unique: false },
                    { value: 'foo', count: 4, proportion: 0.4, unique: true },
                ],
                vocab_size: 2,
            },
            bldgtype: { distribution: [], vocab_size: 0 },
            st_damcat: { distribution: [], vocab_size: 0 },
        },
        county_b: {
            fips: '06003',
            name: 'Beta',
            total_count: 8,
            clr: {
                distribution: [
                    { value: 'red', count: 2, proportion: 0.25, unique: false },
                    { value: 'bar', count: 6, proportion: 0.75, unique: true },
                ],
                vocab_size: 2,
            },
            bldgtype: { distribution: [], vocab_size: 0 },
            st_damcat: { distribution: [], vocab_size: 0 },
        },
        conditioning: { conditions: [], total_conditions: 0 },
        jsd: { original: 0.375, merged: 0.125, reduction: 0.25, reduction_pct: 66.6667 },
    }

    assert.deepEqual(deriveComparisonSummary(comparison, false), {
        displayClrA: {
            distribution: [
                { value: 'red', count: 6, proportion: 0.6, unique: false },
                { value: 'foo', count: 4, proportion: 0.4, unique: true },
            ],
            vocab_size: 2,
        },
        displayClrB: {
            distribution: [
                { value: 'red', count: 2, proportion: 0.25, unique: false },
                { value: 'bar', count: 6, proportion: 0.75, unique: true },
            ],
            vocab_size: 2,
        },
        maxProportion: 0.75,
        uniqueToA: ['foo'],
        uniqueToB: ['bar'],
        sharedColors: ['red'],
        vocabOverlap: 1 / 3,
    })
    assert.deepEqual(deriveComparisonSummary(comparison, true), {
        displayClrA: {
            distribution: [{ value: 'red', count: 10, proportion: 1, unique: false }],
            vocab_size: 1,
        },
        displayClrB: {
            distribution: [
                { value: 'bar', count: 6, proportion: 0.75, unique: true },
                { value: 'red', count: 2, proportion: 0.25, unique: false },
            ],
            vocab_size: 2,
        },
        maxProportion: 1,
        uniqueToA: [],
        uniqueToB: ['bar'],
        sharedColors: ['red'],
        vocabOverlap: 0.5,
    })
})

test('deriveComparisonSummary preserves the empty result for missing and error comparisons', () => {
    const empty = {
        displayClrA: null,
        displayClrB: null,
        maxProportion: 0,
        uniqueToA: [],
        uniqueToB: [],
        sharedColors: [],
        vocabOverlap: 0,
    }

    assert.deepEqual(deriveComparisonSummary(null, false), empty)
    assert.deepEqual(deriveComparisonSummary({ error: 'No comparison data' } as ComparisonResult, true), empty)
})

test('formatColorLabel preserves current group and placeholder labels', () => {
    assert.equal(formatColorLabel('red'), 'red')
    assert.equal(formatColorLabel('alabaster'), 'alabaster')
    assert.equal(formatColorLabel('foo'), 'foo')
    assert.equal(formatColorLabel('bar'), 'bar')
    assert.equal(formatColorLabel('blue_green'), 'blue_green')
})
