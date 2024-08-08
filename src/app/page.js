"use client";

import Map from '@/component/mapa';
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useQuery } from "react-query";
import Localization from "@/component/localization";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Componente que utiliza `window`
const Mapa = dynamic(() => import('@/component/mapa'), { ssr: false });

export default function Home() {
  const [selectedModel, setSelectedModel] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getRastreador"],
    queryFn: async () => {
      const response = await fetchApi("/rastreadores", "GET");
      return response;
    },
    enabled: true,  // Enable automatic fetching
    refetchInterval: 1000, // Refetch every second
  });

  console.log(data);

  const markers = data?.data || []; // Verificar se data é um array antes de passar para Map
  const { location, error: locationError } = Localization(); // Usando o hook

  // Filtrar markers com base no modelo selecionado
  const filteredMarkers = selectedModel
    ? markers.filter((item) => item.model === selectedModel)
    : markers;

  return (
    <>
      <div className='flex flex-row bg-purple-950'>
        <div className='w-3/12 justify-start text-center' >
          <h1 className='pt-64 text-3xl text-lime-400 font-semibold tracking-widest'>Rastreador Controle de Frota</h1>
          <div className='flex justify-center pt-10'>
            <Select onValueChange={(value) => setSelectedModel(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Models</SelectLabel>
                  <SelectItem value={null}>
                    Todos os Modelos
                  </SelectItem>
                  {markers.map((item, index) => (
                    <SelectItem key={index} value={item.model}>
                      {item.model}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className='w-9/12 justify-end'>
          <Map markers={filteredMarkers} location={location} error={locationError} />
        </div>
      </div>
    </>
  );
}
