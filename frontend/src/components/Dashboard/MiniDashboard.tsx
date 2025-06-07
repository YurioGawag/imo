import React from 'react';
import { Box, Typography } from '@mui/material';

interface MiniProps {
  defects: number;
  maintenance: number;
  responsesUpToDate: boolean;
  onNavigate: () => void;
}

export const MiniDashboard: React.FC<MiniProps> = ({ defects, maintenance, responsesUpToDate, onNavigate }) => {
  const color = defects > 0 ? 'error.main' : maintenance > 0 ? 'warning.main' : 'success.main';
  const text = defects > 0 ? `${defects} offene Defekte` : maintenance > 0 ? `${maintenance} Wartungen` : 'Alle Antworten aktuell';
  return (
    <Box
      onClick={onNavigate}
      sx={{
        bgcolor: color,
        color: 'white',
        p: 2,
        borderRadius: 2,
        textAlign: 'center',
        cursor: 'pointer',
      }}
    >
      <Typography fontSize="1.2rem" fontWeight={600}>{text}</Typography>
    </Box>
  );
};
