import Header from "@/components/Header";
import NewsTicker from "@/components/NewsTicker";
import Hero from "@/components/Hero";
import Stats from "@/components/Stats";
import Problems from "@/components/Problems";
import Features from "@/components/Features";
import Services from "@/components/Services";
import Plans from "@/components/Plans";
import HowItWorks from "@/components/HowItWorks";
import Areas from "@/components/Areas";
import Comparison from "@/components/Comparison";
import Stories from "@/components/Stories";
import Media from "@/components/Media";
import FAQ from "@/components/FAQ";
import ProRecruit from "@/components/ProRecruit";
import CTA from "@/components/CTA";
import SeoContent from "@/components/SeoContent";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { faqs } from "@/data/faq";
import {
  organizationLd,
  websiteLd,
  serviceLd,
  mobileApplicationLd,
  faqLd,
  breadcrumbLd,
  localBusinessLd,
} from "@/lib/seo";

export default function Home() {
  return (
    <>
      <JsonLd
        id="ld-graph"
        data={[
          organizationLd(),
          websiteLd(),
          serviceLd(),
          localBusinessLd(),
          mobileApplicationLd(),
          faqLd(faqs),
          breadcrumbLd(),
        ]}
      />
      <Header />
      <main>
        <NewsTicker />
        <Hero />
        <Stats />
        <Problems />
        <Features />
        <Services />
        <HowItWorks />
        <Plans />
        <Comparison />
        <Areas />
        <Stories />
        <Media />
        <ProRecruit />
        <FAQ />
        <SeoContent />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
