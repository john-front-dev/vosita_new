import { Typography } from 'alif-ui';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type DetailsRowProps = {
  label: string;
  to?: string;
  value?: number | string;
};

export const DetailsRow = ({ label, to, value }: DetailsRowProps) => (
  <div className="flex items-start justify-between gap-6 border-b border-(--color-border-default) py-3 last:border-b-0">
    <Typography
      element="span"
      category="body"
      proportions="sStrong"
      className="text-(--color-text-secondary)"
    >
      {label}
    </Typography>
    {to && value ? (
      <Link className="max-w-[58%] text-right wrap-anywhere hover:underline" to={to}>
        <Typography
          element="span"
          category="body"
          proportions="sStrong"
          color="var(--color-primary)"
        >
          {value}
        </Typography>
      </Link>
    ) : (
      <Typography
        element="span"
        category="body"
        proportions="sStrong"
        className="max-w-[58%] text-right wrap-anywhere text-(--color-text-primary)"
      >
        {value || '-'}
      </Typography>
    )}
  </div>
);

export const DetailsGroup = ({ children, title }: { children: ReactNode; title: string }) => (
  <div>
    <Typography
      element="div"
      category="body"
      proportions="mStrong"
      className="mb-1 text-(--color-text-body)"
    >
      {title}
    </Typography>
    <div>{children}</div>
  </div>
);
