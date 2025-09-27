import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Navigation } from '@/components/Navigation';
import { CosmicBackground } from '@/components/CosmicBackground';
import { StarCard } from '@/components/StarCard';
import { CreateFragmentModal, type MintingAdapter } from '@/components/CreateFragmentModal';
import { MintedFragmentGallery } from '@/components/MintedFragmentGallery';
import { FusionView } from '@/components/FusionView';
import { useLifeFragmentNftMinting } from '@/hooks/use-life-fragment-nft';
import { useToast } from '@/components/ui/use-toast';
import { shortenAddress } from '@/lib/utils';
import { 
  Star, 
  Sparkles, 
  Heart, 
  Users, 
  Key, 
  Clock,
  Plus,
  Download,
  Upload,
  ArrowRight,
  Database,
  Shield,
  Network,
  Monitor,
  Wallet,
  Check
} from 'lucide-react';
import cosmicBg from '@/assets/cosmic-background.jpg';

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

const IODigitalLife = () => {
  const [activeSection, setActiveSection] = useState('hero');
  const [fragments, setFragments] = useState<LifeFragment[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const nftMinting = useLifeFragmentNftMinting();
  const { toast } = useToast();

  const mintingAdapter = useMemo<MintingAdapter>(() => ({
    account: nftMinting.account,
    isConnecting: nftMinting.isConnecting,
    isMinting: nftMinting.isMinting,
    providerAvailable: nftMinting.providerAvailable,
    walletError: nftMinting.walletError,
    mintError: nftMinting.mintError,
    connectWallet: nftMinting.connectWallet,
    mintOnChain: nftMinting.mintOnChain,
  }), [
    nftMinting.account,
    nftMinting.isConnecting,
    nftMinting.isMinting,
    nftMinting.providerAvailable,
    nftMinting.walletError,
    nftMinting.mintError,
    nftMinting.connectWallet,
    nftMinting.mintOnChain,
  ]);

  // 初始化示例数据
  useEffect(() => {
    const sampleFragments: LifeFragment[] = [
      {
        id: '1',
        title: '致未来的自己',
        type: '文本',
        content: '当你读到这段话时，我希望你还记得曾经仰望星空时的那份纯真与梦想。时间会改变很多，但请不要忘记最初的自己。',
        visibility: '锁定',
        unlockCondition: '口令',
        unlockValue: '123',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        hash: '0xabc123def456789',
        isUnlocked: false,
      },
      {
        id: '2',
        title: '最爱的夜空',
        type: '图片',
        content: '那个夏夜，我们躺在草地上数星星，你说每一颗星星都是一个故事。现在我明白了，我们就是彼此生命中最亮的那颗星。',
        visibility: '锁定',
        unlockCondition: '时间',
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        hash: '0xdef456abc789123',
        isUnlocked: false,
      },
      {
        id: '3',
        title: '给子女的话',
        type: '文本',
        content: '生命如星辰，虽然个体渺小，但每一个都有自己独特的光芒。希望你们能在这个宇宙中找到属于自己的位置，并且永远保持善良。',
        visibility: '锁定',
        unlockCondition: '见证者签名',
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        hash: '0x123abc456def789',
        isUnlocked: true,
      },
    ];
    setFragments(sampleFragments);
  }, []);

  useEffect(() => {
    if (!nftMinting.walletError) return;
    toast({
      title: '钱包连接失败',
      description: nftMinting.walletError,
      variant: 'destructive',
    });
  }, [nftMinting.walletError, toast]);

  useEffect(() => {
    if (!nftMinting.account) return;
    toast({
      title: '钱包已连接',
      description: `当前地址：${shortenAddress(nftMinting.account)}`,
    });
  }, [nftMinting.account, toast]);

  const handleSectionClick = (section: string) => {
    setActiveSection(section);
    const element = document.getElementById(section);
    if (element) {
      const navHeight = 64; // 导航栏高度
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset - navHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleCreateFragment = (fragmentData: Omit<LifeFragment, 'id' | 'hash' | 'createdAt' | 'isUnlocked'>) => {
    const newFragment: LifeFragment = {
      ...fragmentData,
      id: Date.now().toString(),
      hash: `0x${Math.random().toString(16).substr(2, 15)}`,
      createdAt: new Date().toISOString(),
      isUnlocked: fragmentData.visibility === '公开',
    };
    setFragments(prev => [...prev, newFragment]);
  };

  const handleUnlockFragment = (fragmentId: string) => {
    setFragments(prev =>
      prev.map(fragment =>
        fragment.id === fragmentId
          ? { ...fragment, isUnlocked: true }
          : fragment
      )
    );
  };

  const handleFuseFragments = (fragmentIds: string[]) => {
    // 融合逻辑已在FusionView组件内处理
    console.log('Fusing fragments:', fragmentIds);
  };

  const exportData = () => {
    const dataStr = JSON.stringify(fragments, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `io_digital_life_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (Array.isArray(data)) {
          setFragments(data);
        }
      } catch (error) {
        alert('文件格式错误，请选择有效的JSON文件');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <CosmicBackground />
      <Navigation 
        activeSection={activeSection} 
        onSectionClick={handleSectionClick}
      />
      
      {/* Hero Section */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center px-4">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
          style={{ backgroundImage: `url(${cosmicBg})` }}
        />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-starlight-gold/20 border border-starlight-gold/30 mb-6">
              <Sparkles className="w-4 h-4 text-starlight" />
              <span className="text-sm text-starlight font-medium">数字生命 · 永恒星辰</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              当肉体终将消逝，
              <br />
              <span className="text-starlight">数字生命如星辰永不熄灭</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed">
              将你的记忆、信念与人生碎片铸造成加密资产，<br />
              在特定条件下解锁与融合；<span className="text-starlight">归于宇宙，却仍被看见</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => setShowDemo(true)}
              className="btn-cosmic text-lg px-8 py-4"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              立即体验MVP演示
            </Button>
            <Button 
              onClick={() => handleSectionClick('values')}
              variant="outline" 
              className="text-lg px-8 py-4 border-starlight-gold/30 hover:border-starlight-gold"
            >
              了解价值主张
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => {
                if (!nftMinting.account && !nftMinting.isConnecting) {
                  void nftMinting.connectWallet().catch((error) => {
                    alert(error instanceof Error ? error.message : '连接钱包失败，请稍后再试。');
                  });
                }
              }}
              disabled={nftMinting.isConnecting}
              variant={nftMinting.account ? 'default' : 'outline'}
              className={`text-lg px-8 py-4 flex items-center justify-center gap-2 transition-all ${nftMinting.account
                ? 'btn-cosmic text-foreground shadow-starlight'
                : 'border-starlight-gold/40 text-starlight hover:border-starlight-gold'
              } ${nftMinting.isConnecting ? 'opacity-80 cursor-progress' : ''}`}
            >
              {nftMinting.account ? (
                <>
                  <Check className="w-5 h-5" />
                  <span>已连接 {shortenAddress(nftMinting.account)}</span>
                </>
              ) : (
                <>
                  <Wallet className="w-5 h-5" />
                  <span>{nftMinting.providerAvailable ? (nftMinting.isConnecting ? '连接中…' : '连接浏览器钱包') : '未检测到浏览器钱包'}</span>
                </>
              )}
            </Button>
          </div>
          
          <div className="mt-12 text-sm text-muted-foreground">
            <Badge variant="outline" className="border-starlight-gold/30">
              ⚠️ 铸造操作将发起真实链上交易，请确保网络与合约配置正确
            </Badge>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section id="values" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-starlight">核心价值主张</h2>
            <p className="text-xl text-muted-foreground">
              让数字生命在宇宙中永恒延续，如星辰般被后人仰望
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="star-card text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-starlight" />
              <h3 className="text-xl font-semibold mb-3 text-starlight">保存与延续</h3>
              <p className="text-muted-foreground">
                思想、记忆、情感的流转被记录，化作夜空长明之星，让生命的本质得以永续传承
              </p>
            </Card>
            
            <Card className="star-card text-center">
              <Users className="w-12 h-12 mx-auto mb-4 text-starlight" />
              <h3 className="text-xl font-semibold mb-3 text-starlight">代际共鸣</h3>
              <p className="text-muted-foreground">
                后人可在特定条件下查看、理解与共鸣，如仰望同��片星空，跨越时空的心灵对话
              </p>
            </Card>
            
            <Card className="star-card text-center">
              <Network className="w-12 h-12 mx-auto mb-4 text-starlight" />
              <h3 className="text-xl font-semibold mb-3 text-starlight">解锁与融合</h3>
              <p className="text-muted-foreground">
                在触发条件下公开、解锁、融合为你的"数字星系"，形成独特的生命星图
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-starlight">功能演示</h2>
            <p className="text-xl text-muted-foreground mb-8">
              体验完整的生命碎片创建、铸造、解锁与融合流程
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="btn-cosmic"
              >
                <Plus className="w-5 h-5 mr-2" />
                创建生命碎片
              </Button>
              
              <Button onClick={exportData} variant="outline">
                <Download className="w-5 h-5 mr-2" />
                导出数据
              </Button>
              
              <Button onClick={() => document.getElementById('importInput')?.click()} variant="outline">
                <Upload className="w-5 h-5 mr-2" />
                导入数据
              </Button>
              <input
                id="importInput"
                type="file"
                accept=".json"
                onChange={importData}
                className="hidden"
              />
            </div>
          </div>

          <div className="space-y-4 mb-12">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold text-starlight">已铸造的生命碎片</h3>
                <p className="text-sm text-muted-foreground">
                  最近一次链上铸造会自动记录在此列表。点击“Burn 本地记录”即可移除显示（不会销毁链上资产）。
                </p>
              </div>
              <Badge variant="outline" className="border-starlight/40">
                {nftMinting.mintedFragments.length ? `共 ${nftMinting.mintedFragments.length} 条记录` : '尚无记录'}
              </Badge>
            </div>
            <MintedFragmentGallery
              items={nftMinting.mintedFragments}
              onBurn={nftMinting.burnLocalRecord}
            />
          </div>

          {/* Fragment Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {fragments.map((fragment) => (
              <StarCard
                key={fragment.id}
                fragment={fragment}
                onUnlock={handleUnlockFragment}
              />
            ))}
          </div>

          {/* Fusion View */}
          <FusionView 
            fragments={fragments}
            onFuse={handleFuseFragments}
          />
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-starlight">用户流程</h2>
            <p className="text-xl text-muted-foreground">
              简单五步，让你的数字生命化作永恒星辰
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {[
              { icon: Plus, title: '记录碎片', desc: '创建生命记忆与思考' },
              { icon: Key, title: '设定条件', desc: '选择可见性与解锁方式' },
              { icon: Sparkles, title: '铸造资产', desc: '模拟链上铸造流程' },
              { icon: Clock, title: '条件触发', desc: '解锁并展现内容' },
              { icon: Star, title: '星辰延续', desc: '融合为数字星座' },
            ].map((step, index) => (
              <div key={index} className="text-center relative">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-starlight-gold to-nebula-purple flex items-center justify-center">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
                
                {index < 4 && (
                  <ArrowRight className="hidden md:block absolute top-8 -right-4 w-6 h-6 text-starlight-gold/50" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 px-4 bg-muted/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-starlight">系统架构示意</h2>
            <p className="text-xl text-muted-foreground">
              基于Web3技术栈的去中心化数字生命存储与传承系统
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="star-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-starlight">前端层</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• 生命碎片创建与管理</li>
                <li>• 星图融合可视化界面</li>
                <li>• 解锁条件控制面板</li>
              </ul>
            </Card>
            
            <Card className="star-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-starlight">中间层</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• 加密策略与密钥管理</li>
                <li>• 解锁条件验证引擎</li>
                <li>• 内容分发与权限控制</li>
              </ul>
            </Card>
            
            <Card className="star-card text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-starlight">链上层</h3>
              <ul className="text-sm text-muted-foreground space-y-1 text-left">
                <li>• NFT元数据与哈希存证</li>
                <li>• 智能合约事件触发</li>
                <li>• 去中心化存储网络</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border/30">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Star className="w-6 h-6 text-starlight" />
            <span className="text-xl font-bold text-starlight">数字生命档案馆</span>
          </div>
          <p className="text-muted-foreground mb-4">
            让每一个生命都如星辰般永恒闪耀
          </p>
          <div className="text-xs text-muted-foreground">
            <Badge variant="outline" className="border-starlight-gold/30">
              演示版本 - 技术概念验证
            </Badge>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateFragmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateFragment}
        minting={mintingAdapter}
      />
    </div>
  );
};

export default IODigitalLife;
