import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stats from "./components/Stats";
import Offers from "./components/Offers";
import Sectors from "./components/Sectors";
import Method from "./components/Method";
import Trust from "./components/Trust";
import Crm from "./components/Crm";
import Testimonials from "./components/Testimonials";
import Faq from "./components/Faq";
import Cta from "./components/Cta";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Stats />
        <Offers />
        <Sectors />
        <Method />
        <Trust />
        <Crm />
        <Testimonials />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
