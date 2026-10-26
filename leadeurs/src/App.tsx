import Effects from "./components/Effects";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Stage from "./components/Stage";
import Ticker from "./components/Ticker";
import Bento from "./components/Bento";
import Sectors from "./components/Sectors";
import Method from "./components/Method";
import Reviews from "./components/Reviews";
import Faq from "./components/Faq";
import Final from "./components/Final";
import Footer from "./components/Footer";

export default function App() {
  return (
    <>
      <Effects />
      <Nav />
      <main>
        <Hero />
        <Stage />
        <Ticker />
        <Bento />
        <Sectors />
        <Method />
        <Reviews />
        <Faq />
        <Final />
      </main>
      <Footer />
    </>
  );
}
