import { createFileRoute } from '@tanstack/react-router';
import { AltRoutesPanel } from '@/App.jsx';

export const Route = createFileRoute('/alt-routes')({
  component: AltRoutesPanel,
});
