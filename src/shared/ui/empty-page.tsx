type EmptyPageProps = {
  title: string;
};

export const EmptyPage = ({ title }: EmptyPageProps) => {
  return (
    <section className="min-h-[calc(100vh-48px)]">
      <div>
        <Typography category="heading" proportions="h3" className="text-(--color-text-primary)">
          {title}
        </Typography>
        <Typography category="body" proportions="s" className="mt-2 text-(--color-text-secondary)">
          Страница пока пустая
        </Typography>
      </div>
    </section>
  );
};

import { Typography } from 'alif-ui';
