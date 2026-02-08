import React, { useState, useRef } from 'react';
import { AssessmentResult, AnswerValue } from '../types';
import { calculateScores, calculateMacroScores } from '../services/scoring';

interface CsvImporterProps {
  onImport: (results: AssessmentResult[]) => void;
  onCancel: () => void;
}

export const CsvImporter: React.FC<CsvImporterProps> = ({ onImport, onCancel }) => {
  const [fileData, setFileData] = useState<string[][]>([]);
  const [step, setStep] = useState<'upload' | 'map'>('upload');
  
  // Mapping state
  const [questionColIdx, setQuestionColIdx] = useState<number>(-1);
  const [scoreColIndices, setScoreColIndices] = useState<number[]>([]);
  const [customNames, setCustomNames] = useState<Record<number, string>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      const rows = text.split(/\r?\n/).map(row => row.split(/,|;/).map(cell => cell.trim()));
      const cleanRows = rows.filter(r => r.some(c => c));
      setFileData(cleanRows);
      setStep('map');
    };
    reader.readAsText(file);
  };

  const toggleScoreCol = (idx: number) => {
    if (scoreColIndices.includes(idx)) {
      setScoreColIndices(scoreColIndices.filter(i => i !== idx));
      const newNames = { ...customNames };
      delete newNames[idx];
      setCustomNames(newNames);
    } else {
      setScoreColIndices([...scoreColIndices, idx]);
      // Only pre-fill if the header actually has content, otherwise leave empty to show placeholder
      const headerName = fileData[0][idx];
      if (headerName && headerName.trim() !== '') {
          setCustomNames({
            ...customNames,
            [idx]: headerName
          });
      }
    }
  };

  const updateName = (idx: number, name: string) => {
    setCustomNames({ ...customNames, [idx]: name });
  };

  const processImport = () => {
    if (questionColIdx === -1 || scoreColIndices.length === 0) return;

    const dataRows = fileData.slice(1);
    const newResults: AssessmentResult[] = [];

    scoreColIndices.forEach(scoreIdx => {
      // Use custom name if provided, otherwise default to "Person X"
      const personName = customNames[scoreIdx] && customNames[scoreIdx].trim() !== '' 
        ? customNames[scoreIdx] 
        : `Person ${scoreIdx}`;
        
      const answers: Record<number, AnswerValue> = {};

      dataRows.forEach(row => {
        const qNum = parseInt(row[questionColIdx], 10);
        let score = parseInt(row[scoreIdx], 10);
        
        if (!isNaN(qNum) && !isNaN(score)) {
            if (score < 1) score = 1;
            if (score > 4) score = 4;
            answers[qNum] = score as AnswerValue;
        }
      });

      const scores = calculateScores(answers);
      const macro = calculateMacroScores(answers);

      newResults.push({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        date: new Date().toISOString(),
        name: personName,
        answers,
        scores,
        macro
      });
    });

    onImport(newResults);
  };

  if (step === 'upload') {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center">
        <h2 className="text-xl font-bold mb-4">Import CSV / 导入表格</h2>
        <p className="text-sm text-slate-500 mb-6">
            Upload a CSV file with question numbers and scores.<br/>
            Supports multiple people in one file.
        </p>
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 rounded-xl p-10 cursor-pointer hover:bg-slate-50 hover:border-teal-500 transition"
        >
          <span className="text-slate-400">Click to Select File</span>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
        </div>
        <button onClick={onCancel} className="mt-6 text-slate-400 hover:text-slate-600">Cancel</button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-lg border border-slate-100">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Map Columns / 选择列</h2>
        <div className="space-x-3">
            <button onClick={() => setStep('upload')} className="text-slate-500 hover:text-slate-700">Back</button>
            <button 
                onClick={processImport} 
                disabled={questionColIdx === -1 || scoreColIndices.length === 0}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-bold"
            >
                Confirm Import
            </button>
        </div>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6 text-sm">
         <p className="font-semibold text-slate-700 mb-2">
            Instruction / 说明:
         </p>
         <ul className="list-disc list-inside space-y-1 text-slate-600">
             <li>Select the radio button <strong>Question #</strong> for the column containing question IDs (1-88). <br/><span className="text-xs text-slate-500 ml-5">请选中包含问题编号（1-88）那一列的 <strong>Question #</strong> 单选框。</span></li>
             <li>Check the box <strong>Score Column</strong> for the column(s) containing the scores (1-4). <br/><span className="text-xs text-slate-500 ml-5">请勾选包含分数（1-4）那一列（或多列）的 <strong>Score Column</strong> 复选框。</span></li>
         </ul>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
            <thead>
                <tr>
                    {fileData[0]?.map((header, idx) => (
                        <th key={idx} className="p-2 border bg-slate-50 min-w-[150px] align-top">
                            <div className="font-bold mb-2 text-slate-500 text-xs uppercase">{header}</div>
                            <div className="space-y-2">
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="qCol" 
                                        checked={questionColIdx === idx} 
                                        onChange={() => setQuestionColIdx(idx)}
                                    />
                                    <span className="text-sm font-medium">Question #</span>
                                </label>
                                <label className="flex items-center space-x-1 cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        checked={scoreColIndices.includes(idx)} 
                                        onChange={() => toggleScoreCol(idx)}
                                        disabled={questionColIdx === idx}
                                    />
                                    <span className="text-sm font-medium">Score Column</span>
                                </label>
                                {scoreColIndices.includes(idx) && (
                                  <input 
                                    type="text" 
                                    placeholder="Enter Name / 输入名字"
                                    value={customNames[idx] || ''}
                                    onChange={(e) => updateName(idx, e.target.value)}
                                    className="w-full px-2 py-1 text-sm border-2 border-slate-300 rounded focus:ring-1 focus:ring-teal-500 focus:border-teal-500"
                                  />
                                )}
                            </div>
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {fileData.slice(1, 6).map((row, rIdx) => (
                    <tr key={rIdx}>
                        {row.map((cell, cIdx) => (
                            <td key={cIdx} className={`p-2 border ${questionColIdx === cIdx ? 'bg-blue-50' : ''} ${scoreColIndices.includes(cIdx) ? 'bg-teal-50' : ''}`}>
                                {cell}
                            </td>
                        ))}
                    </tr>
                ))}
                <tr>
                    <td colSpan={fileData[0].length} className="p-2 text-center text-slate-400 italic">
                        ... {fileData.length - 6} more rows ...
                    </td>
                </tr>
            </tbody>
        </table>
      </div>
    </div>
  );
};