import { snackbar } from 'alif-ui';

import { useMutationQuery } from '@shared/api';
import { clearAuthSession } from '@shared/lib';

import { changePasswordApi } from '../api/change-password-api';
import type { ChangePasswordRequest } from './types';

export const useChangePassword = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<
    ApiResponse<unknown>,
    { body: ChangePasswordRequest }
  >({
    method: 'post',
    url: changePasswordApi.changeCurrentPassword,
    options: {
      onSuccess: () => {
        clearAuthSession();
        snackbar.show({
          title: 'Пароль успешно изменён',
          subtitle: 'Авторизуйтесь повторно с новым паролем',
          type: 'success',
          withCloseButton: true,
        });
        onSuccess();
      },
    },
  });

  return {
    changePassword: (body: ChangePasswordRequest) => mutate({ body }),
    isChanging: isPending,
  };
};
