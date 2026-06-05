import { createFileRoute } from '@tanstack/react-router';
import { SCAMS } from '@/data/scamsData';
import { ReferenceGuide, type RefData } from '@/components/reference/ReferenceGuide';

export const Route = createFileRoute('/scams')({
  component: ScamsRoute,
});

function ScamsRoute() {
  return (
    <ReferenceGuide
      icon="⚠️"
      kicker="Stay alert · lose nothing"
      title="Scams & Safety"
      tone="red"
      data={SCAMS as RefData}
    />
  );
}
