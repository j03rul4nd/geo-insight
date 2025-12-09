import Navbar from "@/components/Navbar";
import Aurora from '@/components/aurora';
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
        {/* <Aurora
          colorStops={["#3A29FF", "#FF94B4", "#FF3232"]}
          blend={0.5}
          amplitude={1.0}
          speed={0.5}
        /> */}
          
        {/* <ColorBends
  colors={["#ff6600", "#ffcc00", "#00ff88", "#0088ff", "#ff0088"]}
  rotation={135}
  speed={0.15}
  scale={0.4}
  frequency={0.8}
  warpStrength={0.6}
  mouseInfluence={0.3}
  parallax={0.2}
  noise={0.02}
  transparent
/> */}


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
        {/* <Navbar /> */}
        {children}
      </div>
    </>
  );
}