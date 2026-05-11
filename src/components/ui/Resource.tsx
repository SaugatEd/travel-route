import type { ReactNode } from 'react';
import type { UseQueryResult } from '@tanstack/react-query';
import { EmptyState, LoadingState } from './EmptyState';

interface ResourceProps<T> {
  query: UseQueryResult<T>;
  /** Render the loaded data. */
  children: (data: NonNullable<T>) => ReactNode;
  /** Optional loading override. */
  loading?: ReactNode;
  /** Optional error renderer. */
  error?: (err: Error) => ReactNode;
  /** Treat null/undefined data as "empty" — render this. */
  empty?: ReactNode;
  /** Loading label for the default LoadingState. */
  loadingLabel?: string;
}

/**
 * Generic loading/error/empty/data wrapper for any useQuery result.
 *
 *   <Resource query={useScams()}>
 *     {(scams) => <ScamsList items={scams} />}
 *   </Resource>
 *
 * Eliminates the if/else loading boilerplate in every view.
 */
export function Resource<T>({
  query,
  children,
  loading,
  error,
  empty,
  loadingLabel,
}: ResourceProps<T>) {
  if (query.isLoading) return <>{loading ?? <LoadingState label={loadingLabel} />}</>;
  if (query.isError) {
    const err = query.error as Error;
    return <>{error ? error(err) : <EmptyState title="Failed to load" body={err?.message} />}</>;
  }
  if (query.data == null) {
    return <>{empty ?? <EmptyState title="No data" />}</>;
  }
  return <>{children(query.data as NonNullable<T>)}</>;
}
