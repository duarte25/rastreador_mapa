import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Supondo que Calendar é de data
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function InputDateTimeComponent({ selectedDate, setSelectedDate, textPlacer }) {
  const [time, setTime] = useState(selectedDate ? format(selectedDate, 'HH:mm') : '00:00');

  // Atualiza a data e hora selecionadas
  const handleDateSelect = (date) => {
    if (date) {
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(time.split(':')[0]));
      newDateTime.setMinutes(parseInt(time.split(':')[1]));
      setSelectedDate(newDateTime);
    }
  };

  // Atualiza o horário selecionado
  const handleTimeChange = (event) => {
    setTime(event.target.value);
    if (selectedDate) {
      const newDateTime = new Date(selectedDate);
      newDateTime.setHours(parseInt(event.target.value.split(':')[0]));
      newDateTime.setMinutes(parseInt(event.target.value.split(':')[1]));
      setSelectedDate(newDateTime);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {selectedDate
              ? format(selectedDate, 'PPPp') // 'PPPp' inclui a data e a hora
              : textPlacer}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="flex items-center justify-center mt-2">
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="border rounded px-2 py-1"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
