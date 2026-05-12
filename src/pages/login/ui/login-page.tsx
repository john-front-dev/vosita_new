import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Input,
  OutlineSystemEyeOff,
  OutlineSystemEyeOn,
  snackbar,
} from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { useMutationQuery } from '@shared/api';
import { routes } from '@shared/config';
import { AlifIcon } from '@shared/icons';
import { setAuthSession } from '@shared/lib';

import { loginApi } from '../api/login';
import type { LoginFormValues, LoginRequest, LoginResponse } from '../model/types';
import { loginSchema } from '../model/validation';

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const loginMutation = useMutationQuery<LoginResponse, { body: LoginRequest }>({
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

        if (!getValues('remember')) {
          localStorage.removeItem('refresh_token');
        }

        navigate(routes.home, { replace: true });
      },
    },
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    loginMutation.mutate({
      body: {
        email: values.email.trim(),
        password: values.password,
        is_remember_me: values.remember,
      },
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-[#101828]">
      <form
        className="flex w-full max-w-105 flex-col items-center rounded-xl bg-white px-8.75 py-12.5 shadow-[0_6px_22px_rgba(16,24,40,0.08)]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-6 flex items-center justify-center gap-3 text-[var(--brand-value-default)]">
          <AlifIcon className="h-[42px] w-[42px]" />
          <span className="text-[34px] font-bold leading-none tracking-normal">VOSITA</span>
        </div>

        <div className="flex w-full flex-col gap-5">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                label="Эл. почта"
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                hasError={Boolean(errors.email)}
                hintText={errors.email?.message}
                isHintAlwaysShown={Boolean(errors.email)}
                disabled={loginMutation.isPending}
                fullWidth
                proportions="l"
                bordered
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <Input
                label="Пароль"
                type={isPasswordVisible ? 'text' : 'password'}
                value={field.value}
                onBlur={field.onBlur}
                onChange={field.onChange}
                hasError={Boolean(errors.password)}
                hintText={errors.password?.message}
                isHintAlwaysShown={Boolean(errors.password)}
                disabled={loginMutation.isPending}
                fullWidth
                proportions="l"
                bordered
                rightIcon={
                  <button
                    type="button"
                    className="flex text-[#8fb0cf]"
                    onClick={() => setIsPasswordVisible((currentValue) => !currentValue)}
                    aria-label={isPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                  >
                    {isPasswordVisible ? <OutlineSystemEyeOff /> : <OutlineSystemEyeOn />}
                  </button>
                }
              />
            )}
          />

          <Controller
            control={control}
            name="remember"
            render={({ field }) => (
              <Checkbox
                label="Запомнить меня в системе"
                checked={field.value}
                disabled={loginMutation.isPending}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />

          <Button
            className="mt-0 h-12.5 w-full rounded-lg! text-base! font-semibold!"
            type="submit"
            variant="primary"
            size="l"
            disabled={!isValid || loginMutation.isPending}
            isLoading={loginMutation.isPending}
          >
            Войти
          </Button>

          <button
            type="button"
            className="mx-auto text-base font-medium text-[#8ea7c5] transition-colors hover:text-[var(--brand-value-default)]"
          >
            Забыли пароль?
          </button>
        </div>
      </form>
    </main>
  );
};
