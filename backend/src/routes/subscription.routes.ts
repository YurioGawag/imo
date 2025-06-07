import express from 'express';
import { authenticateJwt, AuthRequest } from '../middleware/auth.middleware';
import { subscriptionService } from '../services/subscription.service';

const router = express.Router();
router.use(authenticateJwt);

router.post('/create', async (req: AuthRequest, res) => {
  try {
    const { plan } = req.body;
    const approvalUrl = await subscriptionService.createSubscription(
      req.user!.userId,
      plan
    );
    res.json({ approvalUrl });
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/update', async (req: AuthRequest, res) => {
  try {
    const { apartmentCount } = req.body;
    await subscriptionService.reviseSubscription(req.user!.userId, apartmentCount);
    res.json({ message: 'updated' });
  } catch (err:any) {
    res.status(500).json({ message: err.message });
  }
});


export default router;
