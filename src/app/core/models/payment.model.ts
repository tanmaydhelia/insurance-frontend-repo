export enum PaymentStatus {
  CREATED = 'CREATED',
  PAID = 'PAID',
  FAILED = 'FAILED'
}

export interface IPayment {
  id: number;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: PaymentStatus;
  amount: number;
  userId: number;
  policyId?: number;
  createdAt: string;
}

export interface ICreateOrderRequest {
  amount: number;
  userId: number;
  policyId?: number;
}

export interface IVerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface IVerifyPaymentResponse {
  status: 'success' | 'failed';
  message: string;
}

// Razorpay Checkout Options
export interface IRazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: IRazorpayResponse) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export interface IRazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Declare Razorpay on window
declare global {
  interface Window {
    Razorpay: new (options: IRazorpayOptions) => {
      open: () => void;
      close: () => void;
    };
  }
}
