import React, { useState } from 'react';
import { Layout, Model, TabNode, type IJsonModel } from 'flexlayout-react';
import 'flexlayout-react/style/light.css';
import { ChartWidget } from './widgets/ChartWidget';
import { OptionsWidget } from './widgets/OptionsWidget';
import { LineChart, Settings, List, FileText } from 'lucide-react';

const json: IJsonModel = {
  global: {
    tabEnableClose: true,
    tabEnableRename: true,
    tabSetEnableMaximize: true,
    tabSetMinWidth: 100,
    tabSetMinHeight: 100,
    borderMinSize: 100,
  },
  borders: [],
  layout: {
    type: 'row',
    weight: 100,
    children: [
      {
        type: 'tabset',
        weight: 70,
        children: [
          {
            type: 'tab',
            name: 'Chart',
            component: 'chart',
            id: 'chart_1',
            icon: 'chart',
          },
          {
            type: 'tab',
            name: 'Notes',
            component: 'notes',
            id: 'notes_1',
            icon: 'notes',
          },
        ],
      },
      {
        type: 'tabset',
        weight: 30,
        children: [
          {
            type: 'tab',
            name: 'Option chain',
            component: 'options',
            id: 'options_1',
            icon: 'list',
          },
        ],
      },
    ],
  },
};

export const Dashboard = () => {
  const [model] = useState(() => Model.fromJson(json));

  const factory = React.useCallback((node: TabNode) => {
    const component = node.getComponent();
    switch (component) {
      case 'chart':
        return <ChartWidget />;
      case 'options':
        return <OptionsWidget />;
      case 'notes':
        return (
          <div className="flex h-full items-center justify-center text-zinc-400 bg-white">
            <p>Notes widget area</p>
          </div>
        );
      default:
        return (
          <div className="flex h-full items-center justify-center text-zinc-400 bg-white shadow-inner">
            <p>Unknown component: {component}</p>
          </div>
        );
    }
  }, []);

  const onRenderTab = React.useCallback(
    (node: TabNode, renderState: { leading: React.ReactNode; content: React.ReactNode }) => {
      const iconBase = 'w-4 h-4 mr-2 text-zinc-500';
      switch (node.getIcon()) {
        case 'chart':
          renderState.leading = <LineChart className={iconBase} />;
          break;
        case 'list':
          renderState.leading = <List className={iconBase} />;
          break;
        case 'notes':
          renderState.leading = <FileText className={iconBase} />;
          break;
      }
    },
    []
  );

  const classNameMapper = React.useCallback((defaultClassName: string) => {
    return defaultClassName;
  }, []);

  return (
    <div className="h-screen w-screen bg-zinc-100 flex flex-col font-sans text-sm">
      {/* Top Header Mockup */}
      <div className="h-12 bg-white border-b border-zinc-200 flex items-center px-4 justify-between shrink-0 shadow-sm z-10">
        <div className="flex space-x-6 items-center">
          <div className="font-bold text-red-600 flex items-center gap-2">
            <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white">
              V
            </div>
            <span>Trade</span>
          </div>
          <div className="text-zinc-500 hidden md:flex space-x-4 text-xs font-semibold">
            <span>NIFTY BANK 53708.10 (+2.10%)</span>
            <span>NIFTY 50 23806.40 (+1.89%)</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-zinc-600">
          <Settings className="w-5 h-5 cursor-pointer hover:text-zinc-900" />
        </div>
      </div>

      {/* Main Dashboard Layout Area */}
      <div className="flex-1 relative overflow-hidden bg-zinc-100 p-2">
        <Layout
          model={model}
          factory={factory}
          onRenderTab={onRenderTab}
          classNameMapper={classNameMapper}
        />
      </div>
    </div>
  );
};
