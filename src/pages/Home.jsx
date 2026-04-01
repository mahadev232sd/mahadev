import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { Globe, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import WalletModal from '../components/WalletModal';
import GameIdCard from '../components/GameIdCard';
import CreateIdModal from '../components/CreateIdModal';
import AnnouncementBar from '../components/AnnouncementBar';
import api from '../api/client';

/* Light blue line-art (wallets / cards) on orange banner — reference style */
const patternSvg = encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160">
  <g fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.42">
    <g transform="rotate(-8 40 50)">
      <rect x="12" y="38" width="52" height="36" rx="5"/>
      <path d="M18 46h40v7H18z"/>
      <circle cx="52" cy="62" r="3"/>
    </g>
    <g transform="rotate(12 118 44)">
      <rect x="88" y="22" width="42" height="28" rx="4"/>
      <path d="M94 30h30M94 38h22"/>
    </g>
    <g transform="rotate(6 28 108)">
      <rect x="8" y="96" width="44" height="30" rx="4"/>
      <path d="M14 108h32v5H14z"/>
    </g>
    <g transform="rotate(-14 130 100)">
      <rect x="104" y="86" width="46" height="32" rx="5"/>
      <path d="M110 96h18l-8 12h20"/>
    </g>
  </g>
</svg>
`);

export default function Home() {
  const { user, refreshUser } = useAuth();
  const [modal, setModal] = useState(null);
  const [createModalPlatform, setCreateModalPlatform] = useState(null);
  const [platforms, setPlatforms] = useState([]);
  const [gameIds, setGameIds] = useState([]);
  const homePrevRef = useRef(null);
  const homeNextRef = useRef(null);

  const load = useCallback(async () => {
    const [pRes, gRes] = await Promise.all([api.get('/game-ids/platforms'), api.get('/game-ids')]);
    setPlatforms(pRes.data.platforms || []);
    setGameIds(gRes.data.gameIds || []);
  }, []);

  useEffect(() => {
    load().catch(() => {});
  }, [load]);

  const byPlatform = useMemo(() => new Map(gameIds.map((g) => [g.platformName, g])), [gameIds]);

  const mergeList = useMemo(
    () => platforms.map((p) => ({ platform: p, gameId: byPlatform.get(p.name) || null })),
    [platforms, byPlatform]
  );

  const createdCount = useMemo(
    () =>
      gameIds.filter(
        (g) => (g.approvalStatus || 'approved') === 'approved' && g.status === 'active'
      ).length,
    [gameIds]
  );

  const onIdRequestCreated = (doc) => {
    setGameIds((prev) => {
      const rest = prev.filter((g) => g.platformName !== doc.platformName);
      return [doc, ...rest];
    });
    window.dispatchEvent(new Event('mahadev:game-ids-changed'));
  };

  const onCardRefresh = (updated) => {
    if (!updated) load();
    else setGameIds((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
  };

  const bal = Number(user?.walletBalance ?? 0).toLocaleString('en-IN');

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0e0e0e] pb-4">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-orange-600 px-4 pb-5 pt-4">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,${patternSvg}")`,
            backgroundSize: '120px 120px',
          }}
        />

        <div className="relative z-10 flex items-center justify-between">
          <Link
            to="/profile"
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/25 text-base font-bold text-white ring-2 ring-white/30 transition hover:bg-black/35 active:scale-95"
            aria-label="Open profile"
          >
            {(user?.name?.charAt(0) ?? 'U').toUpperCase()}
          </Link>
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-black/20 px-3.5 py-2 text-sm font-semibold text-black/85 backdrop-blur-sm"
          >
            <Globe className="h-4 w-4" /> EN
          </button>
        </div>

        {/* Wallet: 3 cards — sides nearly as tall as center, vertically centered, overlap only horizontal */}
        <div className="relative z-10 mx-auto mt-4 flex w-full max-w-[420px] items-center justify-center px-2 pb-1">
          {/* Left — Deposit (bigger; sits behind center via z-index) */}
          <button
            type="button"
            onClick={() => setModal({ type: 'deposit', gameId: null })}
            className="relative z-[8] flex h-[148px] w-[clamp(104px,32vw,140px)] shrink-0 flex-col items-center justify-center gap-3 overflow-visible rounded-[22px] border border-zinc-700/90 bg-black py-3 pr-1 pl-3 shadow-[6px_14px_24px_rgba(0,0,0,0.5)] -mr-7 transition hover:brightness-110 active:brightness-95"
          >
            <span className="max-w-[100%] px-0.5 text-center text-[11px] font-bold uppercase leading-tight tracking-wide text-white">
              Deposit
            </span>
            <img src="/arrowup.svg" alt="" className="h-7 w-7 object-contain" width={28} height={28} />
          </button>

          {/* Center — slightly taller & forward; same vertical middle as siblings */}
          <div className="relative z-20 flex h-[162px] w-[clamp(156px,46%,210px)] shrink-0 flex-col justify-center rounded-[24px] border border-white/10 bg-black px-3 py-3 shadow-[0_24px_44px_rgba(0,0,0,0.6)]">
            <div className="text-center">
              <p className="text-[26px] font-black leading-none tracking-tight text-white">MAHADEV</p>
              <div className="mx-auto mt-1.5 w-full max-w-[148px] rounded-md bg-amber-400 px-2 py-1 shadow-inner">
                <p className="text-center text-[10px] font-extrabold uppercase tracking-[0.2em] text-black">BOOK</p>
              </div>
              <p className="mt-2 text-[8px] font-normal uppercase tracking-[0.2em] text-zinc-400">Wallet balance</p>
              <div className="mt-1 flex items-center justify-center gap-1.5">
                <Coins className="h-6 w-6 shrink-0 text-white" strokeWidth={1.6} aria-hidden />
                <span className="text-2xl font-bold tabular-nums text-white">₹{bal}</span>
              </div>
            </div>
          </div>

          {/* Right — Withdraw */}
          <button
            type="button"
            onClick={() => setModal({ type: 'withdraw', gameId: null })}
            className="relative z-[8] flex h-[148px] w-[clamp(104px,32vw,140px)] shrink-0 flex-col items-center justify-center gap-3 overflow-visible rounded-[22px] border border-zinc-700/90 bg-black py-3 pl-1 pr-3 shadow-[-6px_14px_24px_rgba(0,0,0,0.5)] -ml-7 transition hover:brightness-110 active:brightness-95"
          >
            <span className="max-w-[100%] px-0.5 text-center text-[11px] font-bold uppercase leading-tight tracking-wide text-white">
              Withdraw
            </span>
            <img src="/arrowdown.svg" alt="" className="h-7 w-7 object-contain" width={28} height={28} />
          </button>
        </div>
      </div>

      <AnnouncementBar />

      {/* My IDs — bordered rounded panel */}
      <div className="mx-3 mt-3 rounded-2xl border border-zinc-800 bg-[#151515] p-4 shadow-inner">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold text-white">My IDs ({createdCount})</h2>
            <p className="mt-0.5 text-sm text-zinc-500">Manage your gaming ID</p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/ids"
              className="rounded-xl bg-accent-blue px-3 py-2 text-xs font-bold text-white shadow-[0_0_20px_rgba(52,152,219,0.25)] hover:brightness-110"
            >
              Get New Id
            </Link>
            <button
              ref={homePrevRef}
              type="button"
              className="rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 text-white shadow hover:bg-zinc-700 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              ref={homeNextRef}
              type="button"
              className="rounded-lg border border-zinc-600 bg-zinc-800 p-2.5 text-white shadow hover:bg-zinc-700 active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <Swiper
          modules={[Navigation]}
          slidesPerView={2}
          spaceBetween={14}
          slidesPerGroup={1}
          watchOverflow
          breakpoints={{
            0: { slidesPerView: 1.1, spaceBetween: 12 },
            520: { slidesPerView: 2, spaceBetween: 14 },
          }}
          navigation
          onBeforeInit={(swiper) => {
            const n = swiper.params.navigation;
            if (n && typeof n === 'object') {
              n.prevEl = homePrevRef.current;
              n.nextEl = homeNextRef.current;
            }
          }}
          onSwiper={(swiper) => {
            queueMicrotask(() => {
              swiper.navigation?.init();
              swiper.navigation?.update();
            });
          }}
          className="id-cards-swiper w-full !overflow-hidden !pb-3 !pt-1"
        >
          {mergeList.map(({ platform, gameId }) => (
            <SwiperSlide key={platform.name} className="!h-auto">
              <GameIdCard
                platform={platform}
                gameId={gameId}
                onRefresh={onCardRefresh}
                onCreate={(p) => setCreateModalPlatform(p)}
                onOpenWallet={(m) => setModal(m)}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {modal && (
        <WalletModal
          type={modal.type}
          gameId={modal.gameId || undefined}
          onClose={() => setModal(null)}
          onSuccess={refreshUser}
        />
      )}
      {createModalPlatform && (
        <CreateIdModal
          platform={createModalPlatform}
          onClose={() => setCreateModalPlatform(null)}
          onCreated={onIdRequestCreated}
        />
      )}
    </div>
  );
}
