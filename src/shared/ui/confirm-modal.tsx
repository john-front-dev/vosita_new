import { Button, Modal } from 'alif-ui';
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
  variant = 'default',
}: ConfirmModalProps) => (
  <Modal className="w-[420px]" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
    <Modal.Header title={title} />
    {(message || children) && (
      <Modal.Content>
        {message && <p className="text-sm leading-5 text-[#667085]">{message}</p>}
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
