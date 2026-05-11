import { useQuery, type UseQueryOptions, type UseQueryResult } from '@tanstack/react-query';

/**
 * Factory for "resource hooks" — uniform wrappers around useQuery.
 *
 *   const useScams = createResource('scams', () => Promise.resolve(SCAMS));
 *   const { data, isLoading } = useScams();
 *
 * When the MongoDB backend lands, swap `loader` for `() => fetch(url).then(r => r.json())`
 * and every consumer keeps working unchanged.
 */
export function createResource<T>(
  key: readonly unknown[],
  loader: () => Promise<T>,
  defaults?: Partial<UseQueryOptions<T>>
) {
  return function useResource(
    overrides?: Partial<UseQueryOptions<T>>
  ): UseQueryResult<T> {
    return useQuery<T>({
      queryKey: key,
      queryFn: loader,
      ...defaults,
      ...overrides,
    });
  };
}

/**
 * Same idea for parameterised resources (single record by id, etc.).
 *
 *   const useStop = createParamResource('stop', (id: string) =>
 *     fetchStops().then(rows => rows.find(s => s.id === id) ?? null)
 *   );
 *   const { data } = useStop('rome');
 */
export function createParamResource<TParam, TResult>(
  baseKey: string,
  loader: (param: TParam) => Promise<TResult>,
  defaults?: Partial<UseQueryOptions<TResult>>
) {
  return function useParamResource(
    param: TParam | undefined,
    overrides?: Partial<UseQueryOptions<TResult>>
  ): UseQueryResult<TResult> {
    return useQuery<TResult>({
      queryKey: param == null ? [baseKey, '_noop'] : [baseKey, param],
      queryFn: () => loader(param as TParam),
      enabled: param != null,
      ...defaults,
      ...overrides,
    });
  };
}
