import express from 'express';
import { subscriptionService } from '../services/subscription.service';

const router = express.Router();

router.post('/', async (req, res) => {
  const event = req.body;
  try {
    if (event.resource?.id) {
      if (event.event_type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        await subscriptionService.updateStatus(event.resource.id, 'ACTIVE');
      }
      if (event.event_type === 'BILLING.SUBSCRIPTION.CANCELLED') {
        await subscriptionService.updateStatus(event.resource.id, 'CANCELLED');
      }
      if (event.event_type === 'PAYMENT.SALE.DENIED') {
        await subscriptionService.updateStatus(event.resource.billing_agreement_id, 'FAILED');
      }
    }
    res.sendStatus(200);
  } catch(err:any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
