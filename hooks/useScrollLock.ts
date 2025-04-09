import { useRef, useLayoutEffect } from "react";

let SCROLLBAR_WIDTH = 0;
if (typeof window !== "undefined") {
  const scrollDiv = document.createElement("div");
  scrollDiv.style.cssText =
    "width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px;";
  document.body.appendChild(scrollDiv);
  SCROLLBAR_WIDTH = scrollDiv.offsetWidth - scrollDiv.clientWidth;
  document.body.removeChild(scrollDiv);
}

const useScrollLock = (isOpen: boolean) => {
  const lockCountRef = useRef<number>(0);

  const scrollYRef = useRef<number>(0);

  const wasOpenRef = useRef(isOpen);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;

    const currentScrollY = window.scrollY;

    const openStateChanged = wasOpenRef.current !== isOpen;
    wasOpenRef.current = isOpen;

    if (isOpen) {
      scrollYRef.current = currentScrollY;

      lockCountRef.current += 1;

      if (lockCountRef.current === 1) {
        document.documentElement.style.setProperty(
          "--scrollbar-width",
          `${SCROLLBAR_WIDTH}px`
        );

        document.documentElement.style.setProperty(
          "--scroll-position",
          `-${currentScrollY}px`
        );

        document.body.setAttribute("data-modal-open", "true");
      }
    } else if (openStateChanged) {
      lockCountRef.current = Math.max(0, lockCountRef.current - 1);

      if (lockCountRef.current === 0) {
        const scrollToRestore = scrollYRef.current;

        document.body.removeAttribute("data-modal-open");

        document.documentElement.style.removeProperty("--scrollbar-width");
        document.documentElement.style.removeProperty("--scroll-position");

        setTimeout(() => {
          window.scrollTo(0, scrollToRestore);
        }, 0);
      }
    }

    return () => {
      if (isOpen) {
        lockCountRef.current = Math.max(0, lockCountRef.current - 1);

        if (lockCountRef.current === 0) {
          document.body.removeAttribute("data-modal-open");
          document.documentElement.style.removeProperty("--scrollbar-width");
          document.documentElement.style.removeProperty("--scroll-position");

          setTimeout(() => {
            window.scrollTo(0, scrollYRef.current);
          }, 0);
        }
      }
    };
  }, [isOpen]);
};

export default useScrollLock;
