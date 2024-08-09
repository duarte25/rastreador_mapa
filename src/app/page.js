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
  // Guarda o model do rastreador
  const [selectedModel, setSelectedModel] = useState(null);
  // Guarda todos os models dos rastreadores
  const [guardarDadosModel, setGuardarDadosModel] = useState([]);

  // Realiza fetch com lógica para alterar caso precise, por exemplo pegar todos os rastreadores ou somente o selecionado
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["getRastreador", selectedModel],
    queryFn: async () => {
      // Condicional para verificar se `selectedModel` está presente
      const endpoint = selectedModel
        ? `/rastreadores/${selectedModel}` // Altere a URL conforme sua API
        : "/rastreadores";

      const response = await fetchApi(endpoint, "GET");

      // Guarda os dados do fetch inicial, somente se não houver um modelo selecionado
      if (!selectedModel && Array.isArray(response?.data)) {
        setGuardarDadosModel(response.data);  // Armazena os dados da primeira requisição
      }

      return response;
    },
    enabled: true,  // Enable automatic fetching
    refetchInterval: 1000, // Refetch every second
  });

  const markers = Array.isArray(data?.data) ? data.data : [data?.data].filter(Boolean);
  const { location, error: locationError } = Localization(); // Usando o hook

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
                  <SelectItem value={null}>Todos os Modelos</SelectItem>
                  {Array.isArray(guardarDadosModel) && guardarDadosModel.map((item, index) => (
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
          <Map markers={markers} location={location} error={locationError} />
        </div>
      </div>
    </>
  );
}
