import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  useTheme
} from '@mui/material';
import { vermieterService } from '../../services/vermieter.service';
import { useAuthStore } from '../../store/auth.store';
import AddIcon from '@mui/icons-material/Add';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from '../vermieter/vermieterNavigation';

interface Handwerker {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization: string;
}

interface HandwerkerFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialization: string;
}

export const HandwerkerList: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuthStore();
  const [handwerker, setHandwerker] = useState<Handwerker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState<HandwerkerFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: ''
  });

  const fetchHandwerker = async () => {
    try {
      const data = await vermieterService.getHandwerker();
      setHandwerker(data);
    } catch (err) {
      console.error('Error fetching handwerker:', err);
      setError('Fehler beim Laden der Handwerkerliste');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHandwerker();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      await vermieterService.createHandwerker(formData);
      setOpenDialog(false);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        specialization: ''
      });
      fetchHandwerker(); // Liste aktualisieren
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fehler beim Anlegen des Handwerkers');
    }
  };

  const content = () => {
    if (isLoading) {
      return (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      );
    }

    return (
      <Box p={3}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Handwerker</Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
          >
            Handwerker hinzufügen
          </Button>
        </Box>

        {error && (
          <Typography color="error" mb={2}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {handwerker.map((hw) => (
            <Grid item xs={12} md={6} lg={4} key={hw._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6">
                    {hw.firstName} {hw.lastName}
                  </Typography>
                  <Typography color="textSecondary" gutterBottom>
                    {hw.specialization}
                  </Typography>
                  <Typography variant="body2">
                    Email: {hw.email}
                  </Typography>
                  {hw.phone && (
                    <Typography variant="body2">
                      Telefon: {hw.phone}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Neuen Handwerker anlegen</DialogTitle>
          <DialogContent>
            <Box mt={2}>
              <TextField
                fullWidth
                label="Vorname"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Nachname"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="E-Mail"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Telefon"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Spezialisierung"
                name="specialization"
                value={formData.specialization}
                onChange={handleInputChange}
                margin="normal"
                required
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
            <Button onClick={handleSubmit} color="primary">
              Anlegen
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return (
    <MainLayout title="Handwerker" navigationItems={vermieterNavigationItems}>
      {content()}
    </MainLayout>
  );
};

export default HandwerkerList;
