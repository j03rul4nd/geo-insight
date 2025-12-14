import Navbar from "@/components/Test_navbar";
import ColorBends from '@/components/ColorBends';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Aurora como fondo fijo */}
      <div className="fixed inset-0 -z-10">
        <ColorBends
          colors={["#ff6600", "#ffcc00", "#00ff88", "#0088ff", "#ff0088"]}
                  rotation={2}
                  speed={0.48}
                  scale={0.92}
                  frequency={0.99}
                  warpStrength={1.0}
                  mouseInfluence={0.1}
                  parallax={0.09}
                  noise={0.2}
                  transparent
                />
      </div>
      
      {/* Contenido principal */}
      <div className="relative z-10">
        <Navbar />
        {children}
      </div>
    </>
  );
}