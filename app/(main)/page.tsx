import Navbar from "@/components/Test_navbar";
import { HeroSection } from "@/components/herosectionGis";
import {EarlyAccessCTA} from "@/components/RealTwinEarlyAccess";
import { RealTwinWhyItMatters } from "@/components/RealTwinWhyItMatters";
import { Capabilities } from "@/components/DigitalTwinCaptabilities";
import { Footer } from "@/components/footergis";
export default function Home() {
  return (
    <div className="font-sans">
        <Navbar />
        <HeroSection />
        <Capabilities />
        <RealTwinWhyItMatters />
        <EarlyAccessCTA />
        <Footer />
    </div>
  );
}
