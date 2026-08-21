import { useState } from 'react';
import { Button, OutlineSystemListView, snackbar, Typography } from 'alif-ui';

import type { StockRecord } from '@pages/stock/model/types';
import { httpClient, queryClient } from '@shared/api';

type FixedAssetsInventoryButtonProps = {
  isActive: boolean;
  onClick: () => void;
};

type FixedAssetsInventoryActionsProps = {
  records: StockRecord[];
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
  const [isSaving, setIsSaving] = useState(false);
  const handleSave = async () => {
    if (!selectedIds.length) {
      return;
    }

    const recordsById = new Map(records.map((record) => [String(record.id), record]));
    const payload = selectedIds.map((id) => {
      const record = recordsById.get(String(id));

      return {
        inventory_number: record?.inventory_number,
        is_inventoried: true,
        item_id: Number(id),
        item_name: record?.name,
        item_type_id: 1,
      };
    });

    try {
      setIsSaving(true);
      await httpClient.post('/inventories', payload);
      await queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      snackbar.show({ title: 'Инвентаризация сохранена', type: 'success' });
      onCancel();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить инвентаризацию', type: 'error' });
    } finally {
      setIsSaving(false);
    }
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
