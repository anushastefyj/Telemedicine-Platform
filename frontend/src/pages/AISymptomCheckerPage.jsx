import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, AlertTriangle, Loader2 } from 'lucide-react';
import { analyzeSymptomsAPI } from '../services/api';
import Alert from '../components/Common/Alert';

const AISymptomCheckerPage = () => {
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState('');
  const [result, setResult]     = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) { setError('Please describe your symptoms.'); return; }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await analyzeSymptomsAPI({ symptoms: symptoms.trim() });
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.message || 'Analysis failed. Please try again.');
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-900 min-h-[calc(100vh-80px)] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <Alert type="error" message={error} onClose={() => setError('')} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* LEFT COLUMN: Input */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-white mb-2">Describe your symptoms</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                rows={6}
                placeholder="I have had a headache for 2 days, mild fever, and fatigue..."
                className="w-full bg-dark-900 border border-dark-700 rounded-xl text-white px-5 py-4 resize-none focus:outline-none focus:border-dark-500 leading-relaxed placeholder-dark-400"
              />
              
              <button
                type="submit"
                disabled={loading || !symptoms.trim()}
                className="w-fit bg-transparent border border-dark-600 hover:bg-dark-800 disabled:opacity-50 text-white font-medium py-3 px-8 rounded-xl transition flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Analyse with AI</span>
              </button>
            </form>
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="space-y-6 mt-12 lg:mt-0">
            {loading ? (
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 shadow-sm animate-pulse space-y-6">
                <div className="h-5 bg-dark-700 rounded w-1/3 mb-4" />
                <div className="space-y-4">
                  <div className="h-3 bg-dark-700 rounded w-full" />
                  <div className="h-3 bg-dark-700 rounded w-5/6" />
                  <div className="h-3 bg-dark-700 rounded w-4/6" />
                </div>
              </div>
            ) : result ? (
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-sm flex flex-col h-full">
                
                <h3 className="text-white font-bold text-lg flex items-center gap-2 mb-4">
                  <Brain size={20} className="text-primary-500" />
                  AI analysis result
                </h3>
                
                <p className="text-dark-300 text-sm mb-6">Possible conditions based on your symptoms:</p>

                <div className="space-y-5 flex-1">
                  {(result.possibleConditions || []).slice(0, 3).map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-white font-bold text-sm">{c.name}</span>
                        <span className="text-dark-300 text-sm font-medium">{c.probability}</span>
                      </div>
                      <div className="w-full h-2 bg-[#FDF6E3] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                          style={{ width: c.probability }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 bg-[#FDF6E3] rounded-xl p-4 flex items-start gap-3">
                  <AlertTriangle size={18} className="text-[#8a6d3b] shrink-0 mt-0.5" />
                  <p className="text-[#8a6d3b] text-sm font-medium">
                    This is not a medical diagnosis. Please consult a doctor.
                  </p>
                </div>

                <button
                  onClick={() => navigate('/doctors')}
                  className="w-full mt-6 bg-transparent border border-dark-600 hover:bg-dark-700 text-white font-medium py-3 rounded-xl transition text-center"
                >
                  Book a doctor now
                </button>
              </div>
            ) : (
              <div className="bg-dark-800 border border-dark-700 rounded-2xl p-8 shadow-sm h-full flex flex-col items-center justify-center text-center opacity-50">
                 <Brain size={48} className="text-dark-500 mb-4" />
                 <p className="text-dark-400 font-medium">Describe your symptoms to see AI analysis results here.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default AISymptomCheckerPage;
