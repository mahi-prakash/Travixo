import StoriesHeader from "../components/stories/StoriesHeader";
import ParallaxHero from "../components/stories/ParallaxHero";
import MoodGrid from "../components/stories/MoodGrid";
import FeaturedNarrative from "../components/stories/FeaturedNarrative";
import TravelReels from "../components/stories/TravelReels";
import Newsletter from "../components/stories/Newsletter";
import Footer from "../components/stories/Footer";
import SectionSpacer from "../components/stories/SectionSpacer";

export default function Stories() {
  return (
    <div
      className="min-h-screen bg-cover bg-center bg-fixed bg-no-repeat overflow-hidden font-sans relative"
      style={{ backgroundImage: "url('/cloud.jpg')" }}
    >
      {/* Soft textured overlay to reduce harsh white contrast */}
      <div className="absolute inset-0 bg-sky-50/90 backdrop-blur-[2px] pointer-events-none" />
      
      <StoriesHeader />
      
      <div className="relative">
        <ParallaxHero />

        <div className="relative isolate" style={{ zIndex: 3 }}>
          <MoodGrid />
          <SectionSpacer />

          <FeaturedNarrative />
          <SectionSpacer />

          <TravelReels />
          <SectionSpacer />

          <Newsletter />
          <Footer />
        </div>
      </div>
    </div>
  );
}
