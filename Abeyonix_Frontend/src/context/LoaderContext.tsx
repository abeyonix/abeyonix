import { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react";
import { OverlayLoader } from "@/components/Loader";
import { subscribeLoader } from "@/lib/loaderBus";

interface LoaderContextType {
  showLoader: (message?: string) => void;
  hideLoader: () => void;
  withLoader: <T>(fn: () => Promise<T>, message?: string) => Promise<T>;
}

const LoaderContext = createContext<LoaderContextType | null>(null);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("LOADING...");

  const showLoader = useCallback((msg = "LOADING...") => {
    setMessage(msg.toUpperCase());
    setLoading(true);
  }, []);

  const hideLoader = useCallback(() => {
    setLoading(false);
  }, []);

  /** Subscribe to axios bus — any api call triggers the overlay automatically */
  useEffect(() => {
    const unsubscribe = subscribeLoader((visible, msg) => {
      if (visible) {
        setMessage((msg ?? "LOADING...").toUpperCase());
        setLoading(true);
      } else {
        setLoading(false);
      }
    });
    return unsubscribe;
  }, []);

  const withLoader = useCallback(async <T,>(
    fn: () => Promise<T>,
    msg = "LOADING..."
  ): Promise<T> => {
    showLoader(msg);
    try {
      return await fn();
    } finally {
      hideLoader();
    }
  }, [showLoader, hideLoader]);

  return (
    <LoaderContext.Provider value={{ showLoader, hideLoader, withLoader }}>
      {/* Overlay sits here — covers the full viewport */}
      {loading && (
        <div style={{
          position: "fixed",
          inset: 0,
          zIndex: 9998,
          background: "rgba(0, 8, 20, 0.72)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          backdropFilter: "blur(2px)",
          animation: "abxFadeIn 0.2s ease",
        }}>
          <OverlayLoader message={message} />
        </div>
      )}
      {children}
    </LoaderContext.Provider>
  );
}

export function useAppLoader() {
  const ctx = useContext(LoaderContext);
  if (!ctx) throw new Error("useAppLoader must be used inside <LoaderProvider>");
  return ctx;
}