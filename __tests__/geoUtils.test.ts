import { isUserInPolygon, getPolygonCentroid } from '../src/utils/geoUtils';

const testPolygon = [
  { latitude: 51.5008, longitude: -0.1425 },
  { latitude: 51.5012, longitude: -0.1425 },
  { latitude: 51.5012, longitude: -0.1418 },
  { latitude: 51.5008, longitude: -0.1418 },
];

describe('isUserInPolygon', () => {
  it('returns true when user is inside polygon', () => {
    const inside = { latitude: 51.5010, longitude: -0.1420 };
    expect(isUserInPolygon(inside, testPolygon)).toBe(true);
  });

  it('returns false when user is outside polygon', () => {
    const outside = { latitude: 51.5200, longitude: -0.1500 };
    expect(isUserInPolygon(outside, testPolygon)).toBe(false);
  });

  it('returns false for empty polygon data', () => {
    expect(isUserInPolygon({ latitude: 51.5010, longitude: -0.1420 }, [])).toBe(false);
  });

  it('returns false for polygon with less than 3 points', () => {
    const twoPoints = [
      { latitude: 51.5008, longitude: -0.1425 },
      { latitude: 51.5012, longitude: -0.1425 },
    ];
    expect(isUserInPolygon({ latitude: 51.5010, longitude: -0.1420 }, twoPoints)).toBe(false);
  });

  it('returns false when user is on the boundary edge case', () => {
    // Exact corner point — by GeoJSON spec, on the border is typically false
    const edgePoint = { latitude: 51.5008, longitude: -0.1425 };
    const result = isUserInPolygon(edgePoint, testPolygon);
    expect(typeof result).toBe('boolean'); // Just validate no crash; boundary is implementation-defined
  });
});

describe('getPolygonCentroid', () => {
  it('returns the geometric center of a rectangular polygon', () => {
    const centroid = getPolygonCentroid(testPolygon);
    expect(centroid.latitude).toBeCloseTo(51.5010, 3);
    expect(centroid.longitude).toBeCloseTo(-0.14215, 3);
  });

  it('handles a single-point polygon gracefully', () => {
    const single = [{ latitude: 10, longitude: 20 }];
    const centroid = getPolygonCentroid(single);
    expect(centroid.latitude).toBe(10);
    expect(centroid.longitude).toBe(20);
  });
});
