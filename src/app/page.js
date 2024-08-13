"use client"; // Indica que este arquivo será executado no cliente (client-side rendering).

import Map from '@/component/mapa'; // Importa o componente do mapa.
import { fetchApi } from '@/utils/fetchAPI'; // Importa a função de requisição à API.
import dynamic from 'next/dynamic'; // Importa a função para carregar componentes dinamicamente.
import { useEffect, useRef, useState, useCallback, useTransition } from 'react'; // Importa hooks do React.
import { useQuery } from 'react-query'; // Importa o hook para fazer consultas assíncronas com cache.
import Localization from '@/component/localization'; // Importa o componente de localização.
import { Button } from '@/components/ui/button'; // Importa o componente de botão.
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; // Importa componentes de popover (menu flutuante).
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command'; // Importa componentes relacionados ao comando de busca.
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react'; // Importa ícones da biblioteca Lucide.
import debounce from 'lodash/debounce'; // Importa a função de debounce da biblioteca Lodash.

// Carrega o componente de mapa dinamicamente para evitar SSR (Server-Side Rendering).
const Mapa = dynamic(() => import('@/component/mapa'), { ssr: false });

export default function Home() {
  // Define o estado para o modelo selecionado, termo de busca, abertura do popover, resposta da API, página atual, controle de mais itens e estado de chamada de API.
  const [selectedModel, setSelectedModel] = useState('Todos os rastreadores');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState([]);
  const [page, setPage] = useState(1); // Página inicial.
  const [hasMore, setHasMore] = useState(true); // Controle de mais itens a carregar.
  const [isPendingApiCall, startTransitionApiCall] = useTransition(); // Hook para transição suave de estado.
  const listRef = useRef(); // Referência à lista de itens no popover.

  const MIN_SEARCH_LENGTH = 3; // Comprimento mínimo do termo de busca.
  const LIMIT = 10; // Limite de itens por página.

  // Utiliza o useQuery para buscar dados da API conforme o modelo selecionado.
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getRastreador', selectedModel], // Chave única para a consulta.
    queryFn: async () => {
      const endpoint = selectedModel && selectedModel !== 'Todos os rastreadores' ? `/rastreadores?serial=${selectedModel}` : '/rastreadores';
      const response = await fetchApi(endpoint, 'GET');
      return response;
    },
    enabled: !!selectedModel, // Habilita a consulta apenas se houver um modelo selecionado.
    refetchInterval: 1000, // Intervalo para refazer a consulta (1 segundo).
  });

  console.log("DADOS data", data);

  // Processa os dados recebidos, garantindo que o formato seja um array de marcadores.
  const markers = Array.isArray(data?.data) ? data.data : [data?.data].filter(Boolean);
  const { location, error: locationError } = Localization(); // Obtém a localização atual e possíveis erros.

  // Função para buscar mais itens da API ao rolar a lista.
  const fetchMoreItems = async (currentPage, currentSearchTerm) => {
    let url = `/rastreadores?pagina=${currentPage}&limite=${LIMIT}`;
    if (currentSearchTerm && currentSearchTerm.length >= MIN_SEARCH_LENGTH) {
      url += `&serial=${currentSearchTerm}`;
    }

    startTransitionApiCall(async () => {
      const response = await fetchApi(url, 'GET');
      const newItems = response?.data || [];
      if (newItems.length < LIMIT) {
        setHasMore(false); // Define como falso se não houver mais itens para carregar.
      }
      setResponse(prev => currentPage === 1 ? newItems : [...prev, ...newItems]); // Adiciona novos itens à lista ou reinicia se for a primeira página.
    });
  };

  // Debounce para limitar a quantidade de chamadas à API quando o termo de busca é alterado.
  const debouncedApiCall = useCallback(debounce(async (inputValue = '') => {
    setPage(1); // Reseta a página quando uma nova busca é realizada.
    setHasMore(true); // Reseta o controle de mais itens.
    fetchMoreItems(1, inputValue); // Busca novos itens a partir da primeira página.
  }, 2000), [startTransitionApiCall]);

  // Efeito para carregar dados iniciais quando o popover é aberto.
  useEffect(() => {
    if (open) {
      setPage(1);
      setHasMore(true);
      fetchMoreItems(1, searchTerm); // Carrega itens ao abrir o popover.
    }

    return () => {
      debouncedApiCall.cancel(); // Cancela chamadas pendentes do debounce ao desmontar o componente.
    };
  }, [debouncedApiCall, open]);

  // Função para alterar o modelo selecionado.
  const handleModelChange = (value) => {
    setSelectedModel(value);
    setOpen(false); // Fecha o popover após selecionar um modelo.
  };

  // Função para atualizar o termo de busca e iniciar a chamada debounced.
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedApiCall(value); // Inicia a chamada debounce.
  };

  // Função para lidar com o evento de rolagem e carregar mais itens se necessário.
  const handleScrollEvent = useCallback(debounce(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      // Verifica se o usuário chegou ao final da lista e se há mais itens para carregar.
      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMoreItems(nextPage, searchTerm); // Carrega mais itens para a próxima página.
      }
    }
  }, 200), [page, searchTerm, hasMore]);

  return (
    <>
      <div className='flex flex-row bg-purple-950'>
        <div className='w-3/12 flex flex-col items-center'>
          <h1 className='pt-64 text-3xl text-lime-400 font-semibold tracking-widest'>Rastreador Controle de Frota</h1>
          <div className='pt-10 w-1/2'>

            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  role='combobox'
                  aria-expanded={open}
                  className="flex w-full p-1 px-2 min-h-10 h-auto justify-between"
                >
                  <span>{selectedModel || 'Selecione um rastreador'}</span>
                  <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-[--radix-popover-trigger-width] max-h-[--radix-popover-content-available-height] p-0'>
                <Command>
                  <div className='flex items-center gap-1 py-2 px-2 border-b border-zinc-300'>
                    <Search className='w-[16px] text-zinc-400' />
                    <input
                      type='text'
                      className='w-full focus:outline-none text-sm p-1'
                      placeholder='Buscar rastreador...'
                      onChange={handleInputChange}
                      autoFocus
                      autoComplete='off'
                      disabled={isPendingApiCall}
                      value={searchTerm}
                    />
                  </div>

                  {isPendingApiCall && (
                    <div className='flex justify-center items-center p-2'>
                      <Loader2 className='h-8 w-8 animate-spin' color='gray' />
                    </div>
                  )}

                  {!isPendingApiCall && response.length === 0 && searchTerm && (
                    <CommandEmpty>Nenhum resultado encontrado!</CommandEmpty>
                  )}

                  <CommandList ref={listRef} onScroll={handleScrollEvent}>
                    <CommandGroup>
                      <CommandItem
                        onSelect={() => handleModelChange('Todos os rastreadores')}
                        role='option'
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selectedModel === 'Todos os rastreadores' ? 'opacity-100' : 'opacity-0'}`}
                        />
                        Todos os rastreadores
                      </CommandItem>
                      {response.map((item, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleModelChange(item.serial)}
                          role='option'
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${selectedModel === item.serial ? 'opacity-100' : 'opacity-0'}`}
                          />
                          {item.serial}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

          </div>
        </div>
        <div className='w-9/12 justify-end'>
          <Mapa markers={markers} location={location} error={locationError} />
        </div>
      </div>
    </>
  );
}
