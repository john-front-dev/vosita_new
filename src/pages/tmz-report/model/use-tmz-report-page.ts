import { useMemo, useState } from 'react';

import { useAccessibleWarehouses } from '@entities/location';
import { useFileDownload } from '@shared/api';

import { tmzReportEndpoints } from '../api/tmz-report-api';
import { buildTmzReportColumns, getLeafColumns } from './tmz-report-columns';
import { formatReportDate, transformTmzReportRecords } from './tmz-report-utils';
import { useTmzReport } from './use-tmz-report';

const COMPUS_ID = 1;
const DEFAULT_STORAGE_ID = 41;

export const useTmzReportPage = () => {
  const [initialDates] = useState(() => {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 1);

    return { from, to };
  });
  const [from, setFrom] = useState(initialDates.from);
  const [to, setTo] = useState(initialDates.to);
  const [selectedStorageId, setSelectedStorageId] = useState<number | null>(null);
  const warehouses = useAccessibleWarehouses();
  const defaultStorageId = useMemo(() => {
    const defaultWarehouse = warehouses.warehouses.find(
      (warehouse) => warehouse.storage_id === DEFAULT_STORAGE_ID,
    );

    return (defaultWarehouse ?? warehouses.warehouses[0])?.storage_id ?? 0;
  }, [warehouses.warehouses]);
  const storageId = selectedStorageId ?? defaultStorageId;
  const params = useMemo(
    () => ({
      from_date: formatReportDate(from),
      to_date: formatReportDate(to),
      storage_id: storageId,
    }),
    [from, storageId, to],
  );
  const report = useTmzReport(params);
  const records = useMemo(() => transformTmzReportRecords(report.records), [report.records]);
  const columns = useMemo(
    () =>
      buildTmzReportColumns({
        fromDate: params.from_date,
        isCompus: storageId === COMPUS_ID,
        records,
        toDate: params.to_date,
      }),
    [params.from_date, params.to_date, records, storageId],
  );
  const leafColumns = useMemo(() => getLeafColumns(columns), [columns]);
  const fileDownload = useFileDownload({
    filename: 'tmz-report.xlsx',
    params,
    url: tmzReportEndpoints.download,
  });

  return {
    columns,
    fileDownload,
    from,
    leafColumns,
    records,
    reportIsLoading: Boolean(storageId) && (report.isLoading || report.isFetching),
    setFrom,
    setSelectedStorageId,
    setTo,
    storageId,
    to,
    warehouses,
  };
};
