export function selectNeighborEdges(edges: GeoJSON.FeatureCollection, fips: string | null): GeoJSON.FeatureCollection {
    if (!fips) return { type: 'FeatureCollection', features: [] }

    return {
        type: 'FeatureCollection',
        features: edges.features.filter((edge) => edge.properties?.fips_a === fips || edge.properties?.fips_b === fips),
    }
}
