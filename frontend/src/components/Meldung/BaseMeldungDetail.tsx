// src/components/Meldung/BaseMeldungDetail.tsx

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';
import { MeldungStatus } from '../../types/meldung.types';
import { UnifiedChat } from '../Chat/UnifiedChat';
import api from '../../services/api';

// Definiere die notwendigen Interfaces, um die populierten Daten widerzuspiegeln
interface Property {
  _id: string;
  name: string;
  owner: {
    _id: string;
    firstName: string;
    lastName: string;
    role: 'mieter' | 'vermieter' | 'handwerker';
  };
}

interface Unit {
  _id: string;
  property: Property;
  unitNumber: string;
  // Weitere Felder nach Bedarf
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  role: 'mieter' | 'vermieter' | 'handwerker';
}

interface ImageType {
  url: string;
  // weitere Bildattribute falls nötig
}

interface IMeldung {
  _id: string;
  title: string;
  description: string;
  status: MeldungStatus;
  priority: string;
  unit: Unit;
  reporter: User;
  assignedTo: User;
  images: ImageType[];
  comments: any[];
  createdAt: string;
  vermieter: User;
}

interface ChatPartner {
  id: string;
  firstName: string;
  lastName: string;
  role: 'mieter' | 'vermieter' | 'handwerker';
}

export interface BaseMeldungDetailProps {
  role: 'mieter' | 'vermieter' | 'handwerker';
  meldungId: string;
  onStatusChange?: (status: MeldungStatus) => void;
  additionalActions?: React.ReactNode;
  apiEndpoint: string; // z.B. '/mieter/meldungen' oder '/vermieter/meldungen'
}

export const BaseMeldungDetail: React.FC<BaseMeldungDetailProps> = ({
  role,
  meldungId,
  onStatusChange,
  additionalActions,
  apiEndpoint,
}) => {
  const [meldung, setMeldung] = useState<IMeldung | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!meldungId) {
        setError('Keine Meldungs-ID gefunden');
        setLoading(false);
        return;
      }

      try {
        // Holen der Meldung mit vollständiger Populierung
        const meldungResponse = await api.get(`${apiEndpoint}/${meldungId}`);
        setMeldung(meldungResponse.data.meldung);
        setError(null);
      } catch (error) {
        console.error('Fehler beim Laden der Daten:', error);
        setError('Fehler beim Laden der Daten');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [meldungId, apiEndpoint]);

  const getStatusText = (status: MeldungStatus) => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return 'Offen';
      case MeldungStatus.IN_BEARBEITUNG:
        return 'In Bearbeitung';
      case MeldungStatus.HANDWERKER_ERLEDIGT:
        return 'Vom Handwerker erledigt';
      case MeldungStatus.ABGESCHLOSSEN:
        return 'Abgeschlossen';
      case MeldungStatus.STORNIERT:
        return 'Storniert';
      default:
        return status;
    }
  };

  const getStatusColor = (status: MeldungStatus) => {
    switch (status) {
      case MeldungStatus.OFFEN:
        return 'info';
      case MeldungStatus.IN_BEARBEITUNG:
        return 'warning';
      case MeldungStatus.HANDWERKER_ERLEDIGT:
        return 'secondary';
      case MeldungStatus.ABGESCHLOSSEN:
        return 'success';
      case MeldungStatus.STORNIERT:
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !meldung) {
    return (
      <Box p={2}>
        <Typography color="error">{error || 'Meldung nicht gefunden'}</Typography>
      </Box>
    );
  }

  // Bestimme den Chat-Partner basierend auf der Rolle
  const getChatPartner = (): ChatPartner[] => {
    switch (role) {
      case 'vermieter':
        return [
          {
            id: meldung.reporter._id,
            firstName: meldung.reporter.firstName,
            lastName: meldung.reporter.lastName,
            role: 'mieter' as const
          },
          ...(meldung.assignedTo ? [{
            id: meldung.assignedTo._id,
            firstName: meldung.assignedTo.firstName,
            lastName: meldung.assignedTo.lastName,
            role: 'handwerker' as const
          }] : [])
        ];
      case 'mieter':
        // Prüfe ob der Vermieter verfügbar ist
        return meldung.unit?.property?.owner ? [{
          id: meldung.unit.property.owner._id,
          firstName: meldung.unit.property.owner.firstName,
          lastName: meldung.unit.property.owner.lastName,
          role: 'vermieter' as const
        }] : [];
      case 'handwerker':
        // Prüfe ob der Vermieter verfügbar ist
        return meldung.unit?.property?.owner ? [{
          id: meldung.unit.property.owner._id,
          firstName: meldung.unit.property.owner.firstName,
          lastName: meldung.unit.property.owner.lastName,
          role: 'vermieter' as const
        }] : [];
      default:
        return [];
    }
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {meldung.title}
        </Typography>
        <Typography variant="body1" paragraph>
          {meldung.description}
        </Typography>
        <Box sx={{ mt: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <Chip
            label={getStatusText(meldung.status)}
            color={getStatusColor(meldung.status)}
          />
          <Typography variant="body2" color="textSecondary">
            Erstellt: {formatDistanceToNow(new Date(meldung.createdAt), { addSuffix: true, locale: de })}
          </Typography>
        </Box>

        {/* Unit Information */}
        {meldung.unit && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Wohneinheit
            </Typography>
            <Typography>
              {meldung.unit.property?.name || 'Unbekannte Immobilie'}
            </Typography>
            <Typography>
              Wohnungsnummer: {meldung.unit.unitNumber}
            </Typography>
          </Box>
        )}

        {meldung.assignedTo && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Zugewiesener Handwerker
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar sx={{ bgcolor: 'grey.400' }}>
                {meldung.assignedTo.firstName[0]}
              </Avatar>
              <Typography>
                {meldung.assignedTo.firstName} {meldung.assignedTo.lastName}
              </Typography>
            </Box>
          </Box>
        )}

        {meldung.images && meldung.images.length > 0 && (
          <Box mt={3}>
            <Typography variant="h6" gutterBottom>
              Bilder
            </Typography>
            <Grid container spacing={2}>
              {meldung.images.map((image, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <img
                    src={image.url}
                    alt={`Bild ${index + 1}`}
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover',
                      borderRadius: '4px'
                    }}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {additionalActions}
      </Paper>

      {/* Nachrichten-Bereich */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ height: '400px' }}>
          <UnifiedChat
            meldungId={meldung._id}
            currentUserRole={role}
            availableChatPartners={getChatPartner()}
          />
        </Box>
      </Paper>
    </Box>
  );
};
