import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { getDoctorByIdAPI, bookAppointmentAPI, createPaymentIntentAPI, confirmPaymentAPI } from '../services/api';
import PaymentForm from '../components/PaymentForm';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';

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

  const slots = [
    { time: '9:00 AM', type: 'morning' },
    { time: '9:30 AM', type: 'morning' },
    { time: '10:00 AM', type: 'midday' },
    { time: '10:30 AM', type: 'midday' },
    { time: '11:00 AM', type: 'midday' },
    { time: '11:30 AM', type: 'midday' },
    { time: '12:00 PM', type: 'morning' },
    { time: '2:00 PM', type: 'morning' },
    { time: '3:00 PM', type: 'midday' },
    { time: '3:30 PM', type: 'midday' },
  ];

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!selectedTime) {
      setErrorMsg('Please select a time slot for the appointment.');
      return;
    }
    if (!symptoms) {
      setErrorMsg('Please provide a reason for the consultation.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await bookAppointmentAPI({
        doctorId,
        date: selectedDate.toISOString(),
        time: selectedTime,
        reason: 'General Consultation',
        symptoms,
      });

      if (res.success) {
        setAppointment(res.data);
        const payRes = await createPaymentIntentAPI({ appointmentId: res.data._id });
        if (payRes.success) {
          setClientSecret(payRes.clientSecret);
          setStep(2);
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
    <div className="bg-dark-900 min-h-screen py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title Bar */}
        <div className="bg-dark-800 border border-dark-700 rounded-t-3xl p-6 flex items-center justify-center relative mb-1">
          <span className="px-6 py-2 bg-primary-50 text-primary-800 rounded-full font-bold text-sm">
            Book appointment
          </span>
        </div>

        {/* Main Content Area */}
        <div className="bg-dark-800 border border-dark-700 rounded-b-3xl p-8 shadow-sm">
          <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
          <Alert type="success" message={successMsg} />

          {step === 1 ? (
            <div className="flex flex-col md:flex-row gap-12">
              
              {/* Doctor Card Profile */}
              <div className="w-full md:w-1/3 shrink-0">
                <div className="border border-dark-700 rounded-2xl p-8 flex flex-col items-center text-center">
                  {doctor.profilePic ? (
                    <img src={doctor.profilePic} alt={doctor.name} className="w-24 h-24 rounded-full object-cover mb-4" />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-[#E0E7FF] text-[#4338CA] flex items-center justify-center font-bold text-2xl mb-4">
                      {doctor.name.charAt(0).toUpperCase()}{doctor.name.split(' ')[1]?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h3 className="font-bold text-white text-xl">Dr. {doctor.name}</h3>
                  <p className="text-dark-300 text-sm mb-4">{doctor.specialty}</p>
                  
                  <span className="px-4 py-1 bg-primary-50 text-primary-800 rounded-full text-xs font-bold mb-8">
                    Available today
                  </span>
                  
                  <div className="w-full pt-6 border-t border-dark-700">
                    <p className="text-dark-300 text-sm mb-1">Consultation fee</p>
                    <p className="text-white font-bold text-3xl">₹{doctor.consultationFee || 200}</p>
                  </div>
                </div>
              </div>

              {/* Time Slots & Form */}
              <div className="w-full md:w-2/3">
                <form onSubmit={handleCreateAppointment} className="space-y-8">
                  
                  {/* Slots */}
                  <div>
                    <h3 className="font-bold text-white text-lg mb-4">Select a time slot</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {slots.map((slot) => {
                        const isSelected = selectedTime === slot.time;
                        let colorClass = '';
                        
                        if (isSelected) {
                          colorClass = 'bg-primary-500 text-white border-primary-500';
                        } else if (slot.type === 'morning') {
                          colorClass = 'bg-[#FDF6E3] text-[#B45309] border-[#FDF6E3] hover:brightness-95';
                        } else {
                          colorClass = 'bg-primary-50 text-primary-800 border-primary-50 hover:brightness-95';
                        }

                        return (
                          <button
                            key={slot.time}
                            type="button"
                            onClick={() => setSelectedTime(slot.time)}
                            className={`py-3 text-sm font-bold rounded-xl border transition-all ${colorClass}`}
                          >
                            {slot.time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reason text area */}
                  <div>
                    <h3 className="text-dark-200 text-sm mb-2">Reason for visit</h3>
                    <textarea
                      value={symptoms}
                      onChange={(e) => setSymptoms(e.target.value)}
                      placeholder="Describe your symptoms..."
                      rows="3"
                      className="w-full px-4 py-4 bg-dark-900 border border-dark-700 rounded-xl focus:outline-none focus:border-dark-500 text-white placeholder-dark-400 resize-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-fit px-8 py-3.5 bg-transparent border border-dark-600 hover:bg-dark-700 text-white font-medium rounded-xl transition"
                  >
                    Confirm booking
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-6">
              <h3 className="font-bold text-white text-lg pb-2 border-b border-dark-700">
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
      </div>
    </div>
  );
};

export default BookAppointmentPage;
