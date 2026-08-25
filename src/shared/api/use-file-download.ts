import { useCallback, useState } from 'react';
import type { AxiosRequestConfig } from 'axios';

import { httpClient } from './http-client';

type UseFileDownloadParams = {
  filename: string;
  params?: AxiosRequestConfig['params'];
  url: string;
};

/** Downloads a GET response as a file and exposes its loading state. */
export const useFileDownload = ({ filename, params, url }: UseFileDownloadParams) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const download = useCallback(async () => {
    try {
      setIsDownloading(true);

      const response = await httpClient.get<Blob>(url, { params, responseType: 'blob' });
      const objectUrl = URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = objectUrl;
      link.download = filename;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(objectUrl);
      return true;
    } catch {
      return false;
    } finally {
      setIsDownloading(false);
    }
  }, [filename, params, url]);

  return { download, isDownloading };
};
