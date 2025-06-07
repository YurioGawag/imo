import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { navigationItems } from './mieterNavigation';
import { DefectStats } from '../../components/Dashboard/DefectStats';
import { TenantTimeline } from '../../components/Dashboard/TenantTimeline';
import { MaintenanceCalendar } from '../../components/Dashboard/MaintenanceCalendar';
import { PropertyAccordion } from '../../components/Dashboard/PropertyAccordion';
import { MiniDashboard } from '../../components/Dashboard/MiniDashboard';
import type { MessageItem } from '../../components/Dashboard/TenantTimeline';

const sampleTimeline: MessageItem[] = [
  { unit: 'ME1', date: '10.05.2024', message: 'Anfrage zur Heizung', status: 'Responded' },
  { unit: 'ME1', date: '15.05.2024', message: 'Rückfrage Miete', status: 'Waiting' },
];

const sampleProperties = [
  {
    id: 'p1',
    name: 'Musterstraße 1',
    address: 'Musterstraße 1, 12345 Musterstadt',
    units: 10,
    area: 800,
    year: 1990,
    documents: [{ id: 'd1', name: 'Mietvertrag.pdf' }],
  },
];

export const MieterManagementDashboard: React.FC = () => (
  <MainLayout navigationItems={navigationItems} title="Wohnungsübersicht">
    <Grid container spacing={3}>
      <Grid item xs={12} md={9}>
        <Typography variant="h5" gutterBottom>
          Ihre Übersicht
        </Typography>
      </Grid>
      <Grid item xs={12} md={3}>
        <MiniDashboard defects={1} maintenance={0} responsesUpToDate={true} onNavigate={() => {}} />
      </Grid>

      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Meldungsstatus
          </Typography>
          <DefectStats open={1} resolved={5} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Kommunikation
          </Typography>
          <TenantTimeline items={sampleTimeline} />
        </Paper>
      </Grid>

      <Grid item xs={12} md={6}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Nächste Termine
          </Typography>
          <MaintenanceCalendar items={[{ date: '2024-05-25', urgent: false }]} />
        </Paper>
      </Grid>

      <Grid item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Dokumente & Details
          </Typography>
          <PropertyAccordion properties={sampleProperties} />
        </Paper>
      </Grid>
    </Grid>
  </MainLayout>
);

export default MieterManagementDashboard;
