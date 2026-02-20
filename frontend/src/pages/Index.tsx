import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import GraphDemo from "@/components/GraphDemo";
import DashboardPreview from "@/components/DashboardPreview";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <Hero />
    <Features />
    <GraphDemo />
    <DashboardPreview />
    <Contact />
    <Footer />
  </div>
);

export default Index;
