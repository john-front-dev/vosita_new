import { useMemo, useState } from 'react';
import { Button, OutlineSystemDownload, snackbar, Surface, Typography } from 'alif-ui';

import { applicationEndpoints } from '@entities/application';
import { httpClient, useGetQuery } from '@shared/api';
import { formatDate, formatMoney } from '@shared/lib';
import { DataTable, type DataTableProps } from '@shared/ui';

import type {
  ApplicationInvoice,
  ApplicationInvoiceItem,
  ApplicationInvoicesResponse,
} from '../model/types';

type ApplicationInvoicesTableProps = {
  requestId?: number | string;
};

type InvoiceItemRecord = ApplicationInvoiceItem & {
  id: string;
};

const getInvoiceTotals = (invoice: ApplicationInvoice) => {
  const items = invoice.objects ?? [];

  return items.reduce(
    (totals, item) => ({
      quantity: totals.quantity + (Number(item.quantity) || 0),
      sum: totals.sum + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    }),
    { quantity: 0, sum: 0 },
  );
};

const getInvoiceItems = (invoice: ApplicationInvoice): InvoiceItemRecord[] =>
  (invoice.objects ?? []).map((item, index) => ({
    ...item,
    id: `${invoice.id}-${index}`,
  }));

export const ApplicationInvoicesTable = ({ requestId }: ApplicationInvoicesTableProps) => {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const invoicesQuery = useGetQuery<ApplicationInvoicesResponse>({
    queryKey: ['application-invoices', requestId],
    url: requestId ? applicationEndpoints.invoices(requestId) : '',
    options: {
      enabled: Boolean(requestId),
    },
  });

  const invoices = invoicesQuery.data?.payload ?? [];

  const invoiceColumns = useMemo<DataTableProps<ApplicationInvoice>['columns']>(
    () => [
      {
        accessor: 'invoice_number',
        minWidth: '180px',
        renderRowCell: (invoice) => `№${invoice.invoice_number}`,
        title: 'Номер накладной',
      },
      {
        accessor: 'quantity',
        minWidth: '120px',
        renderRowCell: (invoice) => `${getInvoiceTotals(invoice).quantity} шт`,
        title: 'Количество',
      },
      {
        accessor: 'sum',
        minWidth: '140px',
        renderRowCell: (invoice) => formatMoney(getInvoiceTotals(invoice).sum),
        title: 'Сумма',
      },
      {
        accessor: 'initiator_name',
        minWidth: '180px',
        renderRowCell: (invoice) => invoice.initiator_name || '-',
        title: 'Исполнитель',
      },
      {
        accessor: 'created_at',
        minWidth: '160px',
        renderRowCell: (invoice) => formatDate(invoice.created_at, 'ru', { withTime: true }),
        title: 'Дата',
      },
      {
        accessor: 'actions',
        maxWidth: '96px',
        renderRowCell: (invoice) => (
          <Button
            type="button"
            variant="tertiary"
            size="s"
            isIconBtn
            disabled={downloadingId === invoice.id}
            isLoading={downloadingId === invoice.id}
            onClick={(event) => {
              event.stopPropagation();
              downloadInvoice(invoice);
            }}
          >
            <OutlineSystemDownload />
          </Button>
        ),
        textAlign: 'end',
        title: '',
      },
    ],
    [downloadingId],
  );

  const downloadInvoice = async (invoice: ApplicationInvoice) => {
    try {
      setDownloadingId(invoice.id);

      const response = await httpClient.get<Blob>(
        applicationEndpoints.downloadInvoice(invoice.id),
        {
          responseType: 'blob',
        },
      );
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');

      link.href = url;
      link.download = `invoice-${invoice.invoice_number}.pdf`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch {
      snackbar.show({
        title: 'Не удалось скачать накладную',
        type: 'error',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DataTable
      className="flex flex-1 flex-col"
      columns={invoiceColumns}
      records={invoices}
      isFetching={invoicesQuery.isFetching}
      isLoading={invoicesQuery.isLoading}
      emptyPlaceholder="Пока нет накладных."
      rowExpansion={{
        content: (invoice) => {
          const items = getInvoiceItems(invoice);

          if (items.length === 0) {
            return (
              <Typography category="body" proportions="s" className="text-(--color-text-secondary)">
                В накладной нет объектов.
              </Typography>
            );
          }

          return (
            <Surface p="4" rounded="8">
              <div className="grid gap-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="grid gap-3 rounded-md border border-(--color-border-default) bg-white p-3 md:grid-cols-[minmax(0,1.8fr)_120px_90px_140px]"
                  >
                    <div className="min-w-0">
                      <Typography
                        category="body"
                        proportions="xsStrong"
                        className="mb-1 text-(--color-text-secondary)"
                      >
                        Наименование
                      </Typography>
                      <Typography
                        category="body"
                        proportions="s"
                        className="text-(--color-text-primary)"
                      >
                        {item.name || '-'}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        category="body"
                        proportions="xsStrong"
                        className="mb-1 text-(--color-text-secondary)"
                      >
                        Количество
                      </Typography>
                      <Typography
                        category="body"
                        proportions="s"
                        className="text-(--color-text-primary)"
                      >
                        {item.quantity ?? '-'}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        category="body"
                        proportions="xsStrong"
                        className="mb-1 text-(--color-text-secondary)"
                      >
                        Ед.
                      </Typography>
                      <Typography
                        category="body"
                        proportions="s"
                        className="text-(--color-text-primary)"
                      >
                        {item.unit || '-'}
                      </Typography>
                    </div>
                    <div>
                      <Typography
                        category="body"
                        proportions="xsStrong"
                        className="mb-1 text-(--color-text-secondary)"
                      >
                        Цена
                      </Typography>
                      <Typography
                        category="body"
                        proportions="s"
                        className="text-(--color-text-primary)"
                      >
                        {formatMoney(item.price)}
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </Surface>
          );
        },
      }}
      tableClassNames={{
        root: 'min-w-full',
      }}
    />
  );
};
