import React from 'react';
import { Box, Tooltip } from '@mui/material';

interface UnitItem {
  id: string;
  number: string;
  vacantDays: number;
  occupied: boolean;
}

export const OccupancyGrid: React.FC<{ units: UnitItem[] }> = ({ units }) => (
  <Box display="grid" gridTemplateColumns="repeat(auto-fill, minmax(80px,1fr))" gap={1}>
    {units.map((u) => (
      <Tooltip
        key={u.id}
        title={u.occupied ? `Vermietet` : `Seit ${u.vacantDays} Tagen frei`}
        arrow
      >
        <Box
          role="button"
          tabIndex={0}
          sx={{
            bgcolor: u.occupied ? '#4caf50' : '#f44336',
            color: 'white',
            borderRadius: 1,
            p: 1,
            textAlign: 'center',
            fontWeight: 600,
          }}
        >
          {u.number}
        </Box>
      </Tooltip>
    ))}
  </Box>
);
