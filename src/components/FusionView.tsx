import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Network, Calendar, Sparkles, Star, GitBranch } from 'lucide-react';

interface LifeFragment {
  id: string;
  title: string;
  type: '文本' | '图片' | '音频' | '视频';
  content: string;
  visibility: '私密' | '锁定' | '公开';
  unlockCondition: '时间' | '口令' | '见证者签名';
  unlockValue?: string;
  createdAt: string;
  hash: string;
  isUnlocked: boolean;
}

interface FusionViewProps {
  fragments: LifeFragment[];
  onFuse: (fragmentIds: string[]) => void;
}

export const FusionView = ({ fragments, onFuse }: FusionViewProps) => {
  const [selectedFragments, setSelectedFragments] = useState<string[]>([]);
  const [fusedContent, setFusedContent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'timeline' | 'constellation'>('constellation');

  const unlockedFragments = fragments.filter(f => f.isUnlocked);

  const handleFragmentSelect = (fragmentId: string) => {
    setSelectedFragments(prev => {
      if (prev.includes(fragmentId)) {
        return prev.filter(id => id !== fragmentId);
      }
      return [...prev, fragmentId];
    });
  };

  const handleFusion = () => {
    if (selectedFragments.length < 2) {
      alert('请至少选择两个碎片进行融合');
      return;
    }

    const selectedData = fragments.filter(f => selectedFragments.includes(f.id));
    const fusedTitle = `数字星座 - ${selectedData.map(f => f.title).join(' × ')}`;
    const fusedDescription = `融合了 ${selectedData.length} 个生命碎片，形成了一个新的数字星座。这些记忆和思考彼此呼应，如星辰般连接成了独特的生命轨迹。`;
    
    setFusedContent(`${fusedTitle}\n\n${fusedDescription}\n\n融合内容摘要：\n${selectedData.map((f, i) => `${i + 1}. ${f.title}: ${f.content.substring(0, 50)}...`).join('\n')}`);
    onFuse(selectedFragments);
  };

  const ConstellationView = () => {
    const gridSize = Math.ceil(Math.sqrt(unlockedFragments.length));
    
    return (
      <div className="relative p-8 fusion-view rounded-xl border border-nebula-purple/30 min-h-[400px]">
        {/* 星座背景网格 */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none" 
          viewBox="0 0 400 300"
          preserveAspectRatio="xMidYMid meet"
        >
          {/* 绘制连接线 */}
          {selectedFragments.length > 1 && unlockedFragments.map((fragment, index) => {
            if (!selectedFragments.includes(fragment.id)) return null;
            
            const nextSelected = unlockedFragments.find((f, i) => 
              i > index && selectedFragments.includes(f.id)
            );
            
            if (!nextSelected) return null;
            
            const currentIndex = unlockedFragments.indexOf(fragment);
            const nextIndex = unlockedFragments.indexOf(nextSelected);
            
            const x1 = (currentIndex % gridSize) * (360 / gridSize) + 50;
            const y1 = Math.floor(currentIndex / gridSize) * (200 / gridSize) + 50;
            const x2 = (nextIndex % gridSize) * (360 / gridSize) + 50;
            const y2 = Math.floor(nextIndex / gridSize) * (200 / gridSize) + 50;
            
            return (
              <line
                key={`${fragment.id}-${nextSelected.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className="constellation-line"
              />
            );
          })}
        </svg>

        {/* 星点（碎片） */}
        <div className="relative z-10 grid gap-4" style={{ 
          gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
          minHeight: '300px' 
        }}>
          {unlockedFragments.map((fragment, index) => (
            <div
              key={fragment.id}
              onClick={() => handleFragmentSelect(fragment.id)}
              className={`
                relative cursor-pointer transition-all duration-300 p-4 rounded-lg border
                ${selectedFragments.includes(fragment.id) 
                  ? 'bg-starlight-gold/20 border-starlight-gold shadow-starlight' 
                  : 'bg-card/40 border-border/30 hover:border-starlight-gold/50'
                }
              `}
            >
              <div className="flex items-center gap-2 mb-2">
                <Star className={`w-4 h-4 ${
                  selectedFragments.includes(fragment.id) ? 'text-starlight' : 'text-muted-foreground'
                }`} />
                <span className="text-xs font-medium">{fragment.type}</span>
              </div>
              <h4 className="text-sm font-semibold mb-1">{fragment.title}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2">
                {fragment.content}
              </p>
              
              {selectedFragments.includes(fragment.id) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-starlight rounded-full animate-pulse" />
              )}
            </div>
          ))}
        </div>

        {/* 选择提示 */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              已选择 {selectedFragments.length} 个碎片
            </span>
            {selectedFragments.length >= 2 && (
              <Button onClick={handleFusion} className="btn-cosmic" size="sm">
                <Sparkles className="w-4 h-4 mr-2" />
                融合为星座
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  };

  const TimelineView = () => (
    <div className="space-y-4">
      {unlockedFragments
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .map((fragment, index) => (
          <div key={fragment.id} className="relative">
            {/* 时间轴线 */}
            {index < unlockedFragments.length - 1 && (
              <div className="absolute left-4 top-12 w-px h-16 bg-starlight-gold/30" />
            )}
            
            <div
              onClick={() => handleFragmentSelect(fragment.id)}
              className={`
                flex items-start gap-4 cursor-pointer p-4 rounded-lg border transition-all
                ${selectedFragments.includes(fragment.id) 
                  ? 'bg-starlight-gold/20 border-starlight-gold' 
                  : 'bg-card/40 border-border/30 hover:border-starlight-gold/50'
                }
              `}
            >
              <div className="flex-shrink-0">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${selectedFragments.includes(fragment.id) 
                    ? 'bg-starlight border-starlight' 
                    : 'bg-background border-border'
                  }
                `}>
                  <Star className="w-4 h-4" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">{fragment.title}</h4>
                  <span className="text-xs text-muted-foreground">{fragment.type}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {fragment.content}
                </p>
                <div className="text-xs text-muted-foreground">
                  {new Date(fragment.createdAt).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );

  if (fusedContent) {
    return (
      <Card className="p-6 bg-card/80 backdrop-blur-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-starlight-gold to-nebula-purple flex items-center justify-center">
            <GitBranch className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-starlight mb-2">融合完成</h3>
          <p className="text-muted-foreground">你的生命碎片已融合为一个新的数字星座</p>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-4 mb-6">
          <pre className="whitespace-pre-wrap text-sm">{fusedContent}</pre>
        </div>
        
        <div className="flex gap-3">
          <Button 
            onClick={() => {
              setFusedContent(null);
              setSelectedFragments([]);
            }}
            variant="outline"
            className="flex-1"
          >
            创建新星座
          </Button>
          <Button className="flex-1 btn-cosmic">
            <Network className="w-4 h-4 mr-2" />
            分享星座
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-starlight mb-2">星图融合视图</h3>
        <p className="text-muted-foreground">
          选择多个解锁的生命碎片，将它们融合成你独特的数字星座
        </p>
      </div>

      {unlockedFragments.length === 0 ? (
        <Card className="p-8 text-center bg-card/40">
          <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h4 className="font-semibold mb-2">还没有解锁的碎片</h4>
          <p className="text-sm text-muted-foreground">
            创建并解锁一些生命碎片后，就可以在这里将它们融合为数字星座了
          </p>
        </Card>
      ) : (
        <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'timeline' | 'constellation')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="constellation" className="flex items-center gap-2">
              <Network className="w-4 h-4" />
              星座视图
            </TabsTrigger>
            <TabsTrigger value="timeline" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              时间轴
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="constellation">
            <ConstellationView />
          </TabsContent>
          
          <TabsContent value="timeline">
            <TimelineView />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};