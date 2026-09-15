import { Button, OutlineSystemDownload } from 'alif-ui';

import type { FixedAssetsFilters } from '../model/fixed-assets-filters';
import { useDownloadFixedAssets } from '../model/use-download-fixed-assets';

type FixedAssetsDownloadButtonProps = {
  filters: FixedAssetsFilters;
  limit: number;
  page: number;
  searchText?: string;
};

export const FixedAssetsDownloadButton = ({
  filters,
  limit,
  page,
  searchText,
}: FixedAssetsDownloadButtonProps) => {
  const { download, isDownloading } = useDownloadFixedAssets();

  return (
    <Button
      type="button"
      variant="outline-neutral"
      size="m"
      leftSection={<OutlineSystemDownload />}
      onClick={() => void download(filters, page, limit, searchText)}
      isLoading={isDownloading}
    >
      Скачать
    </Button>
  );
};
