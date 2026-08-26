import React, { useEffect, useMemo, useState } from 'react';
import { Database, Save, Trophy, Medal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import { RaceParticipantInput, RaceRecord } from '../types';

interface QuickRaceSaveCardProps {
  lineup: RaceParticipantInput[];
  recordCount: number;
  serverConnected: boolean;
  onAddRecord: (record: Omit<RaceRecord, 'id'>) => Promise<RaceRecord>;
}

export const QuickRaceSaveCard: React.FC<QuickRaceSaveCardProps> = ({
  lineup,
  recordCount,
  serverConnected,
  onAddRecord,
}) => {
  const [winnerId, setWinnerId] = useState(lineup[0]?.conchId || '');
  const [secondId, setSecondId] = useState('');
  const [thirdId, setThirdId] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const participants = useMemo(() => lineup.slice(0, 6), [lineup]);

  useEffect(() => {
    const ids = participants.map((p) => p.conchId);
    if (!ids.includes(winnerId)) setWinnerId(ids[0] || '');
    if (secondId && !ids.includes(secondId)) setSecondId('');
    if (thirdId && !ids.includes(thirdId)) setThirdId('');
  }, [participants, winnerId, secondId, thirdId]);

  const nameOf = (id: string) => ALL_CONCHES.find((c) => c.id === id)?.name || id;
  const emojiOf = (p: RaceParticipantInput) => EMOTICON_CONFIGS[p.emoticon]?.emoji || '';

  const handleSave = async () => {
    setError('');
    setMessage('');

    if (participants.length !== 6 || new Set(participants.map((p) => p.conchId)).size !== 6) {
      setError('The current lineup must contain 6 different conches.');
      return;
    }
    if (!winnerId) {
      setError('Select the actual winner (1st place) before saving.');
      return;
    }
    if (secondId === winnerId || thirdId === winnerId || (secondId && thirdId && secondId === thirdId)) {
      setError('1st, 2nd and 3rd place must be different.');
      return;
    }

    setSaving(true);
    try {
      await onAddRecord({
        timestamp: Date.now(),
        raceNumber: recordCount + 1,
        participants,
        winnerId,
        secondId: secondId || undefined,
        thirdId: thirdId || undefined,
        notes: notes.trim() || undefined,
      });
      setMessage(`Race #${recordCount + 1} saved to the shared D1 database.`);
      setNotes('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save this race to the shared database.');
    } finally {
      setSaving(false);
    }
  };

  const placeOptions = (exclude: string[]) => participants.filter((p) => !exclude.includes(p.conchId));

  return (
    <section id="quick-save-race" className="bg-slate-900/95 rounded-2xl border border-emerald-500/20 shadow-lg overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-black text-slate-100">Record Actual Race Result</h2>
            <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${serverConnected ? 'text-emerald-300 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-300 bg-amber-500/10 border-amber-500/30'}`}>
              {serverConnected ? 'D1 CONNECTED' : 'D1 OFFLINE'}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Save the real race result after the race finishes. This is independent of the Monte Carlo prediction.
          </p>
        </div>
        <div className="text-[11px] text-slate-500">{recordCount} historical races</div>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="flex items-center gap-1 text-xs font-black text-amber-300 mb-1.5"><Trophy className="w-3.5 h-3.5" /> Winner (1st) *</label>
            <select value={winnerId} onChange={(e) => setWinnerId(e.target.value)} className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-3 py-2.5 text-sm font-bold text-amber-200">
              {participants.map((p) => <option key={p.conchId} value={p.conchId}>{emojiOf(p)} {nameOf(p.conchId)}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-black text-slate-300 mb-1.5"><Medal className="w-3.5 h-3.5" /> 2nd place</label>
            <select value={secondId} onChange={(e) => setSecondId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200">
              <option value="">-- Not recorded --</option>
              {placeOptions([winnerId]).map((p) => <option key={p.conchId} value={p.conchId}>{emojiOf(p)} {nameOf(p.conchId)}</option>)}
            </select>
          </div>
          <div>
            <label className="flex items-center gap-1 text-xs font-black text-slate-300 mb-1.5"><Medal className="w-3.5 h-3.5" /> 3rd place</label>
            <select value={thirdId} onChange={(e) => setThirdId(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm font-bold text-slate-200">
              <option value="">-- Not recorded --</option>
              {placeOptions([winnerId, secondId]).map((p) => <option key={p.conchId} value={p.conchId}>{emojiOf(p)} {nameOf(p.conchId)}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 block mb-1.5">Race notes (optional)</label>
          <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. actual race result, track condition, unusual event..." className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600" />
        </div>

        {error && <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-300"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
        {message && <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-xs text-emerald-300"><CheckCircle2 className="w-4 h-4 shrink-0" />{message}</div>}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <p className="text-[11px] text-slate-500">The selected winner is the <strong className="text-slate-300">actual race winner</strong>, not the AI prediction.</p>
          <button type="button" onClick={handleSave} disabled={saving || !serverConnected} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-black text-xs shadow-lg shadow-emerald-900/30 transition">
            <Save className="w-4 h-4" />
            {saving ? 'Saving to Shared Database…' : '💾 Save Race to Shared Database'}
          </button>
        </div>
      </div>
    </section>
  );
};
