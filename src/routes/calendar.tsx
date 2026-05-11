import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { CalendarPanel, CalendarDayDialog } from '@/App.jsx';
import { useActiveStopId } from '@/store/useUiStore';

export const Route = createFileRoute('/calendar')({
  component: CalendarRoute,
});

function CalendarRoute() {
  const activeStop = useActiveStopId();
  const navigate = useNavigate();
  const [openDay, setOpenDay] = useState<unknown>(null);

  return (
    <>
      {/* Horizontal-scroll wrapper so the inline 7-col grid stays usable on mobile. */}
      <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <div style={{ minWidth: 760 }}>
          <CalendarPanel active={activeStop} onOpenDay={setOpenDay} />
        </div>
      </div>
      {openDay != null && (
        <CalendarDayDialog
          day={openDay}
          onClose={() => setOpenDay(null)}
          onGoToStop={(stopId: string) => {
            const resolved = stopId === 'imst' ? 'innsbruck' : stopId;
            setOpenDay(null);
            navigate({ to: '/stop/$id', params: { id: resolved }, search: { view: 'overview' } });
          }}
        />
      )}
    </>
  );
}
