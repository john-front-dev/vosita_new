export const AccessDeniedPage = () => {
  return (
    <section className="min-h-[calc(100vh-48px)]">
      <Typography category="heading" proportions="h3" className="text-(--color-text-primary)">
        Нет доступа
      </Typography>
      <Typography category="body" proportions="s" className="mt-2 text-(--color-text-secondary)">
        У вашей роли нет прав для просмотра этой страницы.
      </Typography>
    </section>
  );
};

import { Typography } from 'alif-ui';
