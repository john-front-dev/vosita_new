import { useState } from 'react';
import { Button, FileUploader, Modal, OutlineSystemFileAdd } from 'alif-ui';

import { useFixedAssetsFileActions } from '../model/use-fixed-assets-file-actions';

export const FixedAssetsUploadButton = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { downloadTemplate, isDownloadingTemplate, isUploading, upload } =
    useFixedAssetsFileActions(() => {
      setFile(null);
      setIsOpen(false);
    });

  const handleClose = () => {
    setFile(null);
    setIsOpen(false);
  };

  const handleUpload = () => {
    if (!file) {
      return;
    }

    void upload(file);
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
          className="w-125"
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
              onClick={() => void downloadTemplate()}
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
