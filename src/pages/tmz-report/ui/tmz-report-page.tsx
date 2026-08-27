import { Button, DatePicker, OutlineSystemDownload, Select, Typography } from 'alif-ui';

import { normalizeSelectValue } from '@shared/lib';
import { GroupedDataTable } from '@shared/ui';

import { getColumnTotal } from '../model/tmz-report-columns';
import { useTmzReportPage } from '../model/use-tmz-report-page';

export const TmzReportPage = () => {
  const {
    columns,
    fileDownload,
    from,
    leafColumns,
    records,
    reportIsLoading,
    setFrom,
    setSelectedStorageId,
    setTo,
    storageId,
    to,
    warehouses,
  } = useTmzReportPage();

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">
          Отчет по ТМЗ
        </Typography>
        <div className="flex shrink-0 items-end gap-3">
          <div className="w-44">
            <DatePicker
              label="От"
              values={from}
              onDateChange={(date) => date instanceof Date && setFrom(date)}
              allowTime={false}
              fullWidth
            />
          </div>
          <div className="w-44">
            <DatePicker
              label="До"
              values={to}
              onDateChange={(date) => date instanceof Date && setTo(date)}
              allowTime={false}
              fullWidth
            />
          </div>
          <div className="w-72">
            <Select
              label="Склад"
              options={warehouses.warehouses.map((warehouse) => ({
                label: warehouse.storage_name,
                value: String(warehouse.storage_id),
              }))}
              value={storageId ? String(storageId) : undefined}
              onChange={(value) =>
                setSelectedStorageId(Number(normalizeSelectValue(value)) || 0)
              }
              isLoading={warehouses.isLoading}
            />
          </div>
          <Button
            type="button"
            variant="outline-neutral"
            leftSection={<OutlineSystemDownload />}
            onClick={fileDownload.download}
            isLoading={fileDownload.isDownloading}
            disabled={!storageId}
          >
            Скачать
          </Button>
        </div>
      </div>
      <div className="flex flex-1 flex-col">
        <GroupedDataTable
          columns={columns}
          maxHeightClassName="max-h-[calc(100vh-120px)]"
          records={records}
          isLoading={reportIsLoading}
          skeletonRowsCount={12}
          emptyPlaceholder={
            storageId
              ? 'За выбранный период данных нет.'
              : 'Выберите склад для формирования отчета.'
          }
          footer={
            records.length ? (
              <tr className="bg-(--color-table-header) font-semibold text-(--color-table-text)">
                {leafColumns.map((column, index) => {
                  const total = getColumnTotal(records, column);
                  return (
                    <td
                      key={column.id}
                      className="border-r border-b border-(--color-table-border) px-2.5 py-1.25"
                    >
                      {index === 0 ? 'Итог' : total.toFixed(2)}
                    </td>
                  );
                })}
              </tr>
            ) : undefined
          }
        />
      </div>
    </section>
  );
};
