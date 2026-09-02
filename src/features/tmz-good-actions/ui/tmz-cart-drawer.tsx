import { useState } from 'react';
import {
  Button,
  Checkbox,
  Drawer,
  Loader,
  OutlineSystemCheck,
  OutlineSystemDelete,
  OutlineSystemShoppingBasket,
  Typography,
} from 'alif-ui';

import { useTmzCart } from '@entities/tmz-good';
import { formatMoney } from '@shared/lib';

import { useRemoveTmzCartItems, useUpdateTmzCartItem } from '../model/use-tmz-good-mutations';
import { TmzCartDistributeModal } from './tmz-cart-distribute-modal';
import { TmzCartMoveModal } from './tmz-cart-move-modal';

export const TmzCartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [operation, setOperation] = useState<'distribute' | 'move' | null>(null);
  const cart = useTmzCart();
  const updateItem = useUpdateTmzCartItem();
  const removeItems = useRemoveTmzCartItems();
  const selectedItems = cart.items.filter((item) => selectedIds.includes(item.id));
  const groups = Object.entries(
    cart.items.reduce<Record<string, typeof cart.items>>((result, item) => {
      (result[item.item_type_name] ??= []).push(item);
      return result;
    }, {}),
  );

  const toggle = (id: number) =>
    setSelectedIds((ids) =>
      ids.includes(id) ? ids.filter((itemId) => itemId !== id) : [...ids, id],
    );
  const remove = (items: typeof cart.items) =>
    removeItems.mutate({
      body: items.map((item) => ({ good_id: item.good_id, warehouse_id: item.warehouse_id })),
    });
  const getQuantity = (item: (typeof cart.items)[number]) => quantities[item.id] ?? item.qty;
  const setQuantity = (item: (typeof cart.items)[number], qty: number) =>
    setQuantities((values) => ({
      ...values,
      [item.id]: Math.min(Math.max(1, qty), item.qty),
    }));
  const saveQuantity = (item: (typeof cart.items)[number]) => {
    const qty = getQuantity(item);
    if (qty === item.qty) return;
    updateItem.mutate(
      { body: { good_id: item.good_id, qty, warehouse_id: item.warehouse_id } },
      {
        onSuccess: () =>
          setQuantities((values) => {
            const nextValues = { ...values };
            delete nextValues[item.id];
            return nextValues;
          }),
      },
    );
  };
  const hasQuantityChanges = cart.items.some((item) => getQuantity(item) !== item.qty);
  const mixedTypes = selectedItems.some((item) => item.item_type !== selectedItems[0]?.item_type);
  const totalQuantity = selectedItems.reduce((total, item) => total + item.qty, 0);
  const totalPrice = selectedItems.reduce((total, item) => total + item.qty * item.price, 0);
  const closeDrawer = () => {
    setIsOpen(false);
    setSelectedIds([]);
    setQuantities({});
  };

  return (
    <>
      <Button
        type="button"
        variant="outline-neutral"
        isIconBtn
        title="Корзина"
        onClick={() => setIsOpen(true)}
      >
        <span className="relative inline-flex">
          <OutlineSystemShoppingBasket />
          {cart.items.length > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] leading-none text-white">
              {cart.items.length > 99 ? '99+' : cart.items.length}
            </span>
          )}
        </span>
      </Button>
      <Drawer
        title="Корзина"
        isOpen={isOpen}
        onClose={closeDrawer}
        position="right"
        width="min(720px, 100vw)"
      >
        <div className="flex h-full flex-col gap-4">
          {cart.isLoading ? (
            <div className="flex flex-1 items-center justify-center">
              <Loader />
            </div>
          ) : !cart.items.length ? (
            <div className="flex flex-1 items-center justify-center text-(--color-text-secondary)">
              Ваша корзина пуста
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <Checkbox
                  label={selectedIds.length === cart.items.length ? 'Отменить все' : 'Выбрать все'}
                  checked={selectedIds.length === cart.items.length}
                  onChange={() =>
                    setSelectedIds(
                      selectedIds.length === cart.items.length
                        ? []
                        : cart.items.map((item) => item.id),
                    )
                  }
                />
                <Button
                  type="button"
                  size="s"
                  variant="risk"
                  leftSection={<OutlineSystemDelete />}
                  isLoading={removeItems.isPending}
                  onClick={() => remove(cart.items)}
                >
                  Очистить корзину
                </Button>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto pr-1">
                {groups.map(([typeName, items]) => (
                  <section key={typeName} className="space-y-2">
                    <div className="flex items-center justify-between rounded-lg bg-(--color-bg-subtle) px-3 py-2">
                      <Typography category="body" proportions="sStrong">
                        {typeName}
                      </Typography>
                      <Button
                        type="button"
                        size="xs"
                        variant="tertiary"
                        onClick={() => {
                          const groupIds = items.map((item) => item.id);
                          const allSelected = groupIds.every((id) => selectedIds.includes(id));
                          setSelectedIds((ids) =>
                            allSelected
                              ? ids.filter((id) => !groupIds.includes(id))
                              : [...new Set([...ids, ...groupIds])],
                          );
                        }}
                      >
                        {items.every((item) => selectedIds.includes(item.id))
                          ? 'Отменить все'
                          : 'Выбрать все'}
                      </Button>
                    </div>
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="grid grid-cols-[auto_minmax(0,1fr)_150px_120px_88px] items-center gap-3 rounded-lg border border-(--color-border-default) p-3"
                      >
                        <Checkbox
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggle(item.id)}
                        />
                        <div className="min-w-0">
                          <div className="truncate font-medium">{item.name}</div>
                          <div className="text-sm text-(--color-text-secondary)">
                            {item.warehouse} · {formatMoney(item.price, { currency: 'TJS' })}
                          </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            type="button"
                            size="s"
                            variant="outline-neutral"
                            isIconBtn
                            title="Уменьшить количество"
                            disabled={getQuantity(item) <= 1 || updateItem.isPending}
                            onClick={() => setQuantity(item, getQuantity(item) - 1)}
                          >
                            −
                          </Button>
                          <span className="min-w-6 text-center">{getQuantity(item)}</span>
                          <Button
                            type="button"
                            size="s"
                            variant="outline-neutral"
                            isIconBtn
                            title="Увеличить количество"
                            disabled={getQuantity(item) >= item.qty || updateItem.isPending}
                            onClick={() => setQuantity(item, getQuantity(item) + 1)}
                          >
                            +
                          </Button>
                        </div>
                        <div className="text-right font-medium">
                          {formatMoney(getQuantity(item) * item.price, { currency: 'TJS' })}
                        </div>
                        <div className="flex w-[88px] items-center justify-end gap-2">
                          {getQuantity(item) !== item.qty && (
                            <Button
                              type="button"
                              size="s"
                              variant="primary"
                              isIconBtn
                              title="Подтвердить количество"
                              isLoading={updateItem.isPending}
                              onClick={() => saveQuantity(item)}
                            >
                              <OutlineSystemCheck />
                            </Button>
                          )}
                          <Button
                            type="button"
                            size="s"
                            variant="risk"
                            isIconBtn
                            title="Удалить"
                            onClick={() => remove([item])}
                          >
                            <OutlineSystemDelete />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </section>
                ))}
              </div>

              <div className="space-y-3 border-t border-(--color-border-default) pt-4">
                {mixedTypes && (
                  <div className="text-sm text-(--color-danger)">
                    Для распределения выберите товары только одного типа.
                  </div>
                )}
                {hasQuantityChanges && (
                  <div className="text-sm text-(--color-danger)">
                    Подтвердите изменение количества товаров.
                  </div>
                )}
                <div className="flex justify-between">
                  <strong>Итого товаров:</strong>
                  <strong>{totalQuantity} шт.</strong>
                </div>
                <div className="flex justify-between">
                  <span>Общая сумма:</span>
                  <strong>{formatMoney(totalPrice, { currency: 'TJS' })}</strong>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline-neutral"
                    disabled={!selectedItems.length || hasQuantityChanges}
                    onClick={() => setOperation('move')}
                  >
                    Переместить
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!selectedItems.length || mixedTypes || hasQuantityChanges}
                    onClick={() => setOperation('distribute')}
                  >
                    Распределить
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </Drawer>
      {operation === 'distribute' && (
        <TmzCartDistributeModal
          items={selectedItems}
          onClose={() => setOperation(null)}
          onSuccess={() => {
            setOperation(null);
            setSelectedIds([]);
          }}
        />
      )}
      {operation === 'move' && (
        <TmzCartMoveModal
          items={selectedItems}
          onClose={() => setOperation(null)}
          onSuccess={() => {
            setOperation(null);
            setSelectedIds([]);
          }}
        />
      )}
    </>
  );
};
