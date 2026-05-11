import { createFileRoute } from '@tanstack/react-router';
import { JourneysPanel } from '@/App.jsx';
import { useCurrencyMode } from '@/store/useUiStore';
import { useNprRate } from '@/hooks/useNprRate';

export const Route = createFileRoute('/trains')({
  component: TrainsRoute,
});

function TrainsRoute() {
  const mode = useCurrencyMode();
  const { data } = useNprRate();
  const npr = data?.npr ?? ((v: number, cur = 'EUR') => `${cur} ${v}`);
  return <JourneysPanel showNPR={mode === 'npr'} npr={npr} />;
}
