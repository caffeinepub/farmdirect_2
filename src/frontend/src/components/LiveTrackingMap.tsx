import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapPin, Navigation, WifiOff } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { DeliveryType, OrderStatus } from "../backend.d";
import {
  useGetOrderLocations,
  useUpdateOrderLocation,
} from "../hooks/useQueries";

// Fix Leaflet default icon issue
(L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl =
  undefined;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface LiveTrackingMapProps {
  orderId: bigint;
  isSeller: boolean;
  deliveryType: DeliveryType;
  orderStatus: OrderStatus;
}

function haversineDistanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function secondsAgo(timestampNs: bigint | undefined): number | null {
  if (!timestampNs) return null;
  const nowMs = Date.now();
  const thenMs = Number(timestampNs) / 1_000_000;
  return Math.floor((nowMs - thenMs) / 1000);
}

function createEmojiIcon(emoji: string, color: string): L.DivIcon {
  return L.divIcon({
    html: `<div style="
      width: 38px;
      height: 38px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${color};
      border: 3px solid #fff;
      box-shadow: 0 2px 8px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <span style="transform: rotate(45deg); font-size: 16px; display: block; line-height: 30px; text-align: center;">${emoji}</span>
    </div>`,
    className: "",
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -40],
  });
}

export default function LiveTrackingMap({
  orderId,
  isSeller,
}: LiveTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const sellerMarkerRef = useRef<L.Marker | null>(null);
  const buyerMarkerRef = useRef<L.Marker | null>(null);
  const pathLineRef = useRef<L.Polyline | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const lastSentRef = useRef<number>(0);

  const [isSharing, setIsSharing] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);
  const [myLat, setMyLat] = useState<number | null>(null);
  const [myLng, setMyLng] = useState<number | null>(null);

  const { data: locations } = useGetOrderLocations(orderId);
  const updateLocation = useUpdateOrderLocation();

  // Derived location values
  const sellerLat = locations?.sellerLat ?? null;
  const sellerLng = locations?.sellerLng ?? null;
  const buyerLat = locations?.buyerLat ?? null;
  const buyerLng = locations?.buyerLng ?? null;
  const sellerUpdatedAt = locations?.sellerLocationUpdatedAt;
  const buyerUpdatedAt = locations?.buyerLocationUpdatedAt;

  const sellerSecondsAgo = secondsAgo(sellerUpdatedAt);
  const buyerSecondsAgo = secondsAgo(buyerUpdatedAt);

  const distance =
    sellerLat !== null &&
    sellerLng !== null &&
    buyerLat !== null &&
    buyerLng !== null
      ? haversineDistanceKm(sellerLat, sellerLng, buyerLat, buyerLng)
      : null;

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    const map = L.map(mapRef.current, {
      zoom: 12,
      center: [20.5937, 78.9629], // Default: center of India
      zoomControl: true,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    leafletMapRef.current = map;

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update markers and path when locations change
  useEffect(() => {
    const map = leafletMapRef.current;
    if (!map) return;

    const sellerIcon = createEmojiIcon("🌾", "#2d7a3a");
    const buyerIcon = createEmojiIcon("🛒", "#1a56db");

    if (sellerLat !== null && sellerLng !== null) {
      const pos: L.LatLngTuple = [sellerLat, sellerLng];
      if (sellerMarkerRef.current) {
        sellerMarkerRef.current.setLatLng(pos);
      } else {
        sellerMarkerRef.current = L.marker(pos, { icon: sellerIcon })
          .addTo(map)
          .bindPopup("🌾 Farmer");
      }
    }

    if (buyerLat !== null && buyerLng !== null) {
      const pos: L.LatLngTuple = [buyerLat, buyerLng];
      if (buyerMarkerRef.current) {
        buyerMarkerRef.current.setLatLng(pos);
      } else {
        buyerMarkerRef.current = L.marker(pos, { icon: buyerIcon })
          .addTo(map)
          .bindPopup("🛒 Buyer");
      }
    }

    // Draw or update path line between them
    if (
      sellerLat !== null &&
      sellerLng !== null &&
      buyerLat !== null &&
      buyerLng !== null
    ) {
      const latlngs: L.LatLngTuple[] = [
        [sellerLat, sellerLng],
        [buyerLat, buyerLng],
      ];
      if (pathLineRef.current) {
        pathLineRef.current.setLatLngs(latlngs);
      } else {
        pathLineRef.current = L.polyline(latlngs, {
          color: "#2d7a3a",
          weight: 2,
          opacity: 0.5,
          dashArray: "6, 8",
        }).addTo(map);
      }
      // Fit map to show both markers
      map.fitBounds(L.latLngBounds(latlngs), { padding: [40, 40] });
    } else if (sellerLat !== null && sellerLng !== null) {
      map.setView([sellerLat, sellerLng], 14);
    } else if (buyerLat !== null && buyerLng !== null) {
      map.setView([buyerLat, buyerLng], 14);
    }
  }, [sellerLat, sellerLng, buyerLat, buyerLng]);

  const sendLocation = useCallback(
    (lat: number, lng: number) => {
      const now = Date.now();
      if (now - lastSentRef.current < 10_000) return; // throttle to 10s
      lastSentRef.current = now;
      updateLocation.mutate({ orderId, lat, lng });
    },
    [orderId, updateLocation],
  );

  const startSharing = useCallback(() => {
    if (!navigator.geolocation) {
      setShareError("Geolocation is not supported by your browser.");
      return;
    }
    setShareError(null);
    setIsSharing(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMyLat(latitude);
        setMyLng(longitude);
        sendLocation(latitude, longitude);
      },
      (err) => {
        setShareError(
          err.code === 1
            ? "Location permission denied. Please allow location access."
            : "Unable to get your location. Please try again.",
        );
        setIsSharing(false);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
    );
  }, [sendLocation]);

  const stopSharing = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsSharing(false);
    setMyLat(null);
    setMyLng(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const formatAge = (secs: number | null) => {
    if (secs === null) return "No data";
    if (secs < 60) return `${secs}s ago`;
    return `${Math.floor(secs / 60)}m ago`;
  };

  return (
    <div className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-1">
          <Navigation className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-sm text-foreground">
            Live Location Tracking
          </h3>
        </div>
        <p className="text-xs text-muted-foreground">
          {isSeller
            ? "Share your location so the buyer can track delivery."
            : "Track the seller's location. Share yours so they can see you too."}
        </p>
      </div>

      {/* Map container */}
      <div
        ref={mapRef}
        style={{ height: 260 }}
        className="w-full relative z-0"
        data-ocid="tracking.map_marker"
      />

      {/* Stats row */}
      {(sellerLat !== null || buyerLat !== null) && (
        <div className="grid grid-cols-3 gap-2 px-4 pt-3">
          {distance !== null && (
            <div className="bg-primary/8 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="font-display font-bold text-sm text-primary">
                {distance < 1
                  ? `${Math.round(distance * 1000)}m`
                  : `${distance.toFixed(1)}km`}
              </p>
            </div>
          )}
          {sellerLat !== null && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">🌾 Seller</p>
              <p className="text-xs font-semibold text-foreground">
                {formatAge(sellerSecondsAgo)}
              </p>
            </div>
          )}
          {buyerLat !== null && (
            <div className="bg-muted/50 rounded-lg px-3 py-2 text-center">
              <p className="text-xs text-muted-foreground">🛒 Buyer</p>
              <p className="text-xs font-semibold text-foreground">
                {formatAge(buyerSecondsAgo)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* My current location (when sharing) */}
      {isSharing && myLat !== null && myLng !== null && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-primary/10 rounded-lg px-3 py-2">
          <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
          <p className="text-xs text-primary font-medium truncate">
            {myLat.toFixed(5)}, {myLng.toFixed(5)}
          </p>
        </div>
      )}

      {/* Error */}
      {shareError && (
        <div className="mx-4 mt-3 flex items-center gap-2 bg-destructive/10 rounded-lg px-3 py-2">
          <WifiOff className="w-3.5 h-3.5 text-destructive flex-shrink-0" />
          <p className="text-xs text-destructive">{shareError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-4">
        {!isSharing ? (
          <button
            type="button"
            onClick={startSharing}
            className="w-full h-11 rounded-xl bg-primary text-primary-foreground font-semibold text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            data-ocid="tracking.share_button"
          >
            <Navigation className="w-4 h-4" />
            Share My Location
          </button>
        ) : (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 bg-primary/10 rounded-xl px-3 h-11">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
              <span className="text-sm text-primary font-semibold">
                Sharing...
              </span>
            </div>
            <button
              type="button"
              onClick={stopSharing}
              className="h-11 px-4 rounded-xl bg-destructive/10 text-destructive font-semibold text-sm flex items-center gap-2 transition-all hover:bg-destructive/20"
              data-ocid="tracking.stop_button"
            >
              <WifiOff className="w-3.5 h-3.5" />
              Stop
            </button>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-3">
          Both parties must share their location for tracking to work.
        </p>
      </div>
    </div>
  );
}
