import { paypalClient } from '../config/paypal';
import { User } from '../models/user.model';
import paypal from '@paypal/checkout-server-sdk';

interface PayPalLink {
  href: string;
  rel: string;
  method?: string;
}

export const subscriptionService = {
  async createSubscription(userId: string, plan: string) {
    const plans: Record<string, string | undefined> = {
      small: process.env.PAYPAL_PLAN_SMALL_ID,
      medium: process.env.PAYPAL_PLAN_MEDIUM_ID,
      large: process.env.PAYPAL_PLAN_LARGE_ID
    };
    const quotas: Record<string, number> = { small: 10, medium: 50, large: 100 };
    const planId = plans[plan] || process.env.PAYPAL_PLAN_SMALL_ID;
    const quantity = quotas[plan] || 10;
    if (!planId) throw new Error('PayPal plan ID not configured');

    const request = new paypal.subscriptions.SubscriptionCreateRequest();
    request.requestBody({
      plan_id: planId,
      quantity: quantity.toString(),
      application_context: {
        brand_name: 'House Platform',
        locale: 'de-DE',
        return_url: `${process.env.FRONTEND_URL}/billing/success`,
        cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`
      }
    });

    const response = await paypalClient.execute(request);
    const subscriptionId = response.result.id as string;

    await User.findByIdAndUpdate(userId, {
      subscriptionId,
      subscriptionStatus: 'PENDING',
      subscriptionPlan: plan,
      apartmentCount: quantity
    });

    const approval = response.result.links?.find(
      (link: PayPalLink) => link.rel === 'approve'
    );
    return approval?.href;
  },

  async reviseSubscription(userId: string, quantity: number) {
    const user = await User.findById(userId);
    if (!user || !user.subscriptionId) throw new Error('Subscription not found');

    const request = new paypal.subscriptions.SubscriptionReviseRequest(user.subscriptionId);
    request.requestBody({ quantity: quantity.toString() });

    await paypalClient.execute(request);
    user.apartmentCount = quantity;
    await user.save();
  },

  async updateStatus(subscriptionId: string, status: string) {
    await User.findOneAndUpdate({ subscriptionId }, { subscriptionStatus: status });
  }

};

