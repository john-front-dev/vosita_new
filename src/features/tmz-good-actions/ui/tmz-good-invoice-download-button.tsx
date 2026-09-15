import { tmzGoodEndpoints, type TmzGoodHistory } from '@entities/tmz-good';
import { useFileDownload } from '@shared/api';

type Props = {
  history: TmzGoodHistory;
};

export const TmzGoodInvoiceDownloadButton = ({ history }: Props) => {
  const { download, isDownloading } = useFileDownload({
    filename: `invoice_${history.id}.pdf`,
    url: tmzGoodEndpoints.invoice(history.id),
  });

  if (!history.invoice_number) return <>-</>;

  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent text-sm text-(--color-primary) hover:underline disabled:cursor-wait"
      disabled={isDownloading}
      onClick={() => void download()}
    >
      № {history.invoice_number}
    </button>
  );
};
