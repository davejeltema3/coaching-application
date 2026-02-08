interface WelcomeScreenProps {
  onStart: () => void;
}

export default function WelcomeScreen({ onStart }: WelcomeScreenProps) {
  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-8 md:p-12 shadow-xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Apply for 1:1 Coaching
          </h1>
          <p className="text-lg md:text-xl text-slate-300 mb-8 leading-relaxed">
            Thanks for your interest in the <span className="text-blue-400 font-semibold">Boundless Creator Program</span>.
            This short application helps us figure out if we&apos;re a good fit.
          </p>
          <p className="text-slate-400 mb-10">Takes about 2 minutes.</p>
          <button
            onClick={onStart}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg px-8 py-4 rounded-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-blue-500/50"
          >
            Start Application →
          </button>
        </div>
      </div>
    </div>
  );
}
