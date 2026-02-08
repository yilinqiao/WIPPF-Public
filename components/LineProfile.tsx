import React from 'react';
import { CATEGORIES } from '../constants';

interface LineProfileProps {
  scores1: Record<string, number>;
  name1: string;
  scores2?: Record<string, number>;
  name2?: string;
  onCategoryClick?: (categoryId: string) => void;
}

export const LineProfile: React.FC<LineProfileProps> = ({ scores1, name1, scores2, name2, onCategoryClick }) => {
  const sections = [
    { key: 'secondary', title: 'Secondary Capacities / 继发能力' },
    { key: 'primary', title: 'Primary Capacities / 原发能力' },
    { key: 'conflict', title: 'Conflict Reactions / 冲突反应' },
    { key: 'model', title: 'Imitation Models / 模仿模式' },
  ];

  // SVG Config
  const rowHeight = 40;
  const colWidth = 30; // Width of one score unit
  const labelWidth = 120;
  const headerHeight = 40;
  const maxScore = 12; // Standard max score for grid display
  const svgWidth = labelWidth + (maxScore + 1) * colWidth + 20;

  // Colors
  const color1 = "#0d9488"; // Teal 600
  const color2 = "#f43f5e"; // Rose 500

  const renderSection = (sectionKey: string, title: string) => {
    const cats = CATEGORIES.filter(c => c.group === sectionKey);
    const height = cats.length * rowHeight + headerHeight;

    return (
      <div key={sectionKey} className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 mb-6 overflow-x-auto">
        <h3 className="font-bold text-slate-700 mb-4">{title}</h3>
        <div style={{ minWidth: svgWidth }}>
          <svg width={svgWidth} height={height} className="block">
            {/* Grid Background */}
            <g className="grid-lines text-slate-200">
                {/* Vertical Lines */}
                {Array.from({ length: maxScore + 1 }).map((_, i) => (
                    <line 
                        key={`v-${i}`}
                        x1={labelWidth + i * colWidth} 
                        y1={headerHeight} 
                        x2={labelWidth + i * colWidth} 
                        y2={height} 
                        stroke="#e2e8f0" 
                        strokeWidth="1"
                        strokeDasharray={i === 0 || i === maxScore ? "" : "4 2"}
                    />
                ))}
                {/* Header Numbers */}
                {Array.from({ length: maxScore + 1 }).map((_, i) => (
                    <text 
                        key={`h-${i}`}
                        x={labelWidth + i * colWidth} 
                        y={headerHeight - 10} 
                        textAnchor="middle" 
                        className="text-xs fill-slate-400 font-mono"
                    >
                        {i}
                    </text>
                ))}
            </g>

            {/* Rows */}
            {cats.map((cat, idx) => {
                const y = headerHeight + idx * rowHeight + rowHeight / 2;
                const score1 = scores1[cat.id] || 0;
                const score2 = scores2 ? (scores2[cat.id] || 0) : undefined;
                const x1 = labelWidth + Math.min(score1, maxScore) * colWidth;
                const x2 = score2 !== undefined ? labelWidth + Math.min(score2, maxScore) * colWidth : undefined;
                
                // Difference check for circle
                const diff = score2 !== undefined ? Math.abs(score1 - score2) : 0;
                const isBigDiff = diff > 3; // Highlight if difference > 3

                return (
                    <g 
                        key={cat.id} 
                        onClick={() => onCategoryClick && onCategoryClick(cat.id)}
                        className="cursor-pointer group"
                    >
                        {/* Horizontal guide line */}
                        <line x1={0} y1={y} x2={svgWidth} y2={y} stroke="#f1f5f9" strokeWidth="1" className="group-hover:stroke-slate-200 transition-colors" />
                        
                        {/* Label */}
                        <text x={0} y={y + 5} className="text-xs font-bold fill-slate-700 group-hover:fill-teal-600 transition-colors">
                            {cat.id}. {cat.nameZh}
                        </text>

                        {/* Highlight Circle for Difference */}
                        {isBigDiff && x2 !== undefined && (
                             <ellipse 
                                cx={(x1 + x2) / 2} 
                                cy={y} 
                                rx={Math.abs(x1 - x2) / 2 + 10} 
                                ry={15} 
                                fill="none" 
                                stroke="#f59e0b" 
                                strokeWidth="2"
                                strokeDasharray="4 2"
                                opacity="0.6"
                             />
                        )}
                    </g>
                );
            })}

            {/* Plot Lines */}
            {/* Person 1 Line */}
            <polyline
                points={cats.map((cat, idx) => {
                    const y = headerHeight + idx * rowHeight + rowHeight / 2;
                    const x = labelWidth + Math.min(scores1[cat.id] || 0, maxScore) * colWidth;
                    return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke={color1}
                strokeWidth="2"
                className="pointer-events-none" 
            />
             {/* Person 2 Line */}
             {scores2 && (
                <polyline
                    points={cats.map((cat, idx) => {
                        const y = headerHeight + idx * rowHeight + rowHeight / 2;
                        const x = labelWidth + Math.min(scores2[cat.id] || 0, maxScore) * colWidth;
                        return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke={color2}
                    strokeWidth="2"
                    className="pointer-events-none"
                />
            )}

            {/* Plot Dots (on top of lines) */}
             {cats.map((cat, idx) => {
                const y = headerHeight + idx * rowHeight + rowHeight / 2;
                const score1 = scores1[cat.id] || 0;
                const score2 = scores2 ? (scores2[cat.id] || 0) : undefined;
                const x1 = labelWidth + Math.min(score1, maxScore) * colWidth;
                
                return (
                    <g 
                        key={`dot-${cat.id}`}
                        onClick={() => onCategoryClick && onCategoryClick(cat.id)}
                        className="cursor-pointer group"
                    >
                        <circle cx={x1} cy={y} r="4" fill={color1} stroke="white" strokeWidth="2" className="group-hover:stroke-teal-200 transition-colors" />
                        {score2 !== undefined && (
                            <circle cx={labelWidth + Math.min(score2, maxScore) * colWidth} cy={y} r="4" fill={color2} stroke="white" strokeWidth="2" className="group-hover:stroke-rose-200 transition-colors" />
                        )}
                    </g>
                );
             })}

          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full">
        {name2 && (
             <div className="flex justify-center space-x-6 mb-4">
                <div className="flex items-center"><span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: color1 }}></span>{name1}</div>
                <div className="flex items-center"><span className={`w-3 h-3 rounded-full mr-2`} style={{ backgroundColor: color2 }}></span>{name2}</div>
                <div className="flex items-center"><span className="w-6 h-4 rounded-full border border-dashed border-amber-500 mr-2"></span>High Difference</div>
            </div>
        )}
        <div className="text-center text-[10px] text-slate-400 mb-4">Click label/dots to view details / 点击标签或圆点查看详情</div>
      {sections.map(s => renderSection(s.key, s.title))}
    </div>
  );
};