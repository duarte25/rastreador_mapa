"use client";
// pages/index.js
import Map from '@/component/mapa';
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useQuery } from "react-query";
import Localization from "@/component/localization";

// Componente que utiliza `window`
const Mapa = dynamic(() => import('@/component/mapa'), { ssr: false });

export default function Home() {

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getRastreador"],
    queryFn: async () => {
      const response = await fetchApi("/rastreadores", "GET");
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
        <Map markers={markers} location={location} error={locationError} />
      </div>
    </>
  );
}
