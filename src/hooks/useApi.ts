import { useState, useCallback, useEffect } from 'react';

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  initialData?: T;
}

interface UseApiReturn<T, P extends any[]> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...params: P) => Promise<T | null>;
  setData: (data: T | ((prevData: T | null) => T | null)) => void;
  reset: () => void;
}

/**
 * Кастомный хук для удобной работы с API запросами
 * @param apiFunc Функция API которую нужно вызвать
 * @param options Опции для контроля поведения хука
 * @returns Состояние запроса и функция для его выполнения
 */
export function useApi<T, P extends any[]>(
  apiFunc: (...params: P) => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const [data, setData] = useState<T | null>(options.initialData || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...params: P): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await apiFunc(...params);
        
        setData(result);
        options.onSuccess?.(result);
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options.onError?.(error);
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, options]
  );

  const reset = useCallback(() => {
    setData(options.initialData || null);
    setLoading(false);
    setError(null);
  }, [options.initialData]);

  return { data, loading, error, execute, setData, reset };
}

/**
 * Хук для выполнения API-запроса при монтировании компонента
 * @param apiFunc Функция API
 * @param params Параметры для функции API
 * @param options Опции
 * @returns Результат useApi
 */
export function useApiOnMount<T, P extends any[]>(
  apiFunc: (...params: P) => Promise<T>,
  params: P,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const api = useApi(apiFunc, options);
  
  useEffect(() => {
    api.execute(...params);
  }, []);
  
  return api;
}

/**
 * Хук для выполнения API-запроса при изменении зависимостей
 * @param apiFunc Функция API
 * @param params Параметры для функции API
 * @param deps Зависимости, при изменении которых выполняется запрос
 * @param options Опции
 * @returns Результат useApi
 */
export function useApiWithDeps<T, P extends any[]>(
  apiFunc: (...params: P) => Promise<T>,
  params: P,
  deps: React.DependencyList,
  options: UseApiOptions<T> = {}
): UseApiReturn<T, P> {
  const api = useApi(apiFunc, options);
  
  useEffect(() => {
    api.execute(...params);
  }, deps);
  
  return api;
} 