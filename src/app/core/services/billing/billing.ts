import { Injectable } from '@angular/core';
import { Observable, from, switchMap, tap } from 'rxjs';
import { Api } from '../api/api';
import { 
  IPayment, 
  ICreateOrderRequest, 
  IVerifyPaymentRequest, 
  IVerifyPaymentResponse,
  IRazorpayOptions,
  IRazorpayResponse
} from '../../models/payment.model';
import { environment } from '../../../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class Billing {
  private BASE_PATH = '/billing';
  
  // Razorpay Key from environment
  private RAZORPAY_KEY = environment.razorpayKey;

  constructor(private api: Api) {}

  /**
   * Create a Razorpay order
   */
  createOrder(request: ICreateOrderRequest): Observable<IPayment> {
    return this.api.post<IPayment>(`${this.BASE_PATH}/create-order`, request);
  }

  /**
   * Verify payment after Razorpay checkout
   */
  verifyPayment(request: IVerifyPaymentRequest): Observable<IVerifyPaymentResponse> {
    return this.api.post<IVerifyPaymentResponse>(`${this.BASE_PATH}/verify`, request);
  }

  /**
   * Get payment by ID
   */
  getPaymentById(id: number): Observable<IPayment> {
    return this.api.get<IPayment>(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Get payments by user ID
   */
  getPaymentsByUser(userId: number): Observable<IPayment[]> {
    return this.api.get<IPayment[]>(`${this.BASE_PATH}/user/${userId}`);
  }

  /**
   * Load Razorpay script dynamically
   */
  loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  }

  /**
   * Open Razorpay checkout
   */
  openCheckout(options: {
    orderId: string;
    amount: number;
    name: string;
    description: string;
    prefill?: { name?: string; email?: string; contact?: string };
    onSuccess: (response: IRazorpayResponse) => void;
    onDismiss?: () => void;
  }): Promise<void> {
    return this.loadRazorpayScript().then((loaded) => {
      if (!loaded) {
        throw new Error('Failed to load Razorpay SDK');
      }

      const razorpayOptions: IRazorpayOptions = {
        key: this.RAZORPAY_KEY,
        amount: options.amount * 100, // Convert to paise
        currency: 'INR',
        name: options.name,
        description: options.description,
        order_id: options.orderId,
        handler: options.onSuccess,
        prefill: options.prefill,
        theme: {
          color: '#4F46E5' // Indigo color to match the app theme
        },
        modal: {
          ondismiss: options.onDismiss
        }
      };

      const razorpay = new window.Razorpay(razorpayOptions);
      razorpay.open();
    });
  }

  /**
   * Complete payment flow: Create order -> Open checkout -> Verify payment
   */
  initiatePayment(params: {
    amount: number;
    userId: number;
    policyId?: number;
    planName: string;
    userEmail?: string;
    userName?: string;
  }): Observable<{ verified: boolean; payment?: IPayment }> {
    return this.createOrder({
      amount: params.amount,
      userId: params.userId,
      policyId: params.policyId
    }).pipe(
      switchMap((payment) => {
        return from(new Promise<{ verified: boolean; payment?: IPayment }>((resolve, reject) => {
          this.openCheckout({
            orderId: payment.razorpayOrderId,
            amount: params.amount,
            name: 'Smart Health Insurance',
            description: `Premium for ${params.planName}`,
            prefill: {
              name: params.userName,
              email: params.userEmail
            },
            onSuccess: (response) => {
              // Verify payment
              this.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }).subscribe({
                next: (verifyResponse) => {
                  if (verifyResponse.status === 'success') {
                    resolve({ verified: true, payment });
                  } else {
                    resolve({ verified: false, payment });
                  }
                },
                error: () => resolve({ verified: false, payment })
              });
            },
            onDismiss: () => {
              resolve({ verified: false, payment });
            }
          }).catch(reject);
        }));
      })
    );
  }
}
