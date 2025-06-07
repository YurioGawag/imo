import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Button,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Stack,
} from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { MeldungCard } from '../../components/Meldung/MeldungCard';
import { navigationItems } from './mieterNavigation';
import { useNavigate } from 'react-router-dom';
import { Meldung, MeldungStatus } from '../../types/meldung.types';
import api from '../../services/api';
import { COMMON_ISSUES, ROOM_TYPES } from '../../constants/meldung';
import { styled } from '@mui/material/styles';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

interface NewMeldung {
  issueType: string;
  room: string;
  description: string;
  images: File[];
}

export const MieterMeldungenList: React.FC = () => {
  const [meldungen, setMeldungen] = useState<Meldung[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNewMeldungDialogOpen, setIsNewMeldungDialogOpen] = useState(false);
  const [newMeldung, setNewMeldung] = useState<NewMeldung>({
    issueType: '',
    room: '',
    description: '',
    images: [],
  });
  const [selectedIssue, setSelectedIssue] = useState<typeof COMMON_ISSUES[0] | null>(null);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMeldungen = async () => {
      try {
        const response = await api.get('/mieter/meldungen');
        console.log('Geladene Meldungen:', response.data);
        setMeldungen(response.data);
      } catch (error) {
        console.error('Error fetching meldungen:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeldungen();
  }, []);

  const handleCreateMeldung = async () => {
    try {
      const formData = new FormData();
      formData.append('title', selectedIssue?.title || '');
      formData.append('description', newMeldung.description);
      formData.append('room', newMeldung.room);
      newMeldung.images.forEach((image) => {
        formData.append('images', image);
      });

      await api.post('/mieter/meldungen', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setIsNewMeldungDialogOpen(false);
      setNewMeldung({
        issueType: '',
        room: '',
        description: '',
        images: [],
      });
      setSelectedIssue(null);
      setPreviewUrls([]);
      
      // Refresh meldungen list
      const response = await api.get('/mieter/meldungen');
      setMeldungen(response.data);
    } catch (error) {
      console.error('Error creating meldung:', error);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setNewMeldung((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));

      // Create preview URLs
      const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
      setPreviewUrls((prev) => [...prev, ...newPreviewUrls]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setNewMeldung((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    URL.revokeObjectURL(previewUrls[index]);
    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <MainLayout title="Meine Meldungen" navigationItems={navigationItems}>
      <Box mb={3}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setIsNewMeldungDialogOpen(true)}
        >
          Neue Meldung
        </Button>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : meldungen.length === 0 ? (
        <Typography variant="body1" color="textSecondary">
          Keine Meldungen vorhanden
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {meldungen.map((meldung) => (
            <Grid item xs={12} key={meldung._id}>
              <Box 
                onClick={() => navigate(`/mieter/meldungen/${meldung._id}`)}
                sx={{ 
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8,
                    transition: 'opacity 0.2s'
                  }
                }}
              >
                <MeldungCard
                  title={meldung.title}
                  description={meldung.description}
                  status={meldung.status}
                  createdAt={meldung.createdAt}
                  onClick={() => navigate(`/mieter/meldungen/${meldung._id}`)}
                  unreadMessages={meldung.unreadMessages}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Meldung Dialog */}
      <Dialog 
        open={isNewMeldungDialogOpen} 
        onClose={() => setIsNewMeldungDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Neue Meldung erstellen</DialogTitle>
        <DialogContent>
          <Box mt={2}>
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Art des Problems</InputLabel>
              <Select
                value={selectedIssue?.id || ''}
                onChange={(e) => {
                  const issue = COMMON_ISSUES.find(i => i.id === e.target.value);
                  setSelectedIssue(issue || null);
                }}
                label="Art des Problems"
              >
                {COMMON_ISSUES.map((issue) => (
                  <MenuItem key={issue.id} value={issue.id}>
                    {issue.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Raum</InputLabel>
              <Select
                value={newMeldung.room}
                onChange={(e) => setNewMeldung(prev => ({ ...prev, room: e.target.value }))}
                label="Raum"
              >
                {ROOM_TYPES.map((room) => (
                  <MenuItem key={room.id} value={room.id}>
                    {room.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Beschreibung"
              value={newMeldung.description}
              onChange={(e) => setNewMeldung(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <Box>
              <Button
                component="label"
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                sx={{ mb: 2 }}
              >
                Bilder hochladen
                <VisuallyHiddenInput
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                />
              </Button>

              <Grid container spacing={1}>
                {previewUrls.map((url, index) => (
                  <Grid item key={index}>
                    <Box
                      sx={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                      }}
                    >
                      <img
                        src={url}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                      <IconButton
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          '&:hover': {
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          },
                        }}
                        onClick={() => handleRemoveImage(index)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsNewMeldungDialogOpen(false)}>Abbrechen</Button>
          <Button
            onClick={handleCreateMeldung}
            variant="contained"
            disabled={!selectedIssue || !newMeldung.room || !newMeldung.description}
          >
            Erstellen
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};
