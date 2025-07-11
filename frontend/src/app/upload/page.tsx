"use client";
import UploadSection from "@/components/UploadSection";
import Footer from "@/components/Footer";

const UploadPage = () => {
  return (
    <main> 
      <div className="min-h-screen px-6 py-40">
        <h1 className="text-3xl text-amber-600 font-bold text-center mb-10">Upload Your Data</h1>
        <UploadSection />
      </div>
      <Footer />
    </main>
  );
};

export default UploadPage;
