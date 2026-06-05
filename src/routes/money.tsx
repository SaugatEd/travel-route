import { createFileRoute } from '@tanstack/react-router';
import { MONEY } from '@/data/moneyData';
import { ReferenceGuide, type RefData } from '@/components/reference/ReferenceGuide';

export const Route = createFileRoute('/money')({
  component: MoneyRoute,
});

function MoneyRoute() {
  return (
    <ReferenceGuide
      icon="💳"
      kicker="Wise · cash · cards"
      title="Money & Payments"
      tone="accent"
      data={MONEY as RefData}
    />
  );
}
