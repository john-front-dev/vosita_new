import { applicationEndpoints } from '@entities/application';
import { useMutationQuery } from '@shared/api';
import { notify } from '@shared/lib';

import { invalidateApplicationDetailsQueries } from './application-details-cache';
import type { CreateSubrequestRequest, UpdateSubrequestRequest } from './types';

type UseSubrequestMutationsParams = {
  onSuccess: () => void;
};

export const useSubrequestMutations = ({ onSuccess }: UseSubrequestMutationsParams) => {
  const handleSuccess = (title: string) => {
    notify({ title, type: 'success' });
    invalidateApplicationDetailsQueries();
    onSuccess();
  };

  const { isPending: isCreating, mutate: createSubrequest } = useMutationQuery<ApiResponse<unknown>, { body: CreateSubrequestRequest }>({
    method: 'post',
    url: applicationEndpoints.createSubrequest,
    options: { onSuccess: () => handleSuccess('Объект добавлен') },
  });

  const { isPending: isEditing, mutate: editSubrequest } = useMutationQuery<
    ApiResponse<unknown>,
    { body: UpdateSubrequestRequest; url: string }
  >({
    method: 'post',
    url: '',
    options: { onSuccess: () => handleSuccess('Успешно') },
  });

  return {
    createSubrequest: (body: CreateSubrequestRequest) => createSubrequest({ body }),
    editSubrequest: (id: number, body: UpdateSubrequestRequest) =>
      editSubrequest({ body, url: applicationEndpoints.editSubrequest(id) }),
    isSubmitting: isCreating || isEditing,
  };
};
