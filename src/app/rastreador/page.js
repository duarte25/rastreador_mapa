"use client";

import { fetchApi, fetchApiDespaginado } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useQuery } from "react-query";
import Localization from "@/component/localization";
import { useState } from 'react';
import Combobox from '@/component/combobox';
import { IoIosSearch } from 'react-icons/io';
import Link from 'next/link';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { SiOpenstreetmap } from "react-icons/si";
import Image from 'next/image';

// Componente que utiliza `window`
const HistoryTracker = dynamic(() => import('@/component/historyTracker'), { ssr: false });
// Importação dinâmica para garantir que o componente seja renderizado apenas no cliente
const InputDate = dynamic(() => import('@/component/inputDate'), { ssr: false });

export default function Home() {
  const [open, setOpen] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDateInitial, setSelectedDateInitial] = useState(null)
  const [selectedDateLast, setSelectedDateLast] = useState(null)

  // Converte selectedDateInitial para um objeto Date (opcional)
  const dateConvertInitial = new Date(selectedDateInitial);
  const dateConvertLast = new Date(selectedDateLast);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['getVehicle', selectedVehicle, selectedDateInitial, selectedDateLast],
    queryFn: async () => {
      //const response = await fetchApi("/posicoes", "GET", {
      const response = await fetchApiDespaginado("/posicoes", "GET", {
        data_inicial: dateConvertInitial.toISOString(),
        data_final: dateConvertLast.toISOString(),
        // data_final: "2024-08-14T19:00:30.000",
        serial: selectedVehicle
      });
      return response;
    },
    enabled: true,  // Enable automatic fetching
    // refetchInterval: 1000, // Refetch every second
  });

  // Verificar se data é um array antes de passar para Map
  const markers = data?.data || []; // data?.data é o array de marcadores
  for (let m of markers) {
    m.ultima_posicao = m
  }
  const { location, error: locationError } = Localization(); // Usando o hook

  return (
    <div className='relative w-full h-screen'>
      <div className='absolute inset-0 z-10'>
        <HistoryTracker markers={markers} location={location} error={locationError} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`fixed top-1 left-16 z-10 w-1/6 h-14 text-slate-800
              ${open ? 'bg-white border-t-2 border-gray-500 rounded-t-3xl border-b border-transparent' : 'bg-white border border-gray-300 rounded-3xl'}
              hover:bg-white hover:border-gray-300`}  /* Manter a cor padrão ao passar o mouse */
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-row items-center justify-between w-full px-4">
              <a>Busque seu veículo</a>
              <div className='flex flex-row gap-5'>
                <IoIosSearch className='size-5' />
                <Link href="/">
                  <SiOpenstreetmap className='size-5 z-[50]' />
                </Link>
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='z-[10] w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-5 -mt-1 
          h-52 flex flex-col gap-5 justify-center'
          sideOffset={5}
        >
          <Combobox
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />

          <InputDate
            selectedDate={selectedDateInitial}
            setSelectedDate={setSelectedDateInitial}
            textPlacer={'Data inicial'} />

          <InputDate
            selectedDate={selectedDateLast}
            setSelectedDate={setSelectedDateLast}
            textPlacer={"Data final"} />

        </PopoverContent>
      </Popover>

      <Image className='fixed bottom-10 left-20 transform -translate-x-1/2 z-[10]'
        width={100} height={100} src='/smartcerejeiras.png' alt='logo' />
    </div >
  );
}
