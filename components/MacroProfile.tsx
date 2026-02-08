import React from 'react';
import { MacroScores } from '../types';

interface MacroProfileProps {
  macro: MacroScores;
  name: string;
  macro2?: MacroScores;
  name2?: string;
}

export const MacroProfile: React.FC<MacroProfileProps> = ({ macro, name, macro2, name2 }) => {
  const maxSocial = 44; // 11 categories * 4 max score
  const maxEmotional = 32; // 8 categories * 4 max score

  const renderComparisonRow = (
    labelEn: string,
    labelZh: string,
    val1: number,
    val2: number | undefined,
    max: number,
    color1: string,
    color2: string
  ) => {
    const pct1 = (val1 / max) * 100;
    const pct2 = val2 !== undefined ? (val2 / max) * 100 : 0;

    return (
      <div className="space-y-1">
        <div className="flex justify-between items-end">
          <span className="text-sm font-medium text-slate-600">
            {labelEn} <span className="text-xs text-slate-400 ml-1">{labelZh}</span>
          </span>
        </div>
        
        {/* Person 1 Bar */}
        <div className="flex items-center space-x-2">
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className={`h-full ${color1}`} style={{ width: `${pct1}%` }} />
            </div>
            <span className="w-8 text-right text-xs font-bold text-slate-700">{val1}</span>
        </div>

        {/* Person 2 Bar (if comparison) */}
        {val2 !== undefined && (
             <div className="flex items-center space-x-2">
                <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`h-full ${color2}`} style={{ width: `${pct2}%` }} />
                </div>
                <span className="w-8 text-right text-xs font-bold text-slate-500">{val2}</span>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
      <div className="flex justify-between items-start mb-4 border-b pb-2">
        <h3 className="text-lg font-bold text-slate-800">
          Summary / 总体分析
        </h3>
        {macro2 && (
            <div className="flex space-x-4 text-xs">
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-teal-600 mr-1"></span>{name}</div>
                <div className="flex items-center"><span className="w-2 h-2 rounded-full bg-rose-500 mr-1"></span>{name2}</div>
            </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Social Behavior */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 flex items-center">
            <span className="w-2 h-2 rounded-full bg-teal-500 mr-2"></span>
            Social Behavior / 社会行为
          </h4>
          
          <div className="space-y-4">
            {/* Person 1 always Teal shades, Person 2 always Rose shades */}
            {renderComparisonRow("Active", "主动", macro.social.active, macro2?.social.active, maxSocial, 'bg-teal-600', 'bg-rose-500')}
            {renderComparisonRow("Passive", "被动", macro.social.passive, macro2?.social.passive, maxSocial, 'bg-teal-500', 'bg-rose-400')}
            {renderComparisonRow("Concept", "理念", macro.social.concept, macro2?.social.concept, maxSocial, 'bg-teal-400', 'bg-rose-300')}
          </div>
        </div>

        {/* Emotional Relations */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-700 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            Emotional Relations / 情感关系
          </h4>
          
          <div className="space-y-4">
            {/* Person 1 always Teal/Emerald shades, Person 2 always Rose shades */}
            {renderComparisonRow("Self", "自我", macro.emotional.self, macro2?.emotional.self, maxEmotional, 'bg-teal-600', 'bg-rose-500')}
            {renderComparisonRow("We/You", "我们/你", macro.emotional.we, macro2?.emotional.we, maxEmotional, 'bg-teal-500', 'bg-rose-400')}
            {renderComparisonRow("Ideal", "理想", macro.emotional.ideal, macro2?.emotional.ideal, maxEmotional, 'bg-teal-400', 'bg-rose-300')}
          </div>
        </div>
      </div>
    </div>
  );
};