import Footer from "./Footer";

export default function Newsletter() {
  return (
    <section
      className="py-8 sm:py-16 px-4 sm:px-6 lg:px-10"
      id="newsletter"
      aria-label="Newsletter signup"
    >
      <div className="rounded-[24px] sm:rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-900 to-sky-900/40 border border-slate-700 shadow-[0_32px_80px_-40px_rgba(15,23,42,0.9)] px-4 sm:px-6 md:px-10 py-10 sm:py-12 lg:py-16 relative overflow-hidden">
        {/* Subtle accent glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="flex flex-col items-center text-center relative z-10">
          <div className="max-w-2xl">
            <span className="text-[11px] font-semibold tracking-[0.25em] uppercase text-sky-400 mb-6 block">
              STAY IN THE LOOP
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 sm:mb-6">
              Be first in line for new vibes.
            </h2>
            <p className="text-base lg:text-lg text-slate-300 mb-10 leading-relaxed font-medium">
              Get early access to exclusive narratives, launch drops, and the art of slowing
              down. No spam, just travel brain candy delivered every Sunday morning.
            </p>
            
            <form
              className="flex flex-col sm:flex-row gap-4 justify-center"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                className="w-full sm:w-[320px] rounded-full bg-slate-800 border border-slate-600 px-6 py-4 text-base text-slate-100 placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-300 transition-all shadow-inner"
                placeholder="you@travelszn.com"
                type="email"
                id="newsletter-email"
                aria-label="Email address for newsletter"
              />
              <button
                className="px-8 py-4 rounded-full bg-sky-600 hover:bg-sky-500 text-base font-bold text-white shadow-lg shadow-sky-500/30 transition-colors shrink-0"
                type="submit"
                id="newsletter-submit"
              >
                Count me in
              </button>
            </form>
            <p className="mt-8 text-xs text-slate-500 text-center">
              We value your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>

        {/* Footer sits inside the dark container for a unified block, just like Landing.jsx */}
        <div className="mt-12 border-t border-slate-800 pt-8">
          <Footer />
        </div>
      </div>
    </section>
  );
}
