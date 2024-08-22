/* eslint-disable react-hooks/exhaustive-deps */
import React, { useRef, useState, useCallback, useEffect, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandGroup, CommandItem, CommandList, CommandEmpty } from '@/components/ui/command';
import { Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import debounce from 'lodash/debounce';
import { fetchApi } from '@/utils/fetchAPI';

export default function Combobox({ selectedVehicle, setSelectedVehicle }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [response, setResponse] = useState([]);
  const [isPendingApiCall, startTransitionApiCall] = useTransition();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const listRef = useRef();

  const [totalPages, setTotalPages] = useState(1); // Total de páginas retornadas pela API
  const [currentPage, setCurrentPage] = useState(1); // Página atual

  const MIN_SEARCH_LENGTH = 3;
  const LIMIT = 10;

  const fetchMoreItems = async (page, searchTerm) => {
    if (page > totalPages) return; // Se a página atual for maior que o total de páginas, sair da função

    let url = `/rastreadores?pagina=${page}&limite=${LIMIT}`;
    if (searchTerm && searchTerm.length >= MIN_SEARCH_LENGTH) {
      url += `&serial=${searchTerm}`;
    }

    startTransitionApiCall(async () => {
      const response = await fetchApi(url, 'GET');
      const newItems = response?.data || [];

      setTotalPages(response.totalPaginas); // Atualiza o total de páginas com o valor retornado pela API
      setCurrentPage(page); // Atualiza a página atual

      if (newItems.length < LIMIT || page >= response.totalPaginas) {
        setHasMore(false); // Se for a última página, não há mais itens
      }
      setResponse(prev => page === 1 ? newItems : [...prev, ...newItems]);
    });
  };

  const debouncedApiCall = useCallback(debounce(async (inputValue = '') => {
    setPage(1);
    setHasMore(true);
    fetchMoreItems(1, inputValue);
  }, 1000), [startTransitionApiCall]);

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
    setSelectedVehicle(value);
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
        const nextPage = currentPage + 1;
        if (nextPage <= totalPages) { // Verifica se ainda há páginas disponíveis
          setPage(nextPage);
          fetchMoreItems(nextPage, searchTerm);
        }
      }
    }
  }, 200), [currentPage, searchTerm, hasMore, totalPages]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className='w-full justify-between text-left font-normal'
        >
          <span>{selectedVehicle || 'Selecione um rastreador'}</span>
          <ChevronsUpDown className='ml-2 h-4 opacity-50 mr-1' />
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
                  className={`mr-2 h-4 w-4 ${selectedVehicle === 'Todos os rastreadores' ? 'opacity-100' : 'opacity-0'}`}
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
                    className={`mr-2 h-4 w-4 ${selectedVehicle === item.serial ? 'opacity-100' : 'opacity-0'}`}
                  />
                  {item.serial}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
