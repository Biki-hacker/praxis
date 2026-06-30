import ExifReader from 'exifreader';

export interface PhotoMetadata {
  latitude: number | null;
  longitude: number | null;
  timestamp: number | null; // ms since epoch
  error?: string;
}

export function getDistanceInMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaPhi = (lat2 - lat1) * Math.PI / 180;
  const deltaLambda = (lon2 - lon1) * Math.PI / 180;

  const a = Math.sin(deltaPhi/2) * Math.sin(deltaPhi/2) +
            Math.cos(phi1) * Math.cos(phi2) *
            Math.sin(deltaLambda/2) * Math.sin(deltaLambda/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // distance in meters
}

export async function extractPhotoMetadata(file: File): Promise<PhotoMetadata> {
  try {
    const tags = await ExifReader.load(file);
    
    let lat: number | null = null;
    let lng: number | null = null;
    let timestamp: number | null = null;

    if (tags['GPSLatitude'] && tags['GPSLongitude']) {
      const latVal = tags['GPSLatitude'].value;
      const lngVal = tags['GPSLongitude'].value;
      
      const latRef = tags['GPSLatitudeRef']?.value?.[0] || 'N';
      const lngRef = tags['GPSLongitudeRef']?.value?.[0] || 'E';

      if (Array.isArray(latVal) && latVal.length >= 3) {
        const deg = typeof latVal[0] === 'number' ? latVal[0] : Number(latVal[0]);
        const min = typeof latVal[1] === 'number' ? latVal[1] : Number(latVal[1]);
        const sec = typeof latVal[2] === 'number' ? latVal[2] : Number(latVal[2]);
        lat = deg + min / 60 + sec / 3600;
        if (latRef === 'S' || latRef === 's') {
          lat = -lat;
        }
      } else if (typeof latVal === 'number') {
        lat = latVal;
      }

      if (Array.isArray(lngVal) && lngVal.length >= 3) {
        const deg = typeof lngVal[0] === 'number' ? lngVal[0] : Number(lngVal[0]);
        const min = typeof lngVal[1] === 'number' ? lngVal[1] : Number(lngVal[1]);
        const sec = typeof lngVal[2] === 'number' ? lngVal[2] : Number(lngVal[2]);
        lng = deg + min / 60 + sec / 3600;
        if (lngRef === 'W' || lngRef === 'w') {
          lng = -lng;
        }
      } else if (typeof lngVal === 'number') {
        lng = lngVal;
      }
    }

    const dateTag = tags['DateTimeOriginal'] || tags['DateTimeDigitized'] || tags['DateTime'];
    if (dateTag && dateTag.description) {
      const parts = dateTag.description.split(' ');
      if (parts.length === 2) {
        const datePart = parts[0].replace(/:/g, '-');
        const timePart = parts[1];
        const dt = new Date(`${datePart}T${timePart}`);
        if (!isNaN(dt.getTime())) {
          timestamp = dt.getTime();
        }
      }
    }

    if (!timestamp) {
      for (const key of Object.keys(tags)) {
        if (key.toLowerCase().includes('date') && tags[key]?.description) {
          const dt = new Date(tags[key].description);
          if (!isNaN(dt.getTime())) {
            timestamp = dt.getTime();
            break;
          }
        }
      }
    }

    return { latitude: lat, longitude: lng, timestamp };
  } catch (err: any) {
    console.warn('Exif parsing failed:', err);
    return { latitude: null, longitude: null, timestamp: null, error: err.message };
  }
}
