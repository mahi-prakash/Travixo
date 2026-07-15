import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const moodCards = [
  {
    title: "Feeling Adventurous",
    description: "Peak experiences and rugged trails",
    alt: "adventurous explorer standing on a rocky outcrop overlooking a vast desert canyon during golden hour",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxyp5hdK3OJZb5T2ULWL-pA7dWhnhUjEEVPsgUo7uHANA6xM98dU_se_FGPdUEgWP1m1hqIiHJOWWRSNHPjtRPwXB8jCIr50Zg_UUcOAHUSi988viFgYYixqqIvZdVEQ55OlmJ66aKUv6IjnDatz-BJkfm7Z1xBQQ9fDHUo-QWDGDXT6ehZnr64EOouW11lFcOLBDY2mpEQCwL_6KqJiJUc6kg0aNXZLS3QKHmT4vf-FNf5nQqTGzY8fJCQ4AM3PGcoRqFDwI_3O4",
  },
  {
    title: "Need a Retreat",
    description: "Quiet corners for total restoration",
    alt: "serene wellness retreat with minimalist wooden architecture and steaming thermal pools surrounded by misty trees",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBP02wMS7YP7UQAgqIAm62NGQ4vvVu_tv7wqJJUPSQrIryDHKlG8XO24nMBSYZnHfxCFVFLsmyEZLLJmBakT62hHdATjC6C7A_nleDStf-hEg5xTHFeXVfFDbviLd2X0f2RclTKKGVnjTs5NtUs2iAQhO6qigrwaH3vXnIyYvYZRwG4tz2ErdmAjS0bViOGvtpmzr4xGzh6cFq5q_-dGy6ed_G5aIp_gvy6-Xeg9CPsPyy2D-JQ1QYmPimo1ONFu-k7YV92RqBDrfM",
  },
  {
    title: "Pure Foodie",
    description: "Culinary journeys and local markets",
    alt: "colorful variety of authentic gourmet dishes on a rustic wooden table in a sunlit Mediterranean villa",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhJ30ZEG-CbzRZUR8DLp0oMo5vn_t-pczALOJ3fTc4c3_MFKvQ7Sp54EhIlpJ2wnlXqNkXASUqRwZhRjOYPBLUpvQ0V8Xi9DxabhelUjOSD8svh2qY5lGQE8OexeeNNRojU4LBPPHRdJzrY098w5k63IfAg3goYl7qKvv-7wmPbiLXt2h7WK8ZTf6RLlPnig0sMhHVnFC6JvHFVvgTgeSpmDYq7Lck9ZsTBkxGTEZHOBv9Fao36AGhvBxs2wx1qdddJObo6dHnNxU",
  },
  {
    title: "Cultural Deep-Dive",
    description: "Connecting with heritage and craft",
    alt: "vibrant street market scene in an old European city with historical architecture and bustling people",
    src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQIpXyqlp7Gvg_Lil8VRYDVb9O6zufLY6WoYFVUI9z6jdyYDOyDlYyKRISajRLe6grywZHzJoEh5UHa3wPOXpztO_RB2nX7kQ1uMUIyohV-IFmsOw-ne3YVyf_3rupak9SRqY2GuYGQ3qi_AEWDbPfzzC7kdZJpy1lLg7JZR2IsTqINmJl-9NfBqIqIBvetralnJkdNd0Il32-LZHCHjNYsrcYJrvlOOG47CAWzoZ30xsIMyFwXEWhsbefxNEBzXSWpLE3ERtBa1c",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] }
  },
};

export default function MoodGrid() {
  return (
    <section
      className="py-8 sm:py-16 px-4 sm:px-6 lg:px-10"
      id="discover-mood"
      aria-label="Discover by Mood"
    >
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="flex flex-col gap-2 mb-12"
      >
        <span className="text-[11px] font-bold tracking-[0.25em] uppercase text-sky-500 drop-shadow-sm">
          CURATED EXPLORATION
        </span>
        <h2 className="mt-2 text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
          Discover by Mood
        </h2>
      </motion.div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6"
      >
        {moodCards.map((card) => (
          <motion.div
            variants={cardVariants}
            key={card.title}
            className="group relative aspect-[4/5] bg-white border border-slate-200 rounded-2xl sm:rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.03] hover:shadow-2xl hover:shadow-sky-500/20"
            id={`mood-${card.title.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <img
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              alt={card.alt}
              src={card.src}
            />
            {/* Soft gradient from white base */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
            
            <div className="absolute inset-0 p-3 sm:p-6 lg:p-8 flex flex-col justify-end">
              <h3 className="text-sm sm:text-xl lg:text-2xl font-bold text-white tracking-tight transform transition-transform duration-500 group-hover:-translate-y-2">
                {card.title}
              </h3>
              <p className="text-white/90 font-medium mt-1 sm:mt-2 text-[11px] sm:text-sm transform transition-all duration-500 group-hover:-translate-y-2 group-hover:opacity-0 line-clamp-2">
                {card.description}
              </p>

              {/* Hover Pill Interaction */}
              <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 lg:left-8 opacity-0 transform translate-y-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                <span className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30 text-white text-xs font-bold uppercase tracking-wider">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}
