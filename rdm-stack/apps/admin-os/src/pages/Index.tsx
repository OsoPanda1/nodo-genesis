import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CinematicIntro } from "@/components/CinematicIntro";
import { HeroSection } from "@/components/HeroSection";
import { ExperienceGrid } from "@/components/ExperienceGrid";
import { HistorySection } from "@/components/HistorySection";
import { GastronomySection } from "@/components/GastronomySection";
import { AdventureSection } from "@/components/AdventureSection";
import { AccommodationSection } from "@/components/AccommodationSection";
import { CultureSection } from "@/components/CultureSection";
import { FooterSection } from "@/components/FooterSection";
import { FloatingNav } from "@/components/FloatingNav";
import { RealitoOrb } from "@/components/RealitoOrb";
import { DichosSection } from "@/components/DichosSection";
import { TerritorialMap } from "@/components/TerritorialMap";
import { InteractiveMap } from "@/components/InteractiveMap";
import { ReviewPrompt } from "@/components/ReviewPrompt";
import { TourismInnovationSection } from "@/components/TourismInnovationSection";

const Index = () => {
  const [introComplete, setIntroComplete] = useState(false);
  const [showDichos, setShowDichos] = useState(false);

  if (showDichos) {
    return <DichosSection onBack={() => setShowDichos(false)} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {!introComplete && (
          <CinematicIntro onComplete={() => setIntroComplete(true)} />
        )}
      </AnimatePresence>

      {introComplete && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <FloatingNav onDichosClick={() => setShowDichos(true)} />
          <HeroSection />
          <ExperienceGrid onDichosClick={() => setShowDichos(true)} />
          <HistorySection />
          <GastronomySection />
          <AdventureSection />
          <AccommodationSection />
          <CultureSection />
          <TourismInnovationSection />
          <InteractiveMap />
          <TerritorialMap />
          <ReviewPrompt />
          <FooterSection />
          <RealitoOrb />
        </motion.div>
      )}
    </div>
  );
};

export default Index;
