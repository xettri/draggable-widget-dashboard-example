import { Search } from 'lucide-react';

export const OptionsWidget = () => {
  return (
    <div className="w-full h-full flex flex-col bg-white items-center justify-center text-zinc-500">
      <div className="text-center p-6 space-y-4">
        <div className="w-20 h-20 mx-auto bg-zinc-100 rounded-lg flex items-center justify-center">
          <div className="space-y-2">
            <div className="w-12 h-2 bg-zinc-200 rounded-full" />
            <div className="w-16 h-2 bg-zinc-200 rounded-full" />
            <div className="w-10 h-2 bg-zinc-200 rounded-full" />
          </div>
        </div>
        <p className="text-sm">
          This instrument is not traded in the options
          <br />
          market or could not be found.
        </p>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium text-sm flex items-center justify-center gap-2 mx-auto transition-colors">
          <Search size={16} />
          Search
        </button>
      </div>
    </div>
  );
};
