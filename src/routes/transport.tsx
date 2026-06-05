import { createFileRoute } from '@tanstack/react-router';
import { TRANSPORT_VALIDATION } from '@/data/transportValidation';
import { ReferenceGuide, type RefData } from '@/components/reference/ReferenceGuide';

export const Route = createFileRoute('/transport')({
  component: TransportRoute,
});

function TransportRoute() {
  return (
    <ReferenceGuide
      icon="🚇"
      kicker="When do I tap?"
      title="Transport & Validation"
      tone="green"
      data={TRANSPORT_VALIDATION as RefData}
    />
  );
}
