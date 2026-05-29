/**
 * loaderBus.ts
 * A tiny event bridge between axios interceptors (outside React)
 * and the LoaderContext (inside React).
 *
 * Axios calls loaderBus.show() / loaderBus.hide()
 * LoaderContext subscribes and updates the overlay state.
 */

type Listener = (visible: boolean, message?: string) => void;

let listener: Listener | null = null;

/** Called by LoaderContext to register itself */
export function subscribeLoader(fn: Listener) {
  listener = fn;
  return () => { listener = null; };  // returns unsubscribe
}

/** Called by axios interceptors */
export function showLoader(message?: string) {
  listener?.(true, message);
}

export function hideLoader() {
  listener?.(false);
}