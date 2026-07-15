import { useEffect, useState } from "react";
import { motion as Motion } from "framer-motion";

/**
 * HeroSwipeImage
 *
 * Shows a single image card that:
 * - auto changes every few seconds
 * - can be swiped left/right
 * - keeps hero section visually calm
 */
const HeroSwipeImage = ({ heroPlaces }) => {
  // heroPlaces is an array of arrays → flatten it
  const images = heroPlaces.flat();
  const [index, setIndex] = useState(0);

  // Auto change image
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="relative w-[420px] h-[560px]">
      <Motion.div
        key={index}
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -60, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={(e, info) => {
          if (info.offset.x < -80) {
            setIndex((i) => (i + 1) % images.length);
          }
          if (info.offset.x > 80) {
            setIndex((i) => (i - 1 + images.length) % images.length);
          }
        }}
        className="absolute inset-0"
      >
        <div className="w-full h-full rounded-[28px] overflow-hidden bg-white shadow-[0_40px_100px_-40px_rgba(15,23,42,0.6)]">
          <img
            src={images[index].img}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </Motion.div>
    </div>
  );
};

export default HeroSwipeImage;
