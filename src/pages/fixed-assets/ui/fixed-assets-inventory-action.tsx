import { Button, OutlineSystemListView, Typography } from 'alif-ui';

import type { StockAssetListItem } from '@entities/stock-asset';

import { useSaveFixedAssetsInventory } from '../model/use-fixed-assets-file-actions';

type FixedAssetsInventoryButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

type FixedAssetsInventoryActionsProps = {
  records: StockAssetListItem[];
  selectedIds: number[];
  onCancel: () => void;
};

export const FixedAssetsInventoryButton = ({
  isActive,
  onClick,
}: FixedAssetsInventoryButtonProps) => (
  <Button
    type="button"
    variant={isActive ? 'outline-neutral' : 'primary'}
    size="m"
    aria-label="Инвентаризация ОС"
    title="Инвентаризация ОС"
    onClick={onClick}
  >
    <OutlineSystemListView />
  </Button>
);

export const FixedAssetsInventoryActions = ({
  records,
  selectedIds,
  onCancel,
}: FixedAssetsInventoryActionsProps) => {
  const { isSaving, save } = useSaveFixedAssetsInventory(onCancel);
  const handleSave = async () => {
    if (!selectedIds.length) {
      return;
    }

    await save(records, selectedIds);
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-(--color-bg-subtle) p-3">
      <Typography category="body" proportions="s">
        Выбрано: {selectedIds.length}
      </Typography>
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="s" onClick={onCancel}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          size="s"
          onClick={handleSave}
          disabled={!selectedIds.length}
          isLoading={isSaving}
        >
          Сохранить
        </Button>
      </div>
    </div>
  );
};
