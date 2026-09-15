import { snackbar } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { mbpEndpoints } from '../api/mbp-api';

export const useUploadMbp = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { body: FormData }>({
    method: 'post',
    url: mbpEndpoints.upload,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    options: {
      onSuccess: async (response) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['mbp'] }),
          queryClient.invalidateQueries({ queryKey: ['mbp-filter-options'] }),
        ]);
        snackbar.show({ title: response.message || 'Данные успешно загружены', type: 'success' });
        onSuccess();
      },
    },
  });

  return {
    isUploading: isPending,
    upload: (file: File) => {
      const body = new FormData();
      body.append('excelFile', file);
      mutate({ body });
    },
  };
};
