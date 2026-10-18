import { useEffect, useRef, type ReactNode } from "react";
export function Modal({
  title,
  onClose,
  children,
  wide = false,
  returnFocus,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
  returnFocus?: HTMLElement | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef(onClose);
  const returnFocusRef = useRef(returnFocus);
  closeRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current!;
    const previous =
      returnFocusRef.current ?? (document.activeElement as HTMLElement | null);
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    dialog
      .querySelector<HTMLElement>("[data-modal-initial-focus]")
      ?.focus({ preventScroll: true });
    return () => {
      dialog.close();
      document.body.style.overflow = old;
      if (previous?.isConnected && !dialog.contains(previous))
        previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={ref}
      aria-label={title}
      className={`modal ${wide ? "modal-wide" : ""}`}
      onCancel={(e) => {
        e.preventDefault();
        closeRef.current();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeRef.current();
        }
      }}
    >
      {children}
    </dialog>
  );
}
