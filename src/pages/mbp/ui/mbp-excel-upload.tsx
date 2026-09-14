import { useState } from 'react';
import {
  Button,
  FileUploader,
  Modal,
  OutlineSystemDownload,
  OutlineSystemFileAdd,
  snackbar,
  Tooltip,
} from 'alif-ui';

import { queryClient, useMutationQuery } from '@shared/api';

import { mbpEndpoints } from '../api/mbp-api';

const mbpTemplate = {
  fileName: 'mbp_upload_template.xlsx',
  url: '/mbp_upload_template.xlsx',
} as const;

export const MbpExcelUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const uploadMutation = useMutationQuery<ApiResponse<unknown>, { body: FormData }>({
    method: 'post',
    url: mbpEndpoints.upload,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    options: {
      onSuccess: async (response) => {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['mbp'] }),
          queryClient.invalidateQueries({ queryKey: ['mbp-filter-options'] }),
        ]);
        snackbar.show({
          title: response.message || 'Данные успешно загружены',
          type: 'success',
        });
        handleClose();
      },
    },
  });

  const handleClose = () => {
    if (uploadMutation.isPending) {
      return;
    }

    setFile(null);
    setIsOpen(false);
  };

  const handleUpload = () => {
    if (!file || uploadMutation.isPending) {
      return;
    }

    const formData = new FormData();
    formData.append('excelFile', file);
    uploadMutation.mutate({ body: formData });
  };

  return (
    <>
      <Button
        type="button"
        variant="primary"
        size="m"
        leftSection={<OutlineSystemFileAdd />}
        onClick={() => setIsOpen(true)}
      >
        Загрузить Excel
      </Button>

      {isOpen && (
        <Modal
          className="w-150"
          isOpen
          onClose={handleClose}
          isCentered
          withCloseButton
          isCloseOutside={false}
        >
          <Modal.Header className="relative" title="Добавление МБП по файлу" />
          <Modal.Content className="flex flex-col gap-4">
            <div className="absolute top-7 right-20">
              <Tooltip label="Пример Excel">
                <a
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-body) transition-colors hover:bg-(--color-bg-subtle)"
                  href={mbpTemplate.url}
                  download={mbpTemplate.fileName}
                >
                  <OutlineSystemDownload className="h-5 w-5 fill-black" />
                </a>
              </Tooltip>
            </div>
            <FileUploader
              files={file ? [file] : []}
              onFilesChange={(files) => setFile(files[0] ?? null)}
              title="Выберите Excel файл"
              buttonText="Выбрать файл"
              description={file?.name}
              allowedExtensions={['xlsx']}
              allowedMimeTypes={[
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              ]}
              maxCount={1}
              variant="desktop"
              width="100%"
            />
          </Modal.Content>
          <Modal.Actions className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline-neutral"
              onClick={handleClose}
              disabled={uploadMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={!file || uploadMutation.isPending}
              isLoading={uploadMutation.isPending}
              onClick={handleUpload}
            >
              Загрузить
            </Button>
          </Modal.Actions>
        </Modal>
      )}
    </>
  );
};
