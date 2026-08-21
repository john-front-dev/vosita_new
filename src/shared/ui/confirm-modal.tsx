import { Button, Modal, Typography } from 'alif-ui';
import type { ReactNode } from 'react';

type ConfirmModalProps = {
  cancelText?: string;
  children?: ReactNode;
  confirmText?: string;
  isConfirmLoading?: boolean;
  isOpen: boolean;
  message?: ReactNode;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  width?: 'default' | 'large';
  variant?: 'default' | 'risk';
};

export const ConfirmModal = ({
  cancelText = 'Отмена',
  children,
  confirmText = 'Подтвердить',
  isConfirmLoading = false,
  isOpen,
  message,
  onClose,
  onConfirm,
  title,
  width = 'default',
  variant = 'default',
}: ConfirmModalProps) => (
  <Modal
    className={
      width === 'large'
        ? 'w-[560px] max-w-[calc(100vw-32px)]'
        : 'w-[420px] max-w-[calc(100vw-32px)]'
    }
    isOpen={isOpen}
    onClose={onClose}
    isCentered
    withCloseButton
  >
    <Modal.Header title={title} />
    {(message || children) && (
      <Modal.Content>
        {message && (
          <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
            {message}
          </Typography>
        )}
        {children}
      </Modal.Content>
    )}
    <Modal.Actions className="flex justify-end gap-3">
      <Button type="button" variant="outline-neutral" onClick={onClose}>
        {cancelText}
      </Button>
      <Button
        type="button"
        variant={variant === 'risk' ? 'risk' : 'primary'}
        isLoading={isConfirmLoading}
        disabled={isConfirmLoading}
        onClick={onConfirm}
      >
        {confirmText}
      </Button>
    </Modal.Actions>
  </Modal>
);
