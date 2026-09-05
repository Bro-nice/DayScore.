import React, { useState, useMemo } from 'react';
import { JournalEntry } from '../types';
import { 
  Calendar, 
  Search, 
  Sparkles, 
  ArrowUpRight, 
  ShieldCheck, 
  CheckCircle2, 
  Trophy, 
  Clock, 
  Filter,
  FileText,
  ChevronRight,
  TrendingUp,
  Flame,
  Award
} from 'lucide-react';

interface ReflectionArchiveProps {
  journals: JournalEntry[];
  todayDateStr: string;
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  onViewEvaluation: (evaluation: any) => void;
}

export default function ReflectionArchive({
  journals,
  todayDateStr,
  selectedDate,
  onSelectDate,
  onViewEvaluation,
}: ReflectionArchiveProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState<'all' | 'exceptional' | 'strong' | 'decent' | 'growth'>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Sorted and filtered all-time entries
  const filteredJournals = useMemo(() => {
    let list = [...journals];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(j => 
        (j.text && j.text.toLowerCase().includes(q)) ||
        (j.date && j.date.includes(q)) ||
        (j.title && j.title.toLowerCase().includes(q)) ||
        (j.evaluation?.summary && j.evaluation.summary.toLowerCase().includes(q))
      );
    }

    // Score filter
    if (scoreFilter !== 'all') {
      list = list.filter(j => {
        const s = j.score ?? j.evaluation?.score;
        if (s === undefined || s === null) return false;
        if (scoreFilter === 'exceptional') return s >= 90;
        if (scoreFilter === 'strong') return s >= 75 && s < 90;
        if (scoreFilter === 'decent') return s >= 60 && s < 75;
        if (scoreFilter === 'growth') return s < 60;
        return true;
      });
    }

    // Sort order
    list.sort((a, b) => {
      if (sortOrder === 'newest') return b.date.localeCompare(a.date);
      if (sortOrder === 'oldest') return a.date.localeCompare(b.date);
      const scoreA = a.score ?? a.evaluation?.score ?? -1;
      const scoreB = b.score ?? b.evaluation?.score ?? -1;
      if (sortOrder === 'highest') return scoreB - scoreA;
      if (sortOrder === 'lowest') return scoreA - scoreB;
      return 0;
    });

    return list;
  }, [journals, searchQuery, scoreFilter, sortOrder]);

  // Yesterday entry lookup
  const yesterdayStr = useMemo(() => {
    const d = new Date(todayDateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  }, [todayDateStr]);

  const yesterdayEntry = useMemo(() => {
    return journals.find(j => j.date === yesterdayStr);
  }, [journals, yesterdayStr]);

  // Evaluated entries count
  const evaluatedCount = useMemo(() => {
    return journals.filter(j => j.score !== null || j.evaluation !== null).length;
  }, [journals]);

  return (
    <div className="space-y-5">
      {/* Permanent All-Time Cloud & Device Storage Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-violet-500/10 border border-emerald-500/20 dark:border-emerald-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-black text-slate-800 dark:text-white font-display">
                All-Time Built-In Cloud Persistence Active
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                Permanent
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Every daily journal, score mark, and streak is stored forever in DayScore's internal cloud database. You never lose any data when tomorrow comes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0 text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-white/70 dark:bg-slate-800/70 px-3 py-1.5 rounded-xl border border-slate-200/50 dark:border-slate-700">
          <Calendar className="w-3.5 h-3.5 text-violet-500" />
          <span>{journals.length} {journals.length === 1 ? 'Day Saved' : 'Days Saved for All Time'}</span>
        </div>
      </div>

      {/* Yesterday's Reflection Quick Card (if available) */}
      {yesterdayEntry && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-indigo-600/10 border border-violet-200 dark:border-violet-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-white flex flex-col items-center justify-center font-black shrink-0 shadow-sm">
              <span className="text-base leading-none">
                {yesterdayEntry.score ?? yesterdayEntry.evaluation?.score ?? '—'}
              </span>
              <span className="text-[7px] uppercase tracking-wider opacity-80 mt-0.5">/ 100</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm">{yesterdayEntry.emoji || '✨'}</span>
                <h4 className="text-xs font-black text-slate-900 dark:text-white font-display">
                  Yesterday's Reflection ({yesterdayStr})
                </h4>
                <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 text-[9px] font-bold rounded-full">
                  Saved
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-1 mt-0.5">
                {yesterdayEntry.evaluation?.summary || yesterdayEntry.text || 'Reflection recorded.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {yesterdayEntry.evaluation && (
              <button
                type="button"
                onClick={() => onViewEvaluation(yesterdayEntry.evaluation)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>View Evaluation</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => onSelectDate(yesterdayStr)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1 cursor-pointer"
            >
              <span>Open in Editor</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search across all reflections by words, habits, dates..."
              className="w-full pl-9 pr-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-violet-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            <select
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="px-3 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:border-violet-500 cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Score</option>
              <option value="lowest">Lowest Score</option>
            </select>
          </div>
        </div>

        {/* Score filter tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: `All (${journals.length})` },
            { id: 'exceptional', label: '90–100 Exceptional' },
            { id: 'strong', label: '75–89 Strong' },
            { id: 'decent', label: '60–74 Decent' },
            { id: 'growth', label: '< 60 Growth' },
          ].map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setScoreFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all cursor-pointer ${
                scoreFilter === f.id
                  ? 'bg-violet-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* All-Time Timeline Entries List */}
      <div className="space-y-3">
        {filteredJournals.length === 0 ? (
          <div className="text-center py-12 px-4 bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 space-y-2">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 font-display">
              {searchQuery || scoreFilter !== 'all' ? 'No reflections match this filter' : 'No reflections recorded yet'}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
              {searchQuery || scoreFilter !== 'all' 
                ? 'Try clearing the search query or score filter.' 
                : 'Write your first daily reflection on the dashboard above. It will be stored here forever!'}
            </p>
          </div>
        ) : (
          filteredJournals.map(entry => {
            const hasScore = entry.score !== null || entry.evaluation?.score !== undefined;
            const scoreVal = entry.score ?? entry.evaluation?.score ?? null;
            const isToday = entry.date === todayDateStr;
            const isSelected = entry.date === selectedDate;

            return (
              <div
                key={entry.id || entry.date}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md ${
                  isSelected
                    ? 'border-violet-500 dark:border-violet-500 shadow-md ring-2 ring-violet-500/20'
                    : 'border-slate-200/70 dark:border-slate-800 hover:border-violet-300 dark:hover:border-violet-700 shadow-sm'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    {/* Score Badge */}
                    <div className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-black shrink-0 text-white shadow-sm ${
                      scoreVal !== null && scoreVal >= 90
                        ? 'bg-gradient-to-tr from-amber-500 to-orange-500'
                        : scoreVal !== null && scoreVal >= 75
                        ? 'bg-gradient-to-tr from-violet-600 to-fuchsia-600'
                        : scoreVal !== null && scoreVal >= 60
                        ? 'bg-gradient-to-tr from-blue-600 to-cyan-600'
                        : scoreVal !== null
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-600'
                        : 'bg-slate-400 dark:bg-slate-700'
                    }`}>
                      <span className="text-sm leading-none">{scoreVal !== null ? scoreVal : '—'}</span>
                      <span className="text-[7px] uppercase tracking-wider opacity-90 mt-0.5">/ 100</span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base">{entry.emoji || entry.evaluation?.emoji || '📝'}</span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white font-display">
                          {entry.title || entry.evaluation?.title || `Reflection for ${entry.date}`}
                        </h4>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500 text-white">
                            Today
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                        <Calendar className="w-3 h-3" />
                        <span>{entry.date}</span>
                        {entry.isDraft && (
                          <span className="text-amber-500 font-bold">• Draft saved</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    {entry.evaluation && (
                      <button
                        type="button"
                        onClick={() => onViewEvaluation(entry.evaluation)}
                        className="px-3 py-1.5 bg-violet-50 dark:bg-violet-950/60 hover:bg-violet-100 dark:hover:bg-violet-900/60 text-violet-700 dark:text-violet-300 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="View complete DayScore AI breakdown"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>View Analysis</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onSelectDate(entry.date)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        isSelected
                          ? 'bg-violet-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{isSelected ? 'Currently Viewing' : 'Load in Editor'}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Journal Text Preview */}
                <div className="pt-3 space-y-2">
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-2 italic font-serif">
                    "{entry.text}"
                  </p>

                  {/* Highlights from evaluation if available */}
                  {entry.evaluation && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
                      {entry.evaluation.strengths && entry.evaluation.strengths[0] && (
                        <div className="p-2 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/50 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                          <span className="line-clamp-1"><strong>Strength:</strong> {entry.evaluation.strengths[0]}</span>
                        </div>
                      )}
                      {entry.evaluation.tomorrowChallenge && (
                        <div className="p-2 rounded-xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-200/50 dark:border-violet-800/40 text-violet-800 dark:text-violet-300 flex items-start gap-1.5">
                          <Flame className="w-3.5 h-3.5 shrink-0 text-violet-500 mt-0.5" />
                          <span className="line-clamp-1"><strong>Challenge:</strong> {entry.evaluation.tomorrowChallenge}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
