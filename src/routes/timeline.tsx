import { createFileRoute } from '@tanstack/react-router';
import { BookingTimelinePanel } from '@/App.jsx';

export const Route = createFileRoute('/timeline')({
  component: BookingTimelinePanel,
});
