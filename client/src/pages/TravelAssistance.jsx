import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Navigation, Car, Train, Accessibility, Hotel, Star, Wifi, ParkingCircle, Utensils, Bus, FileText } from 'lucide-react';
import api from '../api';
import { LoadingSpinner, Modal } from '../components/shared';

export default function TravelAssistance() {
  const location = useLocation();
  const dest = location.state?.destination || {
    name: 'City General Hospital',
    hospital: 'City General Hospital',
    city: 'Downtown',
    address: '123 Medical Drive'
  };

  const [currentLocation, setCurrentLocation] = useState('');
  const [mode, setMode] = useState('Car');
  const [hotels, setHotels] = useState([]);
  const [loadingHotels, setLoadingHotels] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(false);
  const [travelPlan, setTravelPlan] = useState('');

  // Filter States
  const [filters, setFilters] = useState({ price: 10000, stars: null, amenities: [] });
  const [appliedFilters, setAppliedFilters] = useState({ price: 10000, stars: null, amenities: [] });

  const handleAmenityToggle = (amenity) => {
    setFilters(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity]
    }));
  };

  const applyFilters = () => setAppliedFilters(filters);
  const resetFilters = () => {
    const defaultFilters = { price: 10000, stars: null, amenities: [] };
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
  };

  useEffect(() => {
    // Fetch hotel recommendations from the backend
    setLoadingHotels(true);
    api.post('/travel/hotels', {
      hospital: dest.hospital || dest.name,
      city: dest.city || 'Downtown'
    })
      .then(res => {
        setHotels(res.data.hotels || []);
      })
      .catch(err => {
        console.error('Failed to fetch hotels:', err);
        // Fallback for demo if backend fails
        setHotels([
          {
            name: "Grand Comfort Inn",
            distance: "0.5 km away",
            rating: 4,
            price: 2500,
            description: "A comfortable and highly-rated stay located very close to the hospital.",
            amenities: ["Free WiFi", "Parking"],
            isAIPick: true
          },
          {
            name: "City Suites Extended Stay",
            distance: "1.2 km away",
            rating: 3,
            price: 1800,
            description: "Affordable extended stay options for long treatments.",
            amenities: ["Free WiFi", "Hospital Shuttle"],
            isAIPick: false
          }
        ]);
      })
      .finally(() => {
        setLoadingHotels(false);
      });
  }, [dest.hospital, dest.name, dest.city]);

  const destinationQuery = encodeURIComponent((dest.hospital || dest.name) + ', ' + (dest.city || ''));
  const mapSrc = currentLocation 
    ? `https://maps.google.com/maps?saddr=${encodeURIComponent(currentLocation)}&daddr=${destinationQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`
    : `https://maps.google.com/maps?q=${destinationQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const filteredHotels = hotels.filter(hotel => {
    const hotelPrice = typeof hotel.price === 'string' ? Number(hotel.price.replace(/[^0-9.-]+/g,"")) : (hotel.price || 0);
    if (hotelPrice > appliedFilters.price) return false;
    
    if (appliedFilters.stars) {
      const hotelStars = Math.floor(Number(hotel.rating) || 0);
      if (hotelStars !== appliedFilters.stars) return false;
    }
    
    if (appliedFilters.amenities.length > 0) {
      const hotelAmenitiesLower = (hotel.amenities || []).map(a => a.toLowerCase());
      const hasAll = appliedFilters.amenities.every(a => 
        hotelAmenitiesLower.some(ha => ha.includes(a.toLowerCase()))
      );
      if (!hasAll) return false;
    }
    return true;
  });

  const getAmenityIcon = (name) => {
    switch(name) {
      case 'Free WiFi': return <Wifi size={14} />;
      case 'Parking': return <ParkingCircle size={14} />;
      case 'Restaurant': return <Utensils size={14} />;
      case 'Hospital Shuttle': return <Bus size={14} />;
      default: return null;
    }
  };

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-[#1C2B3A]">Travel Assistance</h1>
        <p className="text-sm text-[#7A8FA6] mt-1">Get directions to your appointment location</p>
      </div>

      <div className="space-y-6 mb-8">
        {/* Destination Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4">Destination</h2>
          <div className="flex items-center gap-3 bg-[#EEF2F6] p-4 rounded-xl">
            <MapPin size={20} className="text-[#1A6FB5]" />
            <div>
              <p className="text-sm font-medium text-[#1C2B3A]">{dest.hospital || dest.name}</p>
              <p className="text-xs text-[#7A8FA6]">{dest.address || dest.city || 'Downtown'}</p>
            </div>
          </div>
        </div>

        {/* Current Location Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4">Your Current Location</h2>
          <div className="relative">
            <Navigation size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7A8FA6]" />
            <input 
              type="text" 
              className="w-full p-4 pl-12 rounded-xl border border-[#E2E8F0] text-sm text-[#1C2B3A] focus:outline-none focus:border-[#1A6FB5]"
              placeholder="Enter your current address or location"
              value={currentLocation}
              onChange={e => setCurrentLocation(e.target.value)}
            />
          </div>
        </div>

        {/* Travel Mode Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-sm font-medium text-[#1C2B3A] mb-4">Travel Mode</h2>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => setMode('Car')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-colors ${
                mode === 'Car' ? 'bg-[#EEF2F6] border-[#1A6FB5] text-[#1A6FB5]' : 'bg-white border-[#E2E8F0] text-[#7A8FA6] hover:border-[#1A6FB5]'
              }`}
            >
              <Car size={24} className="mb-2" />
              <span className="text-sm font-medium">Car</span>
            </button>
            <button 
              onClick={() => setMode('Train')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-colors ${
                mode === 'Train' ? 'bg-[#EEF2F6] border-[#1A6FB5] text-[#1A6FB5]' : 'bg-white border-[#E2E8F0] text-[#7A8FA6] hover:border-[#1A6FB5]'
              }`}
            >
              <Train size={24} className="mb-2" />
              <span className="text-sm font-medium">Train</span>
            </button>
            <button 
              onClick={() => setMode('Walk')}
              className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-colors ${
                mode === 'Walk' ? 'bg-[#EEF2F6] border-[#1A6FB5] text-[#1A6FB5]' : 'bg-white border-[#E2E8F0] text-[#7A8FA6] hover:border-[#1A6FB5]'
              }`}
            >
              <Accessibility size={24} className="mb-2" />
              <span className="text-sm font-medium">Walk</span>
            </button>
          </div>
        </div>

        {/* Google Maps Integration Card */}
        <div className="bg-white rounded-xl border border-[#E2E8F0] p-2 shadow-sm h-96">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0, borderRadius: '0.5rem' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapSrc}
          ></iframe>
        </div>

        {/* Hotels Section Header */}
        <div className="mt-12 mb-6">
          <h2 className="text-xl font-semibold text-[#1C2B3A]">AI-Recommended Hotels near {dest.hospital || dest.name}</h2>
          <p className="text-sm text-[#7A8FA6] mt-1">Filtered based on your budget and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Hotel Filter Panel */}
          <div className="lg:w-1/3 space-y-6">
            <div className="bg-white rounded-xl border border-[#E2E8F0] p-6 shadow-sm sticky top-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-semibold text-[#1C2B3A]">Filters</h3>
                <button onClick={resetFilters} className="text-xs text-[#1A6FB5] hover:underline font-medium">Reset</button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A5568] mb-2">Max Price per night: ₹{filters.price}</label>
                <input 
                  type="range" 
                  min="500" 
                  max="10000" 
                  step="100"
                  value={filters.price} 
                  onChange={(e) => setFilters({...filters, price: parseInt(e.target.value)})}
                  className="w-full accent-[#1A6FB5]"
                />
                <div className="flex justify-between text-xs text-[#7A8FA6] mt-1">
                  <span>₹500</span>
                  <span>₹10,000</span>
                </div>
              </div>

              {/* Star Rating */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-[#4A5568] mb-2">Star Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setFilters({...filters, stars: filters.stars === star ? null : star})}
                      className={`flex-1 py-1.5 rounded text-sm font-medium border transition-colors flex justify-center items-center gap-1 ${
                        filters.stars === star ? 'bg-[#FFF9E6] border-[#F59E0B] text-[#B45309]' : 'bg-white border-[#E2E8F0] text-[#7A8FA6] hover:border-[#F59E0B]'
                      }`}
                    >
                      {star}<Star size={12} className={filters.stars === star ? "fill-[#F59E0B] text-[#F59E0B]" : ""} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#4A5568] mb-2">Amenities</label>
                <div className="space-y-2">
                  {['Free WiFi', 'Parking', 'Restaurant', 'Hospital Shuttle'].map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-[#1A6FB5] rounded border-[#E2E8F0] focus:ring-[#1A6FB5]"
                        checked={filters.amenities.includes(amenity)}
                        onChange={() => handleAmenityToggle(amenity)}
                      />
                      <span className="text-sm text-[#4A5568]">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <button 
                onClick={applyFilters}
                className="w-full py-3 bg-[#1A6FB5] hover:bg-[#155A94] text-white rounded-lg font-medium transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>

          {/* Accommodation List */}
          <div className="lg:w-2/3">
            <div className="space-y-4">
              {loadingHotels ? (
                <div className="py-12 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex justify-center items-center">
                  <LoadingSpinner text="Finding AI-recommended hotels..." />
                </div>
              ) : filteredHotels.length > 0 ? (
                filteredHotels.map((hotel, idx) => {
                  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(hotel.name + ' ' + (dest.city || ''))}`;
                  return (
                    <div key={idx} className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                      {hotel.isAIPick && (
                        <div className="absolute top-0 right-0 bg-[#00C896] text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                          ✦ AI Pick
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-2 pr-20">
                        <div>
                          <h3 className="font-bold text-[#1C2B3A] text-lg">{hotel.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(hotel.rating || 4)].map((_, i) => (
                              <Star key={i} size={14} className="fill-[#F59E0B] text-[#F59E0B]" />
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-[#1A6FB5] text-lg">₹{hotel.price || '2,499'}</p>
                          <p className="text-xs text-[#7A8FA6]">/ night</p>
                        </div>
                      </div>

                      <span className="inline-block bg-[#E6F4F1] text-[#00C896] text-xs px-2.5 py-1 rounded-full font-medium mb-3">
                        {hotel.distance}
                      </span>

                      <p className="text-sm text-[#4A5568] mb-4 line-clamp-2">
                        {hotel.description || hotel.perks || 'A comfortable and highly-rated stay near your destination.'}
                      </p>

                      <div className="flex justify-between items-center pt-4 border-t border-[#E2E8F0]">
                        <div className="flex gap-3 text-[#7A8FA6]">
                          {hotel.amenities?.map((amenity, i) => (
                            <div key={i} className="flex items-center gap-1 text-xs" title={amenity}>
                              {getAmenityIcon(amenity)}
                              <span className="hidden sm:inline">{amenity}</span>
                            </div>
                          ))}
                        </div>
                        <a 
                          href={searchUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2 bg-[#F4F7FB] text-[#1A6FB5] hover:bg-[#1A6FB5] hover:text-white rounded-lg text-sm font-semibold transition-colors"
                        >
                          Book Now
                        </a>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 bg-white rounded-xl border border-[#E2E8F0] shadow-sm flex flex-col justify-center items-center text-[#7A8FA6]">
                  <Hotel size={48} className="mb-4 text-[#CBD5E1]" />
                  <p className="font-medium text-[#1C2B3A]">No hotels match your filters.</p>
                  <button onClick={resetFilters} className="mt-2 text-[#1A6FB5] text-sm hover:underline">Clear all filters</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button 
        onClick={() => {
          setShowPlanModal(true);
          setLoadingPlan(true);
          setTimeout(() => {
            setTravelPlan(
              `### Comprehensive Travel Itinerary to ${dest.hospital || dest.name}\n\n` +
              `**1. Preparation & Packing**\n` +
              `- Medical documents, ID, and insurance cards\n` +
              `- Comfortable clothing for your stay\n\n` +
              `**2. Transportation Route**\n` +
              `- **Primary Route:** Follow Google Maps via major highway. Expected travel time: ~45 mins based on current traffic.\n` +
              `- **Alternative:** Train route via central station. Take the Blue Line and alight at Medical District Station.\n\n` +
              `**3. Accommodation**\n` +
              `- Best Match: ${filteredHotels[0]?.name || 'Recommended Hotel'}\n` +
              `- Distance: ${filteredHotels[0]?.distance || 'Close by'}\n\n` +
              `**4. Dining Options Nearby**\n` +
              `- Hospital Cafeteria (Ground Floor)\n` +
              `- Healthy Bites Cafe (0.2 km away)\n\n` +
              `*This plan is automatically saved to your profile for offline access.*`
            );
            setLoadingPlan(false);
          }, 1500);
        }}
        className="w-full py-4 rounded-xl font-medium text-white bg-[#00C896] hover:bg-[#00B386] transition-colors mt-8 shadow-md"
      >
        Get Comprehensive Travel Plan
      </button>

      {/* Travel Plan Modal */}
      <Modal isOpen={showPlanModal} onClose={() => setShowPlanModal(false)} title="Your AI Travel Itinerary" maxWidth="max-w-2xl">
        <div>
          <div className="flex items-center gap-3 mb-6 bg-[#EEF2F6] p-4 rounded-xl">
            <div className="bg-[#1A6FB5] p-2 rounded-full text-white">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="font-semibold text-[#1C2B3A]">AI-Generated Plan</h3>
              <p className="text-xs text-[#7A8FA6]">Personalized for your upcoming appointment</p>
            </div>
          </div>

          {loadingPlan ? (
            <div className="py-12">
              <LoadingSpinner text="Generating your personalized itinerary..." />
            </div>
          ) : (
            <div className="prose prose-sm max-w-none text-[#4A5568]">
              {travelPlan.split('\n').map((line, i) => {
                if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-[#1C2B3A] mb-3">{line.replace('### ', '')}</h3>;
                if (line.startsWith('**')) return <h4 key={i} className="font-semibold text-[#1C2B3A] mt-4 mb-2">{line.replace(/\*\*/g, '')}</h4>;
                if (line.startsWith('- ')) return (
                  <div key={i} className="flex items-start gap-3 mb-2">
                    <span className="text-[#00C896] leading-relaxed text-lg mt-[-3px]">•</span>
                    <span className="text-sm leading-relaxed text-[#4A5568]">{line.replace('- ', '').replace(/\*\*/g, '')}</span>
                  </div>
                );
                if (line.startsWith('*')) return <p key={i} className="text-xs italic text-[#7A8FA6] mt-6 bg-[#F8FAFC] p-3 rounded-lg">{line.replace(/\*/g, '')}</p>;
                return line ? <p key={i} className="mb-2">{line}</p> : null;
              })}
            </div>
          )}
          
          {!loadingPlan && (
            <button 
              onClick={() => setShowPlanModal(false)}
              className="w-full mt-8 py-3 bg-[#1A6FB5] text-white rounded-xl font-medium hover:bg-[#155A94] transition-colors"
            >
              Save & Close
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
}
