import React, { useState } from 'react';
import { analyzeSymptomsAPI } from '../services/api';
import { BrainCircuit, AlertTriangle, ChevronDown, ChevronRight, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AICheckerTab = ({ setActiveTab }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  // Mock recent checks
  const [recentChecks, setRecentChecks] = useState([
    { id: 1, date: '2023-10-01', text: 'Persistent headache for 3 days with mild fever...', topCondition: 'Tension Headache' },
    { id: 2, date: '2023-09-15', text: 'Lower back pain after lifting heavy boxes...', topCondition: 'Muscle Strain' }
  ]);
  const [showRecents, setShowRecents] = useState(false);

  const handleAnalyze = async () => {
    const trimmed = symptoms.trim();
    if (trimmed.length < 10) {
      setErrorMsg('Please describe your symptoms in more detail (at least 10 characters).');
      return;
    }
    
    setLoading(true);
    setErrorMsg('');
    try {
      // In api.js, API.interceptors already adds the Bearer token.
      const res = await analyzeSymptomsAPI({ text: trimmed });
      if (res.success) {
        setResults(res.data);
      } else {
        setErrorMsg('An error occurred. Please try again.');
      }
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setErrorMsg('Session expired. Please log in again.');
          setTimeout(() => { localStorage.clear(); navigate('/login'); window.location.reload(); }, 2000);
        } else if (status === 429) {
          setErrorMsg('Too many requests. Please wait a moment and try again.');
        } else if (status >= 500) {
          setErrorMsg('Our AI is temporarily unavailable. Please try again in a few minutes.');
        } else {
          setErrorMsg(err.response.data?.message || 'An error occurred.');
        }
      } else if (err.request) {
        setErrorMsg('Could not connect. Please check your internet connection.');
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const charCount = symptoms.length;
  const isOverLimit = charCount >= 480;

  return (
    <div className="max-w-3xl mx-auto space-y-8 fade-in pb-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-2xl mb-2">
          <BrainCircuit size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">AI Symptom Checker</h2>
        <p className="text-slate-500 font-medium max-w-xl mx-auto">
          Describe what you're feeling. Our Gemini-powered AI will suggest possible conditions and the right specialist.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
          <AlertTriangle size={14} />
          <span>⚠ For guidance only — always consult a licensed doctor</span>
        </div>
      </div>

      {!results ? (
        <div className="space-y-6">
          {/* Input Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
            <label className="block text-sm font-bold text-slate-800 mb-3">Describe your symptoms</label>
            <div className="relative">
              <textarea
                value={symptoms}
                onChange={(e) => {
                  if (e.target.value.length <= 500) setSymptoms(e.target.value);
                }}
                disabled={loading}
                placeholder="e.g. I have had a persistent headache for 3 days, along with mild fever and neck stiffness..."
                className="w-full min-h-[120px] p-4 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-slate-700 font-medium disabled:opacity-50 transition"
              ></textarea>
              <div className={`absolute bottom-4 right-4 text-xs font-bold ${isOverLimit ? 'text-rose-500' : 'text-slate-400'}`}>
                {charCount} / 500
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={loading || charCount < 10}
              className="mt-6 w-full h-[48px] flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-xl transition shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Analysing...</span>
                </>
              ) : (
                <span>Analyse Symptoms</span>
              )}
            </button>

            {loading && (
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-primary-500 w-1/3 rounded-full animate-[progress_1.5s_ease-in-out_infinite]"></div>
              </div>
            )}

            {errorMsg && (
              <div className="mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm font-bold flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Recent Checks */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <button 
              onClick={() => setShowRecents(!showRecents)}
              className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100 transition"
            >
              <span className="font-bold text-slate-700 text-sm">Recent checks (last 5)</span>
              {showRecents ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
            </button>
            
            {showRecents && (
              <div className="divide-y divide-slate-100">
                {recentChecks.map(check => (
                  <div 
                    key={check.id} 
                    onClick={() => { setSymptoms(check.text); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-5 cursor-pointer hover:bg-primary-50 transition group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-bold text-slate-400">{check.date}</span>
                      <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md">{check.topCondition}</span>
                    </div>
                    <p className="text-sm text-slate-600 font-medium truncate group-hover:text-primary-700 transition">{check.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Card 1: Conditions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Possible conditions</h3>
            <p className="text-xs text-slate-500 mb-6 font-medium">Confidence levels are estimates and not diagnostic.</p>
            
            <div className="space-y-5">
              {(results.conditions || [{name: 'Tension Headache', confidence: 85}, {name: 'Migraine', confidence: 40}]).slice(0,3).map((cond, i) => (
                <div key={i}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-800 text-sm">{cond.name}</span>
                    <span className="font-bold text-slate-500 text-xs">{cond.confidence}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 rounded-full" style={{ width: `${cond.confidence}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Specialist */}
          <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-8 shadow-md text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
            <div className="relative z-10">
              <h3 className="text-primary-100 font-bold text-sm uppercase tracking-wider mb-2">See a specialist</h3>
              <h2 className="text-3xl font-black mb-3">{results.recommendedSpecialist || 'Neurologist'}</h2>
              <p className="text-primary-50 font-medium text-sm mb-6 max-w-md">
                {results.specialistReason || 'Based on your symptoms, a Neurologist is best equipped to diagnose and treat recurrent headaches and neck stiffness.'}
              </p>
              <button 
                onClick={() => setActiveTab('find-doctors')}
                className="bg-white text-primary-700 hover:bg-slate-50 font-bold px-6 py-3 rounded-xl transition flex items-center gap-2 text-sm shadow-sm"
              >
                Find a {results.recommendedSpecialist || 'Neurologist'} now <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* Card 3: Urgent Care */}
          <div className="bg-rose-50 border border-rose-100 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-rose-900 mb-4 flex items-center gap-2">
              <AlertTriangle size={20} className="text-rose-600" />
              Urgent care signs
            </h3>
            {results.urgentSigns && results.urgentSigns.length > 0 ? (
              <ul className="list-disc pl-5 space-y-2 text-sm font-medium text-rose-800 marker:text-rose-400">
                {results.urgentSigns.map((sign, i) => <li key={i}>{sign}</li>)}
              </ul>
            ) : (
              <p className="text-sm font-medium text-rose-700">No urgent symptoms detected based on your description. However, seek immediate care if you experience sudden severe pain, difficulty breathing, or loss of consciousness.</p>
            )}
          </div>

          <button 
            onClick={() => { setResults(null); setSymptoms(''); }}
            className="w-full py-4 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition text-sm shadow-sm"
          >
            Run another check
          </button>
        </div>
      )}
    </div>
  );
};

export default AICheckerTab;
