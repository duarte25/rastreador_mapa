"use client"
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQuery } from 'react-query';
import Localization from '@/component/localization';
import Combobox from '@/component/combobox';
import Image from 'next/image';

const RealTimeTrackers = dynamic(() => import('@/component/realTimeTrackers'), { ssr: false });

export default function Home() {
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
    <div className='flex flex-row'>
      <div className='w-3/12 flex flex-col items-center'>
        <h1 className='pt-64 text-3xl text-slate-800 font-semibold tracking-widest'>Rastreador Controle de Frota</h1>
        <div className='pt-10 w-1/2'>
          <Combobox 
            selectedVehicle={selectedVehicle} 
            setSelectedVehicle={setSelectedVehicle} 
          />
          <Image className='pt-48 w-48' width={100} height={100} src='./logo.svg' alt='logo' />
        </div>
      </div>
      <div className='w-9/12 justify-end'>
        <RealTimeTrackers markers={markers} location={location} error={locationError} />
      </div>
    </div>
  );
}
