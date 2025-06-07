import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './handwerkerNavigation';
import { useAuthStore } from '../../store/auth.store';
import { handwerkerService, HandwerkerProfile } from '../../services/handwerker.service';

export const HandwerkerProfil: React.FC = () => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<HandwerkerProfile>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await handwerkerService.getProfile();
      setProfileData(data);
    } catch (error) {
      setError('Fehler beim Laden des Profils');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await handwerkerService.updateProfile(profileData);
      setSuccess('Profil erfolgreich aktualisiert');
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      setError('Fehler beim Aktualisieren des Profils');
    }
  };

  const content = (
    <Card>
      <CardContent>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Persönliche Informationen
          </Typography>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Vorname"
                name="firstName"
                value={profileData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nachname"
                name="lastName"
                value={profileData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="E-Mail"
                name="email"
                value={profileData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                type="email"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={profileData.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {!isEditing ? (
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsEditing(true)}
            >
              Bearbeiten
            </Button>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset to original data
                }}
              >
                Abbrechen
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
              >
                Speichern
              </Button>
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <MainLayout title="Mein Profil" navigationItems={navigationItems}>
      {content}
    </MainLayout>
  );
};

export default HandwerkerProfil;
