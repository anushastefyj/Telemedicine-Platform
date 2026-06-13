import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useAuth } from '../context/AuthContext';
import {
  getAppointmentByIdAPI,
  createPrescriptionAPI,
  addReviewAPI,
  createPaymentIntentAPI,
  confirmPaymentAPI,
  getPrescriptionByAppointmentAPI,
} from '../services/api';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import Alert from '../components/Common/Alert';
import PaymentForm from '../components/PaymentForm';
import RatingStars from '../components/RatingStars';
import PrescriptionCard from '../components/PrescriptionCard';
import { Calendar, Clock, Video, FileText, Plus, Trash } from 'lucide-react';

const stripePromise = loadStripe('pk_test_mock_stripe_key_placeholder');

const AppointmentDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appointment, setAppointment] = useState(null);
  const [prescription, setPrescription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Payment integration
  const [clientSecret, setClientSecret] = useState('');

  // Prescription Form state
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '', duration: '' }]);
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const fetchAppointmentDetails = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await getAppointmentByIdAPI(id);
      if (res.success) {
        setAppointment(res.data);

        // Fetch prescription if present
        if (res.data.prescriptionId) {
          const presRes = await getPrescriptionByAppointmentAPI(res.data._id);
          if (presRes.success) {
            setPrescription(presRes.data);
          }
        }

        // If unpaid patient appointment, pre-load payment intent
        if (res.data.paymentStatus === 'pending' && user.role === 'patient' && res.data.status !== 'cancelled') {
          const payRes = await createPaymentIntentAPI({ appointmentId: res.data._id });
          if (payRes.success) {
            setClientSecret(payRes.clientSecret);
          }
        }
      } else {
        setErrorMsg('Failed to load appointment details');
      }
    } catch (err) {
      setErrorMsg('Failed to retrieve appointment details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAppointmentDetails();
    }
  }, [id, user]);

  // Payment callback
  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      const res = await confirmPaymentAPI({
        appointmentId: appointment._id,
        paymentId: paymentIntentId,
      });
      if (res.success) {
        setSuccessMsg('Payment processed successfully!');
        fetchAppointmentDetails();
      }
    } catch (err) {
      setErrorMsg('Failed to confirm payment details.');
    }
  };

  // Prescription Handlers
  const handleAddMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const handleRemoveMedication = (index) => {
    const values = [...medications];
    values.splice(index, 1);
    setMedications(values);
  };

  const handleMedicationChange = (index, field, value) => {
    const values = [...medications];
    values[index][field] = value;
    setMedications(values);
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    // Validate medications list
    const isValid = medications.every((m) => m.name && m.dosage && m.frequency && m.duration);
    if (!isValid) {
      setErrorMsg('Please fill in all medication fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await createPrescriptionAPI({
        appointmentId: appointment._id,
        medications,
        instructions,
        notes,
      });
      if (res.success) {
        setSuccessMsg('Prescription issued successfully!');
        fetchAppointmentDetails();
      }
    } catch (err) {
      setErrorMsg('Failed to issue prescription.');
    } finally {
      setLoading(false);
    }
  };

  // Review handler
  const handleAddReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await addReviewAPI({
        appointmentId: appointment._id,
        rating,
        comment,
      });
      if (res.success) {
        setSuccessMsg('Thank you! Review added successfully.');
        fetchAppointmentDetails();
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to submit review.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !appointment) return <LoadingSpinner fullPage />;
  if (!appointment) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400">
        <Link to={user.role === 'doctor' ? '/doctor-dashboard' : '/patient-dashboard'} className="hover:text-primary-500 transition">
          Dashboard
        </Link>
        <span>/</span>
        <span className="text-slate-600">Appointment Details</span>
      </div>

      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      <Alert type="success" message={successMsg} />

      {/* Detail Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b border-slate-100 mb-6 gap-2">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Virtual Consultation details</h1>
            <p className="text-slate-400 text-xs mt-1">Ref ID: {appointment._id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
              {appointment.status}
            </span>
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
              {appointment.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Appointment Information */}
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Consultation Information</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span>Date & Time</span>
                <span className="font-semibold text-slate-800">
                  {new Date(appointment.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} at {appointment.time}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-50">
                <span>Reason</span>
                <span className="font-semibold text-slate-800 italic">"{appointment.reason}"</span>
              </div>
              {appointment.symptoms && (
                <div className="flex justify-between py-2 border-b border-slate-50">
                  <span>Symptoms</span>
                  <span className="font-semibold text-slate-800">{appointment.symptoms}</span>
                </div>
              )}
            </div>

            {/* Video Call Trigger */}
            {(appointment.status === 'confirmed' || appointment.status === 'in-progress') && appointment.videoCallId && (
              <div className="pt-4">
                <Link
                  to={`/video-call/${appointment.videoCallId}`}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition shadow-md shadow-primary-500/10"
                >
                  <Video size={18} />
                  <span>Enter Video Consultation Room</span>
                </Link>
              </div>
            )}
          </div>

          {/* Counterpart Information & Checkout */}
          <div className="space-y-6">
            <h3 className="font-bold text-slate-800 text-sm">
              {user.role === 'doctor' ? 'Patient Profile' : 'Doctor Specialist'}
            </h3>

            {user.role === 'doctor' ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs text-slate-600">
                <p><span className="font-bold">Name:</span> {appointment.patientId?.name}</p>
                <p><span className="font-bold">Email:</span> {appointment.patientId?.email}</p>
                <p><span className="font-bold">Phone:</span> {appointment.patientId?.phone}</p>
                {appointment.patientId?.medicalHistory?.length > 0 && (
                  <p><span className="font-bold">History:</span> {appointment.patientId.medicalHistory.join(', ')}</p>
                )}
                {appointment.patientId?.allergies?.length > 0 && (
                  <p><span className="font-bold">Allergies:</span> {appointment.patientId.allergies.join(', ')}</p>
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center space-x-4">
                {appointment.doctorId?.profilePic ? (
                  <img
                    src={appointment.doctorId.profilePic}
                    alt={appointment.doctorId.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-700">
                    D
                  </div>
                )}
                <div>
                  <h4 className="font-bold text-slate-800">Dr. {appointment.doctorId?.name}</h4>
                  <p className="text-xs text-slate-400">{appointment.doctorId?.specialty}</p>
                </div>
              </div>
            )}

            {/* If patient is viewing and unpaid, render payment widget */}
            {user.role === 'patient' && appointment.paymentStatus === 'pending' && clientSecret && appointment.status !== 'cancelled' && (
              <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 space-y-4">
                <h4 className="font-bold text-slate-800 text-sm">Consultation Checkout</h4>
                <Elements stripe={stripePromise}>
                  <PaymentForm clientSecret={clientSecret} onPaymentSuccess={handlePaymentSuccess} />
                </Elements>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Section: Render prescription details or Forms */}
      <div className="grid grid-cols-1 gap-8">
        {/* If prescription exists, show it */}
        {prescription && (
          <div className="fade-in">
            <h3 className="font-bold text-slate-800 text-sm mb-4">Consultation Prescription</h3>
            <PrescriptionCard prescription={prescription} role={user?.role} />
          </div>
        )}

        {/* Doctor: Write Prescription Form */}
        {user.role === 'doctor' && ['confirmed', 'completed'].includes(appointment.status) && !prescription && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 fade-in">
            <h3 className="font-bold text-slate-800 text-base pb-2 border-b border-slate-100">
              Write New Prescription
            </h3>

            <form onSubmit={handleCreatePrescription} className="space-y-4">
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Medications List</label>
                {medications.map((med, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Medication name"
                      value={med.name}
                      onChange={(e) => handleMedicationChange(idx, 'name', e.target.value)}
                      className="sm:col-span-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Dosage e.g. 500mg"
                      value={med.dosage}
                      onChange={(e) => handleMedicationChange(idx, 'dosage', e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <input
                      type="text"
                      placeholder="Frequency"
                      value={med.frequency}
                      onChange={(e) => handleMedicationChange(idx, 'frequency', e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        placeholder="Duration"
                        value={med.duration}
                        onChange={(e) => handleMedicationChange(idx, 'duration', e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      {medications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveMedication(idx)}
                          className="text-rose-500 hover:text-rose-700 transition"
                        >
                          <Trash size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={handleAddMedication}
                  className="flex items-center space-x-1 text-primary-500 hover:text-primary-600 transition text-xs font-semibold"
                >
                  <Plus size={14} />
                  <span>Add Medication</span>
                </button>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Instructions</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Take after meals, avoid alcohol..."
                  rows="2"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-xs"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl transition text-xs"
              >
                Issue Prescription
              </button>
            </form>
          </div>
        )}

        {/* Patient: Leave Review Form */}
        {user.role === 'patient' && appointment.status === 'completed' && !appointment.reviewed && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 fade-in">
            <h3 className="font-bold text-slate-800 text-base pb-2 border-b border-slate-100">
              Leave a Review for Dr. {appointment.doctorId?.name}
            </h3>

            <form onSubmit={handleAddReview} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Overall Rating</label>
                <RatingStars rating={rating} onRatingChange={setRating} size={24} />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share details of your experience with this specialist..."
                  rows="3"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition text-xs"
              >
                Submit Review
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentDetailPage;
