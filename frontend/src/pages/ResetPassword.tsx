import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Paper, TextField, Button, Typography, Alert } from '@mui/material';
import { authService } from '../services/auth.service';

export const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Die Passwörter stimmen nicht überein');
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(token || '', password);
      navigate('/login', { state: { message: 'Passwort wurde erfolgreich geändert' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Zurücksetzen des Passworts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper sx={{ p: 4 }} component="form" onSubmit={handleSubmit}>
        <Typography variant="h5" gutterBottom>
          Neues Passwort setzen
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth
          type="password"
          label="Neues Passwort"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          type="password"
          label="Passwort bestätigen"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          sx={{ mb: 2 }}
        />
        <Button type="submit" variant="contained" disabled={loading} fullWidth>
          Passwort setzen
        </Button>
      </Paper>
    </Container>
  );
};

export default ResetPassword;
