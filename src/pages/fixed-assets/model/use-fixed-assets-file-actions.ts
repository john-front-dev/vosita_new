import { useState } from 'react';
import { snackbar } from 'alif-ui';

import type { StockAssetListItem } from '@entities/stock-asset';
import { httpClient, queryClient } from '@shared/api';
import { downloadBlob } from '@shared/lib';

const uploadEndpoint = '/upload_os';
const templateEndpoint = '/template_os';

export const useFixedAssetsFileActions = (onUploaded: () => void) => {
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const downloadTemplate = async () => {
    setIsDownloadingTemplate(true);
    try {
      const { data } = await httpClient.get<Blob>(templateEndpoint, { responseType: 'blob' });
      downloadBlob(data, 'template_os.xlsx');
    } catch {
      snackbar.show({ title: 'Не удалось скачать шаблон', type: 'error' });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const upload = async (file: File) => {
    setIsUploading(true);
    try {
      const body = new FormData();
      body.append('excelFile', file);
      await httpClient.post(uploadEndpoint, body);
      await queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      snackbar.show({ title: 'Файл успешно загружен', type: 'success' });
      onUploaded();
    } catch {
      snackbar.show({ title: 'Не удалось загрузить файл', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return { downloadTemplate, isDownloadingTemplate, isUploading, upload };
};

export const useSaveFixedAssetsInventory = (onSuccess: () => void) => {
  const [isSaving, setIsSaving] = useState(false);
  const save = async (records: StockAssetListItem[], selectedIds: number[]) => {
    const recordsById = new Map(records.map((record) => [record.id, record]));
    const body = selectedIds.map((id) => {
      const record = recordsById.get(id);
      return {
        inventory_number: record?.inventory_number,
        is_inventoried: true,
        item_id: id,
        item_name: record?.name,
        item_type_id: 1,
      };
    });
    setIsSaving(true);
    try {
      await httpClient.post('/inventories', body);
      await queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      snackbar.show({ title: 'Инвентаризация сохранена', type: 'success' });
      onSuccess();
    } catch {
      snackbar.show({ title: 'Не удалось сохранить инвентаризацию', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };
  return { isSaving, save };
};
