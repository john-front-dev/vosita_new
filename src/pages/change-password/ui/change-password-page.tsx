import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  OutlineSystemEyeOff,
  OutlineSystemEyeOn,
  snackbar,
  Surface,
  Typography,
} from 'alif-ui';
import { Controller, type SubmitHandler, useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { useMutationQuery } from '@shared/api';
import { routes } from '@shared/config';
import { AlifIcon } from '@shared/icons';
import { clearAuthSession } from '@shared/lib';

import { changePasswordApi } from '../api/change-password-api';
import type { ChangePasswordFormValues, ChangePasswordRequest } from '../model/types';
import { changePasswordSchema } from '../model/validation';

const defaultValues: ChangePasswordFormValues = {
  old_password: '',
  new_password: '',
  confirm_new_password: '',
};

export const ChangePasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
  const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const isInitialChange = searchParams.get('initial') === '1';

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormValues>({
    defaultValues,
    mode: 'onChange',
    resolver: zodResolver(changePasswordSchema),
  });

  const changePasswordMutation = useMutationQuery<
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
        navigate(routes.login, { replace: true });
      },
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormValues> = (values) => {
    changePasswordMutation.mutate({
      body: {
        old_password: values.old_password,
        new_password: values.new_password,
        confirm_new_password: values.confirm_new_password,
      },
    });
  };

  const handleCancel = () => {
    if (isInitialChange) {
      clearAuthSession();
      navigate(routes.login, { replace: true });
      return;
    }

    navigate(-1);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-4 py-8 text-(--color-text-primary)">
      <Surface
        className="w-full max-w-105 shadow-[0_6px_22px_rgba(16,24,40,0.08)]"
        p="10"
        rounded="12"
      >
        <form className="flex flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-6 flex items-center justify-center gap-3 text-(--brand-value-default)">
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

          <div className="mb-6 flex flex-col items-center gap-2 text-center">
            <Typography
              element="div"
              role="heading"
              aria-level={1}
              category="heading"
              proportions="h3"
              className="text-(--color-text-primary)"
            >
              Изменить пароль
            </Typography>
            <Typography
              category="body"
              proportions="s"
              className="max-w-80 leading-6! text-(--color-text-secondary)"
            >
              {isInitialChange
                ? 'При первом входе необходимо задать новый пароль.'
                : 'Обновите пароль для безопасности вашей учётной записи.'}
            </Typography>
          </div>

          <div className="flex w-full flex-col gap-5">
            <Controller
              control={control}
              name="old_password"
              render={({ field }) => (
                <Input
                  label="Старый пароль"
                  type={isOldPasswordVisible ? 'text' : 'password'}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={field.onChange}
                  hasError={Boolean(errors.old_password)}
                  hintText={errors.old_password?.message}
                  isHintAlwaysShown={Boolean(errors.old_password)}
                  disabled={changePasswordMutation.isPending}
                  fullWidth
                  proportions="l"
                  bordered
                  rightIcon={
                    <button
                      type="button"
                      className="flex text-(--color-input-icon)"
                      onClick={() => setIsOldPasswordVisible((currentValue) => !currentValue)}
                      aria-label={isOldPasswordVisible ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                      {isOldPasswordVisible ? <OutlineSystemEyeOff /> : <OutlineSystemEyeOn />}
                    </button>
                  }
                />
              )}
            />

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
                  disabled={changePasswordMutation.isPending}
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
                  disabled={changePasswordMutation.isPending}
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
              disabled={!isValid || changePasswordMutation.isPending}
              isLoading={changePasswordMutation.isPending}
            >
              Изменить пароль
            </Button>

            <button
              type="button"
              className="mx-auto text-base font-medium text-(--color-text-muted) transition-colors hover:text-(--brand-value-default)"
              onClick={handleCancel}
            >
              Отменить
            </button>
          </div>
        </form>
      </Surface>
    </main>
  );
};
