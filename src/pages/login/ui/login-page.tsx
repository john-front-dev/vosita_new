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

import { loginApi } from '../api/login';
import type { LoginFormValues, LoginRequest, LoginResponse } from '../model/types';
import { loginSchema } from '../model/validation';

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

const getAccessToken = (response: LoginResponse) =>
  response.payload?.access_token ?? response.payload?.token;

export function LoginPage() {
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
        const accessToken = getAccessToken(response);
        const refreshToken = response.payload?.refresh_token;

        if (!accessToken) {
          snackbar.show({
            title: 'Не удалось войти',
            subtitle: 'Сервер не вернул access token',
            type: 'error',
            withCloseButton: true,
          });
          return;
        }

        localStorage.setItem('token', accessToken);

        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken);
        }

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
        className="flex w-full max-w-[420px] flex-col items-center rounded-xl bg-white px-[35px] py-[50px] shadow-[0_6px_22px_rgba(16,24,40,0.08)]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-6 flex items-center justify-center gap-3 text-[#286ca8]">
          <svg viewBox="0 0 22 24" className="h-[42px] w-[42px]" fill="currentColor" aria-hidden>
            <path d="M15.6537 5.90894H12.4406L8.15536 16.3016H10.9044L14.0472 8.27378L17.1931 16.3016H19.9422L15.6537 5.90894Z" />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.8855 23.9416L12.863 23.9385H12.8502C11.2341 23.7777 9.68192 23.2984 8.27697 22.5416C5.56949 21.0849 3.42847 18.6129 2.49077 15.4692C1.55307 12.3255 2.00112 9.1062 3.47647 6.44182C4.23815 5.07021 5.27186 3.84365 6.52959 2.85357L6.55519 2.83465C6.55519 2.83465 6.55839 2.83465 6.55839 2.8315C8.42099 1.32746 10.7028 0.324771 13.1735 0.00945935C13.1863 0.00945935 13.2663 0 13.2791 0L14.316 2.51303C14.3 2.51303 14.2168 2.52249 14.2008 2.52249C11.9958 2.65808 9.95074 3.47474 8.30577 4.77697C8.28017 4.79905 8.25457 4.81796 8.22897 4.84004C8.18736 4.87472 8.14576 4.90625 8.10735 4.94094L8.09135 4.9567C8.08175 4.96616 8.06895 4.97562 8.05935 4.98193C7.12485 5.73867 6.35677 6.66254 5.78711 7.69361C4.63179 9.77466 4.28616 12.2909 5.01583 14.7471C5.74871 17.2034 7.41928 19.1363 9.5315 20.2714C10.6516 20.8736 11.8933 21.252 13.1831 21.3687C15.9962 21.5957 18.6461 20.7065 20.6719 19.0669C20.7711 18.9881 20.8671 18.9061 20.9631 18.8241L22 21.3403C19.4813 23.2385 16.265 24.2475 12.8694 23.9479L12.8855 23.9416Z"
            />
          </svg>
          <span className="text-[34px] font-bold leading-none tracking-[0]">VOSITA</span>
        </div>

        <div className="flex w-full flex-col gap-5">
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <Input
                placeholder="Эл. почта"
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
                placeholder="Пароль"
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
            className="mt-0 h-[50px] w-full !rounded-lg !bg-[#286ca8] !text-base !font-semibold hover:!bg-[#1f5d93]"
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
            className="mx-auto text-base font-medium text-[#8ea7c5] transition-colors hover:text-[#286ca8]"
          >
            Забыли пароль?
          </button>
        </div>
      </form>
    </main>
  );
}
