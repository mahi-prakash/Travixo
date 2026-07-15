import React, { useEffect } from "react";
import { motion as Motion, useMotionValue, useTransform } from "framer-motion";

const TransitionOverlay = ({ onFinished }) => {
  const progress = useMotionValue(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinished();
    }, 900);
    return () => clearTimeout(timer);
  }, [onFinished]);

  return (
    <Motion.div
      className="fixed inset-0 z-[999] pointer-events-none overflow-hidden"
      style={{ perspective: 2000 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.15 }}
    >
      {/* Plane */}
      <Motion.div
        initial={{
          left: "0%",
          bottom: "0%",
          rotate: -35,
          scale: 0.8,
        }}
        animate={{
          left: "100%",
          bottom: "100%",
          rotate: 35,
          scale: 1,
        }}
        transition={{
          duration: 1.8,
          ease: [0.22, 0.8, 0.4, 1],
          onUpdate: (latest) => {
            progress.set(Math.min(latest.left / window.innerWidth, 1));
          },
        }}
        className="absolute z-20"
        style={{
          transform: "translate(-50%, 50%)",
        }}
      >
        <div className="w-14 h-14 rounded-full bg-sky-600 flex items-center justify-center shadow-2xl shadow-sky-500/50">
          <span className="text-2xl leading-none">✈️</span>
        </div>
      </Motion.div>

      {/* PAGE FOLD (PRODUCTION VERSION) */}
      <Motion.div
        style={{
          transformOrigin: "0% 100%",
          transformStyle: "preserve-3d",
          rotateY: useTransform(progress, [0, 1], [0, -70]),
          rotateX: useTransform(progress, [0, 1], [0, 18]),
          rotateZ: useTransform(progress, [0, 1], [0, -12]),
          scale: useTransform(progress, [0, 1], [1, 0.92]),
        }}
        className="absolute inset-0 z-10 bg-sky shadow-2xl"
      >
        {/* Fold shadow */}
        <Motion.div
          style={{
            opacity: useTransform(progress, [0, 1], [0, 0.45]),
          }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(0,0,0,0.35), rgba(0,0,0,0) 60%)",
            }}
          />
        </Motion.div>

        {/* Fold edge highlight */}
        <Motion.div
          style={{
            opacity: useTransform(progress, [0, 1], [0, 1]),
          }}
          className="absolute left-0 bottom-0 w-full h-full pointer-events-none"
        >
          <div
            className="absolute bottom-0 left-0 w-[2px] h-full"
            style={{
              background:
                "linear-gradient(to top, rgba(255,255,255,0.9), rgba(255,255,255,0))",
            }}
          />
        </Motion.div>
      </Motion.div>
    </Motion.div>
  );
};

export default TransitionOverlay;
