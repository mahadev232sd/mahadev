/** Same welcome ticker as Home (📢 + marquee) */
export default function AnnouncementBar({ className = 'mt-3' }) {
  return (
    <div className={`relative z-20 mx-3 ${className}`}>
      <div className="overflow-hidden rounded-xl border border-zinc-700/90 bg-[#0f1629] px-3 py-2.5 shadow-md">
        <div className="flex items-center gap-3">
          <span className="shrink-0 text-[22px] leading-none" role="img" aria-label="Announcement">
            📢
          </span>
          <div className="relative min-h-[22px] min-w-0 flex-1 overflow-hidden">
            <span className="home-announce-text text-sm font-semibold uppercase tracking-wide text-white">
              WELCOME TO MAHADEV
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
