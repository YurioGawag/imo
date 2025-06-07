import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  CircularProgress,
  Box,
  Divider
} from '@mui/material';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { meldungService } from '../../services/meldung.service';
import { Meldung, MeldungStatus } from '../../types/meldung.types';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './handwerkerNavigation';

const statusLabels: { [key in MeldungStatus]: string } = {
  [MeldungStatus.OFFEN]: 'Offen',
  [MeldungStatus.IN_BEARBEITUNG]: 'In Bearbeitung',
  [MeldungStatus.HANDWERKER_ERLEDIGT]: 'Erledigt',
  [MeldungStatus.ABGESCHLOSSEN]: 'Abgeschlossen',
  [MeldungStatus.STORNIERT]: 'Storniert'
};

const statusColors: { [key in MeldungStatus]: 'default' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning' } = {
  [MeldungStatus.OFFEN]: 'error',
  [MeldungStatus.IN_BEARBEITUNG]: 'warning',
  [MeldungStatus.HANDWERKER_ERLEDIGT]: 'success',
  [MeldungStatus.ABGESCHLOSSEN]: 'success',
  [MeldungStatus.STORNIERT]: 'default'
};

const HandwerkerMeldungenList: React.FC = () => {
  const [auftraege, setAuftraege] = useState<Meldung[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAuftraege = async () => {
      try {
        const response = await meldungService.getAssignedMeldungen();
        setAuftraege(response.data);
      } catch (error) {
        console.error('Error fetching auftraege:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAuftraege();
  }, []);

  const content = loading ? (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
      <CircularProgress />
    </Box>
  ) : (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Aufträge
      </Typography>
      <List>
        {auftraege.map((auftrag, index) => (
          <div key={auftrag._id}>
            {index > 0 && <Divider />}
            <ListItem
              button
              onClick={() => navigate(`/handwerker/meldungen/${auftrag._id}`)}
              sx={{ py: 2 }}
            >
              <ListItemText
                primary={auftrag.title}
                secondary={
                  <>
                    <Typography component="span" variant="body2" color="text.primary">
                      {auftrag.unit.property.name} - Einheit {auftrag.unit.unitNumber}
                    </Typography>
                    <br />
                    {format(new Date(auftrag.createdAt), 'PPP', { locale: de })}
                  </>
                }
              />
              <ListItemSecondaryAction>
                <Chip
                  label={statusLabels[auftrag.status]}
                  color={statusColors[auftrag.status]}
                  size="small"
                />
              </ListItemSecondaryAction>
            </ListItem>
          </div>
        ))}
        {auftraege.length === 0 && (
          <ListItem>
            <ListItemText
              primary="Keine Aufträge vorhanden"
              secondary="Ihnen wurden noch keine Aufträge zugewiesen."
            />
          </ListItem>
        )}
      </List>
    </Paper>
  );

  return (
    <MainLayout title="Aufträge" navigationItems={navigationItems}>
      {content}
    </MainLayout>
  );
};

export default HandwerkerMeldungenList;
