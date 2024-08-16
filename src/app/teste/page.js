"use client";
// pages/index.js
import Linha from '@/component/linha';
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useQuery } from "react-query";
import Localization from "@/component/localization";
import { useState } from 'react';

// Componente que utiliza `window`
const Map = dynamic(() => import('@/component/linha'), { ssr: false });

export default function Home() {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getRastreador"],
    queryFn: async () => {
      const response = await fetchApi("/posicoes", "GET", {
        data_inicial: "2024-08-16T18:45:41.000Z",
        // data_final: "2024-08-14T19:00:30.000",
        serial: "BOT_000017"
      });
      return response;
    },
    enabled: true,  // Enable automatic fetching
    refetchInterval: 1000, // Refetch every second
  });

  // Verificar se data é um array antes de passar para Map
  const markers = data?.data || []; // data?.data é o array de marcadores
  for(let m of markers) {
    m.ultima_posicao = m
  }
  const { location, error: locationError } = Localization(); // Usando o hook
  
  return (
    <>
      <div>
        <Map markers={markers} location={location} error={locationError} />
      </div>
    </>
  );
}
