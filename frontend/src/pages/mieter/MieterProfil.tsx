import React, { useEffect, useState } from 'react';
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
import { useAuthStore } from '../../store/auth.store';
import { mieterService } from '../../services/mieter.service';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  unit?: {
    unitNumber: string;
    property: {
      name: string;
      address: {
        street: string;
        postalCode: string;
        city: string;
      };
    };
  };
}

export const MieterProfil: React.FC = () => {
  const { user } = useAuthStore();
  const [profileData, setProfileData] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await mieterService.getProfile();
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
      await mieterService.updateProfile(profileData);
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

        {profileData.unit && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>
              Wohnungsdetails
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Wohnungsnummer"
                  value={profileData.unit.unitNumber}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Immobilie"
                  value={profileData.unit.property.name}
                  disabled
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Adresse"
                  value={`${profileData.unit.property.address.street}, ${profileData.unit.property.address.postalCode} ${profileData.unit.property.address.city}`}
                  disabled
                />
              </Grid>
            </Grid>
          </Box>
        )}

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
