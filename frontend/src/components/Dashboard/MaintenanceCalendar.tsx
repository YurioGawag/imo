import React from 'react';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay, PickersDayProps } from '@mui/x-date-pickers/PickersDay';
import { Badge } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { isSameDay, parseISO } from 'date-fns';
import { DayCalendarSkeleton } from '@mui/x-date-pickers/DayCalendarSkeleton';

export interface MaintenanceItem {
  date: string;
  urgent: boolean;
}

interface Props {
  items: MaintenanceItem[];
}

export const MaintenanceCalendar: React.FC<Props> = ({ items }) => {
  const shouldHighlight = (date: Date) =>
    items.some((item) => isSameDay(parseISO(item.date), date));

  // Custom day renderer component
  const ServerDay = (props: PickersDayProps<Date> & { highlightedDays?: Date[] }) => {
    const { highlightedDays = [], day, ...other } = props;
    const highlight = shouldHighlight(day);

    return (
      <Badge
        key={day.toString()}
        overlap="circular"
        badgeContent={highlight ? '•' : undefined}
        color={highlight ? 'error' : 'default'}
      >
        <PickersDay {...other} day={day} />
      </Badge>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <DateCalendar
        defaultValue={new Date()}
        onChange={() => null}
        slots={{
          day: ServerDay,
        }}
      />
    </LocalizationProvider>
  );
};
