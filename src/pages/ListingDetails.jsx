import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Circle, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Home, Maximize2, Sofa, Layers, Wifi, Wind, Car, WashingMachine, Microwave, Tv, Laptop, TreeDeciduous, Droplets, Shirt, Bed, Sun, Moon, Flame, Shield, AlertTriangle, Package, Coffee, Waves, Calendar, MapPin, ChevronLeft, User, Check, Clock, MessageCircle, Bed as BedIcon, PawPrint, Cigarette, Eye, Bath, Flag } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import ReportListingModal from '@/components/support/ReportListingModal';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ImageGallery from '@/components/listings/ImageGallery';
import PaymentDialog from '@/components/payment/PaymentDialog';
import CalendarAvailability from '@/components/calendar/CalendarAvailability';
import ContactHostButton from '@/components/chat/ContactHostButton';
import ListingMessageHistory from '@/components/chat/ListingMessageHistory';
import AmenityCapsule from '@/components/listings/AmenityCapsule';
import StickyBookingCard from '@/components/booking/StickyBookingCard';
import 'leaflet/dist/leaflet.css';

const amenityIcons = {
  'HAIR_DRYER': Wind,
  'SHAMPOO': Droplets,
  'BODY_SOAP': Droplets,
  'HOT_WATER': Flame,
  'ESSENTIALS': Package,
  'HANGERS': Shirt,
  'BED_LINENS': Bed,
  'EXTRA_PILLOWS_BLANKETS': Bed,
  'ROOM_DARKENING_SHADES': Moon,
  'IRON': Shirt,
  'CLOTHES_STORAGE': Home,
  'WASHER': WashingMachine,
  'DRYER': Wind,
  'TV': Tv,
  'AC': Wind,
  'HEATING_CENTRAL': Flame,
  'HEATING_SPLIT': Flame,
  'SMOKE_ALARM': AlertTriangle,
  'CARBON_MONOXIDE_ALARM': AlertTriangle,
  'FIRE_EXTINGUISHER': Shield,
  'FIRST_AID_KIT': Package,
  'WIFI': Laptop,
  'DEDICATED_WORKSPACE': Laptop,
  'REFRIGERATOR': Home,
  'MICROWAVE': Microwave,
  'KETTLE': Coffee,
  'COOKING_BASICS': Coffee,
  'DISHES_SILVERWARE': Coffee,
  'PRIVATE_PATIO_BALCONY': TreeDeciduous,
  'BEACH_ACCESS': Waves,
  'LONG_TERM_STAYS_ALLOWED': Calendar
};

const amenityLabels = {
  'HAIR_DRYER': 'Hair Dryer',
  'SHAMPOO': 'Shampoo',
  'BODY_SOAP': 'Body Soap',
  'HOT_WATER': 'Hot Water',
  'ESSENTIALS': 'Essentials',
  'HANGERS': 'Hangers',
  'BED_LINENS': 'Bed Linens',
  'EXTRA_PILLOWS_BLANKETS': 'Extra Pillows & Blankets',
  'ROOM_DARKENING_SHADES': 'Room Darkening Shades',
  'IRON': 'Iron',
  'CLOTHES_STORAGE': 'Clothes Storage',
  'WASHER': 'Washing Machine',
  'DRYER': 'Dryer',
  'TV': 'TV',
  'AC': 'Air Conditioning',
  'HEATING_CENTRAL': 'Central Heating',
  'HEATING_SPLIT': 'Split Heating',
  'SMOKE_ALARM': 'Smoke Alarm',
  'CARBON_MONOXIDE_ALARM': 'Carbon Monoxide Alarm',
  'FIRE_EXTINGUISHER': 'Fire Extinguisher',
  'FIRST_AID_KIT': 'First Aid Kit',
  'WIFI': 'Wifi',
  'DEDICATED_WORKSPACE': 'Dedicated Workspace',
  'REFRIGERATOR': 'Refrigerator',
  'MICROWAVE': 'Microwave',
  'KETTLE': 'Kettle',
  'COOKING_BASICS': 'Cooking Basics',
  'DISHES_SILVERWARE': 'Dishes & Silverware',
  'PRIVATE_PATIO_BALCONY': 'Private Patio/Balcony',
  'BEACH_ACCESS': 'Beach Access',
  'LONG_TERM_STAYS_ALLOWED': 'Long Term Stays Allowed (28+ days)'
};

const categoryLabels = {
  'bathroom': 'חדר רחצה',
  'bedroom_laundry': 'חדר שינה וכביסה',
  'entertainment': 'בידור',
  'heating_cooling': 'חימום וקירור',
  'home_safety': 'בטיחות בבית',
  'internet': 'אינטרנט ועבודה',
  'kitchen': 'מטבח',
  'location': 'מיקום ונוף',
  'services': 'שירותים'
};

const amenityTabs = {
  'HOME': ['bathroom', 'bedroom_laundry', 'entertainment', 'internet', 'kitchen'],
  'PROPERTY': ['heating_cooling', 'location', 'services'],
  'SAFETY': ['home_safety']
};

const tabLabels = {
  'HOME': 'HOME',
  'PROPERTY': 'PROPERTY',
  'SAFETY': 'SAFETY'
};

const furnishedLabels = {
  'FULL': 'Fully Furnished',
  'PARTIAL': 'Partially Furnished',
  'NONE': 'Unfurnished'
};

export default function ListingDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const listingId = searchParams.get('id');

  const [showDescriptionModal, setShowDescriptionModal] = useState(false);
  const [showAmenitiesModal, setShowAmenitiesModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [show360TourModal, setShow360TourModal] = useState(false);

  const { data: listing, isLoading, error } = useQuery({
    queryKey: ['listing', listingId],
    queryFn: async () => {
      const listings = await base44.entities.Listing.filter({ id: listingId });
      return listings[0];
    },
    enabled: !!listingId
  });

  const { data: host } = useQuery({
    queryKey: ['host', listing?.hostId],
    queryFn: async () => {
      const users = await base44.entities.User.filter({ id: listing.hostId });
      return users[0];
    },
    enabled: !!listing?.hostId
  });

  if (!listingId) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <p className="text-[#4A2525]">מזהה מודעה חסר</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <p className="text-[#4A2525]">טוען...</p>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <p className="text-[#4A2525]">מודעה לא נמצאה</p>
      </div>
    );
  }

  const listingData = {
    ...listing,
    beds: listing.beds || 2,
    bathrooms: listing.bathrooms || 1,
    guests: listing.guests || 4,
    pricePerNight: listing.pricePerNight || 0,
    hostName: host?.full_name || host?.email?.split('@')[0] || 'Host',
    hostVerified: true,
    hostResponseTime: '1 hour',
    has360Tour: !!listing.photo360,
    matchScore: listing.matchScore || null,
    amenities_categorized: listing.amenities_categorized || {},
    missing_critical_amenities: listing.missing_critical_amenities || [],
    security: listing.security || {},
    photos: listing.photos || []
  };

  const VIBE_LABELS_ENGLISH = {
    VEGAN: 'Vegan 🌱',
    QUIET: 'Quiet 🤫',
    SOCIAL: 'Social 🥳',
    WFH: 'Work From Home 💻',
    CLEAN: 'Clean ✨',
    STUDENT_VIBE: 'Student Vibe 🎓',
    SPIRITUAL: 'Spiritual 🧘‍♀️',
    FLOWING: 'Flowing 🌊',
    PARTY_LOVER: 'Party Lover 🎉'
  };

  const allAmenities = listingData.amenities_categorized ?
    Object.values(listingData.amenities_categorized).flat() : [];
  const topAmenities = allAmenities;
  const totalAmenitiesCount = allAmenities.length;

  return (
    <div className="min-h-screen bg-[#FDFCF8] relative pb-24 md:pb-0" dir="rtl">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#BC5D34]/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] bg-[#E6DDD0]/40 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-[300px] h-[300px] bg-[#BC5D34]/15 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-12">
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#4A2525] hover:text-[#BC5D34] transition-colors mb-4 mt-4"
          >
            <ChevronLeft className="w-5 h-5 rotate-180" />
            <span className="text-sm font-medium">חזור</span>
          </button>

          {/* Image Gallery Collage */}
          <div className="mb-6 relative">
            <ImageGallery 
              images={listingData.photos} 
              photo360={listingData.photo360}
              title={listingData.title || listingData.city}
              onView360Tour={() => setShow360TourModal(true)}
            />
            {listingData.matchScore && (
              <div className="absolute top-4 right-4 bg-white rounded-full px-4 py-2 shadow-lg z-20">
                <span className="text-[#4A2525] font-bold text-sm" style={{ fontFamily: 'League Spartan, sans-serif' }}>
                  {listingData.matchScore}% Match
                </span>
              </div>
            )}
          </div>

          {/* Header Section */}
          <div className="mb-8">
            <h1
              className="text-4xl font-bold text-[#4A2525] mb-2"
              style={{ fontFamily: 'League Spartan, sans-serif' }}
            >
              {listingData.neighborhood}, {listingData.city}
            </h1>

            {listingData.availableFrom && listingData.availableTo && (
              <p className="text-sm text-[#4A2525]/70 mb-3">
                Available: {new Date(listingData.availableFrom).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(listingData.availableTo).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            )}

            {listingData.vibeTags && listingData.vibeTags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {listingData.vibeTags.map((tag) => (
                  <Badge
                    key={tag}
                    className="px-4 py-1.5 text-sm bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 border-0"
                  >
                    {VIBE_LABELS_ENGLISH[tag] || tag}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-[#4A2525]/70">
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>4 Guests</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <BedIcon className="w-4 h-4" />
                <span>{listingData.bedrooms} Bedrooms</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Sofa className="w-4 h-4" />
                <span>{listingData.beds} Beds</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{listingData.bathrooms} Bathroom</span>
              </div>
            </div>
          </div>

          {/* Desktop Layout: Main Content + Sticky Sidebar */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Main Content */}
            <div className="flex-1 space-y-6">
              {/* The Host Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E6DDD0]/50">
                <h2
                  className="text-2xl font-bold text-[#4A2525] mb-6"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  Meet Your Host
                </h2>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-full bg-[#BC5D34] flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-[#4A2525]">{listingData.hostName}</h3>
                      {listingData.hostVerified && (
                        <Badge className="bg-blue-100 text-blue-700 border-0 flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Verified Host
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-[#4A2525]/70">
                      <Clock className="w-4 h-4" />
                      <span>Avg. response: {listingData.hostResponseTime}</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  className="w-full border-[#4A2525] text-[#4A2525] hover:bg-[#4A2525] hover:text-white"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message Host
                </Button>
              </div>

              {/* House Rules & Check-in */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E6DDD0]/50">
                <h2
                  className="text-2xl font-bold text-[#4A2525] mb-6"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  Important Information
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#BC5D34]/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#BC5D34]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A2525] mb-1">Check-in</h3>
                      <p className="text-sm text-[#4A2525]/70">
                        After 3:00 PM
                        {listingData.check_in_method && (
                          <span className="block mt-1">
                            {listingData.check_in_method === 'KEYPAD_LOCKBOX' && '🔑 Self check-in with keypad'}
                            {listingData.check_in_method === 'MEET_THE_HOST' && '👤 Meet the host in person'}
                            {listingData.check_in_method === 'BUILDING_STAFF' && '🏢 Check-in with building staff'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#BC5D34]/10 flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-5 h-5 text-[#BC5D34]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A2525] mb-1">Check-out</h3>
                      <p className="text-sm text-[#4A2525]/70">Before 11:00 AM</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#BC5D34]/10 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-[#BC5D34]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-[#4A2525] mb-1">Cancellation Policy</h3>
                      <p className="text-sm text-[#4A2525]/70">
                        {listingData.cancellationPolicy === 'FLEXIBLE' && 'Free cancellation up to 24 hours before check-in'}
                        {listingData.cancellationPolicy === 'MODERATE' && 'Free cancellation up to 5 days before check-in'}
                        {listingData.cancellationPolicy === 'STRICT' && 'Free cancellation up to 7 days before check-in for 50% refund'}
                      </p>
                    </div>
                  </div>

                  {listingData.other_things && (
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#BC5D34]/10 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="w-5 h-5 text-[#BC5D34]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#4A2525] mb-1">Important to Know</h3>
                        <p className="text-sm text-[#4A2525]/70">{listingData.other_things}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Preview */}
              {listingData.summary && (
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E6DDD0]/50">
                  <h2
                    className="text-2xl font-bold text-[#4A2525] mb-4"
                    style={{ fontFamily: 'League Spartan, sans-serif' }}
                  >
                    About This Place
                  </h2>
                  <div className="text-[#4A2525]/80 leading-relaxed space-y-3">
                    <p>{listingData.summary}</p>
                    {listingData.the_space && <p>{listingData.the_space}</p>}
                  </div>
                  <Button
                    variant="ghost"
                    className="text-[#4A2525] hover:text-[#BC5D34] p-0 h-auto font-medium mt-4"
                    onClick={() => setShowDescriptionModal(true)}
                  >
                    Read more <ChevronLeft className="w-4 h-4 mr-1 rotate-180" />
                  </Button>
                </div>
              )}

              {/* Amenities Section */}
              <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-[#E6DDD0]/50">
                <h2
                  className="text-3xl font-bold text-[#4A2525] mb-8"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  What This Place Offers
                </h2>
                <div className="flex flex-wrap gap-3">
                  {topAmenities.slice(0, 8).map((amenityKey) => {
                    const IconComponent = amenityIcons[amenityKey];
                    const category = Object.keys(listingData.amenities_categorized || {}).find(
                      (cat) => listingData.amenities_categorized[cat]?.includes(amenityKey)
                    );
                    return IconComponent ? (
                      <AmenityCapsule
                        key={amenityKey}
                        icon={IconComponent}
                        label={amenityLabels[amenityKey]}
                        category={category}
                      />
                    ) : null;
                  })}
                </div>
                {totalAmenitiesCount > 8 && (
                  <Button
                    variant="ghost"
                    className="text-[#4A2525] hover:text-[#BC5D34] p-0 h-auto font-medium mt-4"
                    onClick={() => setShowAmenitiesModal(true)}
                  >
                    Show all {totalAmenitiesCount} amenities <ChevronLeft className="w-4 h-4 mr-1 rotate-180" />
                  </Button>
                )}

                {/* Safety Features */}
                <h3 className="text-xl font-medium text-[#4A2525] mb-3 mt-6">Safety & Security</h3>
                <div className="flex flex-wrap gap-3">
                  {listingData.security?.hasMamad && (
                    <AmenityCapsule icon={Shield} label="Shelter (Mamad)" category="home_safety" />
                  )}
                  {listingData.security?.hasBars && (
                    <AmenityCapsule icon={Shield} label="Window Bars" category="home_safety" />
                  )}
                  {listingData.has_security_cameras && (
                    <AmenityCapsule icon={Eye} label="Security Cameras" category="home_safety" />
                  )}
                  {listingData.petsAllowed !== undefined && (
                    <AmenityCapsule
                      icon={PawPrint}
                      label={listingData.petsAllowed ? 'Pets Allowed' : 'No Pets'}
                      category="services"
                    />
                  )}
                  {listingData.smokingPolicy && (
                    <AmenityCapsule
                      icon={Cigarette}
                      label={
                        listingData.smokingPolicy === 'PROHIBITED' ? 'No Smoking' :
                        listingData.smokingPolicy === 'BALCONY_ONLY' ? 'Smoking (Balcony Only)' :
                        'Smoking Allowed'
                      }
                      category="services"
                    />
                  )}
                </div>

                {/* Other Features */}
                <h3 className="text-xl font-medium text-[#4A2525] mb-3 mt-6">Property Features</h3>
                <div className="flex flex-wrap gap-3">
                  {listingData.has_elevator && (
                    <AmenityCapsule icon={Layers} label="Elevator" category="services" />
                  )}
                  {listingData.furnishedStatus && (
                    <AmenityCapsule
                      icon={Sofa}
                      label={furnishedLabels[listingData.furnishedStatus]}
                      category="services"
                    />
                  )}
                  {listingData.waterHeating && (
                    <AmenityCapsule
                      icon={Flame}
                      label={listingData.waterHeating === 'SOLAR' ? 'Solar Water Heating' : 'Electric Water Heating'}
                      category="services"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Sticky Sidebar (Desktop) */}
            <div className="hidden md:block md:w-96">
              <div className="sticky top-24">
                <StickyBookingCard
                  listing={listing}
                  onBook={() => setShowPaymentModal(true)}
                />
              </div>
            </div>
          </div>

          {/* Map Section - Full Width */}
          {listingData.displayLocation && (
            <div className="mb-12 bg-white/70 backdrop-blur-sm rounded-3xl p-6 border border-[#E6DDD0]/50">
              <h2
                className="text-2xl font-bold text-[#4A2525] mb-6"
                style={{ fontFamily: 'League Spartan, sans-serif' }}
              >
                Location
              </h2>
              <div className="h-[400px] rounded-2xl overflow-hidden">
                <MapContainer
                  center={[listingData.displayLocation.lat, listingData.displayLocation.lon]}
                  zoom={15}
                  style={{ width: '100%', height: '100%' }}
                  scrollWheelZoom={true}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  />
                  <Circle
                    center={[listingData.displayLocation.lat, listingData.displayLocation.lon]}
                    radius={listingData.displayLocation.radius || 200}
                    pathOptions={{ color: '#BC5D34', fillColor: '#BC5D34', fillOpacity: 0.2 }}
                  />
                  <Marker position={[listingData.displayLocation.lat, listingData.displayLocation.lon]}>
                    <Popup>Approximate Location</Popup>
                  </Marker>
                </MapContainer>
              </div>
              <p className="text-sm text-[#4A2525]/60 mt-4 text-center">
                <MapPin className="w-4 h-4 inline mr-1" />
                Approximate location - exact address shown after booking
              </p>
            </div>
          )}

          {/* Sticky Footer (Mobile) */}
          <div className="fixed bottom-0 left-0 right-0 md:hidden bg-white/95 backdrop-blur-lg border-t border-[#E6DDD0] p-4 z-50">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xl font-bold text-[#4A2525]">
                  ₪{listingData.pricePerNight?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-[#4A2525]/60">per month</div>
              </div>
              <Button
                onClick={() => setShowPaymentModal(true)}
                className="flex-1 py-6 text-lg font-bold rounded-2xl"
                style={{
                  background: '#BC5D34',
                  fontFamily: 'League Spartan, sans-serif',
                  color: 'white'
                }}
              >
                Book The One
              </Button>
            </div>
          </div>

          {/* Description Modal */}
          <Dialog open={showDescriptionModal} onOpenChange={setShowDescriptionModal}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto" dir="rtl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-medium text-right">About This Place</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 mt-4">
                {listingData.summary && (
                  <div>
                    <p className="text-[#422525]/80 leading-relaxed text-right">{listingData.summary}</p>
                  </div>
                )}
                {listingData.the_space && (
                  <div>
                    <h3 className="text-xl font-medium text-[#1A1A1A] mb-3 text-right">The Space</h3>
                    <p className="text-[#422525]/80 leading-relaxed text-right">{listingData.the_space}</p>
                  </div>
                )}
                {listingData.guest_access && (
                  <div>
                    <h3 className="text-xl font-medium text-[#1A1A1A] mb-3 text-right">Guest Access</h3>
                    <p className="text-[#422525]/80 leading-relaxed text-right">{listingData.guest_access}</p>
                  </div>
                )}
                {listingData.other_things && (
                  <div>
                    <h3 className="text-xl font-medium text-[#1A1A1A] mb-3 text-right">Other Things to Note</h3>
                    <p className="text-[#422525]/80 leading-relaxed text-right">{listingData.other_things}</p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Amenities Modal */}
          <Dialog open={showAmenitiesModal} onOpenChange={setShowAmenitiesModal}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" dir="ltr">
              <DialogHeader>
                <DialogTitle
                  className="text-2xl font-bold text-left text-gray-400"
                  style={{ fontFamily: 'League Spartan, sans-serif' }}
                >
                  AMENITIES
                </DialogTitle>
              </DialogHeader>

              <Tabs defaultValue="HOME" className="mt-6">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  {Object.keys(amenityTabs).map((tabKey) => (
                    <TabsTrigger
                      key={tabKey}
                      value={tabKey}
                      className="text-sm font-medium data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#4A2525] rounded-none"
                      style={{ fontFamily: 'League Spartan, sans-serif' }}
                    >
                      {tabLabels[tabKey]}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {Object.entries(amenityTabs).map(([tabKey, categories]) => (
                  <TabsContent key={tabKey} value={tabKey} className="mt-0">
                    <div className="flex flex-wrap gap-3">
                      {categories.map((category) => {
                        const items = listingData.amenities_categorized?.[category] || [];
                        return items.map((amenityKey) => {
                          const IconComponent = amenityIcons[amenityKey];
                          return IconComponent ? (
                            <AmenityCapsule
                              key={amenityKey}
                              icon={IconComponent}
                              label={amenityLabels[amenityKey]}
                              category={category}
                            />
                          ) : null;
                        });
                      })}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>

              {listingData.missing_critical_amenities && listingData.missing_critical_amenities.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Not Included</h3>
                  <div className="flex flex-wrap gap-3">
                    {listingData.missing_critical_amenities.map((amenityKey) => {
                      const IconComponent = amenityIcons[amenityKey];
                      return IconComponent ? (
                        <div key={amenityKey} className="inline-flex items-center gap-3 bg-gray-50 rounded-full border border-gray-200 px-4 py-2 opacity-60">
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4 text-gray-400" />
                          </div>
                          <span className="text-sm text-gray-500 line-through">{amenityLabels[amenityKey]}</span>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          <PaymentDialog
            open={showPaymentModal}
            onClose={() => setShowPaymentModal(false)}
            listing={listing}
          />

          <ReportListingModal
            listing={listing}
            open={showReportModal}
            onClose={() => setShowReportModal(false)}
          />

          {/* 360 Tour Modal */}
          <Dialog open={show360TourModal} onOpenChange={setShow360TourModal}>
            <DialogContent className="max-w-6xl h-[90vh]">
              <DialogHeader>
                <DialogTitle>סיור וירטואלי 360°</DialogTitle>
              </DialogHeader>
              <div className="w-full h-[calc(100%-60px)]">
                <iframe
                  src={listingData.photo360}
                  title="Virtual 360 Tour"
                  width="100%"
                  height="100%"
                  allowFullScreen
                  frameBorder="0"
                  className="rounded-lg"
                ></iframe>
              </div>
            </DialogContent>
          </Dialog>

        </div>
      </div>
    </div>
  );
}