import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Sectors from "./components/Sectors";
import Method from "./components/Method";
import Guarantees from "./components/Guarantees";
import Crm from "./components/Crm";
import Testimonials from "./components/Testimonials";
import Faq from "./components/Faq";
import FinalCta from "./components/FinalCta";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Sectors />
        <Method />
        <Guarantees />
        <Crm />
        <div className="paper">
          <Testimonials />
          <Faq />
        </div>
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
