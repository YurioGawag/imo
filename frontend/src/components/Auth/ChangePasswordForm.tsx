import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { userService } from '../../services/user.service';

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!currentPassword) {
      errors.currentPassword = 'Bitte geben Sie Ihr aktuelles Passwort ein';
    }
    
    if (!newPassword) {
      errors.newPassword = 'Bitte geben Sie ein neues Passwort ein';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Das Passwort muss mindestens 8 Zeichen lang sein';
    }
    
    if (!confirmPassword) {
      errors.confirmPassword = 'Bitte bestätigen Sie Ihr neues Passwort';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Die Passwörter stimmen nicht überein';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setError('');
      
      await userService.changePassword({
        currentPassword,
        newPassword
      });
      
      setSuccess(true);
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.message || 'Fehler beim Ändern des Passworts');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 500, mx: 'auto', mt: 4 }}>
      <Typography component="h1" variant="h5" gutterBottom>
        Passwort ändern
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Ihr Passwort wurde erfolgreich geändert.
        </Alert>
      )}
      
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          margin="normal"
          required
          fullWidth
          name="currentPassword"
          label="Aktuelles Passwort"
          type="password"
          id="currentPassword"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          error={!!validationErrors.currentPassword}
          helperText={validationErrors.currentPassword}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="newPassword"
          label="Neues Passwort"
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          error={!!validationErrors.newPassword}
          helperText={validationErrors.newPassword}
          disabled={loading}
        />
        
        <TextField
          margin="normal"
          required
          fullWidth
          name="confirmPassword"
          label="Neues Passwort bestätigen"
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={!!validationErrors.confirmPassword}
          helperText={validationErrors.confirmPassword}
          disabled={loading}
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : 'Passwort ändern'}
        </Button>
      </Box>
    </Paper>
  );
};

export default ChangePasswordForm;
