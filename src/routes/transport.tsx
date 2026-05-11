import { createFileRoute } from '@tanstack/react-router';
import { TransportValidationPanel } from '@/App.jsx';

export const Route = createFileRoute('/transport')({
  component: TransportValidationPanel,
});
