import { snackbar } from 'alif-ui';

type SnackbarProps = Parameters<typeof snackbar.show>[0];

export const notify = (notification: SnackbarProps) => {
  snackbar.show(notification);
};

export const notifyError = (title: string, subtitle?: string) => {
  notify({ title, subtitle, type: 'error' });
};
