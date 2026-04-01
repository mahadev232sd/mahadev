import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import IdsTopNav from '../components/IdsTopNav';
import AnnouncementBar from '../components/AnnouncementBar';
import ActiveIdRow from '../components/ActiveIdRow';
import CreateIdModal from '../components/CreateIdModal';
import api from '../api/client';

function effectiveApproval(g) {
  if (!g) return null;
  return g.approvalStatus || 'approved';
}

export default function Ids() {
  const [platforms, setPlatforms] = useState([]);
  const [gameIds, setGameIds] = useState([]);
  const [tab, setTab] = useState('mine');
  const [modalPlatform, setModalPlatform] = useState(null);

  const load = useCallback(async () => {
    const [pRes, gRes] = await Promise.all([api.get('/game-ids/platforms'), api.get('/game-ids')]);
    setPlatforms(pRes.data.platforms || []);
    setGameIds(gRes.data.gameIds || []);
  }, []);

  useEffect(() => {
    load().catch(() => toast.error('Failed to load IDs'));
  }, [load]);

  const byPlatform = useMemo(() => {
    const m = new Map(gameIds.map((g) => [g.platformName, g]));
    return m;
  }, [gameIds]);

  const mergeList = useMemo(
    () => platforms.map((p) => ({ platform: p, gameId: byPlatform.get(p.name) || null })),
    [platforms, byPlatform]
  );

  const activeList = useMemo(
    () =>
      mergeList.filter(
        (x) => x.gameId && effectiveApproval(x.gameId) === 'approved' && x.gameId.status === 'active'
      ),
    [mergeList]
  );

  const pendingList = useMemo(
    () => mergeList.filter((x) => x.gameId && effectiveApproval(x.gameId) === 'pending'),
    [mergeList]
  );

  const rejectedList = useMemo(
    () => mergeList.filter((x) => x.gameId && effectiveApproval(x.gameId) === 'rejected'),
    [mergeList]
  );

  const openCreateModal = (platform) => setModalPlatform(platform);

  const onCreated = (doc) => {
    setGameIds((prev) => {
      const rest = prev.filter((g) => g.platformName !== doc.platformName);
      return [doc, ...rest];
    });
    setTab('mine');
    window.dispatchEvent(new Event('mahadev:game-ids-changed'));
  };

  const onRowRefresh = (updated) => {
    if (!updated) {
      load();
      return;
    }
    setGameIds((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
  };

  const activeCount = activeList.length;

  return (
    <div className="min-h-[calc(100vh-5rem)] bg-[#0e0e0e] pb-4">
      <IdsTopNav />

      <AnnouncementBar className="mt-1" />

      <div className="mx-3 mt-3 space-y-3">
        <div className="flex gap-2 rounded-2xl bg-[#1a1a1a] p-1">
          <button
            type="button"
            onClick={() => setTab('mine')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              tab === 'mine'
                ? 'bg-zinc-600 text-white shadow'
                : 'border border-transparent bg-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            MY IDs ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setTab('create')}
            className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
              tab === 'create'
                ? 'bg-zinc-600 text-white shadow'
                : 'border border-accent-blue/80 bg-zinc-900/60 text-zinc-400'
            }`}
          >
            CREATE ID
          </button>
        </div>

        {tab === 'mine' && (
          <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-4">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-white">My IDs ({activeCount})</h2>
              <p className="text-sm text-zinc-500">Manage your gaming ID</p>
            </div>

            {pendingList.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-amber-400/90">
                  Pending approval
                </p>
                {pendingList.map(({ platform, gameId }) => (
                  <div
                    key={gameId._id}
                    className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-3 py-3 text-sm"
                  >
                    <p className="font-semibold text-white">{platform.name}</p>
                    <p className="text-zinc-400">
                      Username: <span className="text-zinc-200">{gameId.username || '—'}</span>
                    </p>
                    <p className="mt-1 text-xs text-amber-200/80">
                      Waiting for admin. You’ll see ID & password after approval.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {rejectedList.length > 0 && (
              <div className="mb-4 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-red-400/90">Rejected</p>
                {rejectedList.map(({ platform }) => (
                  <div
                    key={platform.name}
                    className="rounded-2xl border border-red-500/25 bg-red-950/15 px-3 py-2 text-sm text-zinc-400"
                  >
                    {platform.name} — use <strong className="text-zinc-300">CREATE ID</strong> to submit
                    again.
                  </div>
                ))}
              </div>
            )}

            {activeCount === 0 && pendingList.length === 0 && rejectedList.length === 0 ? (
              <p className="py-8 text-center text-sm text-zinc-500">
                No IDs yet. Use <strong className="text-zinc-400">CREATE ID</strong> to add one.
              </p>
            ) : activeCount > 0 ? (
              <ul className="space-y-3">
                {activeList.map(({ platform, gameId }) => (
                  <li key={gameId._id}>
                    <ActiveIdRow platform={platform} gameId={gameId} onRefresh={onRowRefresh} />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

        {tab === 'create' && (
          <div className="rounded-2xl border border-zinc-800 bg-[#151515] p-4">
            <h2 className="mb-3 text-lg font-semibold text-white">Choose platform</h2>
            <div className="space-y-3">
              {platforms.map((p) => {
                const g = byPlatform.get(p.name);
                const appr = effectiveApproval(g);
                const blocked = g && appr !== 'rejected';
                return (
                  <div
                    key={p.name}
                    className="flex items-center gap-3 rounded-2xl border border-zinc-800/80 bg-[#1a1a1a] px-4 py-3"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-bold text-accent-yellow">
                      {p.name.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-white">{p.name}</p>
                      <p className="truncate text-xs text-zinc-500">{p.url}</p>
                    </div>
                    <button
                      type="button"
                      disabled={blocked}
                      onClick={() => openCreateModal(p)}
                      className="shrink-0 rounded-full bg-accent-blue px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-40"
                    >
                      {appr === 'pending'
                        ? 'Pending'
                        : appr === 'approved'
                          ? 'Created'
                          : appr === 'rejected'
                            ? 'Try again'
                            : 'Create'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {modalPlatform && (
        <CreateIdModal
          platform={modalPlatform}
          onClose={() => setModalPlatform(null)}
          onCreated={onCreated}
        />
      )}
    </div>
  );
}
