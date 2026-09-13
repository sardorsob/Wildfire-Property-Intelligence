const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import {
    processKLByFipsSdOnly,
    processPooledJsdByFips,
    selectComparisonData,
    type CaseStudyData,
    type ComparisonData,
} from './data.ts'

const sanDiego: ComparisonData = {
    county_a: { name: 'San Diego', total_count: 100, clr: { distribution: [{ value: '#111111', proportion: 0.6, count: 60 }] } },
    county_b: { name: 'Orange', total_count: 80, clr: { distribution: [{ value: '#222222', proportion: 0.5, count: 40 }] } },
    jsd: { original: 0.42, pooled: { weighted_jsd: 0.12, mean_jsd: 0.1 } },
}

test('processPooledJsdByFips retains the maximum pooled JSD for each county', () => {
    assert.deepEqual(processPooledJsdByFips({
        '06025-06073': { weighted_jsd: 0.11 },
        '06059-06073': { weighted_jsd: 0.33, mean_jsd: 0.2 },
        '06065-06073': { weighted_jsd: 0.22 },
        '06025-06059': { weighted_jsd: 0.44 },
    }), {
        '06025': 0.44,
        '06059': 0.44,
        '06065': 0.22,
        '06073': 0.33,
    })
})

test('processKLByFipsSdOnly averages only the San Diego-region rows with padded FIPS keys', () => {
    assert.deepEqual(processKLByFipsSdOnly([
        { fips: 6025, kl_div: 0.1 },
        { fips: 6025, kl_div: 0.3 },
        { fips: 6059, kl_div: 0.2 },
        { fips: 6065, kl_div: 0.4 },
        { fips: 6073, kl_div: 0.5 },
        { fips: 6001, kl_div: 0.9 },
    ]), {
        '06025': 0.2,
        '06059': 0.2,
        '06065': 0.4,
        '06073': 0.5,
    })
})

test('selectComparisonData defaults to the San Diego and Orange case-study comparison', () => {
    const orangeFromPairComparisons: ComparisonData = {
        county_a: { name: 'Orange from pair data', total_count: 1, clr: { distribution: [] } },
        county_b: { name: 'San Diego from pair data', total_count: 1, clr: { distribution: [] } },
        jsd: { original: 0.99 },
    }
    const caseStudyData: CaseStudyData = { sd_vs_neighbors: { '06073-06059': sanDiego } }

    assert.deepEqual(selectComparisonData({
        pairComparisons: { '06059-06073': orangeFromPairComparisons },
        caseStudyData,
        selectedPair: null,
    }), sanDiego)
})

test('selectComparisonData finds an SD case-study comparison from the reverse selected-pair key', () => {
    const imperial: ComparisonData = {
        county_a: { name: 'San Diego', total_count: 100, clr: { distribution: [] } },
        county_b: { name: 'Imperial', total_count: 50, clr: { distribution: [] } },
        jsd: { original: 0.35, pooled: { weighted_jsd: 0.09, mean_jsd: 0.08 } },
    }

    assert.deepEqual(selectComparisonData({
        pairComparisons: {},
        caseStudyData: { sd_vs_neighbors: { '06073-06025': imperial } },
        selectedPair: { fips_a: '06025', fips_b: '06073' },
    }), imperial)
})

test('selectComparisonData combines default base distributions with pooled JSD from a reverse case-study key', () => {
    const base: ComparisonData = {
        county_a: { name: 'San Diego', total_count: 100, clr: { distribution: [{ value: '#123456', proportion: 1, count: 100 }] } },
        county_b: { name: 'Riverside', total_count: 40, clr: { distribution: [{ value: '#abcdef', proportion: 1, count: 40 }] } },
        jsd: { original: 0.28 },
    }

    assert.deepEqual(selectComparisonData({
        pairComparisons: { '06059-06073': base },
        caseStudyData: {
            sd_vs_neighbors: {
                '06059-06073': { jsd: { pooled: { weighted_jsd: 0.07, mean_jsd: 0.06 } } },
            },
        },
        selectedPair: null,
    }), {
        ...base,
        jsd: { original: 0.28, pooled: { weighted_jsd: 0.07, mean_jsd: 0.06 } },
    })
})
