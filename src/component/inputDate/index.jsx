import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon, Clock as ClockIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Supondo que Calendar é de data
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export default function InputDateTimeComponent({ selectedDateInitial, setSelectedDateInitial }) {
  const [time, setTime] = useState(selectedDateInitial ? format(selectedDateInitial, 'HH:mm') : '00:00');

  // Atualiza a data e hora selecionadas
  const handleDateSelect = (date) => {
    if (date) {
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(time.split(':')[0]));
      newDateTime.setMinutes(parseInt(time.split(':')[1]));
      setSelectedDateInitial(newDateTime);
    }
  };

  // Atualiza o horário selecionado
  const handleTimeChange = (event) => {
    setTime(event.target.value);
    if (selectedDateInitial) {
      const newDateTime = new Date(selectedDateInitial);
      newDateTime.setHours(parseInt(event.target.value.split(':')[0]));
      newDateTime.setMinutes(parseInt(event.target.value.split(':')[1]));
      setSelectedDateInitial(newDateTime);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-[280px] justify-start text-left font-normal',
            !selectedDateInitial && 'text-muted-foreground'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span>
            {selectedDateInitial
              ? format(selectedDateInitial, 'PPPp') // 'PPPp' inclui a data e a hora
              : 'Pick a date and time'}
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={selectedDateInitial}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="flex items-center mt-2">
          <ClockIcon className="mr-2 h-4 w-4" />
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
