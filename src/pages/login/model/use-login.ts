import { useNavigate } from 'react-router-dom';

import { useMutationQuery } from '@shared/api';
import { routes } from '@shared/config';
import { setAuthSession } from '@shared/lib';

import { loginApi } from '../api/login';
import type { LoginRequest, LoginResponse } from './types';

export const useLogin = () => {
  const navigate = useNavigate();
  const { isPending, mutate } = useMutationQuery<LoginResponse, { body: LoginRequest }>({
    method: 'post',
    url: loginApi.login,
    options: {
      onSuccess: ({ payload: { accesses, auth } }, { body }) => {
        setAuthSession({
          accessToken: auth.access_token,
          remember: body.is_remember_me,
          refreshToken: auth.refresh_token,
          user: auth.user,
          accesses,
        });
        navigate(auth.is_default_password ? `${routes.changePassword}?initial=1` : routes.home, {
          replace: true,
        });
      },
    },
  });

  return {
    isPending,
    login: (body: LoginRequest) => mutate({ body }),
  };
};
