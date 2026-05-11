import { createFileRoute } from '@tanstack/react-router';
import { ScamsPanel } from '@/App.jsx';

export const Route = createFileRoute('/scams')({
  component: ScamsPanel,
});
