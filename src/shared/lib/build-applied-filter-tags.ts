export type FilterTagOption = {
  label: string;
  value: string;
};

type AppliedFilterConfig<TKey extends string> = {
  key: TKey;
  options: FilterTagOption[];
  title: string;
  value?: string;
};

export type AppliedFilterTag<TKey extends string> = {
  key: TKey;
  label: string;
};

export const buildAppliedFilterTags = <TKey extends string>(
  configs: AppliedFilterConfig<TKey>[],
): AppliedFilterTag<TKey>[] =>
  configs.flatMap(({ key, options, title, value }) => {
    if (!value) {
      return [];
    }

    const optionLabel = options.find((option) => option.value === value)?.label ?? value;

    return [{ key, label: `${title}: ${optionLabel}` }];
  });
