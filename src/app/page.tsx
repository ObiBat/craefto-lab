import { Header, Footer } from "@/components/layout";
import {
  Hero,
  Positioning,
  ServicesOverview,
  SelectedWork,
  Process,
  CTABlock,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <Positioning />
        <ServicesOverview />
        <SelectedWork />
        <Process />
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
