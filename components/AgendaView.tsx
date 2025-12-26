import React, { useState, useEffect } from 'react';

interface AgendaItem {
  id: number;
  time: string;
  duration: string;
  title: string;
  type: 'sign' | 'speech' | 'award' | 'show' | 'draw' | 'dinner' | 'photo';
  description: string;
  music: string;
  lighting: string;
  guest?: string;
}

const AGENDA_DATA: AgendaItem[] = [
  {
    id: 1,
    time: '18:00 - 18:30',
    duration: '30min',
    title: '签到入场 & 暖场 VCR',
    type: 'sign',
    description: '员工入场签到，领取伴手礼及抽奖券，大屏幕滚动播放公司年度回顾视频。',
    music: '轻快科技感背景音乐 (Upbeat Tech)',
    lighting: '全场暖蓝色基础光，镭射灯慢速扫描',
  },
  {
    id: 2,
    time: '18:30 - 18:45',
    duration: '15min',
    title: '领导致辞 (2026 愿景)',
    type: 'speech',
    description: 'CEO 发表开幕致辞，总结 2025 辉煌成就，展望 2026 “进窄门、走远路、见微光”战略目标。',
    music: '激昂进行曲 (Grand Entrance)',
    lighting: '追光聚焦演讲台，全场灯光调暗',
    guest: '朱博 (CEO)',
  },
  {
    id: 3,
    time: '18:45 - 19:15',
    duration: '30min',
    title: '年度颁奖盛典 (第一批)',
    type: 'award',
    description: '颁发“年度最佳新人”、“优秀团队”及“创新开拓奖”。',
    music: '荣耀颁奖曲 (Victory)',
    lighting: '金色氛围灯，颁奖时刻爆破彩带灯效',
  },
  {
    id: 4,
    time: '19:15 - 19:40',
    duration: '25min',
    title: '节目表演:《微光之歌》(合唱)',
    type: 'show',
    description: '研发部带来的原创合唱节目，展现团队凝聚力。',
    music: '现场演奏 + 伴奏',
    lighting: '舞台柔光，点点微光屏特效',
    guest: '研发部合唱团',
  },
  {
    id: 5,
    time: '19:40 - 19:50',
    duration: '10min',
    title: '第一轮抽奖: 幸运微光奖',
    type: 'draw',
    description: '抽取 50 名三等奖获得者，奖品为最新智能穿戴设备。',
    music: '紧张悬疑转场音乐 (Drumroll)',
    lighting: '疯狂闪烁霓虹光，中奖时刻全场通亮',
  },
  {
    id: 6,
    time: '19:50 - 20:30',
    duration: '40min',
    title: '年会晚宴 & 部门交流',
    type: 'dinner',
    description: '正式用餐环节，各部门自由交流，增进跨团队感情。',
    music: '轻音乐/爵士乐 (Lounge Jazz)',
    lighting: '温馨暖黄色调，环境氛围光',
  },
  {
    id: 7,
    time: '20:30 - 21:00',
    duration: '30min',
    title: '多元才艺 Show (舞/奏/演)',
    type: 'show',
    description: '串烧节目：包含动感现代舞、萨克斯独奏及幽默职场小品。',
    music: '多种风格切换',
    lighting: '动感摇头灯，根据节目类型变换冷暖色',
    guest: '销售部、市场部、质量部',
  },
  {
    id: 8,
    time: '21:00 - 21:20',
    duration: '20min',
    title: '终极抽奖: 见微光大奖',
    type: 'draw',
    description: '抽取特等奖 1 名（现金大奖），一等奖 3 名。',
    music: '极度紧张高潮音乐 (Peak Excitement)',
    lighting: '全场红蓝闪烁，大屏幕动态光效',
  },
  {
    id: 9,
    time: '21:20 - 21:30',
    duration: '10min',
    title: '结束语 & 全体合影',
    type: 'photo',
    description: '主持人总结，全体员工舞台前大合影，记录美好瞬间。',
    music: '温馨结束曲 (Final Toast)',
    lighting: '全场满亮度，适合摄影的高显指白光',
  }
];

export const AgendaView: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [likes, setLikes] = useState<Record<number, number>>({});

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatus = (timeStr: string) => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    const [start] = timeStr.split(' - ');
    const [startH, startM] = start.split(':').map(Number);
    
    if (hour > startH || (hour === startH && minute >= startM)) return 'active';
    return 'pending';
  };

  const getTypeIcon = (type: AgendaItem['type']) => {
    switch(type) {
      case 'sign': return '📝';
      case 'speech': return '🎤';
      case 'award': return '🏆';
      case 'show': return '💃';
      case 'draw': return '🎁';
      case 'dinner': return '🍽️';
      case 'photo': return '📸';
      default: return '📍';
    }
  };

  const handleLike = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikes(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-4 px-2 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-center mb-10">
        <button 
          onClick={onBack}
          className="text-slate-400 hover:text-white flex items-center gap-2 transition-colors bg-white/5 px-4 py-2 rounded-xl"
        >
          <span>←</span> 返回报名
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-white tracking-tight">年会流程 微光之夜</h2>
          <p className="text-cyan-500 text-xs font-mono">2026.01.20 | 18:00 - 21:30</p>
        </div>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
        {AGENDA_DATA.map((item, index) => {
          const status = getStatus(item.time);
          const isActive = status === 'active' && index === 2;
          const isExpanded = expandedId === item.id;

          return (
            <div key={item.id} className={`relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group animate-in fade-in slide-in-from-bottom-4 duration-500`} style={{ animationDelay: `${index * 100}ms` }}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-slate-900 text-white z-10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-all duration-500 ${isActive ? 'ring-4 ring-cyan-500/30 scale-125 border-cyan-500' : ''}`}>
                <span className={isActive ? 'animate-pulse' : ''}>{getTypeIcon(item.type)}</span>
              </div>

              <div 
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
                className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl glass border transition-all duration-500 cursor-pointer hover:border-white/20 ${isActive ? 'border-cyan-500/50 shadow-[0_0_20px_rgba(34,211,238,0.1)]' : 'border-white/5'}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter ${isActive ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {item.duration}
                    </span>
                    <time className="font-mono text-xs text-slate-400">{item.time}</time>
                  </div>
                  {item.type === 'show' && (
                    <button 
                      onClick={(e) => handleLike(item.id, e)}
                      className="flex items-center gap-1.5 text-[10px] font-bold bg-pink-500/10 text-pink-500 px-3 py-1 rounded-full border border-pink-500/20 hover:bg-pink-500/20 transition-all active:scale-90"
                    >
                      ❤️ {likes[item.id] || 0}
                    </button>
                  )}
                </div>
                
                <h3 className={`text-lg font-bold transition-colors ${isActive ? 'text-white' : 'text-slate-300'}`}>
                  {item.title}
                </h3>
                
                {item.guest && (
                  <p className="text-xs text-cyan-400/80 mt-1 font-medium">{item.guest}</p>
                )}

                <div className={`overflow-hidden transition-all duration-500 ${isExpanded ? 'max-h-96 mt-4 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-4 pt-4 border-t border-white/5">
                    <div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">环节描述</h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-bold text-cyan-500/70 uppercase tracking-widest mb-1">BGM 建议</h4>
                        <p className="text-[10px] text-slate-400">{item.music}</p>
                      </div>
                      <div className="bg-slate-900/40 p-3 rounded-xl border border-white/5">
                        <h4 className="text-[10px] font-bold text-purple-500/70 uppercase tracking-widest mb-1">灯光建议</h4>
                        <p className="text-[10px] text-slate-400">{item.lighting}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className={`mt-3 text-[10px] font-medium transition-opacity ${isExpanded ? 'opacity-0' : 'opacity-40'}`}>
                  点击查看详情 • {isExpanded ? '收起' : '展开'}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-12 p-6 glass rounded-2xl border border-cyan-500/10 text-center">
        <p className="text-slate-400 text-xs">注意：实际流程可能根据现场情况微调，请以现场大屏幕显示为准。</p>
      </div>
    </div>
  );
};
