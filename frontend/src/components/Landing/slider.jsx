function SingleCardSlider() {
  const containerRef = useRef(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % items.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.scrollTo({
      left: index * containerRef.current.clientWidth,
      behavior: "smooth",
    });
  }, [index]);

  return (
    <div
      ref={containerRef}
      className="flex overflow-hidden rounded-2xl bg-white shadow-lg"
    >
      {items.map((item, i) => (
        <div
          key={i}
          className="min-w-full flex flex-col md:flex-row"
        >
          {/* LEFT IMAGE */}
          <div className="md:w-1/2 h-56 md:h-auto">
            <img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* RIGHT CONTENT */}
          <div className="md:w-1/2 p-8 flex flex-col justify-center gap-3">
            <p className="text-xs font-semibold tracking-widest uppercase text-sky-600">
              {item.tag}
            </p>
            <h3 className="text-2xl font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="text-slate-600 text-sm leading-relaxed">
              {item.body}
            </p>
            <span className="mt-2 text-sky-600 text-sm font-medium cursor-pointer">
              Read more →
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
