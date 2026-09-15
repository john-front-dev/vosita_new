import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  FunctionButton,
  Input,
  OutlineSystemEyeOff,
  OutlineSystemEyeOn,
  Surface,
  Typography,
} from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { routes } from '@shared/config';
import { AlifIcon } from '@shared/icons';

import type { ResetPasswordFormValues } from '../model/types';
import { useResetPassword } from '../model/use-reset-password';
import { resetPasswordSchema } from '../model/validation';

const defaultValues: ResetPasswordFormValues = {
  new_password: '',
  confirm_new_password: '',
};

export const ResetPasswordPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(resetPasswordSchema),
  });

  const { isResetting, resetPassword } = useResetPassword(id ?? '', () =>
    navigate(routes.login, { replace: true }),
  );

  if (!id) {
    return <Navigate to={routes.login} replace />;
  }

  const onSubmit: SubmitHandler<ResetPasswordFormValues> = (values) => {
    resetPassword({
        password: values.new_password,
        passwordConfirm: values.confirm_new_password,
    });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-(--color-text-primary)">
      <Surface p="10" rounded="12">
        <form className="flex w-125! flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 flex items-center justify-center gap-3">
            <AlifIcon className="h-[42px] w-[42px]" />
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
              name="new_password"
              render={({ field }) => (
                <Input
                  label="Новый пароль"
                  type={isNewPasswordVisible ? 'text' : 'password'}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  hasError={Boolean(errors.new_password)}
                  hintText={errors.new_password?.message}
                  isHintAlwaysShown={Boolean(errors.new_password)}
                  disabled={isResetting}
                  fullWidth
                  proportions="l"
                  bordered
                  rightIcon={
                    <button
                      type="button"
                      className="flex text-(--color-input-icon)"
                      onClick={() => setIsNewPasswordVisible((currentValue) => !currentValue)}
                      aria-label={isNewPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {isNewPasswordVisible ? <OutlineSystemEyeOff /> : <OutlineSystemEyeOn />}
                    </button>
                  }
                />
              )}
            />

            <Controller
              control={control}
              name="confirm_new_password"
              render={({ field }) => (
                <Input
                  label="Подтвердите пароль"
                  type={isConfirmPasswordVisible ? 'text' : 'password'}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  hasError={Boolean(errors.confirm_new_password)}
                  hintText={errors.confirm_new_password?.message}
                  isHintAlwaysShown={Boolean(errors.confirm_new_password)}
                  disabled={isResetting}
                  fullWidth
                  proportions="l"
                  bordered
                  rightIcon={
                    <button
                      type="button"
                      className="flex text-(--color-input-icon)"
                      onClick={() => setIsConfirmPasswordVisible((currentValue) => !currentValue)}
                      aria-label={isConfirmPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {isConfirmPasswordVisible ? <OutlineSystemEyeOff /> : <OutlineSystemEyeOn />}
                    </button>
                  }
                />
              )}
            />

            <Button
              className="mt-0 h-12.5 w-full rounded-lg! text-base! font-semibold!"
              type="submit"
              variant="primary"
              size="l"
              disabled={!isValid || isResetting}
              isLoading={isResetting}
            >
              Изменить пароль
            </Button>

            <FunctionButton
              className="cursor-pointer!"
              variant="tertiary"
              size="m"
              onClick={() => navigate(routes.login)}
            >
              Назад ко входу
            </FunctionButton>
          </div>
        </form>
      </Surface>
    </main>
  );
};
