"use client";

import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useQuery } from "react-query";
import Localization from "@/component/localization";
import { useState } from 'react';
import Combobox from '@/component/combobox';

// Componente que utiliza `window`
const HistoryTracker = dynamic(() => import('@/component/historyTracker'), { ssr: false });
// Importação dinâmica para garantir que o componente seja renderizado apenas no cliente
const InputDate = dynamic(() => import('@/component/inputDate'), { ssr: false });

export default function Home() {

  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [selectedDateInitial, setSelectedDateInitial] = useState(null)
  const [selectedDateLast, setSelectedDateLast] = useState(null)

  // Converte selectedDateInitial para um objeto Date (opcional)
  const dateConvertInitial = new Date(selectedDateInitial);
  const dateConvertLast = new Date(selectedDateLast);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['getVehicle', selectedVehicle, selectedDateInitial, selectedDateLast],
    queryFn: async () => {
      const response = await fetchApi("/posicoes", "GET", {
        data_inicial: dateConvertInitial.toISOString(),
        data_final: dateConvertLast.toISOString(),
        // data_final: "2024-08-14T19:00:30.000",
        serial: selectedVehicle
      });
      return response;
    },
    enabled: true,  // Enable automatic fetching
    refetchInterval: 1000, // Refetch every second
  });

  // Verificar se data é um array antes de passar para Map
  const markers = data?.data || []; // data?.data é o array de marcadores
  for (let m of markers) {
    m.ultima_posicao = m
  }
  const { location, error: locationError } = Localization(); // Usando o hook

  return (
    <div className='flex flex-row bg-purple-950'>
      <div className='w-3/12 flex flex-col items-center'>
        <h1 className='pt-64 text-3xl text-lime-400 font-semibold tracking-widest'>Rastreador Controle de Frota</h1>
        <div className='pt-10 w-1/2 flex flex-col gap-2'>
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

        </div>
      </div>
      <div className='w-9/12 justify-end'>
        <HistoryTracker markers={markers} location={location} error={locationError} />
      </div>
    </div>
  );
}
