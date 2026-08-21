import { useState } from 'react';
import { Button, FileUploader, Modal, OutlineSystemFileAdd, snackbar } from 'alif-ui';

import { httpClient, queryClient } from '@shared/api';

const fixedAssetsUploadEndpoint = '/upload_os';
const fixedAssetsTemplateEndpoint = '/template_os';

export const FixedAssetsUploadButton = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleClose = () => {
    setFile(null);
    setIsOpen(false);
  };

  const handleTemplateDownload = async () => {
    try {
      setIsDownloadingTemplate(true);

      const response = await httpClient.get<Blob>(fixedAssetsTemplateEndpoint, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.download = 'template_os.xlsx';
      document.body.append(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      snackbar.show({ title: 'Не удалось скачать шаблон', type: 'error' });
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();

      formData.append('excelFile', file);
      await httpClient.post(fixedAssetsUploadEndpoint, formData);
      await queryClient.invalidateQueries({ queryKey: ['fixed-assets'] });
      snackbar.show({ title: 'Файл успешно загружен', type: 'success' });
      handleClose();
    } catch {
      snackbar.show({ title: 'Не удалось загрузить файл', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="m"
        aria-label="Загрузить ОС"
        title="Загрузить ОС"
        onClick={() => setIsOpen(true)}
      >
        <OutlineSystemFileAdd />
      </Button>

      {isOpen && (
        <Modal
          className="w-125 max-w-[calc(100vw-32px)]"
          isOpen={isOpen}
          onClose={handleClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
        >
          <Modal.Header title="Добавление файла" />
          <Modal.Content className="flex flex-col gap-4">
            <FileUploader
              files={file ? [file] : []}
              onFilesChange={(files) => setFile(files[0] ?? null)}
              title="Выберите файл..."
              buttonText="Выбрать файл"
              description={file?.name}
              allowedExtensions={['xlsx', 'xls']}
              allowedMimeTypes={[
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ]}
              maxCount={1}
              variant="desktop"
              width="100%"
            />
          </Modal.Content>
          <Modal.Actions className="flex flex-col gap-3">
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleUpload}
              disabled={!file}
              isLoading={isUploading}
            >
              Добавить
            </Button>
            <Button
              type="button"
              variant="primary"
              className="w-full"
              onClick={handleTemplateDownload}
              isLoading={isDownloadingTemplate}
            >
              Скачать шаблоны
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
