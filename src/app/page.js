"use client";

import Map from '@/component/mapa';
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
  const [response, setResponse] = useState([]);
  const [page, setPage] = useState(1); // Página inicial
  const [hasMore, setHasMore] = useState(true); // Controle de mais itens
  const [isPendingApiCall, startTransitionApiCall] = useTransition();
  const listRef = useRef();

  const MIN_SEARCH_LENGTH = 3;
  const LIMIT = 10; // Limite de itens por página

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getRastreador', selectedModel],
    queryFn: async () => {
      const endpoint = selectedModel && selectedModel !== 'Todos os rastreadores' ? `/rastreadores?serial=${selectedModel}` : '/rastreadores';
      const response = await fetchApi(endpoint, 'GET');
      return response;
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
        setHasMore(false); // Não há mais itens para carregar
      }
      setResponse(prev => currentPage === 1 ? newItems : [...prev, ...newItems]); // Adiciona novos itens à lista existente, ou reinicia se for a primeira página
    });
  };

  const debouncedApiCall = useCallback(debounce(async (inputValue = '') => {
    setPage(1); // Reset page quando uma nova busca é realizada
    setHasMore(true); // Reset hasMore quando uma nova busca é realizada

    fetchMoreItems(1, inputValue); // Busca novos itens a partir da primeira página
  }, 2000), [startTransitionApiCall]);

  useEffect(() => {
    // Fetch initial data when Popover opens
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
