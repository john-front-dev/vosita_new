type BadgeVariant = 'error' | 'info' | 'neutral' | 'success' | 'warning';

export const getMbpStatusPresentation = (isRepair?: boolean, statusName?: string) => {
  if (isRepair) {
    return { badgeVariant: 'error' as const, label: 'В ремонте', tone: 'red' as const };
  }

  const label = statusName?.trim() || 'Статус не указан';
  const status = label.toLowerCase();
  let badgeVariant: BadgeVariant = 'neutral';
  let tone = 'blue' as 'blue' | 'green' | 'grey' | 'yellow';

  if (status.includes('эксплуат')) {
    badgeVariant = 'success';
    tone = 'green';
  } else if (status.includes('списан') || status.includes('уничтож') || status.includes('утилиз')) {
    badgeVariant = 'error';
    tone = 'grey';
  } else if (status.includes('ожида')) {
    badgeVariant = 'warning';
    tone = 'yellow';
  } else if (status.includes('продан')) {
    badgeVariant = 'info';
  }

  return { badgeVariant, label, tone };
};
