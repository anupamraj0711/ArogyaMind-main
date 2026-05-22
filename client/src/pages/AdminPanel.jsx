import React, { useState } from 'react';
import { StatusBadge, Modal } from '../components/shared';

/**
 * AdminPanel Component
 * Represents SCREEN 7: Dashboard for administrators
 */
export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('Specialists');
  const [showAddModal, setShowAddModal] = useState(false);

  const stats = [
    { label: 'Total Users', value: '1,248' },
    { label: 'Active Specialists', value: '45' },
    { label: "Today's Appointments", value: '82' },
    { label: 'System Logs Count', value: '8,439' },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FB] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#1C2B3A]">Admin Control Panel</h1>
          <button className="text-sm font-semibold text-[#1A6FB5] hover:underline">Return to Dashboard</button>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <div key={i} className="card p-4">
              <p className="text-sm text-[#7A8FA6] mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-[#1C2B3A]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto border-b border-[#E2E8F0] mb-6">
          {['Specialists', 'Appointments', 'System Logs', 'Permissions'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-3 px-6 font-medium whitespace-nowrap transition-colors ${activeTab === tab ? 'text-[#1A6FB5] border-b-2 border-[#1A6FB5]' : 'text-[#7A8FA6] hover:text-[#1C2B3A]'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="card overflow-x-auto">
          {activeTab === 'Specialists' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-[#1C2B3A]">Specialist Management</h2>
                <button onClick={() => setShowAddModal(true)} className="btn-accent text-sm">Add Specialist</button>
              </div>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#7A8FA6]">
                    <th className="pb-3 font-normal">Name</th>
                    <th className="pb-3 font-normal">Specialization</th>
                    <th className="pb-3 font-normal">Hospital</th>
                    <th className="pb-3 font-normal">Status</th>
                    <th className="pb-3 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-[#1C2B3A]">
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3 font-medium">Dr. Sarah Jenkins</td>
                    <td className="py-3">Neurologist</td>
                    <td className="py-3">City General Hospital</td>
                    <td className="py-3">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-[#E2E8F0] rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-[#00C896] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
                      </label>
                    </td>
                    <td className="py-3 text-right">
                      <button className="text-[#1A6FB5] hover:underline mr-3">Edit</button>
                      <button className="text-[#E84040] hover:underline">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Appointments' && (
            <div>
              <h2 className="font-bold text-[#1C2B3A] mb-4">Appointment Records</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#7A8FA6]">
                    <th className="pb-3 font-normal">Patient</th>
                    <th className="pb-3 font-normal">Doctor</th>
                    <th className="pb-3 font-normal">Date & Time</th>
                    <th className="pb-3 font-normal">Status</th>
                  </tr>
                </thead>
                <tbody className="text-[#1C2B3A]">
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3 font-medium">John Doe</td>
                    <td className="py-3">Dr. Sarah Jenkins</td>
                    <td className="py-3">Oct 24, 2026 10:30 AM</td>
                    <td className="py-3"><StatusBadge status="Scheduled" /></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'System Logs' && (
            <div>
              <h2 className="font-bold text-[#1C2B3A] mb-4">System Logs</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#7A8FA6]">
                    <th className="pb-3 font-normal">Log ID</th>
                    <th className="pb-3 font-normal">User</th>
                    <th className="pb-3 font-normal">Action</th>
                    <th className="pb-3 font-normal">Timestamp</th>
                    <th className="pb-3 font-normal">Outcome</th>
                  </tr>
                </thead>
                <tbody className="text-[#1C2B3A]">
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3 font-mono text-xs">#LOG-9281</td>
                    <td className="py-3">system_ai_engine</td>
                    <td className="py-3">analyze_symptoms</td>
                    <td className="py-3">Oct 22, 14:02:11</td>
                    <td className="py-3"><span className="text-[#00C896] font-bold">Success</span></td>
                  </tr>
                  <tr className="border-b border-[#E2E8F0]">
                    <td className="py-3 font-mono text-xs">#LOG-9280</td>
                    <td className="py-3">johndoe@example.com</td>
                    <td className="py-3">login_attempt</td>
                    <td className="py-3">Oct 22, 13:58:04</td>
                    <td className="py-3"><span className="text-[#E84040] font-bold">Failed</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Permissions' && (
            <div>
              <h2 className="font-bold text-[#1C2B3A] mb-4">Role Permission Matrix</h2>
              <table className="w-full text-center text-sm border border-[#E2E8F0]">
                <thead>
                  <tr className="border-b border-[#E2E8F0] bg-[#F4F7FB] text-[#7A8FA6]">
                    <th className="p-3 text-left font-semibold">Role / Module</th>
                    <th className="p-3 font-semibold">Symptoms AI</th>
                    <th className="p-3 font-semibold">Bookings</th>
                    <th className="p-3 font-semibold">Travel Maps</th>
                    <th className="p-3 font-semibold">Admin Settings</th>
                  </tr>
                </thead>
                <tbody className="text-[#1C2B3A]">
                  {['Patient', 'Care Physician', 'Specialist', 'Admin'].map((role, i) => (
                    <tr key={i} className="border-b border-[#E2E8F0]">
                      <td className="p-3 text-left font-medium border-r border-[#E2E8F0]">{role}</td>
                      <td className="p-3 text-lg border-r border-[#E2E8F0]">{role !== 'Admin' ? '✓' : '✗'}</td>
                      <td className="p-3 text-lg border-r border-[#E2E8F0]">{role !== 'Admin' ? '✓' : '✗'}</td>
                      <td className="p-3 text-lg border-r border-[#E2E8F0]">{role === 'Patient' ? '✓' : '✗'}</td>
                      <td className="p-3 text-lg">{role === 'Admin' ? '✓' : '✗'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Specialist">
        <form className="space-y-4" onSubmit={e => { e.preventDefault(); setShowAddModal(false); }}>
          <div>
            <label className="block text-sm text-[#7A8FA6] mb-1">Full Name</label>
            <input type="text" className="input-field" placeholder="Dr. First Last" required />
          </div>
          <div>
            <label className="block text-sm text-[#7A8FA6] mb-1">Specialization</label>
            <input type="text" className="input-field" placeholder="e.g. Cardiologist" required />
          </div>
          <div>
            <label className="block text-sm text-[#7A8FA6] mb-1">Hospital Affiliation</label>
            <input type="text" className="input-field" placeholder="e.g. City General" required />
          </div>
          <button type="submit" className="btn-primary w-full mt-2">Save Specialist</button>
        </form>
      </Modal>
    </div>
  );
}
