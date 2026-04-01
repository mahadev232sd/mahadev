/** DR PLAY branding — reference layout */
export default function DrPlayLogo({ className = '' }) {
  return (
    <div className={`text-center ${className}`}>
      <div className="flex items-end justify-center gap-0.5">
        <span className="text-4xl font-black leading-none tracking-tight text-white sm:text-5xl">D</span>
        <span className="text-4xl font-black leading-none tracking-tight text-[#facc15] sm:text-5xl">R</span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-2 px-2">
        <span className="h-0.5 min-w-[1.5rem] flex-1 bg-[#facc15] sm:min-w-[2rem]" />
        <span className="text-xs font-bold uppercase tracking-[0.35em] text-[#facc15] sm:text-sm">PLAY</span>
        <span className="h-0.5 min-w-[1.5rem] flex-1 bg-[#facc15] sm:min-w-[2rem]" />
      </div>
    </div>
  );
}
