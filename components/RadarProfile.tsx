import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import { CATEGORIES } from '../constants';

interface RadarProfileProps {
  scores1: Record<string, number>;
  name1: string;
  scores2?: Record<string, number>;
  name2?: string;
  group: 'secondary' | 'primary' | 'conflict' | 'model';
  onCategoryClick?: (categoryId: string) => void;
}

const CustomTick = ({ payload, x, y, cx, cy, onCategoryClick, ...rest }: any) => {
  const { value, coordinate } = payload;
  const [en, zh, id] = value.split('||'); 

  return (
    <text 
      x={x} 
      y={y} 
      textAnchor="middle" 
      onClick={() => onCategoryClick && onCategoryClick(id)}
      className="cursor-pointer hover:font-bold hover:fill-teal-600 transition-colors"
      style={{ fontSize: '10px' }}
    >
      <tspan x={x} dy="-0.5em" fill="#334155" fontWeight="500">{en}</tspan>
      <tspan x={x} dy="1.2em" fill="#94a3b8">{zh}</tspan>
    </text>
  );
};

export const RadarProfile: React.FC<RadarProfileProps> = ({ scores1, name1, scores2, name2, group, onCategoryClick }) => {
  // Filter categories belonging to this group
  const groupCategories = CATEGORIES.filter(c => c.group === group);

  const chartData = groupCategories.map(cat => ({
    // Encoding the label and id into a string for the CustomTick to parse
    labelId: `${cat.name}||${cat.nameZh}||${cat.id}`, 
    A: scores1[cat.id] || 0,
    B: scores2 ? (scores2[cat.id] || 0) : 0,
    fullMark: 12, // Approximate max score (3-4 questions * 4)
  }));

  // Colors - Premium Palette
  const color1 = "#0d9488"; // Teal 600
  const color2 = "#f43f5e"; // Rose 500

  // Domain max: standard is around 12 (3 questions * 4), but some categories might differ.
  // 15 is a safe upper bound for visual scaling.
  const domainMax = 16; 

  return (
    <div className="w-full h-[450px] bg-white rounded-xl shadow-sm border border-slate-100 p-4 flex flex-col">
      <div className="mb-2">
        <h3 className="text-center font-bold text-slate-700 mb-1 capitalize">
          {group === 'secondary' ? 'Secondary Capacities (第二能力)' : 
           group === 'primary' ? 'Primary Capacities (第一能力)' : 
           group === 'conflict' ? 'Conflict Reactions (冲突反应)' : 'Imitation Models (模仿模式)'}
        </h3>
        <div className="text-center text-[10px] text-slate-400">Click label to view details / 点击标签查看详情</div>
      </div>

      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={chartData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="labelId" 
              tick={(props) => <CustomTick {...props} onCategoryClick={onCategoryClick} />} 
            />
            <PolarRadiusAxis angle={30} domain={[0, domainMax]} tick={false} axisLine={false} />
            
            <Radar
              name={name1}
              dataKey="A"
              stroke={color1}
              strokeWidth={2}
              fill={color1}
              fillOpacity={0.4}
            />
            
            {scores2 && (
              <Radar
                name={name2 || "Partner"}
                dataKey="B"
                stroke={color2}
                strokeWidth={2}
                fill={color2}
                fillOpacity={0.4}
              />
            )}
            
            <Tooltip 
               formatter={(value, name, props) => {
                 return [value, name];
               }}
               labelFormatter={(label) => {
                  const parts = label.split('||');
                  return `${parts[0]} (${parts[1]})`;
               }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend inside the card */}
      <div className="flex justify-center items-center gap-6 mt-2 border-t border-slate-50 pt-2">
        <div className="flex items-center gap-2">
           <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: color1 }}></span>
           <span className="text-xs font-bold text-slate-600">{name1}</span>
        </div>
        {scores2 && (
          <div className="flex items-center gap-2">
             <span className="w-3 h-3 rounded-sm shadow-sm" style={{ backgroundColor: color2 }}></span>
             <span className="text-xs font-bold text-slate-600">{name2 || "Partner"}</span>
          </div>
        )}
      </div>
    </div>
  );
};