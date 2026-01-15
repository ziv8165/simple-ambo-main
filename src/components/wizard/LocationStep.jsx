import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import FeedbackBubble from '@/components/feedback/FeedbackBubble';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const customIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function DraggableMarker({ position, setPosition }) {
  const [draggable] = useState(true);

  const eventHandlers = {
    dragend(e) {
      const marker = e.target;
      const newPos = marker.getLatLng();
      setPosition([newPos.lat, newPos.lng]);
    },
  };

  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      icon={customIcon}
    />
  );
}

export default function LocationStep({ data, updateData, adminFeedback = {} }) {
  const [mapCenter, setMapCenter] = useState([32.0853, 34.7818]); // Tel Aviv default
  const [markerPosition, setMarkerPosition] = useState(
    data.displayLocation 
      ? [data.displayLocation.lat, data.displayLocation.lon] 
      : [32.0853, 34.7818]
  );
  const [geocoding, setGeocoding] = useState(false);

  // Set city to Tel Aviv automatically
  useEffect(() => {
    if (!data.city) {
      updateData({ city: 'תל אביב-יפו' });
    }
  }, []);

  // Geocode address when realAddress changes
  useEffect(() => {
    if (data.realAddress) {
      geocodeAddress();
    }
  }, [data.realAddress]);

  const geocodeAddress = async () => {
    const address = `${data.realAddress}, תל אביב-יפו, Israel`;
    setGeocoding(true);
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
      );
      const results = await response.json();
      
      if (results && results.length > 0) {
        const { lat, lon } = results[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setMapCenter(newPos);
        setMarkerPosition(newPos);
        updateData({
          displayLocation: {
            lat: parseFloat(lat),
            lon: parseFloat(lon),
            radius: 400
          }
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    } finally {
      setGeocoding(false);
    }
  };

  const handleZoneChange = (zoneValue) => {
    updateData({ zone: zoneValue });
  };

  const handleMarkerMove = (newPos) => {
    setMarkerPosition(newPos);
    updateData({
      displayLocation: {
        lat: newPos[0],
        lon: newPos[1],
        radius: 400
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 
        className="text-5xl font-bold text-[#4A2525] mb-4"
        style={{ fontFamily: 'League Spartan, sans-serif' }}
      >
        איפה נמצא הנכס?
      </h1>
      
      <p className="text-lg text-[#4A2525]/70 mb-12">
        הכתובת שלכם תשותף עם האורחים רק אחרי שהם מבצעים את ההזמנה.
      </p>

      {adminFeedback.location && (
        <div className="mb-6">
          <FeedbackBubble feedback={adminFeedback.location} />
        </div>
      )}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-[#4A2525] mb-2">
            מדינה / אזור
          </label>
          <Input
            value="ישראל - IL"
            disabled
            className="text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A2525] mb-2">
            כתובת
          </label>
          <Input
            value={data.realAddress}
            onChange={(e) => updateData({ realAddress: e.target.value })}
            placeholder="רחוב ומספר בית"
            className="text-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#4A2525] mb-2">
              כניסה (אם רלוונטי)
            </label>
            <Input
              placeholder="כניסה א׳"
              className="text-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#4A2525] mb-2">
              דירה, יחידת דיור וכו׳ (אם רלוונטי)
            </label>
            <Input
              placeholder="דירה 5"
              className="text-lg"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A2525] mb-2">
            עיר
          </label>
          <Input
            value="תל אביב-יפו"
            disabled
            className="text-lg bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A2525] mb-2">
            שכונה
          </label>
          <Input
            value={data.neighborhood}
            onChange={(e) => updateData({ neighborhood: e.target.value })}
            placeholder="נווה צדק"
            className="text-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#4A2525] mb-2">
            אזור תמחור (משפיע על הערכת המחיר)
          </label>
          <select
            value={data.zone || ''}
            onChange={(e) => handleZoneChange(e.target.value)}
            className="w-full p-3 bg-white border border-gray-200 rounded-md text-lg"
          >
            <option value="" disabled>בחר אזור...</option>
            <option value="tlv_heart">לב העיר</option>
            <option value="old_north">הצפון הישן</option>
            <option value="ramat_aviv">רמת אביב</option>
            <option value="south_jaffa">פלורנטין / דרום ת״א</option>
          </select>
        </div>

        {/* Interactive Map */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Navigation className="w-5 h-5 text-[#BC5D34]" />
              <h3 className="font-semibold text-[#4A2525]">אשרו את המיקום על המפה</h3>
            </div>
            {geocoding && (
              <span className="text-sm text-[#4A2525]/60">מאתר כתובת...</span>
            )}
          </div>
          
          <p className="text-sm text-[#4A2525]/70 mb-4">
            גררו את הסמן למיקום המדויק של הנכס שלכם, או לחצו על המפה כדי להזיז אותו.
          </p>

          <div className="rounded-2xl overflow-hidden border-2 border-[#E6DDD0] h-96">
            <MapContainer
              center={mapCenter}
              zoom={16}
              style={{ height: '100%', width: '100%' }}
              key={`${mapCenter[0]}-${mapCenter[1]}`}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <DraggableMarker 
                position={markerPosition} 
                setPosition={handleMarkerMove}
              />
            </MapContainer>
          </div>

          <div className="mt-4 p-4 bg-[#E6DDD0]/20 rounded-xl">
            <p className="text-xs text-[#4A2525]/70">
              💡 <strong>חשוב:</strong> המיקום המדויק יוצג לאורחים רק אחרי שיאשרו הזמנה. 
              במפה הציבורית יוצג מיקום משוער ברדיוס של 400 מטר.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}