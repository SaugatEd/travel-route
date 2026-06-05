import { createFileRoute } from '@tanstack/react-router';
import { TrainsByCountry } from '@/components/trains/TrainsByCountry';

export const Route = createFileRoute('/trains')({
  component: TrainsByCountry,
});
