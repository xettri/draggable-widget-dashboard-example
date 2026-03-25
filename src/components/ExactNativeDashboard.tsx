import React, { useState } from 'react';
import { ChartWidget } from './widgets/ChartWidget';
import { OptionsWidget } from './widgets/OptionsWidget';
import { List, LineChart, FileText } from 'lucide-react';

// --- Types for our Layout Engine ---
type DropZone = 'top' | 'bottom' | 'left' | 'right' | 'center' | null;

type TabData = {
  id: string;
  title: string;
  component: React.ReactNode;
  icon: React.ReactNode;
};

type TabSetNode = {
  id: string;
  type: 'tabset';
  tabs: TabData[];
  activeTabIndex: number;
};

type SplitNode = {
  id: string;
  type: 'row' | 'col';
  children: LayoutNode[];
};

type LayoutNode = TabSetNode | SplitNode;

let nextId = 100;
const generateId = () => `node_${nextId++}`;

// --- Initial Tree ---
const initialLayout: LayoutNode = {
  id: 'root',
  type: 'row',
  children: [
    {
      id: 'tabset_1',
      type: 'tabset',
      activeTabIndex: 0,
      tabs: [
        { id: 'chart', title: 'NIFTY 50 Chart', component: <ChartWidget />, icon: <LineChart className="w-4 h-4 mr-2" /> },
        { id: 'notes', title: 'Notes', component: <div className="flex h-full items-center justify-center text-zinc-400 bg-white">Notes area</div>, icon: <FileText className="w-4 h-4 mr-2" /> },
      ],
    },
    {
      id: 'tabset_2',
      type: 'tabset',
      activeTabIndex: 0,
      tabs: [
        { id: 'options', title: 'Option Chain', component: <OptionsWidget />, icon: <List className="w-4 h-4 mr-2" /> },
      ],
    },
  ],
};

// Traversal Helpers
const removeTabFromTree = (node: LayoutNode, tabId: string): { tree: LayoutNode | null; removedTab: TabData | null } => {
  if (node.type === 'tabset') {
    const tIdx = node.tabs.findIndex((t) => t.id === tabId);
    if (tIdx >= 0) {
      const removedTab = node.tabs[tIdx];
      const newTabs = [...node.tabs];
      newTabs.splice(tIdx, 1);
      
      if (newTabs.length === 0) {
        return { tree: null, removedTab }; // TabSet is empty, remove it
      }
      return { 
        tree: { ...node, tabs: newTabs, activeTabIndex: Math.max(0, node.activeTabIndex > tIdx ? node.activeTabIndex - 1 : node.activeTabIndex) }, 
        removedTab 
      };
    }
    return { tree: node, removedTab: null };
  } else {
    let removedTab: TabData | null = null;
    const newChildren: LayoutNode[] = [];
    
    for (const child of node.children) {
      const result = removeTabFromTree(child, tabId);
      if (result.removedTab) removedTab = result.removedTab;
      if (result.tree) newChildren.push(result.tree);
    }

    if (newChildren.length === 0) return { tree: null, removedTab };
    if (newChildren.length === 1) return { tree: newChildren[0], removedTab }; // Collapse single child splits

    return { tree: { ...node, children: newChildren }, removedTab };
  }
};

const insertTabIntoTree = (node: LayoutNode, targetTabSetId: string, zone: DropZone, tabToInsert: TabData): LayoutNode => {
  if (node.type === 'tabset') {
    if (node.id === targetTabSetId) {
      if (zone === 'center') {
        const newTabs = [...node.tabs, tabToInsert];
        return { ...node, tabs: newTabs, activeTabIndex: newTabs.length - 1 };
      }
      
      const newTabSet: TabSetNode = {
        id: generateId(),
        type: 'tabset',
        tabs: [tabToInsert],
        activeTabIndex: 0,
      };

      if (zone === 'left' || zone === 'right') {
        return {
          id: generateId(),
          type: 'row',
          children: zone === 'left' ? [newTabSet, node] : [node, newTabSet],
        };
      } else {
        return {
          id: generateId(),
          type: 'col',
          children: zone === 'top' ? [newTabSet, node] : [node, newTabSet],
        };
      }
    }
    return node;
  } else {
    return {
      ...node,
      children: node.children.map(child => insertTabIntoTree(child, targetTabSetId, zone, tabToInsert)),
    };
  }
};


export const ExactNativeDashboard = () => {
  const [layout, setLayout] = useState<LayoutNode | null>(initialLayout);
  const [draggedTabId, setDraggedTabId] = useState<string | null>(null);
  const [hoverTarget, setHoverTarget] = useState<{ tabSetId: string; zone: DropZone } | null>(null);

  const handleDragStart = (e: React.DragEvent, tabId: string, tabTitle: string) => {
    setDraggedTabId(tabId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', tabId);

    // Custom Drag Ghost
    const dragGhost = document.createElement('div');
    dragGhost.textContent = tabTitle;
    dragGhost.style.padding = '8px 16px';
    dragGhost.style.background = '#2563eb';
    dragGhost.style.color = 'white';
    dragGhost.style.borderRadius = '4px';
    dragGhost.style.position = 'absolute';
    dragGhost.style.top = '-1000px';
    document.body.appendChild(dragGhost);
    e.dataTransfer.setDragImage(dragGhost, 20, 20);
    setTimeout(() => document.body.removeChild(dragGhost), 0);
  };

  const calculateDropZone = (e: React.DragEvent<HTMLDivElement>, element: HTMLElement): DropZone => {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Exact flexlayout style splitting boundaries
    const thresholdX = rect.width * 0.25;
    const thresholdY = rect.height * 0.25;
    
    if (y < thresholdY) return 'top';
    if (y > rect.height - thresholdY) return 'bottom';
    if (x < thresholdX) return 'left';
    if (x > rect.width - thresholdX) return 'right';
    return 'center';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, tabSetId: string) => {
    e.preventDefault();
    e.stopPropagation(); // Very important for nested Layouts!
    e.dataTransfer.dropEffect = 'move';
    
    const zone = calculateDropZone(e, e.currentTarget);
    setHoverTarget({ tabSetId, zone });
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setHoverTarget(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tabSetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!draggedTabId || !hoverTarget || !layout) {
      setDraggedTabId(null);
      setHoverTarget(null);
      return;
    }

    // Process Tree Mutation
    const removalResult = removeTabFromTree(layout, draggedTabId);
    let tree = removalResult.tree;
    const removedTab = removalResult.removedTab;

    if (removedTab && tree) {
      tree = insertTabIntoTree(tree, tabSetId, hoverTarget.zone, removedTab);
      setLayout(tree);
    } else if (removedTab && !tree) {
       // Only one tab was left and we dragged it somewhere illegal
       setLayout(layout);
    }

    setDraggedTabId(null);
    setHoverTarget(null);
  };

  const handleDragEnd = () => {
    setDraggedTabId(null);
    setHoverTarget(null);
  };

  // Render the blue drop overlay
  const renderOverlay = (tabSetId: string) => {
    if (hoverTarget?.tabSetId !== tabSetId || !hoverTarget.zone) return null;
    
    let insetStyles = 'inset-0'; // Center
    switch (hoverTarget.zone) {
      case 'top': insetStyles = 'top-0 left-0 right-0 bottom-1/2'; break;
      case 'bottom': insetStyles = 'top-1/2 left-0 right-0 bottom-0'; break;
      case 'left': insetStyles = 'top-0 left-0 right-1/2 bottom-0'; break;
      case 'right': insetStyles = 'top-0 left-1/2 right-0 bottom-0'; break;
    }

    return (
      <div className={`absolute ${insetStyles} bg-blue-500/30 border-2 border-blue-500 z-50 pointer-events-none transition-all duration-75`} />
    );
  };

  const activateTab = (tabSetId: string, index: number) => {
    // A simple function to switch active tab without a full tree reducer
    const updateActiveTab = (node: LayoutNode): LayoutNode => {
      if (node.type === 'tabset') {
        if (node.id === tabSetId) return { ...node, activeTabIndex: index };
        return node;
      }
      return { ...node, children: node.children.map(updateActiveTab) };
    };
    if (layout) setLayout(updateActiveTab(layout));
  };

  // Recursive Renderer
  const renderNode = (node: LayoutNode, isRoot: boolean = false): React.ReactNode => {
    if (node.type === 'row' || node.type === 'col') {
      const isRow = node.type === 'row';
      return (
        <div className={`flex flex-1 ${isRow ? 'flex-row' : 'flex-col'} gap-2 ${isRoot ? '' : 'overflow-hidden h-full'} `}>
          {node.children.map((child) => (
            <React.Fragment key={child.id}>
              {renderNode(child)}
            </React.Fragment>
          ))}
        </div>
      );
    }

    if (node.type === 'tabset') {
      const activeTab = node.tabs[node.activeTabIndex] || node.tabs[0];
      return (
        <div 
          className="flex-1 flex flex-col bg-white border border-zinc-200 relative min-h-[30px] min-w-[30px] overflow-hidden"
          onDragOver={(e) => handleDragOver(e, node.id)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, node.id)}
        >
          {renderOverlay(node.id)}
          
          <div className="flex bg-[#f4f4f5] border-b border-zinc-200 overflow-x-auto shrink-0 z-10">
            {node.tabs.map((tab, idx) => {
              const isActive = idx === node.activeTabIndex;
              return (
                <div 
                  key={tab.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, tab.id, tab.title)}
                  onDragEnd={handleDragEnd}
                  onClick={() => activateTab(node.id, idx)}
                  className={`flex items-center px-4 py-1.5 text-xs font-medium cursor-grab active:cursor-grabbing border-r border-r-zinc-200 shrink-0 select-none
                    ${isActive ? 'bg-white border-b-2 border-b-blue-600 text-zinc-900 z-10' : 'bg-transparent text-zinc-500 border-b-2 border-b-transparent hover:bg-zinc-100'}
                    ${draggedTabId === tab.id ? 'opacity-30' : 'opacity-100'}
                  `}
                >
                  <span className={`mr-2 ${isActive ? 'text-zinc-600' : 'text-zinc-400'}`}>{tab.icon}</span>
                  {tab.title}
                </div>
              );
            })}
          </div>
          <div className="flex-1 relative bg-white">
            <div className="absolute inset-0 z-0">
               {activeTab?.component}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-full w-full bg-[#f4f4f5] font-sans p-2 overflow-hidden flex flex-col">
       {layout ? renderNode(layout, true) : <div className="p-4">No Layout Data</div>}
    </div>
  );
};
