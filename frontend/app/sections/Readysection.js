const ReadySection = () => {
  return (
    <section className="w-full h-fit py-16 sm:py-30 px-4 sm:px-30 lg:px-20 button-gradient flex flex-col justify-center items-center text-center">
      
      {/* Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold py-3 sm:py-10">
        Ready to Transform Your Creativity?
      </h1>

      {/* Subheading */}
      <h2 className="text-sm sm:text-xl md:text-2xl text-gray-100 font-semibold pb-6 sm:pb-20">
        Join thousands of creators using Aura.AI to bring their ideas to life
      </h2>

      {/* Button */}
      <button className="text-base sm:text-xl md:text-2xl font-semibold bg-white text-blue-700 rounded-lg py-2 sm:py-4 px-5 sm:px-7 md:px-9 flex items-center justify-center gap-2 hover:scale-105 transition-transform duration-200">
        Start Creating Free
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className="ml-1"
        >
          <path
            fill="none"
            stroke="blue"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M.75 12h22.5m-10.5 10.5L23.25 12L12.75 1.5"
          />
        </svg>
      </button>
    </section>
  );
};

export default ReadySection;
