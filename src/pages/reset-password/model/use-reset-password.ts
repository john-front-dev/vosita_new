import { snackbar } from 'alif-ui';

import { type MutationVariables, useMutationQuery } from '@shared/api';

import { resetPasswordApi } from '../api/reset-password-api';
import type { ResetPasswordRequest } from './types';

export const useResetPassword = (id: string, onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<
    ApiResponse<unknown>,
    MutationVariables<ResetPasswordRequest>
  >({
    method: 'post',
    url: resetPasswordApi.changePassword(id),
    options: {
      onSuccess: () => {
        snackbar.show({
          title: 'Пароль успешно изменён',
          subtitle: 'Теперь вы можете войти с новым паролем',
          type: 'success',
          withCloseButton: true,
        });
        onSuccess();
      },
    },
  });

  return { isResetting: isPending, resetPassword: (body: ResetPasswordRequest) => mutate({ body }) };
};
