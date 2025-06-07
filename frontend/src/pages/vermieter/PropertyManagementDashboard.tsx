import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { MainLayout } from '../../components/Layout/MainLayout';
import { vermieterNavigationItems } from './vermieterNavigation';
import { DefectStats } from '../../components/Dashboard/DefectStats';
import { TenantTimeline } from '../../components/Dashboard/TenantTimeline';
import { OccupancyGrid } from '../../components/Dashboard/OccupancyGrid';
import { MaintenanceCalendar } from '../../components/Dashboard/MaintenanceCalendar';
import { PropertyAccordion } from '../../components/Dashboard/PropertyAccordion';
import { MiniDashboard } from '../../components/Dashboard/MiniDashboard';
import type { MessageItem } from '../../components/Dashboard/TenantTimeline';

const sampleTimeline: MessageItem[] = [
  { unit: '1A', date: '01.05.2024', message: 'Rohrbruch gemeldet', status: 'Responded' },
  { unit: '2B', date: '03.05.2024', message: 'Lärm Beschwerde', status: 'Waiting' },
  { unit: '3C', date: '05.05.2024', message: 'Fenster defekt', status: 'Overdue' },
];

const sampleUnits = [
  { id: '1', number: '1A', vacantDays: 0, occupied: true },
  { id: '2', number: '2B', vacantDays: 12, occupied: false },
  { id: '3', number: '3C', vacantDays: 0, occupied: true },
  { id: '4', number: '4D', vacantDays: 30, occupied: false },
];

const sampleProperties = [
  {
    id: 'p1',
    name: 'Musterstraße 1',
    address: 'Musterstraße 1, 12345 Musterstadt',
    units: 10,
    area: 800,
    year: 1990,
    documents: [
      { id: 'd1', name: 'Grundriss.pdf' },
      { id: 'd2', name: 'Energieausweis.pdf' },
    ],
  },
];

export const PropertyManagementDashboard: React.FC = () => {
  return (
    <MainLayout title="Management Dashboard" navigationItems={vermieterNavigationItems}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Typography variant="h5" gutterBottom>
            Übersicht
          </Typography>
        </Grid>
        <Grid item xs={12} md={3}>
          <MiniDashboard defects={2} maintenance={1} responsesUpToDate={false} onNavigate={() => {}} />
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Defektstatistik
            </Typography>
            <DefectStats open={5} resolved={12} />
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
              Belegung
            </Typography>
            <OccupancyGrid units={sampleUnits} />
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Wartungskalender
            </Typography>
            <MaintenanceCalendar items={[{ date: '2024-05-10', urgent: true }]} />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Immobilien
            </Typography>
            <PropertyAccordion properties={sampleProperties} />
          </Paper>
        </Grid>
      </Grid>
    </MainLayout>
  );
};
