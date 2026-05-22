import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User as UserIcon, Mail, Shield } from 'lucide-react';

export default function Profile() {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const initials = user.name ? user.name.substring(0, 2).toUpperCase() : 'U';
  const personalInfo = {
    dob: user.dob || 'Not set',
    age: user.age || 'Not set',
    gender: user.gender || 'Not set',
    bloodGroup: user.bloodGroup || 'Not set',
    height: user.height || 'Not set',
    weight: user.weight || 'Not set',
    phone: user.phone || 'Not set',
    email: user.email || 'Not set'
  };

  return (
    <div className="p-8 max-w-4xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-2xl font-normal text-[#1C2B3A]">My Profile</h1>
        <p className="text-sm text-[#7A8FA6] mt-1">Manage your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden">
        {/* Banner */}
        <div className="h-32 bg-gradient-to-r from-[#1A6FB5] to-[#00C896]"></div>
        
        <div className="px-8 pb-8 pt-16 relative">
          {/* Avatar */}
          <div className="absolute -top-12 border-4 border-white w-24 h-24 bg-[#1C2B3A] rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-md">
            {initials}
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-[#1C2B3A]">{user.name}</h2>
            <p className="text-[#7A8FA6] mb-6">{user.role}</p>

            <div className="space-y-6 max-w-lg">
              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A6FB5] shadow-sm">
                  <UserIcon size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7A8FA6] uppercase tracking-wider">Full Name</p>
                  <p className="text-[#1C2B3A] font-medium mt-0.5">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A6FB5] shadow-sm">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7A8FA6] uppercase tracking-wider">Email Address</p>
                  <p className="text-[#1C2B3A] font-medium mt-0.5">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A6FB5] shadow-sm">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#7A8FA6] uppercase tracking-wider">Account Role</p>
                  <p className="text-[#1C2B3A] font-medium mt-0.5">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-[#0F1A2B] bg-[#0B1220] text-white p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <UserIcon size={18} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Personal Information</h3>
            <p className="text-xs text-white/60">Overview of patient details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Date of Birth</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.dob}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Age</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.age}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Gender</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.gender}</p>
          </div>

          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Blood Group</p>
            <span className="mt-2 inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              {personalInfo.bloodGroup}
            </span>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Height</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.height}</p>
          </div>
          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Weight</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.weight}</p>
          </div>

          <div>
            <p className="text-xs text-white/50 uppercase tracking-wider">Phone</p>
            <p className="mt-1 text-sm font-semibold">{personalInfo.phone}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-xs text-white/50 uppercase tracking-wider">Email</p>
            <p className="mt-1 text-sm font-semibold break-all">{personalInfo.email}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
