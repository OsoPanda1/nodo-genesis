import { InteractiveMap } from "@/components/InteractiveMap";
import { FloatingNav } from "@/components/FloatingNav";
import { RealitoOrb } from "@/components/RealitoOrb";
import { FooterSection } from "@/components/FooterSection";

const Lugares = () => {
  return (
    <div className="min-h-screen bg-background">
      <FloatingNav />
      <div className="pt-4">
        <InteractiveMap />
      </div>
      <FooterSection />
      <RealitoOrb />
    </div>
  );
};

export default Lugares;
