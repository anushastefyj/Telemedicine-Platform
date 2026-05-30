import React, { useState } from 'react';
import { useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { CreditCard, Loader2 } from 'lucide-react';
import Alert from './Common/Alert';

const PaymentForm = ({ clientSecret, onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    setSuccessMsg('');

    // Handle mock payment clientSecret gracefully for local dev offline
    if (clientSecret.startsWith('pi_mock_secret_')) {
      setTimeout(() => {
        setIsProcessing(false);
        setSuccessMsg('Payment Successful (Dev Mode Mock)!');
        onPaymentSuccess(`mock_payment_id_${Math.random().toString(36).substring(2, 10)}`);
      }, 1500);
      return;
    }

    try {
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (payload.error) {
        setErrorMsg(`Payment failed: ${payload.error.message}`);
      } else {
        setSuccessMsg('Payment Successful!');
        onPaymentSuccess(payload.paymentIntent.id);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during payment processing.');
    } finally {
      setIsProcessing(false);
    }
  };

  const cardStyle = {
    style: {
      base: {
        color: '#0f172a',
        fontFamily: 'Inter, sans-serif',
        fontSmoothing: 'antialiased',
        fontSize: '15px',
        '::placeholder': {
          color: '#94a3b8',
        },
      },
      invalid: {
        color: '#e11d48',
        iconColor: '#e11d48',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Alert type="error" message={errorMsg} onClose={() => setErrorMsg('')} />
      <Alert type="success" message={successMsg} />

      <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-400 mb-3 uppercase tracking-wider">
          <CreditCard size={14} />
          <span>Secure Credit Card Payment</span>
        </div>
        <CardElement options={cardStyle} className="py-2" />
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full flex items-center justify-center space-x-2 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition shadow-sm disabled:opacity-50"
      >
        {isProcessing ? (
          <>
            <Loader2 className="animate-spin h-5 w-5" />
            <span>Processing Payment...</span>
          </>
        ) : (
          <span>Pay Consultation Fee</span>
        )}
      </button>
    </form>
  );
};

export default PaymentForm;
