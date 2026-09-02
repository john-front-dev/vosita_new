import { useState } from 'react';
import { Button } from 'alif-ui';

import { ConfirmModal } from '@shared/ui';

type MbpConfirmActionProps = {
  confirmText: string;
  icon: React.ReactNode;
  isPending: boolean;
  label: string;
  message: string;
  onConfirm: (afterSuccess: () => void) => void;
  title: string;
  variant?: 'default' | 'risk';
};

export const MbpConfirmAction = ({
  confirmText,
  icon,
  isPending,
  label,
  message,
  onConfirm,
  title,
  variant = 'default',
}: MbpConfirmActionProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant={variant === 'risk' ? 'risk' : 'outline-neutral'}
        size="m"
        leftSection={icon}
        onClick={() => setIsOpen(true)}
      >
        {label}
      </Button>
      <ConfirmModal
        isOpen={isOpen}
        title={title}
        message={message}
        confirmText={confirmText}
        variant={variant}
        isConfirmLoading={isPending}
        onClose={() => setIsOpen(false)}
        onConfirm={() => onConfirm(() => setIsOpen(false))}
      />
    </>
  );
};
