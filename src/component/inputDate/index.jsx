import React, { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ptBR } from 'date-fns/locale/pt-BR';

export default function InputDateTimeComponent({ selectedDate, setSelectedDate, textPlacer }) {
  const [time, setTime] = useState(selectedDate ? format(selectedDate, 'HH:mm') : '00:00');

  const handleDateSelect = (date) => {
    if (date) {
      const newDateTime = new Date(date);
      newDateTime.setHours(parseInt(time.split(':')[0]) || 0);
      newDateTime.setMinutes(parseInt(time.split(':')[1]) || 0);
      setSelectedDate(newDateTime);
    }
  };

  const handleTimeChange = (event) => {
    const newTime = event.target.value;
    setTime(newTime);

    if (selectedDate && newTime) {
      const newDateTime = new Date(selectedDate);
      const [hours, minutes] = newTime.split(':');
      if (hours && minutes) {  // Certifica-se de que o valor está completo
        newDateTime.setHours(parseInt(hours));
        newDateTime.setMinutes(parseInt(minutes));
        setSelectedDate(newDateTime);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-between text-left font-normal',
            !selectedDate && 'text-muted-foreground'
          )}
        >
          <span>
            {selectedDate
              ? format(selectedDate, 'PPPp', { locale: ptBR }) // 'PPPp' inclui a data e a hora
              : textPlacer}
          </span>
          <CalendarIcon className="mr-2 h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          initialFocus
        />
        <div className="flex justify-center mt-2">
          <input
            type="time"
            value={time}
            onChange={handleTimeChange}
            className="border rounded px-2 py-1 text-sm"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
