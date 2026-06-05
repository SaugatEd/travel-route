import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { CalendarPanel } from '@/App.jsx';
import { useActiveStopId } from '@/store/useUiStore';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useCalendar } from '@/hooks/queries/itinerary';
import { useBookings } from '@/hooks/queries/bookings';
import { Resource } from '@/components/ui/Resource';
import { CalendarMobileList } from '@/components/calendar/CalendarMobileList';
import { CalendarDayDialog } from '@/components/calendar/CalendarDayDialog';
import type { CalendarDay } from '@/types';

export const Route = createFileRoute('/calendar')({
  component: CalendarRoute,
});

function CalendarRoute() {
  const activeStop = useActiveStopId();
  const [openDay, setOpenDay] = useState<CalendarDay | null>(null);
  const isCompact = useMediaQuery('(max-width: 719px)');
  const calendar = useCalendar();
  const bookings = useBookings();

  return (
    <>
      {isCompact ? (
        // Phones: the 7-col grid is unreadable, so swap to a tappable day list.
        <Resource query={calendar}>
          {(days) => (
            <CalendarMobileList days={days} activeStopId={activeStop} onOpenDay={setOpenDay} />
          )}
        </Resource>
      ) : (
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ minWidth: 760 }}>
            <CalendarPanel active={activeStop} onOpenDay={(d: CalendarDay) => setOpenDay(d)} />
          </div>
        </div>
      )}
      {openDay != null && (
        <CalendarDayDialog
          day={openDay}
          bookings={bookings.data ?? []}
          onClose={() => setOpenDay(null)}
        />
      )}
    </>
  );
}
