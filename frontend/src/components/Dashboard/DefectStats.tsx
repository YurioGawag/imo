import React from 'react';
import { Box, Typography } from '@mui/material';

interface DefectStatsProps {
  open: number;
  resolved: number;
}

const circleSize = 120;

export const DefectStats: React.FC<DefectStatsProps> = ({ open, resolved }) => {
  const total = open + resolved;
  const resolvedRatio = total ? resolved / total : 0;
  const dash = 2 * Math.PI * (circleSize / 2);
  return (
    <Box textAlign="center">
      <svg width={circleSize} height={circleSize} role="img" aria-label="Defect statistics donut chart">
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={(circleSize - 10) / 2}
          stroke="#e0e0e0"
          strokeWidth={10}
          fill="none"
        />
        <circle
          cx={circleSize / 2}
          cy={circleSize / 2}
          r={(circleSize - 10) / 2}
          stroke="#4caf50"
          strokeWidth={10}
          strokeDasharray={`${dash * resolvedRatio} ${dash}`}
          strokeDashoffset={dash * 0.25}
          fill="none"
          transform={`rotate(-90 ${circleSize / 2} ${circleSize / 2})`}
        />
        <text
          x="50%"
          y="50%"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="20"
          fontWeight="600"
        >
          {total}
        </text>
      </svg>
      <Typography variant="subtitle2">{open} offen</Typography>
      <Typography variant="subtitle2">{resolved} erledigt</Typography>
    </Box>
  );
};
