import { useEffect } from "react";

export const useEscapeKey = (handler: () => void) => {
  useEffect(() => {
    const handleEsc = (event: any) => {
      if (event.key === "Escape") {
        handler();
      }
    };

    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [handler]);
};
