import React, { useState, useEffect, useCallback } from 'react';
import {
  Users, UserCheck, Calendar, DollarSign, Trash2, Shield,
  TrendingUp, Activity, ChevronDown, ChevronUp, Search,
  Star, AlertTriangle, CheckCircle, XCircle, RefreshCw,
} from 'lucide-react';
import {
  getAdminUsersAPI,
  getAdminDoctorsAPI,
  getAdminAppointmentsAPI,
  getAdminRevenueAPI,
  deleteAdminUserAPI,
} from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';

/* ─────────────── helpers ─────────────── */
const fmt = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusBadge = (s) => {
  const map = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-blue-100 text-blue-700',
    completed: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[s] || 'bg-slate-100 text-slate-600'}`}>
      {s}
    </span>
  );
};

const payBadge = (s) => (
  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
    {s || 'unpaid'}
  </span>
);

/* ─────────────── StatCard ─────────────── */
const StatCard = ({ icon: Icon, label, value, sub, color }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon size={22} className="text-white" />
    </div>
    <div>
      <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">{label}</p>
      <p className="text-2xl font-extrabold text-slate-800 mt-0.5">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

/* ─────────────── SectionHeader ─────────────── */
const SectionHeader = ({ icon: Icon, title, count }) => (
  <div className="flex items-center gap-2 mb-4">
    <Icon size={18} className="text-indigo-500" />
    <h2 className="text-base font-bold text-slate-800">{title}</h2>
    {count !== undefined && (
      <span className="ml-auto bg-indigo-50 text-indigo-600 text-xs font-semibold px-2.5 py-0.5 rounded-full">
        {count}
      </span>
    )}
  </div>
);

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════ */
const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [success, setSuccess]     = useState('');

  const [patients, setPatients]         = useState([]);
  const [doctors, setDoctors]           = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [revenue, setRevenue]           = useState({ totalRevenue: 0, monthlyBreakdown: [] });

  const [doctorSearch, setDoctorSearch]   = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [apptSearch, setApptSearch]       = useState('');
  const [apptFilter, setApptFilter]       = useState('all');

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, dRes, aRes, rRes] = await Promise.all([
        getAdminUsersAPI({ role: 'patient' }),
        getAdminDoctorsAPI(),
        getAdminAppointmentsAPI(),
        getAdminRevenueAPI(),
      ]);
      if (pRes.success) setPatients(pRes.data);
      if (dRes.success) setDoctors(dRes.data);
      if (aRes.success) setAppointments(aRes.data);
      if (rRes.success) setRevenue(rRes.data);
    } catch {
      setError('Failed to load admin data. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleDelete = async (userId, name) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"? This cannot be undone.`)) return;
    try {
      const res = await deleteAdminUserAPI(userId);
      if (res.success) {
        setSuccess(`User "${name}" deleted successfully.`);
        fetchAll();
      }
    } catch {
      setError('Failed to delete user. Try again.');
    }
  };

  /* filtered lists */
  const filteredDoctors = doctors.filter((d) =>
    [d.name, d.email, d.specialty].some((v) => v?.toLowerCase().includes(doctorSearch.toLowerCase()))
  );
  const filteredPatients = patients.filter((p) =>
    [p.name, p.email].some((v) => v?.toLowerCase().includes(patientSearch.toLowerCase()))
  );
  const filteredAppts = appointments.filter((a) => {
    const matchSearch = [
      a.patientId?.name, a.doctorId?.name, a.doctorId?.specialty,
    ].some((v) => v?.toLowerCase().includes(apptSearch.toLowerCase()));
    const matchFilter = apptFilter === 'all' || a.status === apptFilter;
    return matchSearch && matchFilter;
  });

  const completedCount = appointments.filter((a) => a.status === 'completed').length;
  const pendingCount   = appointments.filter((a) => a.status === 'pending').length;

  if (loading) return <LoadingSpinner fullPage />;

  /* ── TABS ── */
  const tabs = [
    { id: 'overview',      label: 'Overview' },
    { id: 'doctors',       label: `Doctors (${doctors.length})` },
    { id: 'patients',      label: `Patients (${patients.length})` },
    { id: 'appointments',  label: `Appointments (${appointments.length})` },
    { id: 'revenue',       label: 'Revenue' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Shield size={28} className="text-indigo-500" />
            Admin Dashboard
          </h1>
          <p className="text-slate-500 text-sm mt-1">Manage doctors, patients, appointments and revenue</p>
        </div>
        <button
          onClick={fetchAll}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 bg-white border border-slate-200 rounded-xl px-4 py-2 hover:border-indigo-300 transition"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      <Alert type="error"   message={error}   onClose={() => setError('')} />
      <Alert type="success" message={success} onClose={() => setSuccess('')} />

      {/* Tab bar */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === t.id
                ? 'bg-white text-indigo-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={UserCheck} label="Total Doctors"      value={doctors.length}      sub="Registered physicians"      color="bg-indigo-500" />
            <StatCard icon={Users}     label="Total Patients"     value={patients.length}     sub="Registered patients"        color="bg-violet-500" />
            <StatCard icon={Calendar}  label="Total Appointments" value={appointments.length} sub={`${completedCount} completed · ${pendingCount} pending`} color="bg-sky-500" />
            <StatCard icon={DollarSign} label="Total Revenue"     value={fmt(revenue.totalRevenue)} sub="From completed appointments" color="bg-emerald-500" />
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3 flex items-center gap-1.5">
                <Activity size={14} className="text-emerald-400" /> Appointment Breakdown
              </p>
              {['pending','confirmed','completed','cancelled'].map((s) => {
                const cnt = appointments.filter((a) => a.status === s).length;
                const pct = appointments.length ? Math.round((cnt / appointments.length) * 100) : 0;
                return (
                  <div key={s} className="mb-2">
                    <div className="flex justify-between text-xs text-slate-600 mb-0.5">
                      <span className="capitalize">{s}</span>
                      <span>{cnt} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s === 'completed' ? 'bg-emerald-400' : s === 'pending' ? 'bg-amber-400' : s === 'confirmed' ? 'bg-blue-400' : 'bg-red-400'}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3 flex items-center gap-1.5">
                <TrendingUp size={14} className="text-indigo-400" /> Top Earning Doctors
              </p>
              {[...doctors]
                .sort((a, b) => (b.stats?.earnings || 0) - (a.stats?.earnings || 0))
                .slice(0, 4)
                .map((d) => (
                  <div key={d._id} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                    <div>
                      <p className="text-xs font-semibold text-slate-700">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.specialty}</p>
                    </div>
                    <span className="text-xs font-bold text-emerald-600">{fmt(d.stats?.earnings || 0)}</span>
                  </div>
                ))}
              {doctors.length === 0 && <p className="text-xs text-slate-400">No doctor data yet.</p>}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium mb-3 flex items-center gap-1.5">
                <DollarSign size={14} className="text-violet-400" /> Recent Revenue (Monthly)
              </p>
              {revenue.monthlyBreakdown.slice(0, 5).map((m) => (
                <div key={m.month} className="flex justify-between items-center py-1.5 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-600">{m.month}</span>
                  <span className="text-xs font-bold text-slate-800">{fmt(m.revenue)}</span>
                </div>
              ))}
              {revenue.monthlyBreakdown.length === 0 && <p className="text-xs text-slate-400">No revenue data yet.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ── DOCTORS TAB ── */}
      {activeTab === 'doctors' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-4">
            <SectionHeader icon={UserCheck} title="All Doctors" count={filteredDoctors.length} />
            <div className="ml-auto relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name, email, specialty…"
                value={doctorSearch}
                onChange={(e) => setDoctorSearch(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Doctor','Specialty','Rating','Fee','Appointments','Earnings','Action'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDoctors.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-10 text-slate-400 text-sm">No doctors found.</td></tr>
                )}
                {filteredDoctors.map((d) => (
                  <tr key={d._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-800">{d.name}</p>
                      <p className="text-xs text-slate-400">{d.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{d.specialty || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="flex items-center gap-1 text-amber-500 font-semibold text-xs">
                        <Star size={12} fill="currentColor" /> {d.rating?.toFixed(1) || '0.0'}
                        <span className="text-slate-400 font-normal">({d.totalReviews || 0})</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700">{fmt(d.consultationFee || 0)}</td>
                    <td className="px-5 py-3.5">
                      <span className="font-semibold text-slate-700">{d.stats?.totalAppointments || 0}</span>
                      <span className="text-xs text-slate-400 ml-1">({d.stats?.completedAppointments || 0} done)</span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-emerald-600">{fmt(d.stats?.earnings || 0)}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(d._id, d.name)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── PATIENTS TAB ── */}
      {activeTab === 'patients' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-4">
            <SectionHeader icon={Users} title="All Patients" count={filteredPatients.length} />
            <div className="ml-auto relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email…"
                value={patientSearch}
                onChange={(e) => setPatientSearch(e.target.value)}
                className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient','Email','Phone','Joined','Action'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredPatients.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-10 text-slate-400 text-sm">No patients found.</td></tr>
                )}
                {filteredPatients.map((p) => (
                  <tr key={p._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{p.name}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.email}</td>
                    <td className="px-5 py-3.5 text-slate-500">{p.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-400 text-xs">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => handleDelete(p._id, p.name)}
                        className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── APPOINTMENTS TAB ── */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center gap-3">
            <SectionHeader icon={Calendar} title="All Appointments" count={filteredAppts.length} />
            <div className="ml-auto flex gap-3">
              <select
                value={apptFilter}
                onChange={(e) => setApptFilter(e.target.value)}
                className="border border-slate-200 rounded-lg text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search patient or doctor…"
                  value={apptSearch}
                  onChange={(e) => setApptSearch(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-56"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  {['Patient','Doctor','Specialty','Date & Time','Status','Payment'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppts.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-10 text-slate-400 text-sm">No appointments found.</td></tr>
                )}
                {filteredAppts.map((a) => (
                  <tr key={a._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{a.patientId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-700">{a.doctorId?.name || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-500 text-xs">{a.doctorId?.specialty || '—'}</td>
                    <td className="px-5 py-3.5 text-slate-600 text-xs">
                      {a.date ? new Date(a.date).toLocaleDateString() : '—'}
                      {a.time && <span className="ml-1 text-slate-400">@ {a.time}</span>}
                    </td>
                    <td className="px-5 py-3.5">{statusBadge(a.status)}</td>
                    <td className="px-5 py-3.5">{payBadge(a.paymentStatus)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── REVENUE TAB ── */}
      {activeTab === 'revenue' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard icon={DollarSign} label="Total Revenue"      value={fmt(revenue.totalRevenue)} sub="All time from paid appointments" color="bg-emerald-500" />
            <StatCard icon={Calendar}  label="Paid Appointments"  value={appointments.filter((a) => a.paymentStatus === 'paid').length} sub="Successfully processed" color="bg-sky-500" />
            <StatCard icon={TrendingUp} label="Avg per Appointment" value={
              appointments.filter((a) => a.paymentStatus === 'paid').length
                ? fmt(revenue.totalRevenue / appointments.filter((a) => a.paymentStatus === 'paid').length)
                : fmt(0)
            } sub="Average consultation fee" color="bg-violet-500" />
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100">
              <SectionHeader icon={TrendingUp} title="Monthly Revenue Breakdown" count={revenue.monthlyBreakdown.length} />
            </div>
            {revenue.monthlyBreakdown.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No revenue data available yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Month</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {revenue.monthlyBreakdown.map((m) => {
                    const maxRev = Math.max(...revenue.monthlyBreakdown.map((x) => x.revenue), 1);
                    const pct = Math.round((m.revenue / maxRev) * 100);
                    return (
                      <tr key={m.month} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-semibold text-slate-700">{m.month}</td>
                        <td className="px-5 py-3.5 text-emerald-600 font-bold">{fmt(m.revenue)}</td>
                        <td className="px-5 py-3.5 w-64">
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-400 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
