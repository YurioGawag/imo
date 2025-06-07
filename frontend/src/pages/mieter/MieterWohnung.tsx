import { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress
} from '@mui/material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';
import api from '../../services/api';

interface Address {
  street: string;
  city: string;
  postalCode: string;
  country: string;
}

interface PropertyInfo {
  name: string;
  address: Address;
}

interface UnitInfo {
  unitNumber: string;
  floor?: number;
  squareMeters: number;
  rooms: number;
  monthlyRent?: number;
  property: PropertyInfo;
}

interface ProfileData {
  unit?: UnitInfo;
}

export const MieterWohnung: React.FC = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/mieter/profile');
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  if (loading) {
    return (
      <MainLayout navigationItems={navigationItems} title="Meine Wohnung">
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!profile?.unit) {
    return (
      <MainLayout navigationItems={navigationItems} title="Meine Wohnung">
        <Typography>Keine Wohnungsdaten gefunden.</Typography>
      </MainLayout>
    );
  }

  const { unit } = profile;

  return (
    <MainLayout navigationItems={navigationItems} title="Meine Wohnung">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {unit.property.name}
        </Typography>
        <Typography gutterBottom>
          {unit.property.address.street}, {unit.property.address.postalCode}{' '}
          {unit.property.address.city}, {unit.property.address.country}
        </Typography>
        <Grid container spacing={2} mt={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Wohnungsnummer
            </Typography>
            <Typography>{unit.unitNumber}</Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Größe
            </Typography>
            <Typography>
              {unit.squareMeters} m² • {unit.rooms} Zimmer
            </Typography>
          </Grid>
          {unit.monthlyRent && (
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Miete
              </Typography>
              <Typography>{unit.monthlyRent} € / Monat</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </MainLayout>
  );
};