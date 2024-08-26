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
import { FaRoute } from "react-icons/fa6";
import Link from 'next/link';

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
            className={`fixed top-1 left-16 z-10 w-1/6 h-14 text-slate-800
              ${open ? 'bg-white border-t-2 border-gray-500 rounded-t-3xl border-b border-transparent' : 'bg-white border border-gray-300 rounded-3xl'}
              hover:bg-white hover:border-gray-300`}  /* Manter a cor padrão ao passar o mouse */
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-row items-center justify-between w-full px-4">
              <a>Busque seu veículo</a>
              <div className='flex flex-row gap-5'>
                <IoIosSearch className='size-5' />
                <Link href="/rastreador">
                  <FaRoute className='size-5 z-[50]' />
                </Link>
              </div>
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className='z-[10] w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-5 -mt-1 
          h-28 flex flex-col gap-5 justify-center'
          sideOffset={5}
        >
          <Combobox
            selectedVehicle={selectedVehicle}
            setSelectedVehicle={setSelectedVehicle}
          />
        </PopoverContent>
      </Popover>

      <Image className='fixed bottom-10 left-20 transform -translate-x-1/2 z-[10]'
        width={100} height={100} src='/smartcerejeiras.png' alt='logo' />
    </div>

  );
}
