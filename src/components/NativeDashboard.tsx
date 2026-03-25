import React, { useState } from 'react';
import { ChartWidget } from './widgets/ChartWidget';
import { OptionsWidget } from './widgets/OptionsWidget';

type WidgetItem = {
  id: string;
  title: string;
  component: React.ReactNode;
  colSpan: number;
};

const initialWidgets: WidgetItem[] = [
  { id: 'chart', title: 'NIFTY 50 Chart', component: <ChartWidget />, colSpan: 2 },
  { id: 'options', title: 'Option Chain', component: <OptionsWidget />, colSpan: 1 },
  {
    id: 'notes',
    title: 'Trade Notes',
    component: <div className="flex items-center justify-center h-full text-zinc-400 bg-white">Notes area</div>,
    colSpan: 1
  },
  {
    id: 'calculator',
    title: 'Margin Calculator',
    component: <div className="flex items-center justify-center h-full text-zinc-400 bg-white">Calculator area</div>,
    colSpan: 1
  },
  {
    id: 'positions',
    title: 'Active Positions',
    component: <div className="flex items-center justify-center h-full text-zinc-400 bg-white">Positions area</div>,
    colSpan: 1
  }
];

export const NativeDashboard = () => {
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  const [hoveredWidgetId, setHoveredWidgetId] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data
    e.dataTransfer.setData('text/plain', id);

    // Add a slight delay to allow the drag image to be captured before we fade the original element
    setTimeout(() => {
      // Element is styled via class matching draggedWidgetId
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggedWidgetId) {
      setHoveredWidgetId(id);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setHoveredWidgetId(null);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    setHoveredWidgetId(null);

    if (!draggedWidgetId || draggedWidgetId === targetId) {
      setDraggedWidgetId(null);
      return;
    }

    const newWidgets = [...widgets];
    const draggedIndex = newWidgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIndex = newWidgets.findIndex((w) => w.id === targetId);

    // Swap the elements
    const temp = newWidgets[draggedIndex];
    newWidgets[draggedIndex] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    setWidgets(newWidgets);
    setDraggedWidgetId(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setHoveredWidgetId(null);
  };

  return (
    <div className="h-full w-full bg-zinc-100 flex flex-col font-sans p-4 overflow-y-auto overflow-x-hidden">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-zinc-800">Native HTML5 Drag & Drop Grid</h2>
        <p className="text-zinc-500 text-sm">Drag widgets by their headers to swap their positions</p>
      </div>

      {/* 3 Column CSS Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {widgets.map((widget) => (
          <div
            key={widget.id}
            draggable
            onDragStart={(e) => handleDragStart(e, widget.id)}
            onDragOver={(e) => handleDragOver(e, widget.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, widget.id)}
            onDragEnd={handleDragEnd}
            className={`
              flex flex-col bg-white rounded-lg shadow-sm border border-zinc-200 min-h-[400px] overflow-hidden transition-all duration-200
              ${widget.colSpan === 2 ? 'md:col-span-2' : ''}
              ${widget.colSpan === 3 ? 'md:col-span-3' : ''}
              ${draggedWidgetId === widget.id ? 'opacity-30 scale-95' : 'opacity-100'}
              ${hoveredWidgetId === widget.id ? 'border-blue-500 ring-2 ring-blue-500/50 scale-[1.02] shadow-lg z-10' : ''}
            `}
          >
            {/* Draggable Header Handle */}
            <div className="px-4 py-2 border-b border-zinc-200 flex justify-between items-center cursor-grab active:cursor-grabbing bg-zinc-50 hover:bg-zinc-100 transition-colors">
              <span className="font-semibold text-sm text-zinc-700">{widget.title}</span>
              <div className="text-zinc-400">
                {/* Drag handle icon */}
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 3C6.32843 3 7 2.32843 7 1.5C7 0.671573 6.32843 0 5.5 0C4.67157 0 4 0.671573 4 1.5C4 2.32843 4.67157 3 5.5 3ZM9.5 3C10.3284 3 11 2.32843 11 1.5C11 0.671573 10.3284 0 9.5 0C8.67157 0 8 0.671573 8 1.5C8 2.32843 8.67157 3 9.5 3ZM11 7.5C11 8.32843 10.3284 9 9.5 9C8.67157 9 8 8.32843 8 7.5C8 6.67157 8.67157 6 9.5 6C10.3284 6 11 6.67157 11 7.5ZM5.5 9C6.32843 9 7 8.32843 7 7.5C7 6.67157 6.32843 6 5.5 6C4.67157 6 4 6.67157 4 7.5C4 8.32843 4.67157 9 5.5 9ZM11 13.5C11 14.3284 10.3284 15 9.5 15C8.67157 15 8 14.3284 8 13.5C8 12.6715 8.67157 12 9.5 12C10.3284 12 11 12.6715 11 13.5ZM5.5 15C6.32843 15 7 14.3284 7 13.5C7 12.6715 6.32843 12 5.5 12C4.67157 12 4 12.6715 4 13.5C4 14.3284 4.67157 15 5.5 15Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
              </div>
            </div>
            {/* Widget Content */}
            <div className="flex-1 relative">
              {/* Wrapper prevents pointer events during drag so dropping works reliably on the container */}
              <div className={`absolute inset-0 ${draggedWidgetId ? 'z-20' : '-z-10'}`}></div>
              {widget.component}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
