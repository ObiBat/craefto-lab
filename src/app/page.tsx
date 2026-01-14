import { Header, Footer } from "@/components/layout";
import {
  Hero,
  ServicesOverview,
  SelectedWork,
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
        <CTABlock />
      </main>
      <Footer />
    </>
  );
}
