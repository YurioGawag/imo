import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Paper,
  Typography,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Chat as ChatIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './handwerkerNavigation';
import { UnifiedChat } from '../../components/Chat/UnifiedChat';
import api from '../../services/api';
import { Meldung, MeldungStatus } from '../../types/meldung.types';
import { useSnackbar } from 'notistack';

export const HandwerkerMeldungDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [meldung, setMeldung] = useState<Meldung | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [allowedStatus, setAllowedStatus] = useState<MeldungStatus[]>([]);

  useEffect(() => {
    const fetchMeldung = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await api.get(`/handwerker/meldungen/${id}`);
        setMeldung(response.data);
      } catch (err) {
        console.error('Error fetching meldung:', err);
        enqueueSnackbar('Fehler beim Laden der Meldung', { variant: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchMeldung();
  }, [id, enqueueSnackbar]);

  const handleBack = () => {
    navigate('/handwerker/dashboard');
  };

  const handleMarkAsComplete = async () => {
    if (!id || !notes.trim()) return;

    try {
      await api.put(`/handwerker/meldungen/${id}/complete`, {
        notes
      });

      setMeldung(prev => prev ? {
        ...prev,
        status: MeldungStatus.HANDWERKER_ERLEDIGT
      } : null);
      
      setOpenDialog(false);
      enqueueSnackbar('Meldung als erledigt markiert', { variant: 'success' });
    } catch (error) {
      console.error('Error updating meldung status:', error);
      enqueueSnackbar('Fehler beim Aktualisieren des Status', { variant: 'error' });
    }
  };

  const handleStatusUpdate = async () => {
    if (!id || !selectedStatus || !notes.trim()) return;

    try {
      console.log('Updating status:', {
        status: selectedStatus,
        notes
      });

      await api.put(`/handwerker/meldungen/${id}/status`, {
        status: selectedStatus,
        notes
      });

      // Aktualisiere die Meldung nach dem Status-Update
      const response = await api.get(`/handwerker/meldungen/${id}`);
      setMeldung(response.data);
      
      setOpenDialog(false);
      setSelectedStatus('');
      setNotes('');
      enqueueSnackbar('Status erfolgreich aktualisiert', { variant: 'success' });
    } catch (error: any) {
      console.error('Error updating meldung status:', error);
      enqueueSnackbar(error.response?.data?.message || 'Fehler beim Aktualisieren des Status', { 
        variant: 'error' 
      });
    }
  };

  const getStatusLabel = (status: MeldungStatus) => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return 'Offen';
      case MeldungStatus.IN_BEARBEITUNG:
        return 'In Bearbeitung';
      case MeldungStatus.HANDWERKER_ERLEDIGT:
        return 'Erledigt';
      case MeldungStatus.ABGESCHLOSSEN:
        return 'Abgeschlossen';
      default:
        return 'Unbekannt';
    }
  };

  const getStatusColor = (status: MeldungStatus) => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return 'default';
      case MeldungStatus.IN_BEARBEITUNG:
        return 'warning';
      case MeldungStatus.HANDWERKER_ERLEDIGT:
        return 'success';
      case MeldungStatus.ABGESCHLOSSEN:
        return 'success';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <MainLayout title="Meldung laden..." navigationItems={navigationItems}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="500px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (!meldung) {
    return (
      <MainLayout title="Fehler" navigationItems={navigationItems}>
        <Typography color="error" align="center">
          Meldung nicht gefunden
        </Typography>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Zurück zur Übersicht
        </Button>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Meldung: ${meldung.title}`} navigationItems={navigationItems}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2 }}
      >
        Zurück zur Übersicht
      </Button>

      <Grid container spacing={3}>
        {/* Linke Seite: Meldung Details */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              {meldung.title}
            </Typography>
            <Typography variant="body1" paragraph>
              {meldung.description}
            </Typography>

            {/* Bilder Anzeige */}
            {meldung.images && meldung.images.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Bilder:
                </Typography>
                <Grid container spacing={1}>
                  {meldung.images.map((image, index) => (
                    <Grid item key={index}>
                      <Box
                        component="img"
                        src={`${process.env.REACT_APP_API_URL}/uploads/${image}`}
                        alt={`Bild ${index + 1}`}
                        sx={{
                          width: 150,
                          height: 150,
                          objectFit: 'cover',
                          borderRadius: 1,
                          cursor: 'pointer',
                        }}
                        onClick={() => window.open(`${process.env.REACT_APP_API_URL}/uploads/${image}`, '_blank')}
                      />
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Status: <Chip 
                  label={getStatusLabel(meldung.status)} 
                  color={getStatusColor(meldung.status)} 
                  size="small" 
                />
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Raum: {meldung.room}
              </Typography>
              {meldung.reporter && (
                <Typography variant="subtitle2" gutterBottom>
                  Gemeldet von: {meldung.reporter.firstName} {meldung.reporter.lastName}
                </Typography>
              )}
              <Typography variant="subtitle2" gutterBottom>
                Erstellt am: {new Date(meldung.createdAt).toLocaleDateString()}
              </Typography>
            </Box>

            <Box sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  // Nur bestimmte Status-Übergänge erlauben
                  const allowedStatus = [];
                  if (meldung.status === MeldungStatus.OFFEN) {
                    allowedStatus.push(MeldungStatus.IN_BEARBEITUNG);
                  } else if (meldung.status === MeldungStatus.IN_BEARBEITUNG) {
                    allowedStatus.push(MeldungStatus.HANDWERKER_ERLEDIGT);
                  }
                  setAllowedStatus(allowedStatus);
                  setOpenDialog(true);
                }}
                disabled={meldung.status === MeldungStatus.ABGESCHLOSSEN || meldung.status === MeldungStatus.STORNIERT}
              >
                Status aktualisieren
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Rechte Seite: Chat */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Kommunikation
            </Typography>
            <UnifiedChat 
              meldungId={meldung._id}
              currentUserRole="handwerker"
              availableChatPartners={[
                {
                  id: meldung.unit.property.owner._id,
                  firstName: meldung.unit.property.owner.firstName,
                  lastName: meldung.unit.property.owner.lastName,
                  role: 'vermieter'
                }
              ]}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Status aktualisieren</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Neuer Status</InputLabel>
              <Select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                label="Neuer Status"
              >
                {allowedStatus.map((status) => (
                  <MenuItem key={status} value={status}>
                    {getStatusLabel(status)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notizen"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              helperText="Bitte geben Sie einen Kommentar zum Status-Update ein"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button
            onClick={handleStatusUpdate}
            variant="contained"
            disabled={!selectedStatus || !notes.trim()}
          >
            Aktualisieren
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};
