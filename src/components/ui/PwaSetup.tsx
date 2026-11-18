"use client";

import { useEffect, useState } from "react";

interface InstallEvent extends Event {
  prompt: () => Promise<void>;
}

const KEY = "koerier.installHint";
const read = () => {
  try {
    return localStorage.getItem(KEY) === "no";
  } catch {
    return false;
  }
};

const standalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** Registers the offline service worker (production only: in dev it would cache stale code). */
export function useServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
}

/**
 * "Zet op beginscherm": iOS Safari wipes a site's storage after about a week without a visit, a
 * home-screen app keeps it, and it opens full screen. Android offers a real install button; iOS
 * needs the Share menu, so there it is a sentence. Shown once, until dismissed.
 */
export function InstallHint() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    if (standalone() || read()) return;
    const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);
    setIos(isIos);
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setEvent(e as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    if (isIos) setHidden(false);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, "no");
    } catch {}
    setHidden(true);
  };
  if (hidden || (!event && !ios)) return null;

  return (
    <div className="flex items-start justify-between gap-3 border-l-2 border-ochre bg-night/60 py-2 pl-3 font-news text-[length:calc(13.5px*var(--ts,1))] leading-snug text-[#d8d0be]">
      <p className="m-0">
        {event ? (
          <>
            Zet het spel op je beginscherm: het werkt dan ook met slecht bereik en je voortgang blijft bewaard.{" "}
            <button type="button" onClick={() => event.prompt().then(dismiss)} className="-my-2 py-2 font-bold text-ochre underline decoration-dotted underline-offset-4">
              Installeer
            </button>
          </>
        ) : (
          <>Tik op Deel en kies ‘Zet op beginscherm’: dan blijft je voortgang bewaard en werkt het spel ook met slecht bereik.</>
        )}
      </p>
      <button type="button" aria-label="Sluit deze tip" onClick={dismiss} className="-my-2 flex h-11 w-9 flex-none items-center justify-center text-ash">
        ×
      </button>
    </div>
  );
}
