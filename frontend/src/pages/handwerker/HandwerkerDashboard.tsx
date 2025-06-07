import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Paper,
  Chip,
  LinearProgress,
  Button,
  TextField,
  MenuItem,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../store/auth.store';
import { handwerkerService, HandwerkerDashboardData } from '../../services/handwerker.service';
import { MeldungCard } from '../../components/Meldung/MeldungCard';
import { MainLayout } from '../../components/Layout/MainLayout';
import { Meldung, MeldungStatus } from '../../types/meldung.types';
import { navigationItems } from './handwerkerNavigation';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card>
    <CardContent>
      <Box display="flex" alignItems="center" mb={2}>
        <Box
          sx={{
            backgroundColor: color || 'primary.main',
            borderRadius: '50%',
            p: 1,
            mr: 2,
            color: 'white',
          }}
        >
          {icon}
        </Box>
        <Typography color="textSecondary">{title}</Typography>
      </Box>
      <Typography variant="h4" component="div">
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const HandwerkerDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<HandwerkerDashboardData | null>(
    null
  );
  const [selectedMeldung, setSelectedMeldung] = useState<Meldung | null>(null);
  const [updateDialog, setUpdateDialog] = useState(false);
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    actualCost: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await handwerkerService.getDashboard();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  const handleStatusUpdate = async () => {
    if (!selectedMeldung) return;

    try {
      if (statusUpdate.status === MeldungStatus.ABGESCHLOSSEN) {
        await handwerkerService.completeMeldung(selectedMeldung._id, {
          notes: statusUpdate.notes,
          actualCost: parseFloat(statusUpdate.actualCost),
        });
      } else {
        await handwerkerService.updateMeldungStatus(
          selectedMeldung._id,
          statusUpdate.status,
          statusUpdate.notes
        );
      }

      // Refresh dashboard data
      const data = await handwerkerService.getDashboard();
      setDashboardData(data);
      setUpdateDialog(false);
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (!dashboardData) {
    return null; // or loading spinner
  }

  return (
    <MainLayout title="Handwerker Dashboard" navigationItems={navigationItems}>
      <Grid container spacing={3}>
        {/* Stats */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Zugewiesene Meldungen"
            value={dashboardData.stats.totalAssigned}
            icon={<AssignmentIcon />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="In Bearbeitung"
            value={dashboardData.stats.inProgress}
            icon={<PersonIcon />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Abgeschlossen"
            value={dashboardData.stats.completed}
            icon={<SettingsIcon />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Ø Bearbeitungszeit (Tage)"
            value={dashboardData.stats.averageCompletionTime.toFixed(1)}
            icon={<SettingsIcon />}
            color="#9c27b0"
          />
        </Grid>

        {/* Assigned Reports */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Aktuelle Meldungen
          </Typography>
          {dashboardData.assignedMeldungen.map((meldung: Meldung) => (
            <Box key={meldung._id} mb={2}>
              <MeldungCard
                key={meldung._id}
                title={meldung.title}
                description={meldung.description}
                status={meldung.status}
                createdAt={meldung.createdAt}
                onClick={() => navigate(`/handwerker/meldungen/${meldung._id}`)}
                unreadMessages={meldung.unreadMessages}
                unitInfo={{
                  unitNumber: meldung.unit?.unitNumber || 'Keine Einheit',
                  propertyName: meldung.unit?.property?.name || 'Keine Immobilie'
                }}
                reporter={meldung.reporter}
              />
            </Box>
          ))}
        </Grid>
      </Grid>

      {/* Status Update Dialog */}
      <Dialog
        open={updateDialog}
        onClose={() => setUpdateDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Status aktualisieren</DialogTitle>
        <DialogContent>
          <TextField
            select
            margin="dense"
            label="Status"
            fullWidth
            value={statusUpdate.status}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStatusUpdate({ ...statusUpdate, status: e.target.value as MeldungStatus })
            }
          >
            <MenuItem value={MeldungStatus.IN_BEARBEITUNG}>
              In Bearbeitung
            </MenuItem>
            <MenuItem value={MeldungStatus.ABGESCHLOSSEN}>
              Abgeschlossen
            </MenuItem>
          </TextField>
          <TextField
            margin="dense"
            label="Notizen"
            fullWidth
            multiline
            rows={4}
            value={statusUpdate.notes}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setStatusUpdate({ ...statusUpdate, notes: e.target.value })
            }
          />
          {statusUpdate.status === MeldungStatus.ABGESCHLOSSEN && (
            <TextField
              margin="dense"
              label="Tatsächliche Kosten"
              type="number"
              fullWidth
              value={statusUpdate.actualCost}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setStatusUpdate({ ...statusUpdate, actualCost: e.target.value })
              }
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUpdateDialog(false)}>Abbrechen</Button>
          <Button onClick={handleStatusUpdate} variant="contained">
            Aktualisieren
          </Button>
        </DialogActions>
      </Dialog>
    </MainLayout>
  );
};
