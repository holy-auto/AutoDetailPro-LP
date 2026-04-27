import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Problems from "@/components/Problems";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Plans from "@/components/Plans";
import HowItWorks from "@/components/HowItWorks";
import Areas from "@/components/Areas";
import Comparison from "@/components/Comparison";
import Testimonials from "@/components/Testimonials";
import FAQ from "@/components/FAQ";
import ProRecruit from "@/components/ProRecruit";
import CTA from "@/components/CTA";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Stats />
        <Problems />
        <Features />
        <Services />
        <Plans />
        <HowItWorks />
        <Areas />
        <Comparison />
        <Testimonials />
        <FAQ />
        <ProRecruit />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
