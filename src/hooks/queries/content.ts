import { useQuery } from '@tanstack/react-query';
// Static content modules — wrapped in useQuery for a uniform data layer.
// When MongoDB lands, swap each queryFn for a fetch(); views don't change.

import { MONEY } from '@/data/moneyData.js';
import { BOOKING_TIMELINE } from '@/data/bookingTimelineData.js';
import { ALT_ROUTES } from '@/data/altRoutesData.js';
import { SCAMS } from '@/data/scamsData.js';
import { DOCS, MUST_TRY } from '@/data/docsData.js';
import { TIPS, PACKING_CHECKLIST } from '@/data/tipsData.js';
import { PRACTICAL } from '@/data/practicalData.js';
import { TRANSPORT_VALIDATION } from '@/data/transportValidation.js';
import { CITY_IMAGES, ROUTE_MAPS, LANDMARK_IMAGES } from '@/data/imageData.js';
import { SURVIVAL_GUIDE, DESTINATION_SURVIVAL, SITUATION_PHRASES } from '@/data/survivalData.js';

const trivialQuery = <T>(key: readonly unknown[], data: T) =>
  ({ queryKey: key, queryFn: async () => data });

export const useMoney      = () => useQuery(trivialQuery(['money'], MONEY));
export const useTimeline   = () => useQuery(trivialQuery(['timeline'], BOOKING_TIMELINE));
export const useAltRoutes  = () => useQuery(trivialQuery(['altRoutes'], ALT_ROUTES));
export const useScams      = () => useQuery(trivialQuery(['scams'], SCAMS));
export const useDocs       = () => useQuery(trivialQuery(['docs'], DOCS));
export const useMustTry    = () => useQuery(trivialQuery(['mustTry'], MUST_TRY));
export const useTips       = () => useQuery(trivialQuery(['tips'], TIPS));
export const usePacking    = () => useQuery(trivialQuery(['packing'], PACKING_CHECKLIST));
export const usePractical  = () => useQuery(trivialQuery(['practical'], PRACTICAL));
export const useTransport  = () => useQuery(trivialQuery(['transport'], TRANSPORT_VALIDATION));
export const useImages     = () => useQuery(trivialQuery(['images'], { CITY_IMAGES, ROUTE_MAPS, LANDMARK_IMAGES }));
export const useSurvival   = () => useQuery(trivialQuery(['survival'], { SURVIVAL_GUIDE, DESTINATION_SURVIVAL, SITUATION_PHRASES }));
