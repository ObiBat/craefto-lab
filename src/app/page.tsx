import { Header, Footer } from "@/components/layout";
import {
  Hero,
  ServicesOverview,
  SelectedWork,
  ApproachProcess,
  CTABlock,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <ServicesOverview />
        <SelectedWork />
        <ApproachProcess />
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
