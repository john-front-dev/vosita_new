import { snackbar } from 'alif-ui';
import { useNavigate } from 'react-router-dom';

import { useMutationQuery } from '@shared/api';
import { routes } from '@shared/config';
import { setAuthSession } from '@shared/lib';

import { loginApi } from '../api/login';
import type { LoginRequest, LoginResponse } from './types';

export const useLogin = () => {
  const navigate = useNavigate();
  const mutation = useMutationQuery<LoginResponse, { body: LoginRequest }>({
    method: 'post',
    url: loginApi.login,
    options: {
      onSuccess: (response) => {
        const { auth } = response.payload;
        if (!auth.access_token) {
          snackbar.show({
            title: 'Не удалось войти',
            subtitle: 'Сервер не вернул access token',
            type: 'error',
            withCloseButton: true,
          });
          return;
        }
        setAuthSession({
          accessToken: auth.access_token,
          refreshToken: auth.refresh_token,
          user: auth.user,
          accesses: response.payload.accesses,
        });
        navigate(auth.is_default_password ? `${routes.changePassword}?initial=1` : routes.home, {
          replace: true,
        });
      },
    },
  });
  return {
    isPending: mutation.isPending,
    login: (body: LoginRequest) => mutation.mutate({ body }),
  };
};
