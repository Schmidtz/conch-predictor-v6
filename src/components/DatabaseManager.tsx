import React, { useState } from 'react';
import { Conch, ConchStats, EmoticonType, RaceParticipantInput, RaceRecord } from '../types';
import { ALL_CONCHES, EMOTICON_CONFIGS } from '../data/defaultConches';
import { ConchAvatar } from './ConchAvatar';
import {
  Plus,
  Trash2,
  Download,
  Upload,
  Trophy,
  Filter,
  Search,
  Calendar,
  Sparkles,
  AlertCircle,
  FileSpreadsheet,
  RotateCcw,
  CheckCircle2,
  Eye,
} from 'lucide-react';

interface DatabaseManagerProps {
  records: RaceRecord[];
  databaseStats: Record<string, ConchStats>;
  onAddRecord: (record: Omit<RaceRecord, 'id'>) => void;
  onDeleteRecord: (id: string) => void;
  onClearDatabase: () => void;
  onImportRecords: (records: RaceRecord[]) => void;
  onSeedScreenshotData: () => void;
  currentLineup: RaceParticipantInput[];
}

export const DatabaseManager: React.FC<DatabaseManagerProps> = ({
  records,
  databaseStats,
  onAddRecord,
  onDeleteRecord,
  onClearDatabase,
  onImportRecords,
  onSeedScreenshotData,
  currentLineup,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterConch, setFilterConch] = useState<string>('all');

  // Form State for Manual Race Entry
  const [formParticipants, setFormParticipants] = useState<RaceParticipantInput[]>([
    { conchId: 'karl', emoticon: 'cool', popularity: 20 },
    { conchId: 'dejavu', emoticon: 'happy', popularity: 15 },
    { conchId: 'crazy_conch', emoticon: 'nervous', popularity: 10 },
    { conchId: 'blackhat', emoticon: 'angry', popularity: 30 },
    { conchId: 'galloping_tractor', emoticon: 'nervous', popularity: 15 },
    { conchId: 'gold_miner', emoticon: 'happy', popularity: 10 },
  ]);
  const [formWinner, setFormWinner] = useState<string>('karl');
  const [formSecond, setFormSecond] = useState<string>('blackhat');
  const [formThird, setFormThird] = useState<string>('dejavu');
  const [formNotes, setFormNotes] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Quick populate form with current line up
  const handleLoadCurrentLineupToForm = () => {
    if (currentLineup && currentLineup.length > 0) {
      setFormParticipants([...currentLineup]);
      setFormWinner(currentLineup[0].conchId);
      setFormSecond(currentLineup[1]?.conchId || '');
      setFormThird(currentLineup[2]?.conchId || '');
    }
  };

  const handleSaveRace = async (e: React.FormEvent) => {
    e.preventDefault();
    const ids = formParticipants.map((p) => p.conchId);
    const uniqueIds = new Set(ids);
    if (formParticipants.length !== 6 || uniqueIds.size !== 6) {
      alert('Please select 6 different conches.');
      return;
    }
    if (!formWinner || !ids.includes(formWinner)) {
      alert('Please select the conch that won (1st place).');
      return;
    }
    if (formSecond && formSecond === formWinner) {
      alert('2nd place cannot be the winner.');
      return;
    }
    if (formThird && [formWinner, formSecond].includes(formThird)) {
      alert('3rd place must be different from 1st and 2nd place.');
      return;
    }

    setIsSaving(true);
    try {
      await Promise.resolve(onAddRecord({
        timestamp: Date.now(),
        raceNumber: records.length + 1,
        participants: formParticipants,
        winnerId: formWinner,
        secondId: formSecond || undefined,
        thirdId: formThird || undefined,
        notes: formNotes,
      }));
      setShowAddModal(false);
      setFormNotes('');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Could not save the race to the shared database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(records, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conch-race-history-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON / CSV
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          onImportRecords(parsed);
          alert(`Successfully imported ${parsed.length} race records!`);
        } else {
          alert('Invalid file format. Expected a JSON array of race records.');
        }
      } catch (err) {
        alert('Failed to parse file. Please upload a valid JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (filterConch !== 'all') {
      const hasConch =
        r.winnerId === filterConch ||
        r.participants.some((p) => p.conchId === filterConch);
      if (!hasConch) return false;
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const winnerName =
        ALL_CONCHES.find((c) => c.id === r.winnerId)?.name.toLowerCase() || '';
      const notes = r.notes?.toLowerCase() || '';
      const raceNum = `#${r.raceNumber}`;
      return (
        winnerName.includes(term) ||
        notes.includes(term) ||
        raceNum.includes(term)
      );
    }
    return true;
  });

  return (
    <div id="database-manager" className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/90 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-100 tracking-tight">
              Historical Race Database
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {records.length} Recorded Races
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manually record race results, emoticons, and placements to continuously train the prediction model.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-add-race-modal"
            type="button"
            onClick={() => {
              handleLoadCurrentLineupToForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Race</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            disabled={records.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer disabled:opacity-50"
            title="Export database as JSON"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          <label
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-bold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
            title="Import JSON database"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={onSeedScreenshotData}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs rounded-xl border border-amber-500/30 transition cursor-pointer"
            title="Load sample race results based on screenshot lineups"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Load Sample Races</span>
          </button>

          {records.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Are you sure you want to clear all race records?')) {
                  onClearDatabase();
                }
              }}
              className="p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-xl border border-rose-900/50 transition cursor-pointer"
              title="Clear Database"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by winner or race #..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-950 text-xs text-slate-200 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-bold text-slate-300">Filter Conch:</span>
          <select
            value={filterConch}
            onChange={(e) => setFilterConch(e.target.value)}
            className="bg-slate-950 text-xs font-bold text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="all" className="bg-slate-900 text-slate-200">All 9 Conches</option>
            {ALL_CONCHES.map((c) => (
              <option key={c.id} value={c.id} className="bg-slate-900 text-slate-200">
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Race Records Table */}
      {records.length === 0 ? (
        <div className="bg-slate-900/90 rounded-2xl p-12 text-center border-2 border-dashed border-slate-800 space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center mx-auto">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-100">Database is Currently Empty</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            As requested, no past records are preset. You can log real game race results manually, or
            click "Load Sample Races" to preview statistical calculations.
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                handleLoadCurrentLineupToForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
            >
              + Record 1st Race Result
            </button>
            <button
              type="button"
              onClick={onSeedScreenshotData}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 cursor-pointer transition"
            >
              Load Screenshot Lineups
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                  <th className="p-3">Race #</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Winner (1st)</th>
                  <th className="p-3">2nd Place</th>
                  <th className="p-3">3rd Place</th>
                  <th className="p-3">Field & Morale</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredRecords.map((rec) => {
                  const winner = ALL_CONCHES.find((c) => c.id === rec.winnerId);
                  const second = ALL_CONCHES.find((c) => c.id === rec.secondId);
                  const third = ALL_CONCHES.find((c) => c.id === rec.thirdId);
                  const winnerParticipant = rec.participants.find(
                    (p) => p.conchId === rec.winnerId
                  );

                  return (
                    <tr key={rec.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-black text-slate-200">
                        #{rec.raceNumber}
                      </td>
                      <td className="p-3 text-slate-400">
                        {new Date(rec.timestamp).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold text-sm">👑</span>
                          <span className="font-bold text-slate-100">
                            {winner?.name || rec.winnerId}
                          </span>
                          {winnerParticipant && (
                            <span className="text-xs">
                              {EMOTICON_CONFIGS[winnerParticipant.emoticon].emoji}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        {second ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-bold">🥈</span>
                            <span>{second.name.split(',')[0]}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3 text-slate-300 font-medium">
                        {third ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-amber-500 font-bold">🥉</span>
                            <span>{third.name.split(',')[0]}</span>
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {rec.participants.map((p, idx) => {
                            const c = ALL_CONCHES.find((conch) => conch.id === p.conchId);
                            const em = EMOTICON_CONFIGS[p.emoticon];
                            const isWin = p.conchId === rec.winnerId;

                            return (
                              <span
                                key={idx}
                                title={`${c?.name}: ${em.name}`}
                                className={`px-1.5 py-0.5 rounded text-[11px] font-bold border flex items-center gap-0.5 ${
                                  isWin
                                    ? 'bg-blue-600/30 text-blue-300 border-blue-500/50 ring-1 ring-blue-500'
                                    : 'bg-slate-950/60 text-slate-400 border-slate-800'
                                }`}
                              >
                                <span>{em.emoji}</span>
                                <span className="hidden sm:inline text-[10px]">
                                  {c?.name.split(' ')[0]}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteRecord(rec.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add New Race Result Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-slate-100">
                  Record Past Race Result
                </h3>
                <p className="text-xs text-slate-400">
                  Enter the 6 conches, their morale, then explicitly select the winner, 2nd, and 3rd.
                  The race is saved to the shared Cloudflare D1 database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-200 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveRace} className="space-y-4">
              {/* Participating Conches (6) */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">
                  1. Six Competing Conches & Morale:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {formParticipants.map((p, idx) => {
                    const c = ALL_CONCHES.find((conch) => conch.id === p.conchId);

                    return (
                      <div
                        key={idx}
                        className="p-2.5 bg-slate-950/70 rounded-xl border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <span className="w-5 h-5 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/30 font-bold text-xs flex items-center justify-center flex-shrink-0">
                          {idx + 1}
                        </span>

                        <select
                          value={p.conchId}
                          onChange={(e) => {
                            const newId = e.target.value;
                            const next = [...formParticipants];
                            next[idx].conchId = newId;
                            setFormParticipants(next);
                          }}
                          className="bg-slate-900 text-xs font-bold text-slate-100 p-1.5 rounded-lg border border-slate-700 flex-1"
                        >
                          {ALL_CONCHES.map((conch) => (
                            <option key={conch.id} value={conch.id} className="bg-slate-900 text-slate-100">
                              {conch.name}
                            </option>
                          ))}
                        </select>

                        <select
                          value={p.emoticon}
                          onChange={(e) => {
                            const next = [...formParticipants];
                            next[idx].emoticon = e.target.value as EmoticonType;
                            setFormParticipants(next);
                          }}
                          className="bg-slate-900 text-xs p-1.5 rounded-lg border border-slate-700 text-slate-100"
                        >
                          <option value="cool" className="bg-slate-900">😎 Cool</option>
                          <option value="happy" className="bg-slate-900">😁 Happy</option>
                          <option value="nervous" className="bg-slate-900">😲 Sweat</option>
                          <option value="distressed" className="bg-slate-900">💣 Bomb</option>
                          <option value="angry" className="bg-slate-900">😡 Angry</option>
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Placements: Winner, 2nd, 3rd */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div>
                  <label className="text-xs font-bold text-amber-400 block mb-1">
                    👑 Winner (1st)
                  </label>
                  <select
                    value={formWinner}
                    onChange={(e) => setFormWinner(e.target.value)}
                    required
                    className="w-full bg-slate-950 text-xs font-bold text-amber-300 p-2 rounded-xl border border-amber-500/50 focus:ring-1 focus:ring-blue-500"
                  >
                    {formParticipants.map((p) => {
                      const c = ALL_CONCHES.find((conch) => conch.id === p.conchId);
                      return (
                        <option key={p.conchId} value={p.conchId} className="bg-slate-900 text-slate-100">
                          {c?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    🥈 2nd Place (Optional)
                  </label>
                  <select
                    value={formSecond}
                    onChange={(e) => setFormSecond(e.target.value)}
                    className="w-full bg-slate-950 text-xs font-medium text-slate-200 p-2 rounded-xl border border-slate-700"
                  >
                    <option value="" className="bg-slate-900">-- None --</option>
                    {formParticipants.map((p) => {
                      const c = ALL_CONCHES.find((conch) => conch.id === p.conchId);
                      return (
                        <option key={p.conchId} value={p.conchId} className="bg-slate-900 text-slate-100">
                          {c?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 block mb-1">
                    🥉 3rd Place (Optional)
                  </label>
                  <select
                    value={formThird}
                    onChange={(e) => setFormThird(e.target.value)}
                    className="w-full bg-slate-950 text-xs font-medium text-slate-200 p-2 rounded-xl border border-slate-700"
                  >
                    <option value="" className="bg-slate-900">-- None --</option>
                    {formParticipants.map((p) => {
                      const c = ALL_CONCHES.find((conch) => conch.id === p.conchId);
                      return (
                        <option key={p.conchId} value={p.conchId} className="bg-slate-900 text-slate-100">
                          {c?.name}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-1">
                  Race Notes / Details:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Screenshot #1 round, Karl had dark sweat"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-slate-950 text-xs text-slate-200 p-2 rounded-xl border border-slate-700 placeholder-slate-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-700 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-900/30 cursor-pointer disabled:cursor-wait transition"
                >
                  {isSaving ? 'Saving to Shared Database…' : '💾 Save Race to Shared Database'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
