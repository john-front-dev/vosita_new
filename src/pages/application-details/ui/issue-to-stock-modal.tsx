import { useState } from 'react';
import { Button, Input, Modal, snackbar } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { useMutationQuery } from '@shared/api';
import { downloadBlob } from '@shared/lib';

import type { ApplicationListType, IssueApplicationObjectsRequest } from '../model/types';

type IssueToStockModalProps = {
  ids: number[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  type: ApplicationListType;
};

const getMaxDate = () => new Date().toISOString().split('T')[0];

export const IssueToStockModal = ({
  ids,
  isOpen,
  onClose,
  onSuccess,
  type,
}: IssueToStockModalProps) => {
  const [registrationDate, setRegistrationDate] = useState('');
  const issueMutation = useMutationQuery<Blob, { body: IssueApplicationObjectsRequest }>({
    method: 'post',
    url: applicationEndpoints.issue[type],
    config: {
      responseType: 'blob',
    },
    options: {
      onSuccess: (response) => {
        downloadBlob(response, 'issue-to-stock.pdf');

        snackbar.show({
          title: 'Объекты отправлены на склад',
          type: 'success',
        });
        onSuccess();
        onClose();
      },
    },
  });

  const handleIssue = () => {
    if (!registrationDate) {
      snackbar.show({
        title: 'Выберите дату оформления',
        type: 'error',
      });
      return;
    }

    issueMutation.mutate({
      body: {
        objects: ids.map((id) => ({ id })),
        registration_date: registrationDate,
      },
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Отправка на склад" />
      <Modal.Content>
        <Input
          label="Дата оформления"
          type="date"
          value={registrationDate}
          max={getMaxDate()}
          onChange={(event) => setRegistrationDate(event.target.value)}
          fullWidth
          bordered
        />
      </Modal.Content>
      <Modal.Actions className="justify-end">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
          Отмена
        </Button>
        <Button
          type="button"
          variant="primary"
          disabled={!registrationDate || issueMutation.isPending}
          isLoading={issueMutation.isPending}
          onClick={handleIssue}
        >
          Выдать
        </Button>
      </Modal.Actions>
    </Modal>
  );
};
