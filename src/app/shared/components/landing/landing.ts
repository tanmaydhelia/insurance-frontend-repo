import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../core/services/auth/auth';
import { ERole, IUser } from '../../../core/models/user.model';
import { take } from 'rxjs';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, Footer],
  templateUrl: './landing.html',
  styleUrl: './landing.css'
})
export class LandingComponent implements OnInit {
  private auth = inject(Auth);
  private router = inject(Router);

  isLoggedIn = false;
  currentYear = new Date().getFullYear();

  features = [
    {
      icon: 'pi pi-shield',
      title: 'Comprehensive Coverage',
      description: 'From health to life insurance, we offer plans that protect what matters most to you and your family.'
    },
    {
      icon: 'pi pi-bolt',
      title: 'Quick Claims Processing',
      description: 'Our streamlined digital claims process ensures you get your settlements faster than ever.'
    },
    {
      icon: 'pi pi-wallet',
      title: 'Affordable Premiums',
      description: 'Competitive pricing with flexible payment options to fit every budget and lifestyle.'
    },
    {
      icon: 'pi pi-headphones',
      title: '24/7 Support',
      description: 'Our dedicated support team is always available to assist you with any queries or concerns.'
    }
  ];

  stats = [
    { value: '500K+', label: 'Happy Customers' },
    { value: '₹50Cr+', label: 'Claims Settled' },
    { value: '99.5%', label: 'Claim Approval Rate' },
    { value: '24/7', label: 'Customer Support' }
  ];

  plans = [
    {
      name: 'Basic Health',
      price: '₹499',
      period: '/month',
      features: ['Individual Coverage', 'Up to ₹5 Lakhs', 'Cashless Hospitalization', 'No Waiting Period'],
      popular: false
    },
    {
      name: 'Family Shield',
      price: '₹999',
      period: '/month',
      features: ['Family of 4 Coverage', 'Up to ₹15 Lakhs', 'Cashless + Reimbursement', 'Maternity Benefits', 'Free Health Checkups'],
      popular: true
    },
    {
      name: 'Premium Plus',
      price: '₹1,999',
      period: '/month',
      features: ['Unlimited Members', 'Up to ₹50 Lakhs', 'Global Coverage', 'Air Ambulance', 'Personal Health Manager'],
      popular: false
    }
  ];

  testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      image: 'https://randomuser.me/api/portraits/women/44.jpg',
      quote: 'The claim process was incredibly smooth. I received my settlement within 48 hours!'
    },
    {
      name: 'Rajesh Kumar',
      role: 'IT Professional',
      image: 'https://randomuser.me/api/portraits/men/32.jpg',
      quote: 'Best insurance service I\'ve ever used. Their customer support is exceptional.'
    },
    {
      name: 'Anita Desai',
      role: 'Doctor',
      image: 'https://randomuser.me/api/portraits/women/68.jpg',
      quote: 'Affordable plans with comprehensive coverage. Highly recommend to everyone!'
    }
  ];

  ngOnInit(): void {
    this.auth.user$.pipe(take(1)).subscribe((user: IUser | null) => {
      this.isLoggedIn = !!user;
    });
  }

  goToDashboard(): void {
    this.auth.user$.pipe(take(1)).subscribe((user: IUser | null) => {
      if (!user) {
        this.router.navigate(['/auth/login']);
        return;
      }

      switch (user.role) {
        case ERole.ROLE_ADMIN:
          this.router.navigate(['/admin/dashboard']);
          break;
        case ERole.ROLE_USER:
          this.router.navigate(['/member/dashboard']);
          break;
        case ERole.ROLE_AGENT:
          this.router.navigate(['/agent/dashboard']);
          break;
        case ERole.ROLE_PROVIDER:
          this.router.navigate(['/provider/dashboard']);
          break;
        case ERole.ROLE_CLAIMS_OFFICER:
          this.router.navigate(['/claims/dashboard']);
          break;
        default:
          this.router.navigate(['/auth/login']);
          break;
      }
    });
  }

  scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }
}
