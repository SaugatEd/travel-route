import { createFileRoute } from '@tanstack/react-router';
import { MoneyPanel } from '@/App.jsx';

export const Route = createFileRoute('/money')({
  component: MoneyPanel,
});
