import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Calendar, Video, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?specialty=${searchQuery}`);
    } else {
      navigate('/doctors');
    }
  };

  const steps = [
    {
      icon: <Search className="h-6 w-6 text-primary-500" />,
      title: 'Find Your Doctor',
      desc: 'Browse verified specialists, read patient reviews, and filter by rate or location.',
    },
    {
      icon: <Calendar className="h-6 w-6 text-primary-500" />,
      title: 'Schedule a Slot',
      desc: 'Pick a convenient date and time that fits your lifestyle. Get auto-confirmed.',
    },
    {
      icon: <Video className="h-6 w-6 text-primary-500" />,
      title: 'Attend Video Consultation',
      desc: 'Connect securely using our built-in video consult tool. No third-party downloads.',
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 bg-primary-50 text-primary-600 font-semibold text-xs rounded-full">
              <UserCheck size={12} />
              <span>Certified Online Healthcare Specialists</span>
            </span>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-none">
              Your Health, <br />
              <span className="text-primary-500">Connected Anywhere.</span>
            </h1>
            <p className="text-slate-600 text-lg max-w-lg leading-relaxed">
              Book medical consultations and join secure HD video calls with leading doctors in minutes. All prescriptions and medical histories, protected in one dashboard.
            </p>

            {/* Search Input Widget */}
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3.5 text-slate-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search specialty e.g. Cardiology, Pediatrics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm shadow-sm"
                />
              </div>
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-600 text-white font-semibold px-6 py-3 rounded-xl transition shadow-md shadow-primary-500/10 flex items-center justify-center space-x-1"
              >
                <span>Find Doctors</span>
              </button>
            </form>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-tr from-primary-100 to-indigo-100 rounded-3xl -rotate-2 transform scale-95 opacity-50 blur-lg"></div>
            <div className="relative bg-white border border-slate-100 rounded-3xl p-6 shadow-xl flex flex-col space-y-6">
              <div className="flex items-center space-x-4 border-b border-slate-100 pb-4">
                <div className="h-12 w-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-lg">
                  CS
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">CareSync Care Desk</h3>
                  <p className="text-xs text-slate-400">Available 24/7 for urgent consultations</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="block text-2xl font-bold text-primary-600">50+</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Specialists</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="block text-2xl font-bold text-primary-600">10k+</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Consultations</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl">
                  <span className="block text-2xl font-bold text-primary-600">99.8%</span>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">Ratings</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How CareSync Works</h2>
            <p className="text-slate-500 mt-2">Get professional medical advice in 3 simple steps</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 relative">
                <div className="absolute top-6 right-6 text-slate-200 font-black text-4xl select-none">
                  0{idx + 1}
                </div>
                <div className="h-12 w-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-6 border border-slate-100">
                  {step.icon}
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{step.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Trust Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center py-8">
        <div className="bg-indigo-900 text-white rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-xl">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 bg-indigo-800 opacity-20 h-40 w-40 rounded-full"></div>
          <div className="relative max-w-2xl mx-auto space-y-6">
            <ShieldCheck className="h-12 w-12 mx-auto text-teal-400" />
            <h2 className="text-3xl font-extrabold">End-to-End HIPAA Compliant Platform</h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Your patient health records, virtual consultations, and payment intents are encrypted. We prioritize user privacy and match high security standards.
            </p>
            <div className="pt-4">
              <Link
                to="/doctors"
                className="inline-flex items-center space-x-2 bg-white text-indigo-900 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition shadow-md"
              >
                <span>Find a Doctor Now</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
