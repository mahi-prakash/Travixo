import { useLayoutEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export default function VerticalMarqueeColumn({ items, direction }) {
  const trackRef = useRef(null);
  const [distance, setDistance] = useState(0);

  const moveDown = direction === "down";

  useLayoutEffect(() => {
    if (!trackRef.current) return;

    // wait for images to load & layout to settle
    const height = trackRef.current.scrollHeight / 2;
    setDistance(height);
  }, [items]);

  if (!distance) return null; // prevents broken animation

  return (
    <div className="relative flex-1 overflow-hidden">
      <motion.div
        ref={trackRef}
        initial={{ y: 0 }}
        animate={{ y: moveDown ? distance : -distance }}
        transition={{
          duration: 40,
          repeat: Infinity,
          ease: "linear",
        }}
        className="flex flex-col gap-3"
      >
        {[...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="h-56 rounded-xl overflow-hidden bg-gray-200"
          >
            <img
              src={item.img}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
