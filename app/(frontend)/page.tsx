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

const siteUrl = "https://www.bncbusinesscard.com";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      name: "BNC Business Card",
      alternateName: "BNC",
      url: siteUrl,
      logo: `${siteUrl}/logo.png`,
      description:
        "BNC Business Card provides smart NFC digital business cards that let professionals share contact details with a single tap.",
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: "BNC Business Card",
      publisher: { "@id": `${siteUrl}/#organization` },
    },
    {
      "@type": "Product",
      name: "BNC NFC Business Card",
      brand: { "@type": "Brand", name: "BNC" },
      category: "NFC Digital Business Card",
      description:
        "Smart NFC business card to instantly share your contact details, social links, and portfolio with a single tap — no app required.",
      url: siteUrl,
      image: `${siteUrl}/logo.png`,
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
