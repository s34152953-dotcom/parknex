import { NextRequest, NextResponse } from "next/server";

interface RealPlace {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distanceKm: number;
  driveTimeMin: number;
  trafficStatus: "fast" | "moderate" | "heavy";
  totalCapacity: number;
  availableSpaces: number;
  evChargersAvailable: number;
  status: "available" | "limited" | "full";
  googleMapsUrl: string;
}

function calculateHaversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const latStr = searchParams.get("lat");
  const lngStr = searchParams.get("lng");
  const radius = parseInt(searchParams.get("radius") || "15000", 10);

  if (!latStr || !lngStr) {
    return NextResponse.json({ error: "Missing lat and lng query params" }, { status: 400 });
  }

  const userLat = parseFloat(latStr);
  const userLng = parseFloat(lngStr);

  if (isNaN(userLat) || isNaN(userLng)) {
    return NextResponse.json({ error: "Invalid lat and lng values" }, { status: 400 });
  }

  try {
    // 1. Reverse geocode user's exact spot to get district & neighborhood name
    let userLocationName = "Current Location";
    let searchAreaTerms: string[] = [];

    try {
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${userLat}&lon=${userLng}&format=json&zoom=14`,
        {
          headers: {
            "User-Agent": "ParkNex-GPS-Parking/2.0",
          },
          signal: AbortSignal.timeout(4500),
        }
      );

      if (geoRes.ok) {
        const geoData = await geoRes.json();
        const addr = geoData.address || {};
        const suburb = addr.suburb || addr.neighbourhood || addr.village || addr.residential;
        const district = addr.county || addr.state_district || addr.city_district;
        const city = addr.city || addr.town || addr.municipality || addr.state;

        userLocationName = [suburb, district || city].filter(Boolean).join(", ") || "Current Location";

        if (suburb) searchAreaTerms.push(suburb);
        if (district) searchAreaTerms.push(district);
        if (city) searchAreaTerms.push(city);
      }
    } catch {}

    const primaryArea = searchAreaTerms[0] || searchAreaTerms[1] || "";
    const secondaryArea = searchAreaTerms[1] || searchAreaTerms[2] || "";

    const places: RealPlace[] = [];
    const seenNames = new Set<string>();

    const addPlace = (
      id: string,
      rawName: string,
      category: string,
      fullAddress: string,
      lat: number,
      lng: number
    ) => {
      const cleanName = rawName.trim();
      const lower = cleanName.toLowerCase();
      if (!cleanName || cleanName.length < 3 || seenNames.has(lower)) return;
      seenNames.add(lower);

      const distanceKm = calculateHaversine(userLat, userLng, lat, lng);
      const driveTimeMin = Math.max(2, Math.round((distanceKm / 22) * 60) + 1);

      // Realistic capacity & space simulation for the detected place
      const totalCapacity = Math.floor((distanceKm * 47) % 220) + 80;
      const availableSpaces = Math.max(
        0,
        Math.floor(totalCapacity * (0.2 + ((distanceKm * 17) % 55) / 100))
      );
      const evChargersAvailable = Math.floor(totalCapacity * 0.08);

      const status: "available" | "limited" | "full" =
        availableSpaces === 0
          ? "full"
          : availableSpaces < totalCapacity * 0.18
          ? "limited"
          : "available";

      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLng}&destination=${lat},${lng}&travelmode=driving`;

      places.push({
        id,
        name: cleanName,
        category,
        address: fullAddress,
        lat,
        lng,
        distanceKm,
        driveTimeMin,
        trafficStatus: distanceKm > 3.5 ? "moderate" : "fast",
        totalCapacity,
        availableSpaces,
        evChargersAvailable,
        status,
        googleMapsUrl,
      });
    };

    // 2. Parallel Nominatim queries for shopping malls, multiplexes, and parking hubs in the area
    const queries = [
      `https://nominatim.openstreetmap.org/search?format=json&q=mall+near+${encodeURIComponent(
        primaryArea || "shopping"
      )}&limit=8`,
      `https://nominatim.openstreetmap.org/search?format=json&q=shopping+near+${encodeURIComponent(
        secondaryArea || primaryArea
      )}&limit=8`,
      `https://nominatim.openstreetmap.org/search?format=json&q=parking+near+${encodeURIComponent(
        primaryArea || secondaryArea
      )}&limit=8`,
      `https://nominatim.openstreetmap.org/search?format=json&q=multiplex+near+${encodeURIComponent(
        primaryArea || secondaryArea
      )}&limit=6`,
      `https://nominatim.openstreetmap.org/search?format=json&q=commercial+near+${encodeURIComponent(
        primaryArea || secondaryArea
      )}&limit=6`,
    ];

    await Promise.allSettled(
      queries.map(async (url) => {
        try {
          const res = await fetch(url, {
            headers: { "User-Agent": "ParkNex-GPS-Parking/2.0" },
            signal: AbortSignal.timeout(4500),
          });
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
              for (const item of data) {
                const name =
                  item.name ||
                  (item.display_name ? item.display_name.split(",")[0] : "");
                const lat = parseFloat(item.lat);
                const lng = parseFloat(item.lon);
                if (name && !isNaN(lat) && !isNaN(lng)) {
                  const parts = (item.display_name || "").split(",");
                  const address = parts.slice(1, 4).join(",").trim() || "Local Area";
                  let cat = "Shopping & Parking";
                  if (item.type === "mall" || item.class === "shop") cat = "Shopping Mall Parking";
                  else if (item.type === "parking" || item.class === "amenity") cat = "Public Parking Deck";
                  else if (item.type === "cinema") cat = "Multiplex & Retail Parking";
                  else if (item.class === "building") cat = "Commercial Hub Parking";

                  addPlace(`nom-${item.place_id}`, name, cat, address, lat, lng);
                }
              }
            }
          }
        } catch {}
      })
    );

    // 3. Query Overpass API with wider radius as supplementary source
    try {
      const overpassQuery = `
        [out:json][timeout:5];
        (
          node["amenity"="parking"](around:${radius},${userLat},${userLng});
          node["shop"="mall"](around:${radius},${userLat},${userLng});
          node["shop"="supermarket"](around:${radius},${userLat},${userLng});
          way["shop"="mall"](around:${radius},${userLat},${userLng});
          way["amenity"="parking"](around:${radius},${userLat},${userLng});
        );
        out center 20;
      `;
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(
        overpassQuery
      )}`;
      const opRes = await fetch(overpassUrl, {
        headers: { "User-Agent": "ParkNex-GPS-Parking/2.0" },
        signal: AbortSignal.timeout(4500),
      });
      if (opRes.ok) {
        const opData = await opRes.json();
        if (opData.elements && Array.isArray(opData.elements)) {
          for (const el of opData.elements) {
            const tags = el.tags || {};
            const name = tags.name || tags["name:en"] || tags.operator;
            const lat = el.lat || (el.center && el.center.lat);
            const lng = el.lon || (el.center && el.center.lon);
            if (name && lat && lng) {
              const street = tags["addr:street"] || tags.street;
              const suburb = tags["addr:suburb"] || tags["addr:city"] || "";
              const address = [street, suburb].filter(Boolean).join(", ") || primaryArea || "Nearby Commercial Zone";
              let cat = "Shopping Mall Parking";
              if (tags.amenity === "parking") cat = "Public Parking Facility";
              else if (tags.shop === "supermarket") cat = "Retail Center Parking";

              addPlace(`osm-${el.id}`, name, cat, address, lat, lng);
            }
          }
        }
      }
    } catch {}

    // Sort strictly by closest geodesic distance
    places.sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,
      userLocationName,
      userCoords: { lat: userLat, lng: userLng },
      count: places.length,
      places,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to fetch nearby places", details: err.message },
      { status: 500 }
    );
  }
}
