import { useState } from 'react';
import { Button, Input, Modal } from 'alif-ui';

import type { TmzGoodRemain } from '@entities/tmz-good';

import { useAddTmzGoodToCart } from '../model/use-tmz-good-mutations';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  remain: TmzGoodRemain | null;
};

export const AddToCartModal = ({ isOpen, onClose, remain }: Props) => {
  const [quantity, setQuantity] = useState('1');
  const value = Number(quantity);
  const hasError = Boolean(remain && (!value || value < 0 || value > remain.total_qty));
  const mutation = useAddTmzGoodToCart(remain?.goods_id ?? '', onClose);

  if (!remain) return null;
  return (
    <Modal
      className="w-125"
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      withCloseButton
      isCloseOutside={false}
    >
      <Modal.Header title="Добавить в корзину" />
      <Modal.Content className="flex flex-col gap-4">
        <Input label="Город" value={remain.from_department_name} disabled fullWidth bordered />
        <Input label="Здание" value={remain.from_subdivision_name} disabled fullWidth bordered />
        <Input
          label={`Количество (доступно: ${remain.total_qty} ${remain.unit})`}
          value={quantity}
          onChange={(event) =>
            setQuantity(event.target.value.replace(',', '.').replace(/[^0-9.]/g, ''))
          }
          hasError={hasError}
          hintText={hasError ? `Введите число от 1 до ${remain.total_qty}` : undefined}
          isHintAlwaysShown={hasError}
          fullWidth
          bordered
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={hasError || mutation.isPending}
          isLoading={mutation.isPending}
          onClick={() =>
            mutation.mutate({
              body: {
                good_id: remain.goods_id,
                qty: value,
                warehouse_id: Number(remain.from_storage),
              },
            })
          }
        >
          Добавить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
