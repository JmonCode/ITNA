"use client";

import type { ChangeEvent } from "react";
import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

const maxProductImageSize = 10 * 1024 * 1024;
const acceptedImageTypes = new Set(["image/gif", "image/jpeg", "image/png", "image/webp"]);

export function ProductImageField() {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <span className="text-caption">제품 이미지</span>
          <p className="mt-1 text-body-sm opacity-70">목록과 상세 화면에 보일 대표 이미지를 올려주세요.</p>
        </div>
        {previewUrl ? (
          <button className="btn-icon shrink-0" type="button" aria-label="제품 이미지 삭제" onClick={clearImage}>
            <X size={18} strokeWidth={1.8} />
          </button>
        ) : null}
      </div>

      <input
        ref={inputRef}
        id={inputId}
        className="sr-only"
        name="productImage"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleChange}
      />

      <label
        htmlFor={inputId}
        className="block cursor-pointer overflow-hidden rounded-[var(--radius-md)] border border-dashed border-hairline bg-surface-soft transition hover:border-primary"
      >
        <div className="aspect-[16/9] w-full">
          {previewUrl ? (
            <div className="relative h-full w-full">
              <Image
                className="object-contain"
                src={previewUrl}
                alt="제품 이미지 미리보기"
                fill
                sizes="(min-width: 1024px) 640px, 100vw"
                unoptimized
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
              <span className="btn-icon">
                <ImagePlus size={20} strokeWidth={1.8} />
              </span>
              <span className="text-body-sm">이미지를 선택하거나 다시 클릭해 변경</span>
              <span className="text-caption opacity-60">JPG, PNG, WEBP, GIF · 10MB 이하</span>
            </div>
          )}
        </div>
      </label>

      {fileName ? <p className="truncate text-caption opacity-70">{fileName}</p> : null}
      {error ? <p className="text-body-sm text-[var(--color-accent-magenta)]">{error}</p> : null}
    </div>
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    setError("");

    if (!file) {
      clearImage();
      return;
    }

    if (!acceptedImageTypes.has(file.type) || file.size > maxProductImageSize) {
      clearImage();
      setError("jpg, png, webp, gif 형식의 10MB 이하 이미지만 올릴 수 있습니다.");
      return;
    }

    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }
    setPreviewUrl(null);
    setFileName("");
  }
}
