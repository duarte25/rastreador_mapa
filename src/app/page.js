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
  const [selectedModel, setSelectedModel] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState([]);
  const [initialModels, setInitialModels] = useState([]);
  const [isPendingApiCall, startTransitionApiCall] = useTransition();
  const listRef = useRef();

  const MIN_SEARCH_LENGTH = 3;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['getRastreador', selectedModel],
    queryFn: async () => {
      const endpoint = selectedModel && selectedModel !== 'todos' ? `/rastreadores?serial=${selectedModel}` : '/rastreadores';
      const response = await fetchApi(endpoint, 'GET');
      return response;
    },
    enabled: !!selectedModel, // Ensures that query is enabled when selectedModel has a value
    refetchInterval: 1000,
  });

  const markers = Array.isArray(data?.data) ? data.data : [data?.data].filter(Boolean);
  const { location, error: locationError } = Localization();

  const debouncedApiCall = useCallback(debounce(async (inputValue = '') => {
    if (inputValue.length >= MIN_SEARCH_LENGTH) {
      let urlPrimary = `/rastreadores?serial=${inputValue}`;

      startTransitionApiCall(async () => {
        const response = await fetchApi(urlPrimary, 'GET');
        setResponse(response?.data || []);
      });
    } else {
      setResponse([]); // Clear results if the input is too short
    }
  }, 1000), [startTransitionApiCall]);

  useEffect(() => {
    // Fetch all initial data
    const fetchAllRastreadores = async () => {
      const response = await fetchApi('/rastreadores', 'GET');
      setInitialModels(response?.data || []);
    };
    fetchAllRastreadores();
    
    return () => {
      debouncedApiCall.cancel();
    };
  }, [debouncedApiCall]);

  const handleModelChange = (value) => {
    setSelectedModel(value);
    setOpen(false);
  };

  // Include search term in the list if it is not already present
  const filteredItems = response.filter((item) =>
    item.serial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const itemsToShow = [
    // Include search term if it's not found in response data
    ...(filteredItems.length > 0 || searchTerm.length < MIN_SEARCH_LENGTH
      ? filteredItems
      : [{ serial: searchTerm, isSearchTerm: true }]),
    ...initialModels.filter((item) =>
      !filteredItems.some((filteredItem) => filteredItem.serial === item.serial)
    ),
  ];

  const handleScrollEvent = useCallback(debounce(() => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 5) {
        // Handle pagination or fetching more data if needed
      }
    }
  }, 200), []);

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
                  className='w-full'
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
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        debouncedApiCall(e.target.value);
                      }}
                      autoFocus
                      autoComplete='off'
                      disabled={isPendingApiCall}
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
                        onSelect={() => handleModelChange('todos')}
                        role='option'
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${selectedModel === 'todos' ? 'opacity-100' : 'opacity-0'}`}
                        />
                        Todos os Modelos
                      </CommandItem>
                      {itemsToShow.map((item, index) => (
                        <CommandItem
                          key={index}
                          onSelect={() => handleModelChange(item.serial)}
                          role='option'
                          className={item.isSearchTerm ? 'bg-yellow-100' : ''}
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

