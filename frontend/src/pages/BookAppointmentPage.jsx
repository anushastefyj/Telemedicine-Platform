import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getDoctorByIdAPI, bookAppointmentAPI, createPaymentIntentAPI, confirmPaymentAPI } from '../services/api';
import ScheduleCalendar from '../components/ScheduleCalendar';
import PaymentForm from '../components/PaymentForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import { Calendar, Clock, DollarSign, FileText } from 'lucide-react';

const stripePromise = loadStripe('pk_test_mock_stripe_key_placeholder');

const BookAppointmentPage = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Booking details state
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [symptoms, setSymptoms] = useState('');

  // Checkout states
  const [appointment, setAppointment] = useState(null);
  const [clientSecret, setClientSecret] = useState('');
  const [step, setStep] = useState(1); // 1: Pick Info, 2: Payment Checkout

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const res = await getDoctorByIdAPI(doctorId);
        if (res.success) {
          setDoctor(res.data.doctor);
        } else {
          setErrorMsg('Failed to load doctor profile');
        }
      } catch (err) {
        setErrorMsg('Failed to fetch doctor profile info');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [doctorId]);

  // Generate generic list of daily slots for demo purposes
  const slots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '01:00 PM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg('Please select a time slot for the appointment.');
      return;
    }
    if (!reason) {
      setErrorMsg('Please provide a reason for the consultation.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      // 1. Book the appointment (pending state)
      const res = await bookAppointmentAPI({
        doctorId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        reason,
        symptoms,
      });

      if (res.success) {
        setAppointment(res.data);

        // 2. Fetch Payment Intent for the appointment
        const payRes = await createPaymentIntentAPI({ appointmentId: res.data._id });
        if (payRes.success) {
          setClientSecret(payRes.clientSecret);
          setStep(2); // advance to checkout payment
        } else {
          setErrorMsg('Failed to create payment intent');
        }
      } else {
        setErrorMsg('Failed to book appointment');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to initialize booking');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    setLoading(true);
    try {
      // Confirm payment in backend (which sets paymentStatus='paid' and status='confirmed')
      const res = await confirmPaymentAPI({
        appointmentId: appointment._id,
        paymentId: paymentIntentId,
      });

      if (res.success) {
        setSuccessMsg('Appointment Booked and Paid Successfully!');
        setTimeout(() => {
          navigate('/patient-dashboard');
        }, 2000);
      } else {
        setErrorMsg('Payment recorded but failed to schedule appointment status. Please contact support.');
      }
    } catch (err) {
      setErrorMsg('Failed to record payment details');
    } finally {
      setLoading(false);
    }
  };

  if (loading && step === 1) return <LoadingSpinner fullPage />;
  if (!doctor) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book Virtual Consult</h1>
        <p className="text-slate-500 mt-1">Consultation with Dr. {doctor.name}</p>
      </div>

      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      <Alert type="success" message={successMsg} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left column: Pick Date/Time or Summary */}
        <div className="md:col-span-2 space-y-6">
          {step === 1 ? (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">1. Select Date</h3>
                <ScheduleCalendar
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                  availability={doctor.availability}
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">2. Choose Time Slot</h3>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2 text-xs font-semibold rounded-xl border transition ${
                        selectedTime === slot
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleCreateAppointment} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Reason for Visit</label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Regular health checkup, persistent cough..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Symptoms (Optional)</label>
                  <textarea
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    placeholder="Describe any symptoms you are experiencing..."
                    rows="3"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition shadow-md shadow-primary-500/10"
                >
                  Confirm & Go to Checkout
                </button>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm pb-2 border-b border-slate-100">
                Complete Consultation Payment
              </h3>
              {clientSecret && (
                <Elements stripe={stripePromise}>
                  <PaymentForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
                </Elements>
              )}
            </div>
          )}
        </div>

        {/* Right column: Summary Detail Card */}
        <div className="md:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-4">
            <h4 className="font-bold text-slate-800 text-sm border-b border-slate-50 pb-2">Consultation Summary</h4>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Specialist</span>
                <span className="font-semibold text-slate-800">Dr. {doctor.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Specialty</span>
                <span className="font-semibold text-slate-800">{doctor.specialty}</span>
              </div>
              <div className="flex justify-between">
                <span>Date</span>
                <span className="font-semibold text-slate-800">
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Time Slot</span>
                <span className="font-semibold text-slate-800">{selectedTime || 'Not selected'}</span>
              </div>
              <div className="border-t border-slate-50 pt-3 flex justify-between text-sm">
                <span className="font-bold text-slate-800">Consultation Fee</span>
                <span className="font-black text-primary-600">${doctor.consultationFee}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookAppointmentPage;
