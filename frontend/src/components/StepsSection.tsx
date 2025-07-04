const steps = [
  {
    title: "1. Upload Your Data",
    description: "Drag and drop your CSV or Excel files.",
  },
  {
    title: "2. Try Analyses & Visuals",
    description: "Use the trial space to preview different options.",
  },
  {
    title: "3. Explore Insights",
    description: "Generate full reports and download visualizations.",
  },
];

const StepsSection = () => {
  return (
    <section id="steps" className="min-h-auto flex flex-col justify-top text-center py-40">
      <h2 className="text-3xl text-amber-600 font-bold mb-10">How It Works</h2>
      <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 px-6 max-w-5xl mx-auto">
        {steps.map((step, idx) => (
          <div
            key={idx}
            className="bg-gray-50 shadow-md rounded-xl p-6 w-full md:w-1/3 border hover:shadow-lg transition"
          >
            <h3 className="text-xl text-amber-500 font-semibold mb-3">{step.title}</h3>
            <p className="text-amber-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StepsSection;
