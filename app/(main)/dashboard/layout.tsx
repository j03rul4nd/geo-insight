import Navbar from "@/components/Test_navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>     
      {/* Contenido principal */}
      <div className="relative z-10">
        <Navbar />
        {children}
      </div>
    </>
  );
}