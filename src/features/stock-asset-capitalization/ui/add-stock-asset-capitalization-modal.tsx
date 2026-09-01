import { zodResolver } from '@hookform/resolvers/zod';
import { Button, DatePicker, Input, Modal, Select, TextArea } from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { queryClient, useMutationQuery } from '@shared/api';
import { normalizeSelectValue } from '@shared/lib';

import {
  type CapitalizationFormValues,
  capitalizationSchema,
  getCapitalizationDefaultValues,
} from '../model/capitalization-validation';

type AddStockAssetCapitalizationModalProps = {
  assetId: number | string;
  isOpen: boolean;
  onClose: () => void;
};

const formatCapitalizationDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;

const normalizePrice = (value: string) =>
  value
    .replace(/,/g, '.')
    .replace(/[^0-9.]/g, '')
    .replace(/(\..*)\./g, '$1');

export const AddStockAssetCapitalizationModal = ({
  assetId,
  isOpen,
  onClose,
}: AddStockAssetCapitalizationModalProps) => {
  const {
    control,
    handleSubmit,
    reset,
    formState: { isValid },
  } = useForm<CapitalizationFormValues>({
    defaultValues: getCapitalizationDefaultValues(),
    mode: 'onChange',
    resolver: zodResolver(capitalizationSchema),
  });
  const addMutation = useMutationQuery<
    ApiResponse<unknown>,
    {
      body: {
        capitalization: number;
        comment: string;
        currency: string;
        date: string;
        object_id: number;
      };
    }
  >({
    method: 'post',
    url: '/capitalization',
    options: {
      onSuccess: () => {
        reset(getCapitalizationDefaultValues());
        queryClient.invalidateQueries({ queryKey: ['stock-asset', String(assetId)] });
        onClose();
      },
    },
  });
  const onSubmit: SubmitHandler<CapitalizationFormValues> = (values) =>
    addMutation.mutate({
      body: {
        capitalization: Number(values.price),
        comment: values.comment,
        currency: values.currency,
        date: formatCapitalizationDate(values.date),
        object_id: Number(assetId),
      },
    });
  const handleClose = () => {
    reset(getCapitalizationDefaultValues());
    onClose();
  };

  return (
    <Modal
      className="w-120"
      isOpen={isOpen}
      onClose={handleClose}
      isCentered
      withCloseButton
    >
      <Modal.Header title="Добавление капитализации" />
      <Modal.Content className="flex flex-col gap-4">
        <Controller
          control={control}
          name="price"
          render={({ field }) => (
            <Input
              label="Цена"
              value={field.value}
              onChange={(event) => field.onChange(normalizePrice(event.target.value))}
              fullWidth
            />
          )}
        />
        <Controller
          control={control}
          name="currency"
          render={({ field }) => (
            <Select
              label="Валюта"
              value={field.value}
              options={['TJS', 'RUB', 'USD'].map((value) => ({ label: value, value }))}
              onChange={(value) => field.onChange(normalizeSelectValue(value))}
              fullWidth
            />
          )}
        />
        <Controller
          control={control}
          name="date"
          render={({ field }) => (
            <DatePicker
              label="Месяц и год"
              values={field.value}
              onDateChange={(date) => field.onChange(date instanceof Date ? date : undefined)}
              allowTime={false}
              allowDay={false}
              allowMonth
              allowYear
              fullWidth
            />
          )}
        />
        <Controller
          control={control}
          name="comment"
          render={({ field }) => (
            <TextArea label="Описание" value={field.value} onChange={field.onChange} fullWidth />
          )}
        />
      </Modal.Content>
      <Modal.Actions className="flex justify-end gap-3">
        <Button type="button" variant="outline-neutral" onClick={handleClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!isValid || addMutation.isPending}
          isLoading={addMutation.isPending}
          onClick={handleSubmit(onSubmit)}
        >
          Добавить
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
