import { useState } from 'react';
import {
  Button,
  FileUploader,
  Modal,
  OutlineSystemDownload,
  snackbar,
  Tooltip,
} from 'alif-ui';

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
          title: 'Excel загружен',
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
    <Modal className="w-[550px]" isOpen={isOpen} onClose={onClose} isCentered withCloseButton>
      <Modal.Header title="Массовое добавление запросов" />
      <Modal.Content className="flex flex-col gap-4">
        <div className="flex justify-end">
          <Tooltip label="Пример Excel">
            <a
              className="inline-flex items-center gap-2 rounded-md border border-[#d0d5dd] px-3 py-2 text-sm font-medium text-[#344054] transition-colors hover:bg-[#f9fafb]"
              href={subrequestTemplate.url}
              download={subrequestTemplate.fileName}
            >
              <OutlineSystemDownload className="h-5 w-5" />
              Скачать пример Excel
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
