import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';
import api from '../../services/api';
import { Room, CommonIssue } from '../../types/meldung.types';

const getRoomLabel = (room: Room): string => {
  switch (room) {
    case Room.WOHNZIMMER:
      return 'Wohnzimmer';
    case Room.SCHLAFZIMMER:
      return 'Schlafzimmer';
    case Room.KUECHE:
      return 'Küche';
    case Room.BADEZIMMER:
      return 'Badezimmer';
    case Room.FLUR:
      return 'Flur';
    case Room.BALKON:
      return 'Balkon';
    case Room.KELLER:
      return 'Keller';
    case Room.SONSTIGE:
      return 'Sonstige';
    default:
      return room;
  }
};

const getIssueLabel = (issue: CommonIssue): string => {
  switch (issue) {
    case CommonIssue.WASSERSCHADEN:
      return 'Wasserschaden';
    case CommonIssue.HEIZUNG_DEFEKT:
      return 'Heizung defekt';
    case CommonIssue.STROMAUSFALL:
      return 'Stromausfall';
    case CommonIssue.SCHIMMEL:
      return 'Schimmel';
    case CommonIssue.FENSTER_DEFEKT:
      return 'Fenster defekt';
    case CommonIssue.TUERE_DEFEKT:
      return 'Türe defekt';
    case CommonIssue.SANITAER_PROBLEM:
      return 'Sanitär Problem';
    case CommonIssue.BODENBELAG_BESCHAEDIGT:
      return 'Bodenbelag beschädigt';
    case CommonIssue.ELEKTRO_PROBLEM:
      return 'Elektro Problem';
    case CommonIssue.SCHLOSS_DEFEKT:
      return 'Schloss defekt';
    default:
      return issue;
  }
};

export const MieterMeldungCreate: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [room, setRoom] = useState<Room | ''>('');
  const [commonIssue, setCommonIssue] = useState<CommonIssue | ''>('');
  const [images, setImages] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [customTitle, setCustomTitle] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!room || (!commonIssue && !customTitle)) {
      setError('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('title', commonIssue ? getIssueLabel(commonIssue) : customTitle);
      formData.append('description', description);
      formData.append('room', room);
      
      if (images) {
        Array.from(images).forEach(image => {
          formData.append('images', image);
        });
      }

      await api.post('/mieter/meldungen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate('/mieter', { state: { meldungCreated: true } });
    } catch (err) {
      console.error('Error creating meldung:', err);
      setError('Fehler beim Erstellen der Meldung');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout title="Neue Meldung erstellen" navigationItems={navigationItems}>
      <Paper elevation={2}>
        <Box p={3}>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Raum</InputLabel>
                  <Select
                    value={room}
                    onChange={(e) => setRoom(e.target.value as Room)}
                    label="Raum"
                    error={!room && error !== ''}
                  >
                    {Object.values(Room).map((roomValue) => (
                      <MenuItem key={roomValue} value={roomValue}>
                        {getRoomLabel(roomValue)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Häufige Probleme</InputLabel>
                  <Select
                    value={commonIssue}
                    onChange={(e) => {
                      setCommonIssue(e.target.value as CommonIssue);
                      if (e.target.value) {
                        setCustomTitle('');
                      }
                    }}
                    label="Häufige Probleme"
                  >
                    <MenuItem value="">
                      <em>Eigener Titel</em>
                    </MenuItem>
                    {Object.values(CommonIssue).map((issueValue) => (
                      <MenuItem key={issueValue} value={issueValue}>
                        {getIssueLabel(issueValue)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {!commonIssue && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Eigener Titel"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    required
                    error={!customTitle && error !== ''}
                    helperText={!customTitle && error !== '' ? 'Titel ist erforderlich' : ''}
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Beschreibung"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  multiline
                  rows={4}
                  error={!description && error !== ''}
                  helperText={!description && error !== '' ? 'Beschreibung ist erforderlich' : ''}
                />
              </Grid>

              <Grid item xs={12}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="images-upload"
                  multiple
                  type="file"
                  onChange={(e) => setImages(e.target.files)}
                />
                <label htmlFor="images-upload">
                  <Button variant="outlined" component="span">
                    Bilder hochladen (optional)
                  </Button>
                </label>
                {images && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {Array.from(images).map(file => file.name).join(', ')}
                  </Typography>
                )}
              </Grid>

              {error && (
                <Grid item xs={12}>
                  <Typography color="error">{error}</Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Box display="flex" gap={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Meldung erstellen'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => navigate('/mieter/meldungen')}
                    disabled={loading}
                  >
                    Abbrechen
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </form>
        </Box>
      </Paper>
    </MainLayout>
  );
};
