import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/store';

export function CookieBanner() {
  const consented = useStore((s) => s.consented);
  const cookieAccepted = useStore((s) => s.cookieAccepted);
  const acceptCookies = useStore((s) => s.acceptCookies);

  useEffect(() => {
    if (!consented) return;
    const timer = setTimeout(() => {
      acceptCookies();
    }, 4500);
    return () => {
      clearTimeout(timer);
    };
  }, [consented, acceptCookies]);

  if (!consented) return null;

  return (
    <AnimatePresence>
      {!cookieAccepted ? (
        <motion.div
          key="banner"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="fixed bottom-4 left-4 right-4 z-40 mx-auto max-w-3xl border border-border bg-panel/95 backdrop-blur p-4 rounded-lg shadow-neon"
          role="dialog"
          aria-label="Cookie banner (theatrical, no cookies are actually set)"
        >
          <div className="flex items-center gap-4 text-sm">
            <span className="text-fg/80">
              We use cookies to improve your experience. By continuing, you agree to our use of cookies.
            </span>
            <span className="ml-auto opacity-60 italic">
              (don't read me — most users don't)
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="accepted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 text-sm font-mono text-green border border-green/40 bg-green/5 px-4 py-2 rounded"
        >
          Cookies accepted ✔ (you didn't click anything — that's the point)
        </motion.div>
      )}
    </AnimatePresence>
  );
}
