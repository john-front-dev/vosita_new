import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

type QrCodeProps = {
  className?: string;
  size?: number;
  value: string;
};

export const QrCode = ({ className, size = 220, value }: QrCodeProps) => {
  const [source, setSource] = useState('');

  useEffect(() => {
    let isActive = true;

    QRCode.toDataURL(value, {
      margin: 1,
      width: size,
    }).then((nextSource) => {
      if (isActive) {
        setSource(nextSource);
      }
    });

    return () => {
      isActive = false;
    };
  }, [size, value]);

  if (!source) {
    return <div className={className} style={{ height: size, width: size }} />;
  }

  return (
    <img className={className} src={source} alt={`QR-код ${value}`} height={size} width={size} />
  );
};
