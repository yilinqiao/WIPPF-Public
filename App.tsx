import React, { useState, useEffect, useRef } from 'react';
import { AppView, AssessmentResult, AnswerValue, Question } from './types';
import { QUESTIONS, SCALES, CATEGORIES } from './constants';
import { calculateScores, calculateMacroScores } from './services/scoring';
import { RadarProfile } from './components/RadarProfile';
import { MacroProfile } from './components/MacroProfile';
import { CsvImporter } from './components/CsvImporter';
import { LineProfile } from './components/LineProfile';

// --- Icons ---
const PlusIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const ChevronDownIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>;
const UploadIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const TrashIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

// --- Components ---

// 1. Home View
const HomeView: React.FC<{ onStart: (name: string) => void, onImportClick: () => void }> = ({ onStart, onImportClick }) => {
  const [name, setName] = useState('');

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 animate-fade-in">
      <div className="max-w-md w-full text-center space-y-8">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">WIPPF Digital</h1>
          <p className="mt-2 text-lg text-slate-600">
            Wiesbaden Inventory for Positive Psychotherapy <br/>
            <span className="text-sm font-normal">威斯巴登积极心理治疗与家庭治疗问卷</span>
          </p>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
          <p className="text-slate-500 mb-2 text-sm">
            This digital tool helps you track psychological capacities and compare with a partner. There are about 88 questions. Please answer intuitively.
          </p>
          <p className="text-slate-500 mb-6 text-sm">
            这个数字工具可以帮助你追踪心理能力并与伴侣进行比较。大约有88个问题。请凭直觉回答。
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 text-left mb-1">Your Name / 名字</label>
              <input
                type="text"
                id="name"
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <button
              onClick={() => name.trim() && onStart(name)}
              disabled={!name.trim()}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg shadow-md transition transform hover:scale-[1.02]"
            >
              Start Assessment / 开始测试
            </button>
            <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs">OR</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <button
                onClick={onImportClick}
                className="w-full flex items-center justify-center space-x-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold py-3 px-4 rounded-lg border border-slate-200 transition"
            >
                <UploadIcon />
                <span>Import CSV / 导入数据</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Assessment View
const AssessmentView: React.FC<{ 
  name: string; 
  onComplete: (answers: Record<number, AnswerValue>) => void;
  onCancel: () => void;
}> = ({ name, onComplete, onCancel }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});

  const activeQuestion = QUESTIONS[currentIdx];
  const progress = ((currentIdx + 1) / QUESTIONS.length) * 100;

  const handleAnswer = (val: AnswerValue) => {
    const nextAnswers = { ...answers, [activeQuestion.id]: val };
    setAnswers(nextAnswers);

    if (currentIdx < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIdx(currentIdx + 1), 100); 
    } else {
      onComplete(nextAnswers);
    }
  };

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-600 text-sm font-medium">
          Cancel
        </button>
        <div className="text-xs font-semibold text-teal-600 tracking-wider uppercase">
          Question {currentIdx + 1} of {QUESTIONS.length}
        </div>
      </div>

      <div className="w-full bg-slate-200 h-2 rounded-full mb-8 overflow-hidden">
        <div 
          className="bg-teal-500 h-2 rounded-full transition-all duration-300 ease-out" 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-8 min-h-[300px] flex flex-col justify-center animate-fade-in relative">
        <h2 className="text-xl md:text-2xl font-serif text-slate-800 mb-8 leading-relaxed text-center">
          {activeQuestion.textZh}
          <div className="text-sm text-slate-400 font-sans mt-2">{activeQuestion.text}</div>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {SCALES.map((scale) => (
            <button
              key={scale.value}
              onClick={() => handleAnswer(scale.value as AnswerValue)}
              className="py-4 px-6 rounded-xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-left group"
            >
              <span className="block text-lg font-bold text-slate-700 group-hover:text-teal-700">
                {scale.labelZh}
              </span>
              <span className="text-xs text-slate-400 group-hover:text-teal-600 uppercase tracking-wide">
                {scale.short} - {scale.value}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div className="text-center mt-8 text-slate-400 text-sm">
        Assessment for <span className="font-semibold text-slate-600">{name}</span>
      </div>
    </div>
  );
};

// Summary Table Component
const SummaryTable: React.FC<{ 
    scores: Record<string, number>, 
    answers: Record<number, AnswerValue>,
    partnerScores?: Record<string, number>,
    partnerAnswers?: Record<number, AnswerValue>,
    partnerName?: string,
    highlightId?: string | null
}> = ({ scores, answers, partnerScores, partnerAnswers, partnerName, highlightId }) => {
  const [expandedCats, setExpandedCats] = useState<string[]>([]);
  
  // Handle auto-scroll and expand when highlightId changes
  useEffect(() => {
    if (highlightId) {
      if (!expandedCats.includes(highlightId)) {
        setExpandedCats(prev => [...prev, highlightId]);
      }
      setTimeout(() => {
        const element = document.getElementById(`row-${highlightId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary flash effect
          element.classList.add('bg-teal-50');
          setTimeout(() => element.classList.remove('bg-teal-50'), 2000);
        }
      }, 100);
    }
  }, [highlightId]);

  const toggleExpand = (id: string) => {
    if (expandedCats.includes(id)) {
        setExpandedCats(expandedCats.filter(e => e !== id));
    } else {
        setExpandedCats([...expandedCats, id]);
    }
  };

  const sections = [
    { key: 'secondary', title: 'Secondary Capacities / 继发能力 (Social)' },
    { key: 'primary', title: 'Primary Capacities / 原发能力 (Emotional)' },
    { key: 'conflict', title: 'Conflict Reactions / 冲突反应' },
    { key: 'model', title: 'Imitation Models / 模仿模式' },
  ];

  const getQuestionsForCategory = (catId: string) => {
      return QUESTIONS.filter(q => {
        const match = q.categoryCode.match(/^(\d+)([a-z])?/);
        if (!match) return false;
        const num = match[1];
        const char = match[2];

        if (catId === '24m') return num === '24' && ['a','b','c'].includes(char);
        if (catId === '24f') return num === '24' && ['d','e','f'].includes(char);
        if (catId === '24o') return num === '24' && ['g','h','i'].includes(char);

        return num === catId;
      });
  };

  return (
    <div className="space-y-8">
      {sections.map(section => (
        <div key={section.key} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 font-bold text-slate-700">
                {section.title}
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-100 text-xs text-slate-500 uppercase">
                    <tr>
                        <th className="px-6 py-3 w-12">#</th>
                        <th className="px-6 py-3">Category</th>
                        <th className="px-6 py-3 text-center">Score</th>
                        {partnerScores && <th className="px-6 py-3 text-center text-rose-600">{partnerName}</th>}
                        <th className="px-6 py-3 w-10"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {CATEGORIES.filter(c => c.group === section.key).map(cat => (
                        <React.Fragment key={cat.id}>
                            <tr 
                                id={`row-${cat.id}`}
                                onClick={() => toggleExpand(cat.id)}
                                className={`cursor-pointer transition duration-300 ${expandedCats.includes(cat.id) ? 'bg-slate-50' : 'hover:bg-slate-50'}`}
                            >
                                <td className="px-6 py-4 font-mono text-xs text-slate-400">{cat.id}</td>
                                <td className="px-6 py-4">
                                    <div className="font-semibold text-slate-800">{cat.nameZh}</div>
                                    <div className="text-xs text-slate-400">{cat.name}</div>
                                </td>
                                <td className="px-6 py-4 text-center font-bold text-teal-600 text-base">
                                    {scores[cat.id] || 0}
                                </td>
                                {partnerScores && (
                                    <td className="px-6 py-4 text-center font-bold text-rose-600 text-base">
                                        {partnerScores[cat.id] || 0}
                                    </td>
                                )}
                                <td className="px-6 py-4 text-slate-400">
                                    <div className={`transform transition ${expandedCats.includes(cat.id) ? 'rotate-180' : ''}`}>
                                        <ChevronDownIcon />
                                    </div>
                                </td>
                            </tr>
                            {expandedCats.includes(cat.id) && (
                                <tr className="bg-slate-50/50">
                                    <td colSpan={partnerScores ? 5 : 4} className="px-6 py-4">
                                        <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                                            {getQuestionsForCategory(cat.id).map(q => {
                                                const myAns = answers[q.id];
                                                const pAns = partnerAnswers ? partnerAnswers[q.id] : undefined;
                                                // Change low score warning to Amber to avoid confusion with Person 2 (Red/Rose)
                                                const isLowMy = myAns <= 2;
                                                const isLowP = pAns !== undefined && pAns <= 2;
                                                
                                                return (
                                                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-start justify-between text-xs gap-4 border-b border-slate-100 pb-2 last:border-0">
                                                        <div className="flex-1">
                                                            <div className="flex items-center mb-1">
                                                                <span className="font-mono text-slate-400 mr-2 bg-slate-100 px-1 rounded">{q.categoryCode}</span>
                                                                <span className="text-slate-700 font-medium">{q.textZh}</span>
                                                            </div>
                                                            <div className="text-slate-500 pl-8">{q.text}</div>
                                                        </div>
                                                        <div className="flex-shrink-0 flex items-center space-x-2">
                                                            <div className="flex flex-col items-end">
                                                                <span className={`inline-block px-2 py-1 rounded font-bold min-w-[40px] text-center ${isLowMy ? 'bg-amber-100 text-amber-700' : 'bg-teal-50 text-teal-700'}`}>
                                                                    {myAns || '-'}
                                                                </span>
                                                            </div>
                                                            {partnerAnswers && (
                                                                <div className="flex flex-col items-end">
                                                                    <span className={`inline-block px-2 py-1 rounded font-bold min-w-[40px] text-center ${isLowP ? 'bg-amber-100 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                                                        {pAns || '-'}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
      ))}
    </div>
  );
};

// 3. Results / History View
const DashboardView: React.FC<{ 
  history: AssessmentResult[]; 
  onCompare: (id1: string, id2: string) => void;
  onDelete: (id: string) => void;
}> = ({ history, onCompare, onDelete }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [tab, setTab] = useState<'table' | 'charts' | 'line'>('table'); 
  const [highlightCategoryId, setHighlightCategoryId] = useState<string | null>(null);

  // Reset selection if deleted item was selected
  useEffect(() => {
    const validIds = selectedIds.filter(id => history.find(h => h.id === id));
    if (validIds.length !== selectedIds.length) {
      setSelectedIds(validIds);
    }
  }, [history, selectedIds]);

  const toggleSelection = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      if (selectedIds.length < 2) {
        setSelectedIds([...selectedIds, id]);
      } else {
        setSelectedIds([selectedIds[1], id]);
      }
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setTab('table');
    setHighlightCategoryId(categoryId);
    // Reset after a delay so it can be clicked again
    setTimeout(() => setHighlightCategoryId(null), 1000);
  };

  const selectedResults = history.filter(h => selectedIds.includes(h.id));
  const isComparison = selectedResults.length === 2;
  const displayResult = selectedResults.length > 0 ? selectedResults[0] : history[0];
  const compareResult = selectedResults.length === 2 ? selectedResults[1] : undefined;

  if (history.length === 0) {
    return <div className="text-center text-slate-500 mt-20">No assessments yet. Start one!</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left: History List */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-100">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-slate-700">History / 记录</h3>
                    <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                        {selectedIds.length === 0 ? 'Select 2' : `${selectedIds.length}/2 Selected`}
                    </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                    Click on two people to compare their results. <br/>
                    点击两个人名以对比结果。
                </p>
            </div>
            <ul className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {history.map((res) => (
                <li 
                  key={res.id} 
                  onClick={() => toggleSelection(res.id)}
                  className={`p-4 cursor-pointer transition hover:bg-slate-50 relative group ${selectedIds.includes(res.id) ? 'bg-teal-50' : ''}`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-800">{res.name}</div>
                      <div className="text-xs text-slate-500">{new Date(res.date).toLocaleDateString()}</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedIds.includes(res.id) && (
                        <div className="bg-teal-500 text-white p-1 rounded-full">
                          <CheckIcon />
                        </div>
                      )}
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(res.id);
                        }}
                        className="text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Delete"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right: Visualization/Table */}
        <div className="lg:col-span-3 space-y-6">
            {displayResult ? (
                <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                    <h2 className="text-2xl font-bold text-slate-800">
                        {isComparison ? 'Comparison / 对比' : `${displayResult?.name}'s Profile`}
                    </h2>
                    {isComparison && (
                        <span className="bg-rose-100 text-rose-700 text-xs font-bold px-2 py-1 rounded-full uppercase mt-1 inline-block">
                        Vs {compareResult?.name}
                        </span>
                    )}
                    </div>
                    
                    <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg self-start">
                    <button 
                        onClick={() => setTab('table')}
                        className={`px-3 py-1.5 rounded text-sm font-bold transition ${tab === 'table' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Table
                    </button>
                    <button 
                        onClick={() => setTab('line')}
                        className={`px-3 py-1.5 rounded text-sm font-bold transition ${tab === 'line' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Line / 曲线
                    </button>
                    <button 
                        onClick={() => setTab('charts')}
                        className={`px-3 py-1.5 rounded text-sm font-bold transition ${tab === 'charts' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Radar
                    </button>
                    </div>
                </div>
                
                <MacroProfile 
                    macro={displayResult.macro} 
                    name={displayResult.name} 
                    macro2={compareResult?.macro}
                    name2={compareResult?.name}
                />

                {tab === 'table' && (
                    <SummaryTable 
                    scores={displayResult.scores}
                    answers={displayResult.answers}
                    partnerScores={compareResult?.scores}
                    partnerAnswers={compareResult?.answers}
                    partnerName={compareResult?.name}
                    highlightId={highlightCategoryId}
                    />
                )}

                {tab === 'line' && (
                    <LineProfile 
                        scores1={displayResult.scores}
                        name1={displayResult.name}
                        scores2={compareResult?.scores}
                        name2={compareResult?.name}
                        onCategoryClick={handleCategoryClick}
                    />
                )}

                {tab === 'charts' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RadarProfile 
                        group="secondary" 
                        scores1={displayResult.scores} 
                        name1={displayResult.name}
                        scores2={compareResult?.scores}
                        name2={compareResult?.name}
                        onCategoryClick={handleCategoryClick}
                    />
                    <RadarProfile 
                        group="primary" 
                        scores1={displayResult.scores} 
                        name1={displayResult.name}
                        scores2={compareResult?.scores}
                        name2={compareResult?.name}
                        onCategoryClick={handleCategoryClick}
                    />
                    <RadarProfile 
                        group="conflict" 
                        scores1={displayResult.scores} 
                        name1={displayResult.name}
                        scores2={compareResult?.scores}
                        name2={compareResult?.name}
                        onCategoryClick={handleCategoryClick}
                    />
                    <RadarProfile 
                        group="model" 
                        scores1={displayResult.scores} 
                        name1={displayResult.name}
                        scores2={compareResult?.scores}
                        name2={compareResult?.name}
                        onCategoryClick={handleCategoryClick}
                    />
                    </div>
                )}
                </>
            ) : (
                <div className="flex items-center justify-center h-full text-slate-400">
                    Select a record to view details
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.HOME);
  const [name, setName] = useState('');
  const [history, setHistory] = useState<AssessmentResult[]>(() => {
    try {
      const saved = localStorage.getItem('wippf_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('wippf_history', JSON.stringify(history));
  }, [history]);

  const handleStart = (userName: string) => {
    setName(userName);
    setView(AppView.ASSESSMENT);
  };

  const handleComplete = (answers: Record<number, AnswerValue>) => {
    const scores = calculateScores(answers);
    const macro = calculateMacroScores(answers);
    
    const newResult: AssessmentResult = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      name: name,
      answers,
      scores,
      macro
    };
    
    setHistory(prev => [newResult, ...prev]);
    setView(AppView.HISTORY);
  };

  const handleImport = (results: AssessmentResult[]) => {
    setHistory(prev => [...results, ...prev]);
    setView(AppView.HISTORY);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      setHistory(prev => prev.filter(h => h.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center cursor-pointer" onClick={() => setView(AppView.HOME)}>
              <span className="text-2xl font-extrabold text-teal-600 tracking-tighter">WIPPF</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-slate-100 text-xs font-medium text-slate-500">Digital</span>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setView(AppView.HOME)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === AppView.HOME ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                Home
              </button>
              <button 
                onClick={() => setView(AppView.HISTORY)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${view === AppView.HISTORY ? 'text-teal-600 bg-teal-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'}`}
              >
                History ({history.length})
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-6">
        {view === AppView.HOME && (
          <HomeView onStart={handleStart} onImportClick={() => setView(AppView.IMPORT)} />
        )}
        
        {view === AppView.ASSESSMENT && (
          <AssessmentView 
            name={name} 
            onComplete={handleComplete} 
            onCancel={() => setView(AppView.HOME)} 
          />
        )}
        
        {view === AppView.HISTORY && (
          <DashboardView 
            history={history} 
            onCompare={() => {}} 
            onDelete={handleDelete}
          />
        )}

        {view === AppView.IMPORT && (
          <CsvImporter 
            onImport={handleImport} 
            onCancel={() => setView(AppView.HOME)} 
          />
        )}
      </main>
    </div>
  );
};

export default App;