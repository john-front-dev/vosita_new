import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Checkbox,
  Input,
  OutlineSystemEyeOff,
  OutlineSystemEyeOn,
  Typography,
} from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';

import { AlifIcon } from '@shared/icons';

import type { LoginFormValues } from '../model/types';
import { useLogin } from '../model/use-login';
import { loginSchema } from '../model/validation';

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
  remember: false,
};

export const LoginPage = () => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { isPending, login } = useLogin();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(loginSchema),
  });

  const onSubmit: SubmitHandler<LoginFormValues> = (values) => {
    login({
      email: values.email.trim(),
      password: values.password,
      is_remember_me: values.remember,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-(--color-text-primary)">
      <form
        className="flex w-full max-w-105 flex-col items-center rounded-xl bg-white px-8.75 py-12.5 shadow-[0_6px_22px_rgba(16,24,40,0.08)]"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="mb-6 flex items-center justify-center gap-3 text-(--brand-value-default)">
          <AlifIcon className="h-10.5 w-10.5" />
          <Typography
            element="span"
            category="display"
            proportions="sStrong"
            className="text-[34px]! leading-none! tracking-normal!"
          >
            VOSITA
          </Typography>
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
                disabled={isPending}
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
                disabled={isPending}
                fullWidth
                proportions="l"
                bordered
                rightIcon={
                  <button
                    type="button"
                    className="flex text-(--color-input-icon)"
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
                disabled={isPending}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />

          <Button
            className="mt-0 h-12.5 w-full rounded-lg! text-base! font-semibold!"
            type="submit"
            variant="primary"
            size="l"
            disabled={!isValid || isPending}
            isLoading={isPending}
          >
            Войти
          </Button>

          <button
            type="button"
            className="cursor-pointer text-(--color-text-muted) transition-colors hover:text-(--brand-value-default)"
          >
            Забыли пароль?
          </button>
        </div>
      </form>
    </main>
  );
};
