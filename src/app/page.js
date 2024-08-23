"use client"
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQuery } from 'react-query';
import Localization from '@/component/localization';
import Combobox from '@/component/combobox';
import Image from 'next/image';
import { Popover, PopoverContent, PopoverTrigger, PopoverArrow } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { IoIosSearch } from "react-icons/io";

const RealTimeTrackers = dynamic(() => import('@/component/realTimeTrackers'), { ssr: false });

export default function Home() {
  const [open, setOpen] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState('Todos os rastreadores');
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getVehicle', selectedVehicle],
    queryFn: async () => {
      const endpoint = selectedVehicle && selectedVehicle !== 'Todos os rastreadores'
        ? `/rastreadores?serial=${selectedVehicle}&`
        : '/rastreadores?&';

      const response = await fetchApi(endpoint, 'GET');
      return { data: response.data };
    },
    enabled: !!selectedVehicle,
    refetchInterval: 1000,
  });

  const markers = Array.isArray(data?.data) ? data.data : [data?.data].filter(Boolean);
  const { location, error: locationError } = Localization();

  return (
    <div className='relative w-full h-screen'>
      <div className='absolute inset-0 z-10'>
        <RealTimeTrackers markers={markers} location={location} error={locationError} />
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            className={`flex fixed top-1 left-16 z-10 w-1/6 h-14 text-slate-800
            ${open ? 'bg-white border-t-2 border-gray-500 rounded-t-3xl border-b border-transparent' : 'bg-white border border-gray-300 rounded-3xl'}`}
            onClick={() => setOpen(!open)}
          >
            <div className='flex flex-row items-center gap-5'>
              <a>Busque seu veículo...</a>
              <IoIosSearch />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='z-[10] w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0 -mt-2 
          h-48 flex flex-col gap-5 justify-center'
          sideOffset={5}
        >
          <Combobox
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
          <Combobox
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
          <Combobox
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        </PopoverContent>
      </Popover>
    </div>

  );
}
