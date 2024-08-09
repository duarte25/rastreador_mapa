"use client";
// pages/index.js
import Linha from '@/component/linha';
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useQuery } from "react-query";
import Localization from "@/component/localization";
import { useState } from 'react';

// Componente que utiliza `window`
const Mapa = dynamic(() => import('@/component/mapa'), { ssr: false });

export default function Home() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [selectedDataInitial, setSelectedDataInitial] = useState(null);
  const [selectedDataLast, setSelectedDataLast] = useState(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getRastreador"],
    queryFn: async () => {
      const response = await fetchApi("/posicoes", "GET");
      return response;
    },
    enabled: true,  // Enable automatic fetching
    refetchInterval: 1000, // Refetch every second
  });

  // Verificar se data é um array antes de passar para Map
  const markers = data?.data || []; // data?.data é o array de marcadores
  const { location, error: locationError } = Localization(); // Usando o hook
  
  return (
    <>
      <div>
        <h1>Meu Mapa com Leaflet</h1>
        <Linha markers={markers} location={location} error={locationError} />
      </div>
    </>
  );
}
