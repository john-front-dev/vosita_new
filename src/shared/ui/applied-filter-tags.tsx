import { Button, Tag } from 'alif-ui';

type FilterTag = {
  label: string;
};

type AppliedFilterTagsProps<TFilter extends FilterTag> = {
  filters: readonly TFilter[];
  getKey: (filter: TFilter) => number | string;
  onClear: () => void;
  onRemove: (filter: TFilter) => void;
};

export const AppliedFilterTags = <TFilter extends FilterTag>({
  filters,
  getKey,
  onClear,
  onRemove,
}: AppliedFilterTagsProps<TFilter>) => {
  if (!filters.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {filters.map((filter) => (
        <Tag key={getKey(filter)} variant="primary" size="s" onClose={() => onRemove(filter)}>
          {filter.label}
        </Tag>
      ))}
      <Button type="button" variant="secondary" size="s" onClick={onClear}>
        Сбросить
      </Button>
    </div>
  );
};
