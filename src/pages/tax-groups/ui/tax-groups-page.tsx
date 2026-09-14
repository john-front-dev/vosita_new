import { Surface, Typography } from 'alif-ui';

import { taxGroups } from '../model/tax-groups';

export const TaxGroupsPage = () => (
  <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
    <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
      Группа налогов
    </Typography>

    <div className="mx-auto flex w-full max-w-190 flex-col gap-3">
      {taxGroups.map((taxGroup) => (
        <Surface
          key={taxGroup.id}
          className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center"
          p="5"
          rounded="12"
        >
          <div className="min-w-0 flex-1">
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="mb-2 text-(--color-text-secondary)"
            >
              Налог {taxGroup.id}
            </Typography>
            <Typography
              element="div"
              category="body"
              proportions="m"
              className="leading-6 text-(--color-text-primary)"
            >
              {taxGroup.description}
            </Typography>
          </div>

          <div className="shrink-0 sm:w-24 sm:text-right">
            <Typography
              element="div"
              category="body"
              proportions="sStrong"
              className="mb-2 text-(--color-text-secondary)"
            >
              Норма
            </Typography>
            <Typography
              element="div"
              category="heading"
              proportions="h4"
              className="text-(--color-text-primary)"
            >
              {taxGroup.norm}%
            </Typography>
          </div>
        </Surface>
      ))}
    </div>
  </section>
);
