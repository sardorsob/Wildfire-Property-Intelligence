const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import {
    buildCountyDetail,
    buildCountyDetailAllLandcover,
    type DetailRow,
    type SummaryRow,
} from './conditionalPooling.ts'

test('buildCountyDetail keeps the selected land-cover rows and padded FIPS', () => {
    const summaryRows: SummaryRow[] = [
        { fips: 6001, lc_type: 'Forest', n_county: 10, n_pool: 12, num_neighbors: 3, kl_div: 0.25, l1_distance: 0.5, top_color: 'red', top_contrib: 0.2 },
        { fips: 6001, lc_type: 'Urban', n_county: 8, n_pool: 9, num_neighbors: 3, kl_div: 0.1, l1_distance: 0.3, top_color: 'blue', top_contrib: 0.1 },
    ]
    const detailRows: DetailRow[] = [
        { fips: 6001, lc_type: 'Forest', clr: 'red', y_county: 6, y_pool: 4, p_county: 0.6, p_pool: 0.3333333333333333, contrib: 0.16, abs_diff: 0.27 },
        { fips: 6001, lc_type: 'Urban', clr: 'blue', y_county: 4, y_pool: 3, p_county: 0.5, p_pool: 0.3333333333333333, contrib: 0.08, abs_diff: 0.17 },
    ]
    const geoFeatures: GeoJSON.Feature[] = [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { fips: '06001', county_name: 'Alameda' } },
    ]

    assert.deepEqual(buildCountyDetail(6001, summaryRows, detailRows, geoFeatures, 'Forest'), {
        fips: '06001',
        county_name: 'Alameda',
        by_landcover: [{
            lc_type: 'Forest',
            n_county: 10,
            n_pool: 12,
            num_neighbors: 3,
            kl_div: 0.25,
            l1_distance: 0.5,
            top_color: 'red',
            top_contrib: 0.2,
            distributions: [{
                clr: 'red',
                y_county: 6,
                y_pool: 4,
                p_county: 0.6,
                p_pool: 0.3333333333333333,
                contrib: 0.16,
                abs_diff: 0.27,
            }],
        }],
        total_landcover_types: 1,
    })
})

test('buildCountyDetailAllLandcover combines color counts before normalizing', () => {
    const detailRows: DetailRow[] = [
        { fips: 6001, lc_type: 'Forest', clr: 'red', y_county: 2, y_pool: 2, p_county: 0, p_pool: 0, contrib: 0, abs_diff: 0 },
        { fips: 6001, lc_type: 'Forest', clr: 'green', y_county: 2, y_pool: 6, p_county: 0, p_pool: 0, contrib: 0, abs_diff: 0 },
        { fips: 6001, lc_type: 'Urban', clr: 'red', y_county: 2, y_pool: 2, p_county: 0, p_pool: 0, contrib: 0, abs_diff: 0 },
        { fips: 6001, lc_type: 'Urban', clr: 'blue', y_county: 10, y_pool: 6, p_county: 0, p_pool: 0, contrib: 0, abs_diff: 0 },
    ]
    const geoFeatures: GeoJSON.Feature[] = [
        { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: { fips: '06001', name: 'Alameda' } },
    ]

    assert.deepEqual(buildCountyDetailAllLandcover(6001, detailRows, geoFeatures), {
        fips: '06001',
        county_name: 'Alameda',
        by_landcover: [{
            lc_type: 'All land cover types',
            n_county: 16,
            n_pool: 16,
            num_neighbors: 0,
            kl_div: 0,
            l1_distance: 0,
            top_color: '',
            top_contrib: 0,
            distributions: [
                { clr: 'red', y_county: 4, y_pool: 4, p_county: 0.25, p_pool: 0.25, contrib: 0, abs_diff: 0 },
                { clr: 'green', y_county: 2, y_pool: 6, p_county: 0.125, p_pool: 0.375, contrib: 0.25, abs_diff: 0.25 },
                { clr: 'blue', y_county: 10, y_pool: 6, p_county: 0.625, p_pool: 0.375, contrib: 0.25, abs_diff: 0.25 },
            ],
        }],
        total_landcover_types: 1,
    })
})
