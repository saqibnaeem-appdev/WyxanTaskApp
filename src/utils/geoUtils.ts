import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import { point, polygon } from '@turf/helpers';
import { Coordinate } from '@mocks/routeData';

/**
 * Checks if a coordinate is strictly inside a defined polygon using Turf.js
 * @param location Current user coordinate
 * @param polygonData Array of coordinates defining the polygon bounds
 */
export const isUserInPolygon = (location: Coordinate, polygonData: Coordinate[]): boolean => {
  if (!polygonData || polygonData.length < 3) return false;

  // Turf expects polygon coordinates to have matching start and end points
  // so we duplicate the first point at the end to close the linear ring
  const ring = polygonData.map((coord) => [coord.longitude, coord.latitude]);
  if (
    ring[0][0] !== ring[ring.length - 1][0] ||
    ring[0][1] !== ring[ring.length - 1][1]
  ) {
    ring.push([...ring[0]]);
  }

  try {
    const pt = point([location.longitude, location.latitude]);
    const poly = polygon([ring]);
    return booleanPointInPolygon(pt, poly);
  } catch (error) {
    console.error('Error validating polygon intersection:', error);
    return false;
  }
};

/**
 * Helper to get the centroid coordinate of a polygon, useful for camera focusing
 */
export const getPolygonCentroid = (polygonData: Coordinate[]): Coordinate => {
  const lats = polygonData.map(p => p.latitude);
  const lngs = polygonData.map(p => p.longitude);
  
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  
  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2
  };
};
