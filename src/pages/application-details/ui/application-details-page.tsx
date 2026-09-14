import { type ChangeEvent, useMemo, useRef, useState } from 'react';
import {
  Button,
  OutlineNavigationLeftArrow,
  OutlineSystemAdd,
  OutlineSystemEdit,
  OutlineSystemFileAdd,
  OutlineSystemShoppingBasket,
  OutlineSystemTrash,
  OutlineSystemUpload,
  Surface,
  TabMenuNew,
  Typography,
} from 'alif-ui';
import { useNavigate, useParams } from 'react-router-dom';

import {
  type AuthAccess,
  type AuthUser,
  formatDate,
  formatMoney,
  getStoredAccesses,
  getStoredUser,
  useUrlListState,
} from '@shared/lib';
import { ConfirmModal, DataTable, type DataTableProps } from '@shared/ui';

import {
  applicationDetailsTabs,
  defaultApplicationDetailsStatus,
  isApplicationDetailsStatus,
} from '../model/application-details-tabs';
import type {
  ApplicationDetailsPayload,
  ApplicationDetailsStatus,
  ApplicationListType,
  ApplicationObjectRecord,
} from '../model/types';
import { useApplicationDetails } from '../model/use-application-details';
import { useApplicationDetailsActions } from '../model/use-application-details-actions';
import { ApplicationInvoicesTable } from './application-invoices-table';
import { IssueToStockModal } from './issue-to-stock-modal';
import { SubrequestModal } from './subrequest-modal';
import { UploadSubrequestsModal } from './upload-subrequests-modal';

type ApplicationDetailsPageProps = {
  type: ApplicationListType;
};

type InfoItemProps = {
  label: string;
  value?: number | string;
};

const listTypeTitleMap: Record<ApplicationListType, string> = {
  'fixed-assets': 'ОС',
  lri: 'ПАУ',
  mbp: 'МБП',
  other: 'Другие',
  tmz: 'ТМЗ',
};

const statusBarTextMap = {
  accepted: 'Рассмотрен',
  'not-reviewed': 'Не рассмотрен',
  paid: 'Ожидает отправки на склад',
} satisfies Record<ApplicationDetailsStatus, string>;

const statusBarClassNameMap = {
  accepted: 'border-green-200 bg-green-50 text-green-700',
  'not-reviewed':
    'border-(--color-border-info) bg-(--color-bg-info-muted) text-(--color-text-muted)',
  paid: 'border-amber-200 bg-amber-50 text-amber-700',
} satisfies Record<ApplicationDetailsStatus, string>;

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="flex flex-col gap-1 wrap-anywhere">
    <Typography category="body" proportions="xs" className="text-(--color-text-muted)">
      {label}
    </Typography>
    <Typography
      category="body"
      proportions="sStrong"
      className="leading-5! text-(--color-text-body)"
    >
      {value || '-'}
    </Typography>
  </div>
);

const getSelectedTotalTjs = (records: ApplicationObjectRecord[], selectedIds: number[]) =>
  records.reduce((total, record) => {
    if (!selectedIds.includes(record.id) || record.currency?.toUpperCase() !== 'TJS') {
      return total;
    }

    return total + (Number(record.total_sum) || 0);
  }, 0);

const getCanManage = (user: AuthUser | null, accesses: AuthAccess[]) => {
  const isAccountant = accesses.some((access) => access.storage_type === 'Accountant');

  return Boolean((user?.is_responsible_person && !user.is_warehouse_manager) || isAccountant);
};

const getCanIssueToStock = (user: AuthUser | null, accesses: AuthAccess[]) =>
  getCanManage(user, accesses) || Boolean(user?.is_warehouse_manager);

const getDetailsStatusCounts = (details?: ApplicationDetailsPayload) => ({
  accepted: details?.count?.accepted_count ?? 0,
  'not-reviewed': details?.count?.received_count ?? 0,
  paid: details?.count?.paid_count ?? 0,
});

export const ApplicationDetailsPage = ({ type }: ApplicationDetailsPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getStoredUser();
  const accesses = getStoredAccesses();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const receiptFileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isIssueOpen, setIsIssueOpen] = useState(false);
  const [isSubrequestOpen, setIsSubrequestOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editingSubrequest, setEditingSubrequest] = useState<ApplicationObjectRecord | null>(null);
  const {
    pagination,
    queryParams,
    setType,
    type: status,
  } = useUrlListState<ApplicationDetailsStatus>({
    defaultType: defaultApplicationDetailsStatus,
    isType: isApplicationDetailsStatus,
    typeParamKey: 'status',
  });

  const { details, isFetching, isLoading, records, totalCount } = useApplicationDetails({
    id,
    limit: queryParams.limit,
    page: queryParams.page,
    status,
  });

  const canManage = getCanManage(user, accesses);
  const canIssueToStock = getCanIssueToStock(user, accesses);
  const selectable =
    (canManage && (status === 'not-reviewed' || status === 'paid')) ||
    (canIssueToStock && status === 'paid');
  const canEditSubrequest = selectable && status === 'not-reviewed';
  const selectedTotalTjs = useMemo(
    () => getSelectedTotalTjs(records, selectedIds),
    [records, selectedIds],
  );
  const statusCounts = getDetailsStatusCounts(details);
  const tabs = useMemo(
    () =>
      applicationDetailsTabs.map((tab) => ({
        counter: statusCounts[tab.value],
        label: tab.label,
        value: tab.value,
      })),
    [statusCounts],
  );

  const applicationActions = useApplicationDetailsActions({
    onDeleted: () => {
      setIsDeleteConfirmOpen(false);
      setSelectedIds([]);
    },
    onReceiptUploaded: () => setSelectedIds([]),
  });

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      return;
    }

    const ids = selectedIds.join(',');

    if (status === 'not-reviewed') {
      applicationActions.removeSubrequests(ids);
      return;
    }

    applicationActions.deleteSubrequests(ids);
  };

  const handleEditSelected = () => {
    if (selectedIds.length !== 1) {
      return;
    }

    const selectedRecord = records.find((record) => record.id === selectedIds[0]);

    if (selectedRecord) {
      setEditingSubrequest(selectedRecord);
    }
  };

  const handleReceiptFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    event.target.value = '';

    if (!selectedFile || selectedIds.length === 0) {
      return;
    }

    applicationActions.uploadReceipt(selectedIds.join(','), selectedFile);
  };

  const handleCloseEditModal = () => {
    setEditingSubrequest(null);
  };

  const handleRowClick = (record: ApplicationObjectRecord) => {
    if (!selectable) {
      return;
    }

    setSelectedIds((currentIds) =>
      currentIds.includes(record.id)
        ? currentIds.filter((selectedId) => selectedId !== record.id)
        : [...currentIds, record.id],
    );
  };

  const columns = useMemo<DataTableProps<ApplicationObjectRecord>['columns']>(
    () => [
      {
        accessor: 'name',
        minWidth: '220px',
        renderRowCell: (record) => record.name || '-',
        title: listTypeTitleMap[type],
      },
      {
        accessor: 'category',
        minWidth: '160px',
        renderRowCell: (record) => record.category || '-',
        title: 'Категория',
      },
      {
        accessor: 'quantity',
        minWidth: '120px',
        renderRowCell: (record) => `${record.quantity ?? '-'} ${record.unit ?? ''}`.trim(),
        title: 'Количество',
      },
      {
        accessor: 'price',
        minWidth: '130px',
        renderRowCell: (record) => formatMoney(record.price, { currency: record.currency }),
        title: 'Цена',
      },
      {
        accessor: 'total_sum',
        minWidth: '150px',
        renderRowCell: (record) => formatMoney(record.total_sum, { currency: record.currency }),
        title: 'Общая цена',
      },
    ],
    [type],
  );

  return (
    <section className="relative flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5 pb-24">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline-neutral"
          size="s"
          isIconBtn
          onClick={() => navigate(-1)}
        >
          <OutlineNavigationLeftArrow />
        </Button>
        <div>
          <Typography
            element="div"
            role="heading"
            aria-level={1}
            category="heading"
            proportions="h3"
            className="text-(--color-text-primary)"
          >
            {details?.title ?? 'Запрос'}
          </Typography>
          <Typography
            category="body"
            proportions="s"
            className="mt-1 text-(--color-text-secondary)"
          >
            Запрошено {formatDate(details?.date, 'ru', { withTime: true })}
          </Typography>
        </div>
      </div>

      <div className="grid flex-1 grid-cols-[minmax(0,1fr)_320px] gap-5">
        <div className="flex min-w-0 flex-col gap-6">
          <div
            className={[
              'rounded-lg border px-4 py-2 text-center text-sm font-medium',
              statusBarClassNameMap[status],
            ].join(' ')}
          >
            {statusBarTextMap[status]}
          </div>

          <TabMenuNew
            tabs={tabs}
            value={status}
            justify="center"
            onChange={(value) => {
              setSelectedIds([]);
              setType(value);
            }}
          />

          {records.length > 0 && selectable && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {canIssueToStock && status === 'paid' && (
                  <Button
                    type="button"
                    variant="outline-neutral"
                    size="s"
                    leftSection={<OutlineSystemShoppingBasket />}
                    disabled={selectedIds.length === 0}
                    onClick={() => setIsIssueOpen(true)}
                  >
                    На склад
                  </Button>
                )}
                {canEditSubrequest && (
                  <>
                    <Button
                      type="button"
                      variant="outline-neutral"
                      size="s"
                      leftSection={<OutlineSystemEdit />}
                      disabled={selectedIds.length !== 1}
                      onClick={handleEditSelected}
                    >
                      Изменить
                    </Button>
                    <input
                      ref={receiptFileInputRef}
                      className="hidden"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleReceiptFileChange}
                    />
                    <Button
                      type="button"
                      variant="outline-neutral"
                      size="s"
                      leftSection={<OutlineSystemFileAdd />}
                      disabled={selectedIds.length === 0 || applicationActions.isUploadingReceipt}
                      isLoading={applicationActions.isUploadingReceipt}
                      onClick={() => receiptFileInputRef.current?.click()}
                    >
                      Добавить чек
                    </Button>
                  </>
                )}
                {canManage && (
                  <Button
                    type="button"
                    variant="risk"
                    size="s"
                    leftSection={<OutlineSystemTrash />}
                    disabled={selectedIds.length === 0 || applicationActions.isDeleting}
                    isLoading={applicationActions.isDeleting}
                    onClick={() => setIsDeleteConfirmOpen(true)}
                  >
                    Удалить
                  </Button>
                )}
              </div>
              <Typography
                category="body"
                proportions="sStrong"
                className="text-(--color-text-body)"
              >
                Выбрано: {selectedIds.length}
              </Typography>
            </div>
          )}

          <Surface className="flex min-w-0 flex-1 flex-col gap-4" p="4" rounded="12">
            {status === 'accepted' ? (
              <ApplicationInvoicesTable requestId={details?.id ?? id} />
            ) : (
              <DataTable
                className="flex flex-1 flex-col"
                columns={columns}
                records={records}
                selectedRecords={selectable ? selectedIds : undefined}
                onSelectedRecordsChange={selectable ? setSelectedIds : undefined}
                onRowClick={selectable ? handleRowClick : undefined}
                isFetching={isFetching}
                isLoading={isLoading}
                emptyPlaceholder="Пока нет объектов."
                pagination={{
                  ...pagination,
                  totalCount,
                }}
                tableClassNames={{
                  root: 'min-w-full',
                }}
              />
            )}
          </Surface>
        </div>

        <aside className="sticky top-6 flex max-h-[calc(100vh-48px)] flex-col gap-5 self-start overflow-y-auto pb-10">
          <Surface className="flex flex-col gap-5" p="4" rounded="8">
            <InfoItem label="Заявитель" value={details?.applicant?.name} />
            <InfoItem label="Всего объектов" value={details?.count?.total_count ?? 0} />
            <InfoItem label="Описание" value={details?.description} />
            <InfoItem label="Здание и склад" value={details?.storage_name} />
            <InfoItem label="Категория" value={details?.tmz_cat_name || listTypeTitleMap[type]} />
          </Surface>

          <Surface className="flex flex-col gap-5" p="4" rounded="8">
            <InfoItem
              label="Сумма всех объектов (TJS)"
              value={formatMoney(details?.count?.total_tjs)}
            />
            <InfoItem
              label="Сумма всех объектов (RUB)"
              value={formatMoney(details?.count?.total_rub)}
            />
            <InfoItem
              label="Сумма всех объектов (USD)"
              value={formatMoney(details?.count?.total_usd)}
            />
            <InfoItem
              label="Сумма выбранных объектов (TJS)"
              value={formatMoney(selectedTotalTjs)}
            />
          </Surface>
        </aside>
      </div>

      {canManage && (
        <div className="fixed right-8 bottom-8 z-10 flex flex-col items-end gap-4">
          <Button
            className="min-w-38 rounded-2xl!"
            type="button"
            variant="primary"
            size="l"
            leftSection={<OutlineSystemUpload />}
            onClick={() => setIsUploadOpen(true)}
          >
            Загрузить Excel
          </Button>
          <Button
            className="min-w-30 rounded-2xl!"
            type="button"
            variant="primary"
            size="l"
            leftSection={<OutlineSystemAdd />}
            onClick={() => setIsSubrequestOpen(true)}
          >
            Добавить
          </Button>
        </div>
      )}

      {isSubrequestOpen && details?.id && (
        <SubrequestModal
          isOpen={isSubrequestOpen}
          requestId={details.id}
          onClose={() => setIsSubrequestOpen(false)}
          onSuccess={applicationActions.refresh}
        />
      )}

      {editingSubrequest && (
        <SubrequestModal
          isOpen={Boolean(editingSubrequest)}
          subrequest={editingSubrequest}
          onClose={handleCloseEditModal}
          onSuccess={applicationActions.refresh}
        />
      )}

      {isUploadOpen && (
        <UploadSubrequestsModal
          isOpen={isUploadOpen}
          onClose={() => setIsUploadOpen(false)}
          onSuccess={applicationActions.refresh}
        />
      )}

      {isIssueOpen && (
        <IssueToStockModal
          categoryId={details?.tmz_cat_id}
          isOpen={isIssueOpen}
          records={records.filter((record) => selectedIds.includes(record.id))}
          storageId={details?.storage_id}
          type={type}
          onClose={() => setIsIssueOpen(false)}
          onSuccess={() => {
            setSelectedIds([]);
            applicationActions.refresh();
          }}
        />
      )}

      <ConfirmModal
        title="Удалить выбранные объекты?"
        message="После удаления их нельзя будет восстановить."
        confirmText="Удалить"
        isOpen={isDeleteConfirmOpen}
        isConfirmLoading={applicationActions.isDeleting}
        variant="risk"
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDelete}
      />
    </section>
  );
};
