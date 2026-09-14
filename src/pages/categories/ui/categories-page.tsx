import { useMemo, useState } from 'react';
import { Badge, Button, OutlineSystemAdd, OutlineSystemEdit, OutlineSystemTrash, Search, SegmentedControl, snackbar, Surface, Typography } from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';
import { getStoredUser, useUrlListState } from '@shared/lib';
import { ConfirmModal, DataTable, type DataTableProps } from '@shared/ui';

import { categoriesEndpoints } from '../api/categories-api';
import { categoryAddLabels, categoryTabs } from '../model/category-tabs';
import type { CategoryRecord, MbpCategory, OsCategory, TmzCategory } from '../model/types';
import { isCategoryType } from '../model/types';
import { useCategoriesList } from '../model/use-categories-list';
import { CategoryFormModal } from './category-form-modal';
import { TmzCategoryAddModal } from './tmz-category-add-modal';
import { TmzCategoryDetailsModal } from './tmz-category-details-modal';

export const CategoriesPage = () => {
  const canManage = getStoredUser()?.access === 'редактор';
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<CategoryRecord | null>(null);
  const [removingRecord, setRemovingRecord] = useState<CategoryRecord | null>(null);
  const [tmzDetailsId, setTmzDetailsId] = useState<number | null>(null);
  const { pagination, queryParams, searchText, setSearchText, setType, type } = useUrlListState({ clearOnTypeChange: true, defaultType: 'os', isType: isCategoryType });
  const canCreate = canManage || type === 'tmz' || type === 'mbp';
  const list = useCategoriesList({ limit: queryParams.limit, page: queryParams.page, searchText: queryParams.searchText, type });
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['categories-page-list', type] });
  const removeMutation = useMutationQuery<ApiResponse<unknown>, { url: string }>({
    method: 'delete',
    url: '',
    options: { onSuccess: (response) => { if (response.code !== 200) { snackbar.show({ title: response.message || 'Не удалось удалить категорию', type: 'error' }); return; } setRemovingRecord(null); snackbar.show({ title: 'Категория удалена', type: 'success' }); void invalidate(); } },
  });
  const columns = useMemo<DataTableProps<CategoryRecord>['columns']>(() => {
    const result: DataTableProps<CategoryRecord>['columns'] = type === 'os'
      ? [
          { accessor: 'id', minWidth: '90px', title: 'ID' },
          { accessor: 'name', minWidth: '260px', title: 'Название' },
          { accessor: 'tax_group_id', minWidth: '130px', title: 'Налог' },
          { accessor: 'depreciation_rate', minWidth: '130px', renderRowCell: (record) => `${(record as OsCategory).depreciation_rate}%`, title: 'Норма' },
        ]
      : type === 'tmz'
        ? [
            { accessor: 'id', minWidth: '90px', title: 'ID' },
            { accessor: 'name', minWidth: '300px', title: 'Название' },
            { accessor: 'storage_count', minWidth: '190px', title: 'Количество складов' },
          ]
        : [
            { accessor: 'id', minWidth: '90px', title: 'ID' },
            { accessor: 'name', minWidth: '300px', title: 'Название' },
            { accessor: 'is_destroyable', minWidth: '210px', renderRowCell: (record) => <Badge size="m" type="secondary" variant={(record as MbpCategory).is_destroyable ? 'info' : 'neutral'}>{(record as MbpCategory).is_destroyable ? 'Да' : 'Нет'}</Badge>, title: 'Подлежит уничтожению' },
          ];
    if (!canManage || type === 'tmz') return result;
    return [...result, { accessor: 'actions', minWidth: '112px', renderRowCell: (record) => <div className="flex justify-end gap-1" onClick={(event) => event.stopPropagation()}><Button type="button" variant="tertiary" size="s" isIconBtn aria-label="Изменить" onClick={() => setEditingRecord(record)}><OutlineSystemEdit /></Button><Button type="button" variant="tertiary" size="s" isIconBtn aria-label="Удалить" onClick={() => setRemovingRecord(record)}><OutlineSystemTrash /></Button></div>, textAlign: 'end', title: '' }];
  }, [canManage, type]);
  const removeUrl = removingRecord ? (type === 'os' ? categoriesEndpoints.removeOs(removingRecord.id) : categoriesEndpoints.removeMbp(removingRecord.id)) : '';

  return (
    <section className="flex min-h-[calc(100vh-48px)] flex-1 flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Typography element="div" role="heading" aria-level={1} category="heading" proportions="h3">Категории</Typography>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl tabs={categoryTabs} value={type} onChange={setType} rounded size="m" variant="accent" />
          {canCreate && <Button type="button" variant="primary" leftSection={<OutlineSystemAdd />} onClick={() => setIsAddOpen(true)}>{categoryAddLabels[type]}</Button>}
        </div>
      </div>
      <Surface className="flex flex-1 flex-col gap-4" p="6" rounded="12">
        <Search className="min-w-70" label="Поиск" value={searchText} onChange={(event) => setSearchText(event.target.value)} onClear={() => setSearchText('')} fullWidth proportions="l" />
        <DataTable columns={columns} records={list.records} isFetching={list.isFetching} isLoading={list.isLoading} onRowClick={type === 'tmz' ? (record) => setTmzDetailsId((record as TmzCategory).id) : undefined} emptyPlaceholder={queryParams.searchText ? `По поиску «${queryParams.searchText}» ничего не найдено.` : 'Список категорий пока пуст.'} pagination={{ ...pagination, totalCount: list.totalCount }} />
      </Surface>
      {isAddOpen && (type === 'tmz' ? <TmzCategoryAddModal isOpen onClose={() => setIsAddOpen(false)} onSuccess={() => void invalidate()} /> : <CategoryFormModal isOpen type={type} record={null} onClose={() => setIsAddOpen(false)} onSuccess={() => void invalidate()} />)}
      {editingRecord && type !== 'tmz' && <CategoryFormModal isOpen type={type} record={editingRecord} onClose={() => setEditingRecord(null)} onSuccess={() => void invalidate()} />}
      <TmzCategoryDetailsModal categoryId={tmzDetailsId} canManage={canManage} onClose={() => setTmzDetailsId(null)} onSuccess={() => void invalidate()} />
      <ConfirmModal isOpen={removingRecord !== null} title="Удалить категорию?" message="После удаления запись нельзя будет восстановить." confirmText="Удалить" variant="risk" isConfirmLoading={removeMutation.isPending} onClose={() => setRemovingRecord(null)} onConfirm={() => removeUrl && removeMutation.mutate({ url: removeUrl })} />
    </section>
  );
};
