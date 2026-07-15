import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Dropdown = ({ trigger, children, className = "", width = "w-48", align = "right" }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef();

    // close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div
            ref={ref}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
            className={`relative inline-block ${className}`}
        >
            <div 
                onClick={(e) => {
                    e.stopPropagation();
                    setOpen(!open);
                }} 
                className="cursor-pointer select-none"
            >
                {trigger}
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={`absolute ${align === "right" ? "right-0" : "left-0"} mt-2 ${width} bg-white rounded-[22px] shadow-2xl border border-slate-100 z-[100] ring-1 ring-black/[0.04] overflow-hidden`}
                    >
                        {typeof children === 'function' ? children({ close: () => setOpen(false) }) : children}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Dropdown;