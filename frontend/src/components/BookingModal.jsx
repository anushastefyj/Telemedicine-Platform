import React, { useState } from 'react';
import { bookAppointmentAPI } from '../services/api';
import { AlertCircle } from 'lucide-react';

const formatDocName = (name) => name?.startsWith('Dr.') ? name : `Dr. ${name}`;

const BookingModal = ({ doctor, onClose, onSuccess }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const availableSlots = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];
  const todayStr = new Date().toISOString().split('T')[0];

  const handleBook = async () => {
    if (!selectedDate || !selectedTime) {
      setError('Please select both date and time.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await bookAppointmentAPI({
        doctorId: doctor._id,
        date: selectedDate,
        time: selectedTime,
        reason: 'General Consultation'
      });
      if (res.success) {
        onSuccess();
      } else {
        setError(res.message || 'Booking failed');
      }
    } catch (err) {
      setError('An error occurred during booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h3 className="text-xl font-black text-slate-900">Book Appointment</h3>
          <p className="text-sm text-slate-500 font-medium mt-1">{formatDocName(doctor.name)} • {doctor.specialty}</p>
        </div>
        
        <div className="p-6 flex flex-col space-y-5 flex-1 overflow-y-auto">
          {error && <div className="text-rose-600 bg-rose-50 text-xs font-bold p-3 rounded-lg border border-rose-100 flex items-center gap-2"><AlertCircle size={14}/>{error}</div>}
          
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Date</label>
            <input 
              type="date" 
              min={todayStr}
              value={selectedDate}
              onChange={(e) => { setSelectedDate(e.target.value); setSelectedTime(''); }}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Select Time</label>
            <div className="grid grid-cols-3 gap-3">
              {availableSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`py-2 rounded-lg text-sm font-bold border transition ${selectedTime === time ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-slate-200 text-slate-600 hover:border-primary-500 hover:text-primary-600'}`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition text-sm">Cancel</button>
          <button onClick={handleBook} disabled={loading} className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition shadow-sm text-sm disabled:opacity-50">
            {loading ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
