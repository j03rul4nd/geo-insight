import Navbar from "@/components/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>     
      {/* Contenido principal */}
      <div className="relative z-10">
        {/* <Navbar /> */}
        {children}
      </div>
    </>
  );
}