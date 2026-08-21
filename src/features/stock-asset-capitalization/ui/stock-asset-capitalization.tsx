import { useState } from 'react';
import { Button, Surface, Typography } from 'alif-ui';

import type { StockAssetCapitalization as CapitalizationItem } from '@entities/stock-asset';
import { queryClient, useMutationQuery } from '@shared/api';
import { formatDate, formatMoney } from '@shared/lib';
import { ConfirmModal } from '@shared/ui';

type StockAssetCapitalizationProps = {
  assetId: string;
  capitalization?: CapitalizationItem[];
  canManage?: boolean;
};

const currencies = ['TJS', 'RUB', 'USD'] as const;

export const StockAssetCapitalization = ({
  assetId,
  capitalization = [],
  canManage = true,
}: StockAssetCapitalizationProps) => {
  const [removingId, setRemovingId] = useState<number | string | null>(null);
  const totals = currencies.map((currency) => ({
    currency,
    value: capitalization.reduce(
      (total, item) => total + (item.currency === currency ? Number(item.price ?? 0) : 0),
      0,
    ),
  }));
  const removeMutation = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '/capitalization/',
    options: {
      onSuccess: () => {
        setRemovingId(null);
        queryClient.invalidateQueries({ queryKey: ['stock-asset', assetId] });
      },
    },
  });

  return (
    <>
    <Surface className="flex flex-col gap-5" p="4" rounded="12">
        {capitalization.length > 0 ? (
          capitalization.map((item) => (
            <div key={item.id} className="rounded-lg border border-(--color-border-default) p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Typography
                    element="div"
                    category="body"
                    proportions="sStrong"
                    className="text-(--color-text-primary)"
                  >
                    {formatMoney(item.price, { currency: item.currency })}
                  </Typography>
                  <Typography
                    element="div"
                    category="body"
                    proportions="xs"
                    className="mt-1 text-(--color-text-disabled)"
                  >
                    {formatDate(item.date)}
                  </Typography>
                </div>
                {canManage && (
                  <Button
                    type="button"
                    variant="risk"
                    size="s"
                    onClick={() => setRemovingId(item.id)}
                  >
                    Удалить
                  </Button>
                )}
              </div>
              {item.description && (
                <Typography
                  element="div"
                  category="body"
                  proportions="s"
                  className="mt-4 text-(--color-text-secondary)"
                >
                  {item.description}
                </Typography>
              )}
            </div>
          ))
        ) : (
          <Typography
            element="div"
            category="body"
            proportions="s"
            className="text-center text-(--color-text-secondary)"
          >
            Данный объект не капитализирован
          </Typography>
        )}
        {capitalization.length > 0 && (
          <div className="grid grid-cols-1 gap-3 border-t border-(--color-border-default) pt-4 sm:grid-cols-3">
            {totals.map((total) => (
              <div key={total.currency} className="rounded-lg bg-(--color-bg-subtle) px-4 py-3">
                <Typography
                  element="div"
                  category="body"
                  proportions="xsStrong"
                  className="text-(--color-text-disabled)"
                >
                  Итого ({total.currency})
                </Typography>
                <Typography
                  element="div"
                  category="body"
                  proportions="mStrong"
                  className="mt-1 text-(--color-text-primary)"
                >
                  {formatMoney(total.value, { currency: total.currency })}
                </Typography>
              </div>
            ))}
          </div>
        )}
      </Surface>
      <ConfirmModal
        isOpen={removingId !== null}
        title="Вы уверены, что хотите удалить запись капитализации?"
        message="После удаления записи её нельзя будет восстановить."
        confirmText="Удалить"
        variant="risk"
        isConfirmLoading={removeMutation.isPending}
        onClose={() => setRemovingId(null)}
        onConfirm={() =>
          removingId !== null && removeMutation.mutate({ url: `/capitalization/${removingId}` })
        }
      />
    </>
  );
};
