import { snackbar } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { useMutationQuery } from '@shared/api';
import { downloadBlob } from '@shared/lib';

import type { ApplicationListType, IssueApplicationObjectsRequest } from './types';

export const useUploadSubrequests = (onSuccess: () => void) => {
  const { isPending, mutate } = useMutationQuery<ApiResponse<unknown>, { body: FormData }>({
    method: 'post',
    url: applicationEndpoints.uploadSubrequests,
    config: { headers: { 'Content-Type': 'multipart/form-data' } },
    options: {
      onSuccess: () => {
        snackbar.show({ title: 'Успешно', type: 'success' });
        onSuccess();
      },
    },
  });

  return {
    isUploading: isPending,
    upload: (file: File) => {
      const body = new FormData();
      body.append('file', file);
      mutate({ body });
    },
  };
};

export const useIssueApplicationObjects = (
  type: ApplicationListType,
  onSuccess: () => void,
) => {
  const { isPending, mutate } = useMutationQuery<Blob, { body: IssueApplicationObjectsRequest }>({
    method: 'post',
    url: applicationEndpoints.issue[type],
    config: { responseType: 'blob' },
    options: {
      onSuccess: (response) => {
        downloadBlob(response, 'issue-to-stock.pdf');
        snackbar.show({ title: 'Объекты отправлены на склад', type: 'success' });
        onSuccess();
      },
    },
  });

  return { isIssuing: isPending, issue: (body: IssueApplicationObjectsRequest) => mutate({ body }) };
};
