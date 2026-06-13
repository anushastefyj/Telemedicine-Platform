import React from 'react';
import { CheckCircle2, Clock, CalendarHeart, FileText } from 'lucide-react';

const HealthJourneyTimeline = ({ appointments }) => {
  // Sort appointments by date
  const sorted = [...appointments].sort((a, b) => new Date(a.date) - new Date(b.date));
  const now = new Date();

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none z-0"></div>
      
      <div className="relative z-10 flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Health Journey</h2>
          <p className="text-slate-500 font-medium mt-1">Your consultation timeline</p>
        </div>
        <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full font-bold text-sm flex items-center space-x-2">
          <CalendarHeart size={18} />
          <span>{appointments.length} Consults</span>
        </div>
      </div>

      <div className="relative z-10 pl-4 border-l-2 border-slate-100 space-y-8 mt-4">
        {sorted.length === 0 ? (
          <div className="text-slate-400 py-4 font-medium">No appointments on record.</div>
        ) : (
          sorted.map((app, index) => {
            const appDate = new Date(app.date);
            const isPast = app.status === 'completed' || appDate < now;
            const isNext = app.status === 'confirmed' && appDate >= now && index === sorted.findIndex(a => new Date(a.date) >= now);

            return (
              <div key={app._id} className="relative group">
                {/* Timeline node */}
                <div className={`absolute -left-[25px] h-4 w-4 rounded-full border-4 border-white shadow-sm transition-transform duration-300 group-hover:scale-125 ${
                  isNext ? 'bg-rose-500 animate-pulse' : isPast ? 'bg-primary-500' : 'bg-slate-300'
                }`}></div>

                {/* Content Card */}
                <div className={`p-5 rounded-2xl border transition-all duration-300 ${
                  isNext 
                    ? 'bg-gradient-to-br from-primary-50 to-white border-primary-200 shadow-md transform -translate-y-1' 
                    : 'bg-white border-slate-100 shadow-sm hover:shadow-md'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start space-x-4">
                      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 font-bold text-lg ${
                        isNext ? 'bg-primary-600 text-white shadow-md' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {app.doctor?.name?.charAt(0) || 'D'}
                      </div>
                      
                      <div>
                        <h4 className={`font-bold text-lg ${isNext ? 'text-primary-800' : 'text-slate-800'}`}>
                          Dr. {app.doctor?.name}
                        </h4>
                        <p className="text-slate-500 text-sm font-medium flex items-center mt-1">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-xs mr-2">{app.doctor?.specialty}</span>
                          {app.type === 'video' ? 'Video Consult' : 'In-Person Visit'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-slate-800 font-bold">
                        {appDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                      <p className="text-slate-500 font-medium text-sm mt-0.5">{app.time}</p>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="mt-4 pt-4 border-t border-slate-100/80 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isPast && app.status === 'completed' && (
                        <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                          <CheckCircle2 size={14} className="mr-1" />
                          Completed
                        </span>
                      )}
                      {isNext && (
                        <span className="flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-md">
                          <Clock size={14} className="mr-1" />
                          Upcoming Next
                        </span>
                      )}
                      {!isPast && !isNext && app.status === 'confirmed' && (
                        <span className="flex items-center text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md">
                          Confirmed
                        </span>
                      )}
                      {app.status === 'cancelled' && (
                        <span className="flex items-center text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                          Cancelled
                        </span>
                      )}
                    </div>

                    {isPast && app.status === 'completed' && (
                      <button className="text-primary-600 hover:text-primary-700 text-sm font-bold flex items-center transition group-hover:translate-x-1">
                        <FileText size={16} className="mr-1" />
                        View Summary
                      </button>
                    )}
                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default HealthJourneyTimeline;
