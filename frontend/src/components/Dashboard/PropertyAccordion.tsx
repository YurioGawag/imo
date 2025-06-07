import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UploadFileIcon from '@mui/icons-material/UploadFile';

export interface PropertyDoc {
  id: string;
  name: string;
}

export interface PropertyInfo {
  id: string;
  name: string;
  address: string;
  units: number;
  area: number;
  year: number;
  documents: PropertyDoc[];
}

export const PropertyAccordion: React.FC<{ properties: PropertyInfo[] }> = ({ properties }) => (
  <div>
    {properties.map((p) => (
      <Accordion key={p.id} sx={{ mb: 1 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography sx={{ flexGrow: 1, fontWeight: 600 }}>{p.name}</Typography>
          <Chip label={`${p.units} Einheiten`} size="small" sx={{ mr: 1 }} />
          <Chip label={`${p.area} m²`} size="small" sx={{ mr: 1 }} />
          <Chip label={`Bj. ${p.year}`} size="small" />
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" gutterBottom>{p.address}</Typography>
          <Grid container spacing={1}>
            {p.documents.map((d) => (
              <Grid item key={d.id}>
                <Chip label={d.name} icon={<UploadFileIcon />} clickable />
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>
    ))}
  </div>
);
