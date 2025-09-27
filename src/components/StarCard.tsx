import { useState } from 'react';
import { Lock, Unlock, Calendar, Key, Users, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

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

interface StarCardProps {
  fragment: LifeFragment;
  onUnlock: (id: string) => void;
}

export const StarCard = ({ fragment, onUnlock }: StarCardProps) => {
  const [unlockInput, setUnlockInput] = useState('');
  const [showUnlockInput, setShowUnlockInput] = useState(false);

  const getConditionIcon = () => {
    switch (fragment.unlockCondition) {
      case '时间':
        return <Calendar className="w-4 h-4" />;
      case '口令':
        return <Key className="w-4 h-4" />;
      case '见证者签名':
        return <Users className="w-4 h-4" />;
      default:
        return <Lock className="w-4 h-4" />;
    }
  };

  const getVisibilityIcon = () => {
    if (fragment.isUnlocked) {
      return <Eye className="w-4 h-4 text-starlight" />;
    }
    return <EyeOff className="w-4 h-4 text-muted-foreground" />;
  };

  const handleUnlock = () => {
    if (fragment.unlockCondition === '口令') {
      if (unlockInput === '123' || unlockInput === fragment.unlockValue) {
        onUnlock(fragment.id);
        setShowUnlockInput(false);
        setUnlockInput('');
      } else {
        alert('口令错误，请重试');
      }
    } else {
      onUnlock(fragment.id);
    }
  };

  return (
    <div className={`star-card ${fragment.isUnlocked ? 'unlocked' : ''}`}>
      {/* 星光粒子装饰 */}
      {fragment.isUnlocked && (
        <>
          <div className="stellar-particle" style={{ top: '10px', right: '15px' }} />
          <div className="stellar-particle" style={{ top: '25px', right: '30px', animationDelay: '1s' }} />
          <div className="stellar-particle" style={{ bottom: '15px', left: '20px', animationDelay: '2s' }} />
        </>
      )}

      <div className="relative z-10">
        {/* 卡片头部 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {getVisibilityIcon()}
            <span className="text-sm text-muted-foreground">{fragment.type}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {getConditionIcon()}
            <span>{fragment.unlockCondition}</span>
          </div>
        </div>

        {/* 标题 */}
        <h3 className="text-lg font-semibold mb-2 text-starlight">{fragment.title}</h3>

        {/* 内容区域 */}
        <div className="mb-4">
          {fragment.isUnlocked ? (
            <div>
              <p className="text-foreground mb-3">{fragment.content}</p>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>创建时间: {new Date(fragment.createdAt).toLocaleString('zh-CN')}</p>
                <p className="font-mono">哈希: {fragment.hash}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="h-20 bg-muted/30 rounded-lg flex items-center justify-center">
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                内容已锁定，需要满足解锁条件
              </p>
            </div>
          )}
        </div>

        {/* 解锁控制 */}
        {!fragment.isUnlocked && (
          <div className="space-y-3">
            {fragment.unlockCondition === '时间' && (
              <Button
                onClick={handleUnlock}
                className="w-full btn-cosmic"
                size="sm"
              >
                <Calendar className="w-4 h-4 mr-2" />
                时间已到，解锁内容
              </Button>
            )}

            {fragment.unlockCondition === '口令' && (
              <div>
                {showUnlockInput ? (
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="请输入解锁口令..."
                      value={unlockInput}
                      onChange={(e) => setUnlockInput(e.target.value)}
                      className="bg-input/50"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={handleUnlock}
                        className="flex-1 btn-cosmic"
                        size="sm"
                      >
                        <Unlock className="w-4 h-4 mr-2" />
                        解锁
                      </Button>
                      <Button
                        onClick={() => setShowUnlockInput(false)}
                        variant="outline"
                        size="sm"
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={() => setShowUnlockInput(true)}
                    className="w-full btn-cosmic"
                    size="sm"
                  >
                    <Key className="w-4 h-4 mr-2" />
                    输入解锁口令
                  </Button>
                )}
              </div>
            )}

            {fragment.unlockCondition === '见证者签名' && (
              <Button
                onClick={handleUnlock}
                className="w-full btn-cosmic"
                size="sm"
              >
                <Users className="w-4 h-4 mr-2" />
                见证者签名验证（演示）
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};