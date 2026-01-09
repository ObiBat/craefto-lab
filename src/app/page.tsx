import { Header, Footer } from "@/components/layout";
import {
  Hero,
  SocialProof,
  Positioning,
  ServicesOverview,
  SelectedWork,
  Metrics,
  Process,
  CTABlock,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <SocialProof />
        <Positioning />
        <ServicesOverview />
        <SelectedWork />
        <Metrics />
        <Process />
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
