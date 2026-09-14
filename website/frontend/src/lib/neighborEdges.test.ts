const assert = await import('node:' + 'assert/strict')
const { default: test } = await import('node:' + 'test')
import { selectNeighborEdges } from './neighborEdges.ts'

const edges: GeoJSON.FeatureCollection = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[-122.3, 37.7], [-122.1, 37.9]] },
            properties: { fips_a: '06001', fips_b: '06013' },
        },
        {
            type: 'Feature',
            geometry: { type: 'LineString', coordinates: [[-121.9, 37.3], [-121.7, 37.5]] },
            properties: { fips_a: '06085', fips_b: '06081' },
        },
    ],
}

test('selectNeighborEdges keeps only edges touching the selected county', () => {
    assert.deepEqual(selectNeighborEdges(edges, '06001').features, [edges.features[0]])
})

test('selectNeighborEdges keeps edges when the selected county is fips_b', () => {
    assert.deepEqual(selectNeighborEdges(edges, '06013').features, [edges.features[0]])
})

test('selectNeighborEdges returns an empty collection without a selection', () => {
    assert.deepEqual(selectNeighborEdges(edges, null), { type: 'FeatureCollection', features: [] })
})
