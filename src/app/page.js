"use client"
import { fetchApi } from '@/utils/fetchAPI';
import dynamic from 'next/dynamic';
import { useEffect, useRef, useState, useCallback, useTransition } from 'react';
import { useQuery } from 'react-query';
import Localization from '@/component/localization';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import debounce from 'lodash/debounce';

const Mapa = dynamic(() => import('@/component/mapa'), { ssr: false });

export default function Home() {
  const [selectedModel, setSelectedModel] = useState('Todos os rastreadores');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isPendingApiCall, startTransitionApiCall] = useTransition();
  const listRef = useRef();

  const [response, setResponse] = useState([]);
  const prevResponseRef = useRef([]); // Armazena a lista completa de rastreadores

  const MIN_SEARCH_LENGTH = 3;
  const LIMIT = 10;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getRastreador', selectedModel],
    queryFn: async () => {
      const endpoint = selectedModel && selectedModel !== 'Todos os rastreadores'
        ? `/rastreadores?serial=${selectedModel}`
        : '/rastreadores';

      // Obtém a maior data de `createdAt` da lista completa
      let maiorData = prevResponseRef.current.length > 0
        ? prevResponseRef.current.reduce((prev, current) => {
          let createdAt = new Date(current.ultima_posicao.createdAt);
          return !prev || createdAt > prev ? createdAt : prev;
        }, null)
        : new Date();

      let response;
      let updatedData;
      if (data === undefined || data.length === 0) {
        // Faz a requisição com a `maiorData` apenas se já houver uma data anterior)
        response = await fetchApi(endpoint, 'GET');
        updatedData = response.data;
      } else {
        // Faz a requisição com a `maiorData` apenas se já houver uma data anterior
        response = await fetchApi(endpoint + (maiorData ? `?&data_atualizado=${maiorData.toISOString()}` : ""), 'GET');
        updatedData = response.data;
      }

      // Atualiza apenas os itens que foram modificados
      const updatedResponse = prevResponseRef.current.map(existingItem => {
        const newItem = updatedData.find(item => item.serial === existingItem.serial);
        if (newItem) {
          const newDate = new Date(newItem.ultima_posicao.createdAt);
          const oldDate = new Date(existingItem.ultima_posicao.createdAt);
          return newDate > oldDate ? newItem : existingItem;
        }
        return existingItem;
      });

      // Adiciona novos itens que não estavam na lista anterior
      const newItems = updatedData.filter(newItem => !prevResponseRef.current.some(item => item.serial === newItem.serial));

      const finalResponse = [...updatedResponse, ...newItems];
      prevResponseRef.current = finalResponse; // Atualiza a lista completa no ref
      return { data: finalResponse };
    },
    enabled: !!selectedModel,
    refetchInterval: 1000,
  });

  const markers = Array.isArray(data?.data) ? data.data : [data?.data].filter(Boolean);
  const { location, error: locationError } = Localization();

  const fetchMoreItems = async (currentPage, currentSearchTerm) => {
    let url = `/rastreadores?pagina=${currentPage}&limite=${LIMIT}`;
    if (currentSearchTerm && currentSearchTerm.length >= MIN_SEARCH_LENGTH) {
      url += `&serial=${currentSearchTerm}`;
    }

    startTransitionApiCall(async () => {
      const response = await fetchApi(url, 'GET');
      const newItems = response?.data || [];
      if (newItems.length < LIMIT) {
        setHasMore(false);
      }
      setResponse(prev => currentPage === 1 ? newItems : [...prev, ...newItems]);
    });
  };

  const debouncedApiCall = useCallback(debounce(async (inputValue = '') => {
    setPage(1);
    setHasMore(true);
    fetchMoreItems(1, inputValue);
  }, 2000), [startTransitionApiCall]);

  useEffect(() => {
    if (open) {
      setPage(1);
      setHasMore(true);
      fetchMoreItems(1, searchTerm);
    }

    return () => {
      debouncedApiCall.cancel();
    };
  }, [debouncedApiCall, open]);

  const handleModelChange = (value) => {
    setSelectedModel(value);
    setOpen(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedApiCall(value);
  };

  const handleScrollEvent = useCallback(debounce(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 5 && hasMore) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchMoreItems(nextPage, searchTerm);
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
