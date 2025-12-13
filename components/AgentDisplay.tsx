import React from 'react';
import { AgentStatus } from '../types';
import { Bot, PenTool, Palette, SearchCheck } from 'lucide-react';

interface AgentDisplayProps {
  agents: AgentStatus[];
}

const AgentDisplay: React.FC<AgentDisplayProps> = ({ agents }) => {
  const getIcon = (role: AgentStatus['role']) => {
    switch (role) {
      case 'planner': return <Bot className="w-5 h-5" />;
      case 'art_director': return <Palette className="w-5 h-5" />;
      case 'writer': return <PenTool className="w-5 h-5" />;
      case 'reviewer': return <SearchCheck className="w-5 h-5" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-8">
      {agents.map((agent) => (
        <div 
          key={agent.role}
          className={`
            relative p-4 rounded-xl border transition-all duration-300 overflow-hidden
            ${agent.status === 'working' ? 'bg-dark-800 border-brand-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : ''}
            ${agent.status === 'finished' ? 'bg-dark-800 border-green-800/50 opacity-100' : ''}
            ${agent.status === 'idle' ? 'bg-dark-800 border-dark-700 text-gray-500 opacity-60' : ''}
          `}
        >
          <div className="flex items-center gap-3 mb-2 relative z-10">
            <div className={`p-2 rounded-full ${agent.status === 'working' ? 'bg-brand-900/50 text-brand-400 animate-pulse' : 'bg-dark-700 text-gray-400'}`}>
              {getIcon(agent.role)}
            </div>
            <h4 className={`font-semibold text-sm ${agent.status === 'finished' ? 'text-green-400' : 'text-gray-200'}`}>{agent.name}</h4>
          </div>
          <p className="text-xs min-h-[1.5em] text-gray-400 relative z-10">{agent.message}</p>
          
          {agent.status === 'working' && (
            <div className="absolute bottom-0 left-0 h-1 bg-brand-600 w-full">
               <div className="h-full bg-brand-400 w-full origin-left animate-[loading_1.5s_ease-in-out_infinite] opacity-70"></div>
            </div>
          )}
          
          {/* subtle background glow for working agents */}
          {agent.status === 'working' && (
             <div className="absolute -right-4 -top-4 w-16 h-16 bg-brand-500/10 rounded-full blur-xl"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default AgentDisplay;