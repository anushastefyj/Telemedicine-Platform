import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Stethoscope, Play, ShieldCheck, Star, Users, Video, 
  BrainCircuit, FileText, FolderHeart, BellRing, CreditCard,
  Menu, X, CheckCircle2, Shield, HeartPulse, Clock
} from 'lucide-react';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [annualBilling, setAnnualBilling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fadeUpVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 overflow-x-hidden selection:bg-primary-200 selection:text-primary-900">
      
      {/* ─── SECTION 1: NAVBAR ─────────────────────────────────── */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center text-white group-hover:bg-primary-700 transition">
                <Stethoscope size={24} />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xl tracking-tight text-slate-900 leading-none">ASISHCARE</span>
                <span className="font-light text-[10px] tracking-widest text-primary-600 leading-none mt-0.5">CONSULTING</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition">Features</a>
              <a href="#how-it-works" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition">How It Works</a>
              <a href="#doctors" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition">Doctors</a>
              <a href="#pricing" className="text-sm font-bold text-slate-600 hover:text-primary-600 transition">Pricing</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Link to="/login" className="text-sm font-bold text-slate-700 hover:text-primary-600 px-4 py-2 transition">Login</Link>
              <Link to="/register" className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold px-6 py-2.5 rounded-full transition shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                Get Started Free
              </Link>
            </div>

            <button className="md:hidden text-slate-800 p-2" onClick={() => setMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>

          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col md:hidden">
          <div className="flex justify-between items-center p-4 border-b border-slate-100">
             <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  <Stethoscope size={18} />
                </div>
                <span className="font-black text-lg tracking-tight text-slate-900">ASISHCARE</span>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-slate-500">
                <X size={24} />
              </button>
          </div>
          <div className="flex flex-col p-6 space-y-6 text-xl font-bold">
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">Features</a>
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">How It Works</a>
            <a href="#doctors" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">Doctors</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">Pricing</a>
            <hr className="border-slate-100" />
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-slate-800">Login</Link>
            <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="bg-primary-600 text-white text-center py-4 rounded-xl mt-4">
              Get Started Free
            </Link>
          </div>
        </div>
      )}

      {/* ─── SECTION 2: HERO ───────────────────────────────────── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden flex items-center min-h-[90vh]">
        {/* Animated Background Circles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-10%] right-[-5%] w-[800px] h-[800px] rounded-full bg-primary-600/5 blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-teal-500/5 blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8">
            
            <motion.div 
              initial="hidden" animate="visible" variants={fadeUpVariant}
              className="w-full lg:w-[55%] space-y-8"
            >
              <h1 className="text-5xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Your doctor is just <br/><span className="text-primary-600">one click away.</span>
              </h1>
              <p className="text-lg lg:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl">
                ASISHCARE CONSULTING connects you with verified, experienced doctors for video consultations, prescriptions, and health monitoring — from anywhere, anytime.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                <Link to="/register" className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-4 rounded-full text-center transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Book a Consultation
                </Link>
                <button className="w-full sm:w-auto group flex items-center justify-center space-x-3 text-slate-700 hover:text-primary-600 font-bold px-8 py-4 rounded-full transition-all">
                  <div className="h-10 w-10 rounded-full bg-primary-50 group-hover:bg-primary-100 flex items-center justify-center transition">
                    <Play size={18} className="text-primary-600 translate-x-0.5" />
                  </div>
                  <span>Watch how it works</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-8 border-t border-slate-200/60">
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <ShieldCheck size={18} className="text-primary-600" />
                  <span>HIPAA-compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <Star size={18} className="text-amber-400 fill-amber-400" />
                  <span>4.9/5 rated</span>
                </div>
                <div className="flex items-center space-x-2 text-sm font-bold text-slate-700">
                  <Stethoscope size={18} className="text-primary-600" />
                  <span>500+ doctors</span>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="w-full lg:w-[45%] relative"
            >
              {/* Custom SVG Scene */}
              <div className="relative w-full aspect-square max-w-[500px] mx-auto">
                <div className="absolute inset-0 bg-primary-50 rounded-full scale-90"></div>
                
                {/* Floating Cards */}
                <div className="absolute top-10 right-0 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 animate-bounce" style={{ animationDuration: '4s' }}>
                  <p className="text-xs font-bold text-slate-500 mb-1">Next appointment</p>
                  <p className="text-sm font-black text-primary-600">Today 3:00 PM</p>
                </div>

                <div className="absolute bottom-20 -left-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center space-x-3">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">AM</div>
                  <div>
                    <p className="text-sm font-black text-slate-800">Dr. Aisha Mehta</p>
                    <p className="text-xs font-bold text-slate-500">Cardiologist</p>
                  </div>
                </div>

                <div className="absolute -bottom-6 right-10 bg-primary-600 text-white px-5 py-3 rounded-2xl shadow-xl z-20 flex items-center space-x-2">
                  <CheckCircle2 size={18} />
                  <span className="text-sm font-bold">Prescription ready</span>
                </div>

                {/* Abstract Laptop/Doctor Illustration */}
                <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full z-10 drop-shadow-2xl">
                  {/* Laptop Base */}
                  <rect x="70" y="280" width="260" height="15" rx="7.5" fill="#e2e8f0"/>
                  <rect x="100" y="120" width="200" height="160" rx="12" fill="#334155"/>
                  {/* Screen Content */}
                  <rect x="110" y="130" width="180" height="140" rx="8" fill="#f8fafc"/>
                  {/* Doctor Avatar on Screen */}
                  <circle cx="200" cy="190" r="40" fill="#2c8a52"/>
                  <circle cx="200" cy="180" r="15" fill="#e8f5ee"/>
                  <path d="M175 220C175 206.193 186.193 195 200 195C213.807 195 225 206.193 225 220V230H175V220Z" fill="#e8f5ee"/>
                  <rect x="185" y="210" width="30" height="40" rx="2" fill="#fff" opacity="0.9"/>
                  {/* Video Call UI */}
                  <rect x="120" y="240" width="40" height="25" rx="4" fill="#0F1117" opacity="0.8"/>
                  <circle cx="140" cy="252.5" r="6" fill="#4ade80"/>
                  <rect x="180" y="255" width="40" height="8" rx="4" fill="#ef4444"/>
                </svg>

              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 3: PROBLEM -> SOLUTION STRIP ───────────────── */}
      <section className="bg-[#e8f5ee] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6 text-center">
            
            <div className="flex flex-col items-center group">
              <Clock size={32} className="text-primary-600 mb-4" />
              <h3 className="text-3xl font-black text-slate-900 mb-2">73% of patients</h3>
              <p className="text-slate-600 font-medium mb-4">skip care due to long clinic wait times.</p>
              <div className="h-1 w-12 bg-primary-600 rounded-full mb-3 transition-all duration-300 group-hover:w-24"></div>
              <p className="text-primary-800 font-bold text-sm tracking-wide uppercase">ASISHCARE fixes this.</p>
            </div>

            <div className="flex flex-col items-center group">
              <Shield size={32} className="text-primary-600 mb-4" />
              <h3 className="text-3xl font-black text-slate-900 mb-2">1 in 3 people</h3>
              <p className="text-slate-600 font-medium mb-4">live more than 30km from their nearest specialist.</p>
              <div className="h-1 w-12 bg-primary-600 rounded-full mb-3 transition-all duration-300 group-hover:w-24"></div>
              <p className="text-primary-800 font-bold text-sm tracking-wide uppercase">ASISHCARE fixes this.</p>
            </div>

            <div className="flex flex-col items-center group">
              <FileText size={32} className="text-primary-600 mb-4" />
              <h3 className="text-3xl font-black text-slate-900 mb-2">62% of Rx</h3>
              <p className="text-slate-600 font-medium mb-4">are never refilled due to inconvenient follow-ups.</p>
              <div className="h-1 w-12 bg-primary-600 rounded-full mb-3 transition-all duration-300 group-hover:w-24"></div>
              <p className="text-primary-800 font-bold text-sm tracking-wide uppercase">ASISHCARE fixes this.</p>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 4: FEATURES ───────────────────────────────── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUpVariant}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">Everything you need, in one platform</h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto">Seamless, secure, and smart healthcare delivery right from your living room.</p>
          </motion.div>

          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[
              { icon: Video, title: "Video Consultations", desc: "HD-quality, end-to-end encrypted video calls with licensed doctors. Schedule in minutes, join from any device." },
              { icon: BrainCircuit, title: "AI Symptom Checker", desc: "Describe your symptoms and our AI instantly suggests likely conditions and the right specialist to see." },
              { icon: FileText, title: "Digital Prescriptions", desc: "Doctors issue structured, digital prescriptions directly after your consultation — downloadable and shareable." },
              { icon: FolderHeart, title: "Medical Records Vault", desc: "Upload, organize, and share lab reports securely. Tagged by body system for instant retrieval." },
              { icon: BellRing, title: "Appointment Reminders", desc: "Automated email reminders 24 hours and 1 hour before your consultation — so you never miss a visit." },
              { icon: CreditCard, title: "Secured Payments", desc: "Pay consultation fees securely via Stripe. Receipts issued instantly. No hidden charges, ever." }
            ].map((feature, idx) => (
              <motion.div key={idx} variants={fadeUpVariant} className="bg-white p-8 rounded-[2rem] border border-primary-50/50 hover:border-primary-100 hover:shadow-xl hover:shadow-primary-600/5 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                <div className="h-14 w-14 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 mb-6 group-hover:bg-primary-600 group-hover:text-white transition-colors duration-300">
                  <feature.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 5: HOW IT WORKS ───────────────────────────── */}
      <section id="how-it-works" className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="text-center mb-20"
          >
            <h2 className="text-4xl font-black text-slate-900 mb-4">From symptom to prescription in 4 steps</h2>
          </motion.div>

          <div className="relative">
            {/* Connecting line desktop */}
            <div className="hidden lg:block absolute top-12 left-0 right-0 h-1 bg-primary-100 rounded-full z-0"></div>
            
            {/* Connecting line mobile */}
            <div className="lg:hidden absolute top-0 bottom-0 left-8 w-0.5 border-l-2 border-dashed border-primary-200 z-0"></div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6 relative z-10"
            >
              {[
                { step: "1", title: "Create your account", desc: "Register in under 60 seconds. No forms, no paperwork. Just your name, email, and health profile." },
                { step: "2", title: "Describe symptoms", desc: "Use our AI Symptom Checker or search directly for a specialist. We'll match you with the right doctor." },
                { step: "3", title: "Book & consult", desc: "Pick a time slot, join the video call, and speak with your doctor — from your phone, tablet, or laptop." },
                { step: "4", title: "Get prescription", desc: "Receive a structured digital prescription, book a follow-up, and access your full consultation notes." }
              ].map((item, idx) => (
                <motion.div key={idx} variants={fadeUpVariant} className="flex lg:flex-col items-start lg:items-center relative pl-20 lg:pl-0">
                  <div className="absolute lg:relative left-0 top-0 lg:mb-8 w-16 lg:w-24 h-16 lg:h-24 bg-white border-4 border-primary-100 rounded-full flex items-center justify-center text-2xl lg:text-3xl font-black text-primary-600 shadow-sm z-10">
                    {item.step}
                  </div>
                  <div className="lg:text-center pt-2 lg:pt-0">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                    <p className="text-slate-600 font-medium">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: DOCTOR PROFILES ────────────────────────── */}
      <section id="doctors" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <h2 className="text-4xl font-black text-slate-900 mb-4">Meet our verified specialists</h2>
              <p className="text-xl text-slate-500 font-medium max-w-2xl">Every doctor on ASISHCARE is license-verified, peer-reviewed, and background-checked.</p>
            </div>
            <Link to="/register" className="hidden md:inline-flex items-center text-primary-600 font-bold hover:text-primary-700 transition">
              View all 500+ doctors &rarr;
            </Link>
          </motion.div>

          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 hide-scrollbar gap-6 snap-x">
            {[
              { name: "Dr. Aisha Mehta", spec: "Cardiologist", rating: "4.9", exp: "15 years exp.", avail: "Available Today", availColor: "bg-primary-500" },
              { name: "Dr. Rohan Iyer", spec: "Neurologist", rating: "4.8", exp: "12 years exp.", avail: "Next: Tomorrow", availColor: "bg-amber-500" },
              { name: "Dr. Priya Nair", spec: "Dermatologist", rating: "5.0", exp: "8 years exp.", avail: "Available Now", availColor: "bg-primary-500" },
              { name: "Dr. Samuel Osei", spec: "General Physician", rating: "4.7", exp: "20 years exp.", avail: "Available Today", availColor: "bg-primary-500" }
            ].map((doc, idx) => (
              <div key={idx} className="min-w-[280px] w-[280px] md:w-auto md:flex-1 shrink-0 snap-start bg-slate-50 rounded-[2rem] p-6 border border-slate-100 hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="h-16 w-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-700 font-black text-xl">
                    {doc.name.split(' ')[1][0]}{doc.name.split(' ')[2]?.[0]}
                  </div>
                  <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-lg shadow-sm border border-slate-100">
                    <Star size={14} className="text-amber-400 fill-amber-400" />
                    <span className="text-xs font-bold text-slate-700">{doc.rating}</span>
                  </div>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-1">{doc.name}</h3>
                <p className="text-primary-600 font-bold text-sm mb-4">{doc.spec}</p>
                <div className="flex items-center space-x-4 text-xs font-medium text-slate-500 mb-6">
                  <span className="bg-slate-200/50 px-2.5 py-1 rounded-md">{doc.exp}</span>
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full ${doc.availColor} mr-1.5`}></span>
                    {doc.avail}
                  </span>
                </div>
                <Link to="/register" className="w-full block text-center bg-white border border-slate-200 text-slate-700 hover:border-primary-600 hover:text-primary-600 hover:bg-primary-50 font-bold py-3 rounded-xl transition">
                  Book Now
                </Link>
              </div>
            ))}
          </div>
          
          <Link to="/register" className="md:hidden mt-4 inline-flex items-center text-primary-600 font-bold">
              View all 500+ doctors &rarr;
          </Link>
        </div>
      </section>

      {/* ─── SECTION 7: TRUST & SECURITY ───────────────────────── */}
      <section className="py-24 bg-[#1a5c38] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUpVariant}
              className="w-full lg:w-1/2 space-y-6"
            >
              <h2 className="text-4xl lg:text-5xl font-black mb-6">Your health data is safe with us.</h2>
              <p className="text-lg text-primary-100 font-medium leading-relaxed">
                ASISHCARE CONSULTING is built on enterprise-grade security. We never sell your data, never share your records without consent, and maintain full HIPAA-compliant infrastructure.
              </p>
            </motion.div>

            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
              className="w-full lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6"
            >
              {[
                { icon: ShieldCheck, text: "End-to-end encryption on all video calls" },
                { icon: FolderHeart, text: "HIPAA-compliant data storage" },
                { icon: CheckCircle2, text: "License-verified doctors only" },
                { icon: CreditCard, text: "Stripe-secured payments — PCI DSS compliant" }
              ].map((trust, idx) => (
                <motion.div key={idx} variants={fadeUpVariant} className="bg-white/10 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                  <trust.icon size={32} className="text-primary-200 mb-4" />
                  <p className="font-bold text-white">{trust.text}</p>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 8: TESTIMONIALS ───────────────────────────── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4">Trusted by patients across the country</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { q: "I got a prescription within 20 minutes of booking. No waiting room, no stress. ASISHCARE changed how I handle my health.", name: "Meera S.", loc: "Hyderabad" },
              { q: "The AI symptom checker immediately pointed me to a neurologist. Turned out I had a vitamin deficiency — caught early thanks to ASISHCARE.", name: "James O.", loc: "Lagos" },
              { q: "As a working mom, I can't always make it to a clinic. ASISHCARE lets me consult a doctor during lunch break. Absolute lifesaver.", name: "Ananya R.", loc: "Bangalore" }
            ].map((test, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm relative">
                <div className="absolute -top-6 left-8 text-7xl text-primary-100 font-serif leading-none">"</div>
                <div className="flex mb-4 relative z-10 pt-2">
                  {[...Array(5)].map((_, i) => <Star key={i} size={16} className="text-amber-400 fill-amber-400 mr-1" />)}
                </div>
                <p className="text-slate-600 font-medium leading-relaxed mb-8 relative z-10">"{test.q}"</p>
                <div className="flex items-center space-x-4 border-t border-slate-100 pt-6">
                  <div className="h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-black">
                    {test.name[0]}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{test.name}</p>
                    <p className="text-sm font-medium text-slate-500">{test.loc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 9: PRICING ────────────────────────────────── */}
      <section id="pricing" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Simple, transparent pricing</h2>
            
            <div className="inline-flex items-center bg-slate-100 p-1.5 rounded-full">
              <button 
                onClick={() => setAnnualBilling(false)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition ${!annualBilling ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setAnnualBilling(true)}
                className={`px-6 py-2.5 rounded-full text-sm font-bold transition flex items-center ${annualBilling ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
              >
                Annual <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
            
            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Basic</h3>
              <p className="text-slate-500 font-medium mb-6">Free</p>
              <div className="text-4xl font-black text-slate-900 mb-8">₹0<span className="text-lg text-slate-400 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['1 AI symptom check per day', 'Browse doctor profiles', 'Book 1 consultation/month', 'Email support'].map((feature, i) => (
                  <li key={i} className="flex items-start text-sm font-medium text-slate-600"><CheckCircle2 size={18} className="text-primary-600 mr-2 shrink-0" />{feature}</li>
                ))}
              </ul>
              <Link to="/register" className="w-full block text-center border-2 border-slate-200 hover:border-primary-600 text-slate-800 hover:text-primary-600 font-bold py-3.5 rounded-xl transition">
                Get started free
              </Link>
            </div>

            {/* Standard Plan */}
            <div className="bg-primary-600 p-1 rounded-[2rem] shadow-xl transform lg:scale-105 relative">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 text-amber-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm z-10">
                Most Popular
              </div>
              <div className="bg-white p-8 rounded-[1.8rem] h-full flex flex-col">
                <h3 className="text-2xl font-black text-slate-900 mb-2">Standard</h3>
                <p className="text-slate-500 font-medium mb-6">Everything you need</p>
                <div className="text-4xl font-black text-slate-900 mb-8">₹{annualBilling ? '399' : '499'}<span className="text-lg text-slate-400 font-medium">/mo</span></div>
                <ul className="space-y-4 mb-8 flex-1">
                  {['Unlimited AI symptom checks', 'Unlimited video consultations', 'Digital prescriptions included', 'Medical records vault (5GB)', 'Priority booking'].map((feature, i) => (
                    <li key={i} className="flex items-start text-sm font-medium text-slate-700"><CheckCircle2 size={18} className="text-primary-600 mr-2 shrink-0" />{feature}</li>
                  ))}
                </ul>
                <Link to="/register" className="w-full block text-center bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-md hover:shadow-lg">
                  Start free trial
                </Link>
              </div>
            </div>

            {/* Family Plan */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Family</h3>
              <p className="text-slate-500 font-medium mb-6">For your loved ones</p>
              <div className="text-4xl font-black text-slate-900 mb-8">₹{annualBilling ? '799' : '999'}<span className="text-lg text-slate-400 font-medium">/mo</span></div>
              <ul className="space-y-4 mb-8">
                {['All Standard features', 'Up to 5 family members', 'Shared health timeline', 'Dedicated care coordinator', '24/7 emergency callback'].map((feature, i) => (
                  <li key={i} className="flex items-start text-sm font-medium text-slate-600"><CheckCircle2 size={18} className="text-primary-600 mr-2 shrink-0" />{feature}</li>
                ))}
              </ul>
              <Link to="/register" className="w-full block text-center border-2 border-slate-200 hover:border-primary-600 text-slate-800 hover:text-primary-600 font-bold py-3.5 rounded-xl transition">
                Choose Family
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ─── SECTION 10: FINAL CTA BANNER ──────────────────────── */}
      <section className="bg-[#1a5c38] py-20 overflow-hidden relative">
        <div className="absolute top-[-50%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary-500/20 blur-[100px]"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl font-black text-white mb-6">Your health can't wait.</h2>
          <p className="text-xl text-primary-100 font-medium mb-10">Join 10,000+ patients already consulting on ASISHCARE. Register free in 60 seconds.</p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-white text-primary-800 hover:bg-primary-50 font-bold px-8 py-4 rounded-full transition shadow-lg text-lg">
              Create Free Account
            </Link>
            <Link to="/register" className="w-full sm:w-auto border-2 border-primary-400 hover:border-white text-white font-bold px-8 py-4 rounded-full transition text-lg">
              Talk to a doctor now
            </Link>
          </div>
          <p className="text-primary-200 text-sm mt-6 font-medium">No credit card required. Cancel anytime.</p>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────── */}
      <footer className="bg-[#0F1117] text-white pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center text-white">
                  <Stethoscope size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="font-black text-lg tracking-tight text-white leading-none">ASISHCARE</span>
                  <span className="font-light text-[9px] tracking-widest text-primary-500 leading-none mt-0.5">CONSULTING</span>
                </div>
              </div>
              <p className="text-slate-400 text-sm mb-6 max-w-xs leading-relaxed">Bringing the doctors closer to you. Secure, fast, and reliable telemedicine platform.</p>
              <p className="text-slate-500 text-xs">© 2025 ASISHCARE CONSULTING.<br/>All rights reserved.</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Platform</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Home</a></li>
                <li><a href="#features" className="text-slate-400 hover:text-white transition text-sm">Features</a></li>
                <li><a href="#how-it-works" className="text-slate-400 hover:text-white transition text-sm">How It Works</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition text-sm">Pricing</a></li>
                <li><Link to="/login" className="text-slate-400 hover:text-white transition text-sm">Login</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Specialties</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">General Medicine</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Cardiology</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Dermatology</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Neurology</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Pediatrics</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6 uppercase tracking-wider text-sm">Company</h4>
              <ul className="space-y-4">
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Contact</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition text-sm">Careers</a></li>
              </ul>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm flex items-center justify-center">
              Built with <HeartPulse size={16} className="text-rose-500 mx-2" /> for better healthcare access.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
