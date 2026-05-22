import React, { useState, useEffect } from 'react';
import { SpecialistCard, EmptyState, LoadingSpinner } from '../components/shared';
import api from '../api';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function SpecialistRecommendation() {
  const [searchParams] = useSearchParams();
  const initialSpecialty = searchParams.get('specialty') || 'All';

  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSpec, setFilterSpec] = useState(initialSpecialty);
  const [filterLocation, setFilterLocation] = useState('All Locations');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortBy, setSortBy] = useState('Rating');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (initialSpecialty && initialSpecialty !== 'All') params.specialty = initialSpecialty;

    api.get('/specialists', { params })
      .then(res => {
        setSpecialists(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, [initialSpecialty]);

  const handleBook = (spec) => {
    navigate('/schedule-appointment', { state: { specialist: spec } });
  };

  const departments = ['All', ...new Set(specialists.map(s => s.specialty))];
  const locations = ['All Locations', ...new Set(specialists.map(s => s.city).filter(Boolean))];

  const filtered = specialists
    .filter(s => filterSpec === 'All' || s.specialty === filterSpec)
    .filter(s => filterLocation === 'All Locations' || s.city === filterLocation)
    .filter(s => !availableOnly || s.online_available)
    .sort((a, b) => {
      if (sortBy === 'Rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'Fee') return (a.consultation_fee || 0) - (b.consultation_fee || 0);
      return 0; 
    });

  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-[#1C2B3A]">Recommended Specialists</h1>
        <span className="text-xs font-bold text-[#00C896] bg-[#00C896]/10 px-2 py-1 rounded">✦ Real Data</span>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between border border-[#E2E8F0]">
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <select className="input-field py-1.5 w-full md:w-48 text-sm" value={filterSpec} onChange={e => setFilterSpec(e.target.value)}>
            {departments.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <select className="input-field py-1.5 w-full md:w-48 text-sm" value={filterLocation} onChange={e => setFilterLocation(e.target.value)}>
            {locations.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          
          <label className="flex items-center gap-2 text-sm text-[#1C2B3A] cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded text-[#1A6FB5] focus:ring-[#1A6FB5]" checked={availableOnly} onChange={e => setAvailableOnly(e.target.checked)} />
            Online Consultations Only
          </label>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-sm text-[#7A8FA6] whitespace-nowrap">Sort by:</span>
          <select className="input-field py-1.5 w-full md:w-40 text-sm" value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="Rating">Rating</option>
            <option value="Fee">Lowest Fee</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="mt-12"><LoadingSpinner text="Finding the best specialists..." /></div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(spec => (
            <SpecialistCard 
              key={spec._id}
              name={spec.user?.name || spec.doctor_id}
              specialty={spec.specialty}
              hospital={spec.hospital}
              city={spec.city}
              experience_years={spec.experience_years}
              rating={spec.rating}
              consultation_fee={spec.consultation_fee}
              available_timings={spec.available_timings}
              online_available={spec.online_available}
              onBook={() => handleBook({
                name: spec.user?.name || spec.doctor_id,
                specialty: spec.specialty,
                hospital: spec.hospital,
                city: spec.city,
                _id: spec._id
              })}
            />
          ))}
        </div>
      ) : (
        <EmptyState message="No specialists found matching your criteria." />
      )}
    </div>
  );
}
