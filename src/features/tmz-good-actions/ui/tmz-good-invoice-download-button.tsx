import { tmzGoodEndpoints, type TmzGoodHistory } from '@entities/tmz-good';
import { useFileDownload } from '@shared/api';

type Props = {
  history: TmzGoodHistory;
};

export const TmzGoodInvoiceDownloadButton = ({ history }: Props) => {
  const invoice = useFileDownload({
    filename: `invoice_${history.id}.pdf`,
    url: tmzGoodEndpoints.invoice(history.id),
  });

  if (!history.invoice_number) return <>-</>;

  return (
    <button
      type="button"
      className="cursor-pointer border-0 bg-transparent text-sm text-(--color-primary) hover:underline disabled:cursor-wait"
      disabled={invoice.isDownloading}
      onClick={() => void invoice.download()}
    >
      № {history.invoice_number}
    </button>
  );
};
