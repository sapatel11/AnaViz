import Image from "next/image";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center px-6 pt-10">
      <div className="max-w-7xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-amber-700">
            Visualize and Understand Your Data with AnaViz
          </h1>
          <p className="text-lg text-amber-600 mb-8">
            Upload your dataset and instantly explore powerful visualizations and statistical insights. Try before applying full analysis using our trial space.
          </p>
          <Link
            href="/upload"
            className="inline-block bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-full font-semibold transition"
          >
            Get Started
          </Link>
        </div>

        {/* Right Column - Image */}
        <div className="w-full relative h-80 md:h-[400px] opacity-80">
          <Image
            src="/images/hero-preview.png"
            alt="AnaViz Dashboard Preview"
            fill
            className="object-contain rounded-xl shadow-lg"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
