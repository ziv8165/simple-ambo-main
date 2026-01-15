import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import L from 'leaflet';
import { MapPin, Bed, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import 'leaflet/dist/leaflet.css';

export default function ListingsMap({ listings = [] }) {
  const [selectedListing, setSelectedListing] = useState(null);

  // Center map on Israel (Tel Aviv area)
  const defaultCenter = [32.0853, 34.7818];
  const defaultZoom = 12;

  // Create custom marker icon
  const createCustomIcon = (isSelected) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div class="relative">
          <div class="w-10 h-10 rounded-full ${isSelected ? 'bg-[#E3C766]' : 'bg-[#422525]'} shadow-lg flex items-center justify-center transition-all hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
          </div>
          <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] ${isSelected ? 'border-t-[#E3C766]' : 'border-t-[#422525]'} border-l-transparent border-r-transparent"></div>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });
  };

  const listingsWithCoords = listings.filter(
    listing => listing.displayLocation?.lat && listing.displayLocation?.lon
  );

  if (listingsWithCoords.length === 0) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">אין דירות להצגה על המפה</p>
      </div>
    );
  }

  return (
    <div className="w-full h-[600px] rounded-xl overflow-hidden shadow-lg" dir="rtl">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap'
        />

        {listingsWithCoords.map((listing) => (
          <Marker
            key={listing.id}
            position={[listing.displayLocation.lat, listing.displayLocation.lon]}
            icon={createCustomIcon(selectedListing?.id === listing.id)}
            eventHandlers={{
              click: () => setSelectedListing(listing),
            }}
          >
            <Popup className="custom-popup" minWidth={280}>
              <div className="p-2" dir="rtl">
                <div className="relative h-32 mb-3 rounded-lg overflow-hidden">
                  <img
                    src={listing.photos?.[0] || 'https://via.placeholder.com/400'}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-medium text-[#1A1A1A] mb-1 text-right">
                  {listing.title || `דירה ב${listing.city}`}
                </h3>
                <p className="text-sm text-[#422525]/70 mb-2 text-right">
                  {listing.neighborhood}, {listing.city}
                </p>
                <div className="flex items-center gap-3 text-xs text-[#422525]/70 mb-3">
                  <div className="flex items-center gap-1">
                    <Bed className="w-3 h-3" />
                    <span>{listing.bedrooms} חדרים</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Maximize2 className="w-3 h-3" />
                    <span>{listing.areaSqMeters} מ"ר</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-semibold text-[#1A1A1A]">
                    ₪{listing.pricePerNight?.toLocaleString()}
                    <span className="text-xs font-normal text-[#422525]/60"> / לילה</span>
                  </span>
                  <Button size="sm" asChild className="bg-[#E3C766] hover:bg-[#d4b85a] text-[#1A1A1A]">
                    <Link to={createPageUrl(`ListingDetails?id=${listing.id}`)}>
                      צפה בדירה
                    </Link>
                  </Button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style>{`
        .custom-marker {
          background: none !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          padding: 0 !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
          width: 280px !important;
        }
        .leaflet-popup-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
}