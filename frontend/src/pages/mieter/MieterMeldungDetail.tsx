import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  DialogContentText,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';
import { BaseMeldungDetail } from '../../components/Meldung/BaseMeldungDetail';
import { MeldungStatus } from '../../types/meldung.types';
import api from '../../services/api';
import { useSnackbar } from 'notistack';

interface Meldung {
  _id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  reporter: {
    firstName: string;
    lastName: string;
  };
  assignedTo?: {
    firstName: string;
    lastName: string;
  };
}

export const MieterMeldungDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [openDialog, setOpenDialog] = useState(false);
  const [meldung, setMeldung] = useState<Meldung | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    const fetchMeldung = async () => {
      try {
        const response = await api.get(`/mieter/meldungen/${id}`);
        setMeldung(response.data);
      } catch (error) {
        console.error('Error fetching meldung:', error);
        enqueueSnackbar('Fehler beim Laden der Meldung', { variant: 'error' });
      }
    };

    if (id) {
      fetchMeldung();
    }
  }, [id, enqueueSnackbar]);

  const handleBack = () => {
    navigate('/mieter/meldungen');
  };

  const handleStatusChange = async (newStatus: MeldungStatus) => {
    if (!id) return;

    try {
      await api.put(`/mieter/meldungen/${id}/status`, {
        status: newStatus
      });
      // Optional: Feedback an den Benutzer
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleConfirmCompletion = async () => {
    try {
      await api.put(`/mieter/meldungen/${id}/status`, {
        status: MeldungStatus.ABGESCHLOSSEN
      });
      
      setMeldung(prev => prev ? {
        ...prev,
        status: MeldungStatus.ABGESCHLOSSEN
      } : null);
      
      enqueueSnackbar('Meldung wurde als abgeschlossen markiert', { variant: 'success' });
    } catch (error) {
      console.error('Error confirming completion:', error);
      enqueueSnackbar('Fehler beim Bestätigen der Fertigstellung', { variant: 'error' });
    }
  };

  const handleConfirmDialog = async () => {
    try {
      await api.put(`/mieter/meldungen/${id}/status`, {
        status: MeldungStatus.ABGESCHLOSSEN
      });
      
      setMeldung(prev => prev ? {
        ...prev,
        status: MeldungStatus.ABGESCHLOSSEN
      } : null);
      
      setOpenDialog(false);
    } catch (error) {
      console.error('Error updating meldung status:', error);
    }
  };

  const additionalActions = (
    <>
      {meldung?.status === MeldungStatus.HANDWERKER_ERLEDIGT && (
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
          sx={{ mt: 2 }}
        >
          Als erledigt bestätigen
        </Button>
      )}

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
      >
        <DialogTitle>Meldung als erledigt markieren?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Bitte bestätigen Sie, dass die Reparatur zu Ihrer Zufriedenheit ausgeführt wurde.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Abbrechen</Button>
          <Button onClick={handleConfirmDialog} color="primary">
            Bestätigen
          </Button>
        </DialogActions>
      </Dialog>

      {meldung?.status === MeldungStatus.HANDWERKER_ERLEDIGT && (
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirmCompletion}
        >
          Fertigstellung bestätigen
        </Button>
      )}
    </>
  );

  if (!id) {
    return null;
  }

  return (
    <MainLayout title="Meldung Details" navigationItems={navigationItems}>
      <Box sx={{ mb: 3 }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mb: 2 }}
        >
          Zurück zur Liste
        </Button>
      </Box>

      <BaseMeldungDetail
        role="mieter"
        meldungId={id}
        apiEndpoint="/mieter/meldungen"
        onStatusChange={handleStatusChange}
        additionalActions={additionalActions}
      />
    </MainLayout>
  );
};
