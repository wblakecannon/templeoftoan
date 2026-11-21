"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface LightboxImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

function readImage(el: Element): LightboxImage {
  const {
    lightboxSrc,
    lightboxWidth,
    lightboxHeight,
    lightboxAlt,
    lightboxCaption,
  } = (el as HTMLElement).dataset;
  return {
    src: lightboxSrc ?? "",
    width: Number(lightboxWidth) || 0,
    height: Number(lightboxHeight) || 0,
    alt: lightboxAlt ?? "",
    caption: lightboxCaption,
  };
}

export function Lightbox() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [open, setOpen] = useState(false);
  const [siblings, setSiblings] = useState<Element[]>([]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Element | null;
      const trigger = target?.closest("[data-lightbox-src]");
      if (!trigger) return;

      triggerRef.current = trigger as HTMLElement;

      const gallery = trigger.closest("[data-lightbox-gallery]");
      const group = gallery
        ? Array.from(gallery.querySelectorAll("[data-lightbox-src]"))
        : [trigger];

      setSiblings(group);
      setIndex(Math.max(0, group.indexOf(trigger)));
      setOpen(true);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const handleClose = useCallback(() => {
    setOpen(false);
    triggerRef.current?.focus();
  }, []);

  const goTo = useCallback(
    (nextIndex: number) => {
      if (siblings.length === 0) return;
      setIndex((nextIndex + siblings.length) % siblings.length);
    },
    [siblings.length],
  );

  function handleDialogClick(event: React.MouseEvent<HTMLDialogElement>) {
    if (
      event.target === dialogRef.current ||
      event.target === backdropRef.current
    ) {
      dialogRef.current?.close();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDialogElement>) {
    if (siblings.length < 2) return;
    if (event.key === "ArrowLeft") goTo(index - 1);
    if (event.key === "ArrowRight") goTo(index + 1);
  }

  const current = siblings[index] ? readImage(siblings[index]) : null;

  return (
    <dialog
      ref={dialogRef}
      aria-label={current?.alt || "Image viewer"}
      onClick={handleDialogClick}
      onKeyDown={handleKeyDown}
      onClose={handleClose}
      className="fixed inset-0 z-[100] m-0 h-full max-h-none w-full max-w-none bg-black/90 p-0 backdrop:bg-transparent open:flex open:items-center open:justify-center"
    >
      {current ? (
        <div
          ref={backdropRef}
          className="relative flex max-h-[100vh] w-full flex-col items-center justify-center gap-3 p-3 sm:p-4"
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => dialogRef.current?.close()}
            className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-6 w-6"
            >
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
          </button>

          {siblings.length > 1 ? (
            <>
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => goTo(index - 1)}
                className="absolute top-1/2 left-2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:left-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <button
                type="button"
                aria-label="Next image"
                onClick={() => goTo(index + 1)}
                className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 sm:right-4"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-6 w-6"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </>
          ) : null}

          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            width={current.width}
            height={current.height}
            sizes="100vw"
            className="h-auto max-h-[92vh] w-auto max-w-full object-contain"
          />
          {current.caption ? (
            <p className="max-w-2xl text-center text-sm text-white/80">
              {current.caption}
            </p>
          ) : null}
          {siblings.length > 1 ? (
            <p className="text-xs text-white/50">
              {index + 1} / {siblings.length}
            </p>
          ) : null}
        </div>
      ) : null}
    </dialog>
  );
}
