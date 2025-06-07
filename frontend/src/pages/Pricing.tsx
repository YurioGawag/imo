import React from 'react';
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { useAuthStore } from '../store/auth.store';
import { subscriptionService } from '../services/subscription.service';

interface Plan {
  key: string;
  title: string;
  price: string;
  description: string;
  limit: number;
}

const plans: Plan[] = [
  {
    key: 'small',
    title: 'Small',
    price: '19,90€ / Monat',
    description: 'Bis zu 10 Wohnungen (1,99€ pro Wohnung)',
    limit: 10
  },
  {
    key: 'medium',
    title: 'Medium',
    price: '74,50€ / Monat',
    description: 'Bis zu 50 Wohnungen (1,49€ pro Wohnung)',
    limit: 50
  },
  {
    key: 'large',
    title: 'Large',
    price: '99,00€ / Monat',
    description: 'Bis zu 100 Wohnungen (0,99€ pro Wohnung)',
    limit: 100
  }
];

export const Pricing: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  const handleSubscribe = async (plan: Plan) => {
    if (!isAuthenticated) {
      alert('Bitte zuerst einloggen.');
      return;
    }
    const result = await subscriptionService.create(plan.key);
    window.location.href = result.approvalUrl;
  };

  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Wähle dein Abo-Modell
      </Typography>
      <Grid container spacing={4} justifyContent="center">
        {plans.map((plan) => (
          <Grid item xs={12} sm={6} md={4} key={plan.key}>
            <Card sx={{ textAlign: 'center', p: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {plan.title}
                </Typography>
                <Typography variant="h5" color="primary" gutterBottom>
                  {plan.price}
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {plan.description}
                </Typography>
                <Button variant="contained" onClick={() => handleSubscribe(plan)} sx={{ mt: 1 }}>
                  Auswählen
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Mehr als 100 Wohnungen?
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Bitte kontaktiere uns per E-Mail.
              </Typography>
              <Button variant="outlined" href="mailto:info@example.com" sx={{ mt: 1 }}>
                Kontakt
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Pricing;

