import React, { useState, useEffect } from 'react';
import { BRAND_IMAGES, resolveBrandImage } from '@/src/assets/brandAssets';

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  unoptimized?: boolean;
  quality?: number;
}

export default function Image({
  fill,
  priority,
  unoptimized: _unoptimized,
  quality: _quality,
  className = '',
  style,
  src,
  alt = '',
  onError,
  ...props
}: ImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(() => resolveBrandImage(src));

  useEffect(() => {
    setImgSrc(resolveBrandImage(src));
  }, [src]);

  const fillClasses = fill ? 'absolute inset-0 w-full h-full' : '';

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (imgSrc !== BRAND_IMAGES.oversizedTshirt) {
      setImgSrc(BRAND_IMAGES.oversizedTshirt);
      return;
    }
    if (onError) onError(e);
  };

  return (
    <img
      src={imgSrc}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`${fillClasses} ${className}`.trim()}
      style={style}
      loading={priority ? 'eager' : 'lazy'}
      onError={handleError}
      {...props}
    />
  );
}
