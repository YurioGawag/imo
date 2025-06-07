import React, { useState } from 'react';
import { Container, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { authService } from '../services/auth.service';

export const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await authService.requestPasswordReset(email);
      setSuccess('Falls ein Konto existiert, wurde eine E-Mail zum Zurücksetzen des Passworts gesendet.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Anfordern des Passwort-Resets');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          Passwort vergessen
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <TextField
          fullWidth
          type="email"
          label="E-Mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          Zurücksetzen anfordern
        </Button>
      </Paper>
    </Container>
  );
};

export default ForgotPassword;
