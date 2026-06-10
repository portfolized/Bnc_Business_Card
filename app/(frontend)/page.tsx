import Navbar from "@/components/Landing/Navbar";
import Hero from "@/components/Landing/Hero";
import DigitalCard from "@/components/Landing/DigitalCard";
import CustomizeCard from "@/components/Landing/CustomizeCard";
import HowItWorks from "@/components/Landing/HowItWorks";
import TransformIndustry from "@/components/Landing/TransformIndustry";
import Team from "@/components/Landing/Team";
import Testimonials from "@/components/Landing/Testimonials";
import Blog from "@/components/Landing/Blog";
import Pricing from "@/components/Landing/Pricing";
import FAQ from "@/components/Landing/FAQ";
import Newsletter from "@/components/Landing/Newsletter";
import Footer from "@/components/Landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <DigitalCard />
        <CustomizeCard />
        <HowItWorks />
        <TransformIndustry />
        {/* <Team /> */}
        <Testimonials />
        <Blog />
        <Pricing />
        <FAQ />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
