import { useState } from 'react';
import { Button, FileUploader, Modal, OutlineSystemDownload, snackbar, Tooltip } from 'alif-ui';

import { useMutationQuery } from '@shared/api';

import { applicationEndpoints } from '../api/applications-api';

const subrequestTemplate = {
  fileName: 'subrequest_upload_template.xlsx',
  url: '/subrequest_upload_template.xlsx',
} as const;

type UploadSubrequestsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const UploadSubrequestsModal = ({
  isOpen,
  onClose,
  onSuccess,
}: UploadSubrequestsModalProps) => {
  const [file, setFile] = useState<File | null>(null);

  const uploadMutation = useMutationQuery<ApiResponse<unknown>, { body: FormData }>({
    method: 'post',
    url: applicationEndpoints.uploadSubrequests,
    config: {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
    options: {
      onSuccess: () => {
        snackbar.show({
          title: 'Успешно',
          type: 'success',
        });
        setFile(null);
        onSuccess();
        onClose();
      },
    },
  });

  const handleUpload = () => {
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    uploadMutation.mutate({ body: formData });
  };

  return (
    <Modal className="w-150" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header className="relative" title="Массовое добавление запросов" />
      <Modal.Content className="flex flex-col gap-4">
        <div className="absolute top-7 right-20">
          <Tooltip label="Пример Excel">
            <a
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-(--color-text-body) transition-colors hover:bg-(--color-bg-subtle)"
              href={subrequestTemplate.url}
              download={subrequestTemplate.fileName}
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
      <Modal.Actions className="flex justify-end gap-4">
        <Button type="button" variant="outline-neutral" onClick={onClose}>
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
  );
};
