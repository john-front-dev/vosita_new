import { Typography } from 'alif-ui';

type StatusTone = 'blue' | 'green' | 'grey' | 'red' | 'yellow';

const toneClasses: Record<StatusTone, string> = {
  blue: 'border-(--color-primary) bg-(--color-primary-soft) text-(--color-primary)',
  green: 'border-(--color-success) bg-(--color-success-soft) text-(--color-success)',
  grey: 'border-(--color-text-disabled) bg-(--color-border-default) text-(--color-text-disabled)',
  red: 'border-(--color-danger) bg-(--color-danger-soft) text-(--color-danger)',
  yellow: 'border-(--color-warning) bg-(--color-warning-soft) text-(--color-warning)',
};

export const StatusBanner = ({ label, tone }: { label: string; tone: StatusTone }) => (
  <Typography
    element="div"
    category="body"
    proportions="sStrong"
    className={`rounded-lg border-2 px-4 py-2 text-center ${toneClasses[tone]}`}
  >
    {label}
  </Typography>
);
