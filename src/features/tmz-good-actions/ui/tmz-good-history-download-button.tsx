import { Button, OutlineSystemDownload } from 'alif-ui';

import { tmzGoodEndpoints } from '@entities/tmz-good';
import { useFileDownload } from '@shared/api';

type Props = {
  goodsId: number | string;
  iconOnly?: boolean;
  storageId?: number | string;
};

export const TmzGoodHistoryDownloadButton = ({ goodsId, iconOnly = true, storageId }: Props) => {
  const { download, isDownloading } = useFileDownload({
    filename: `history_${goodsId}.xlsx`,
    url: tmzGoodEndpoints.historyReport(goodsId, storageId ?? ''),
  });

  return (
    <Button
      type="button"
      size={iconOnly ? 's' : 'm'}
      variant="outline-neutral"
      isIconBtn={iconOnly}
      leftSection={iconOnly ? undefined : <OutlineSystemDownload />}
      title="Скачать историю"
      isLoading={isDownloading}
      onClick={() => void download()}
    >
      {iconOnly ? <OutlineSystemDownload /> : 'Скачать историю'}
    </Button>
  );
};
