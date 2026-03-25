import React, { useState } from 'react';
import { ChartWidget } from './widgets/ChartWidget';
import { OptionsWidget } from './widgets/OptionsWidget';
import { List, LineChart, FileText } from 'lucide-react';

type DropZone = 'top' | 'bottom' | 'left' | 'right' | 'center' | null;

type WidgetItem = {
  id: string;
  title: string;
  component: React.ReactNode;
  icon: React.ReactNode;
};

const initialWidgets: WidgetItem[] = [
  { id: 'chart', title: 'NIFTY 50 Chart', component: <ChartWidget />, icon: <LineChart className="w-4 h-4 mr-2" /> },
  { id: 'options', title: 'Option Chain', component: <OptionsWidget />, icon: <List className="w-4 h-4 mr-2" /> },
  { id: 'notes', title: 'Notes', component: <div className="flex h-full items-center justify-center text-zinc-400 bg-white">Notes area</div>, icon: <FileText className="w-4 h-4 mr-2" /> },
];

export const ExactNativeDashboard = () => {
  const [widgets, setWidgets] = useState<WidgetItem[]>(initialWidgets);
  const [draggedWidgetId, setDraggedWidgetId] = useState<string | null>(null);
  
  // Track which widget is hovered and where (top, bottom, left, right, center)
  const [hoverTarget, setHoverTarget] = useState<{ id: string; zone: DropZone } | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    setDraggedWidgetId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Create a custom drag image to look like flexlayout's dragged tab
    const dragGhost = document.createElement('div');
    dragGhost.textContent = widgets.find(w => w.id === id)?.title || 'Widget';
    dragGhost.style.padding = '8px 16px';
    dragGhost.style.background = '#2563eb';
    dragGhost.style.color = 'white';
    dragGhost.style.borderRadius = '4px';
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 20, 20);
    
    setTimeout(() => {
      document.body.removeChild(dragGhost);
    }, 0);
  };

  const calculateDropZone = (e: React.DragEvent<HTMLDivElement>, element: HTMLElement): DropZone => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Calculate percentage from edges
    const xPct = x / rect.width;
    const yPct = y / rect.height;
    
    // Determine the drop zone exactly like flexlayout
    if (yPct < 0.25) return 'top';
    if (yPct > 0.75) return 'bottom';
    if (xPct < 0.25) return 'left';
    if (xPct > 0.75) return 'right';
    return 'center'; // Center means tabbing
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (id === draggedWidgetId) {
      setHoverTarget(null);
      return;
    }
    
    const zone = calculateDropZone(e, e.currentTarget);
    setHoverTarget({ id, zone });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    // Only clear if we actually left the element, not just a child
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setHoverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();
    if (!draggedWidgetId || draggedWidgetId === targetId || !hoverTarget) {
      setDraggedWidgetId(null);
      setHoverTarget(null);
      return;
    }

    const newWidgets = [...widgets];
    const draggedIndex = newWidgets.findIndex((w) => w.id === draggedWidgetId);
    const targetIndex = newWidgets.findIndex((w) => w.id === targetId);

    // Swap the elements to simulate the drop (in a real engine this would split panes)
    const temp = newWidgets[draggedIndex];
    newWidgets[draggedIndex] = newWidgets[targetIndex];
    newWidgets[targetIndex] = temp;

    setWidgets(newWidgets);
    setDraggedWidgetId(null);
    setHoverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedWidgetId(null);
    setHoverTarget(null);
  };

  // Render the blue drop overlay
  const renderOverlay = (widgetId: string) => {
    if (hoverTarget?.id !== widgetId || !hoverTarget.zone) return null;
    
    let insetStyles = 'inset-0'; // Default center
    
    switch (hoverTarget.zone) {
      case 'top': insetStyles = 'top-0 left-0 right-0 bottom-1/2'; break;
      case 'bottom': insetStyles = 'top-1/2 left-0 right-0 bottom-0'; break;
      case 'left': insetStyles = 'top-0 left-0 right-1/2 bottom-0'; break;
      case 'right': insetStyles = 'top-0 left-1/2 right-0 bottom-0'; break;
      case 'center': insetStyles = 'inset-0'; break;
    }

    return (
      <div 
        className={`absolute ${insetStyles} bg-blue-500/30 border-2 border-blue-500 z-50 pointer-events-none transition-all duration-100 ease-out`}
      />
    );
  };

  return (
    <div className="h-full w-full bg-[#f4f4f5] flex flex-col font-sans p-2">
      {/* Mocking the container to look exactly like the flexlayout dashboard */}
      <div className="flex-1 flex gap-2">
        {/* We'll render them linearly for this POC, but give them flex logic */}
        <div className="flex-[70%] flex flex-col gap-2">
          {widgets.slice(0, 2).map(widget => (
            <div 
              key={widget.id}
              className={`flex-1 flex flex-col bg-white border border-zinc-200 relative
                ${draggedWidgetId === widget.id ? 'opacity-50' : 'opacity-100'}
              `}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widget.id)}
            >
              {renderOverlay(widget.id)}
              
              {/* Tab Header exactly like FlexLayout */}
              <div className="flex bg-[#f4f4f5] border-b border-zinc-200">
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center px-4 py-1.5 bg-white border-b-2 border-blue-600 text-zinc-900 text-xs font-medium cursor-grab active:cursor-grabbing border-r border-r-zinc-200"
                >
                  <span className="text-zinc-500">{widget.icon}</span>
                  {widget.title}
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden pointer-events-none">
                 <div className="absolute inset-0 pointer-events-auto">
                   {widget.component}
                 </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex-[30%] flex flex-col">
          {widgets.slice(2, 3).map(widget => (
            <div 
              key={widget.id}
              className={`flex-1 flex flex-col bg-white border border-zinc-200 relative
                ${draggedWidgetId === widget.id ? 'opacity-50' : 'opacity-100'}
              `}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, widget.id)}
            >
              {renderOverlay(widget.id)}
              <div className="flex bg-[#f4f4f5] border-b border-zinc-200">
                <div 
                  draggable
                  onDragStart={(e) => handleDragStart(e, widget.id)}
                  onDragEnd={handleDragEnd}
                  className="flex items-center px-4 py-1.5 bg-white border-b-2 border-blue-600 text-zinc-900 text-xs font-medium cursor-grab active:cursor-grabbing border-r border-r-zinc-200"
                >
                  <span className="text-zinc-500">{widget.icon}</span>
                  {widget.title}
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden pointer-events-none">
                 <div className="absolute inset-0 pointer-events-auto">
                   {widget.component}
                 </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
