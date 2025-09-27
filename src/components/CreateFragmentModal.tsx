import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, Upload, Zap } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
import type { MintedLifeFragment } from '@/hooks/use-life-fragment-nft';

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

export type MintingAdapter = {
  account: string | null;
  isConnecting: boolean;
  isMinting: boolean;
  providerAvailable: boolean;
  walletError: string | null;
  mintError: string | null;
  connectWallet: () => Promise<string | void>;
  mintOnChain: (
    text: string,
    onProgress?: (progress: { progress: number; message: string }) => void
  ) => Promise<MintedLifeFragment>;
};

interface CreateFragmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fragment: Omit<LifeFragment, 'id' | 'hash' | 'createdAt' | 'isUnlocked'>) => void;
  minting?: MintingAdapter;
}

type FormDataType = {
  title: string;
  type: '文本' | '图片' | '音频' | '视频';
  content: string;
  visibility: '私密' | '锁定' | '公开';
  unlockCondition: '时间' | '口令' | '见证者签名';
  unlockValue: string;
};

export const CreateFragmentModal = ({ isOpen, onClose, onSave, minting }: CreateFragmentModalProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    type: '文本',
    content: '',
    visibility: '锁定',
    unlockCondition: '时间',
    unlockValue: '',
  });
  const [mintingProgress, setMintingProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldMint, setShouldMint] = useState(false);

  const isBusy = isSubmitting || Boolean(minting?.isMinting);

  useEffect(() => {
    if (!shouldMint) {
      setMintingProgress(0);
      setProgressMessage('');
    }
  }, [shouldMint]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('请填写完整信息');
      return;
    }

    if (shouldMint && !minting) {
      alert('未加载 NFT 铸造功能，请稍后重试。');
      return;
    }

    try {
      setIsSubmitting(true);
      setMintingProgress(0);
      setProgressMessage('');

      if (shouldMint && minting) {
        if (!minting.providerAvailable || !minting.account) {
          setMintingProgress(10);
          setProgressMessage('请求连接钱包...');
          await minting.connectWallet();
        }

        await minting.mintOnChain(formData.content, ({ progress, message }) => {
          setMintingProgress(progress);
          setProgressMessage(message);
        });
      }

      onSave(formData);

      setFormData({
        title: '',
        type: '文本',
        content: '',
        visibility: '锁定',
        unlockCondition: '时间',
        unlockValue: '',
      });
      setMintingProgress(0);
      setProgressMessage('');
      setShouldMint(false);
      onClose();
    } catch (error) {
      const message = error instanceof Error ? error.message : '操作失败，请稍后再试。';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isBusy) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-card/95 backdrop-blur-md border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-starlight flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            创建生命碎片
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">碎片标题</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="为你的记忆起个名字..."
                className="bg-input/50"
                disabled={isBusy}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">内容类型</Label>
              <Select 
                value={formData.type}
                onValueChange={(value) => 
                  setFormData({ ...formData, type: value as '文本' | '图片' | '音频' | '视频' })
                }
                disabled={isBusy}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="文本">文本</SelectItem>
                  <SelectItem value="图片">图片</SelectItem>
                  <SelectItem value="音频">音频 (占位)</SelectItem>
                  <SelectItem value="视频">视频 (占位)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">内容</Label>
            {formData.type === '文本' ? (
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="写下你想要保存的记忆、想法或感悟..."
                rows={4}
                className="bg-input/50"
                disabled={isBusy}
              />
            ) : (
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  {formData.type}文件上传 (MVP演示占位)
                </p>
                <Input
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="输入文件描述或占位内容..."
                  className="bg-input/50"
                  disabled={isBusy}
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="visibility">可见性</Label>
              <Select 
                value={formData.visibility}
                onValueChange={(value) => 
                  setFormData({ ...formData, visibility: value as '私密' | '锁定' | '公开' })
                }
                disabled={isBusy}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="私密">私密 (仅自己可见)</SelectItem>
                  <SelectItem value="锁定">锁定 (需解锁条件)</SelectItem>
                  <SelectItem value="公开">公开 (立即可见)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unlockCondition">解锁条件</Label>
              <Select 
                value={formData.unlockCondition}
                onValueChange={(value) => 
                  setFormData({ ...formData, unlockCondition: value as '时间' | '口令' | '见证者签名' })
                }
                disabled={isBusy || formData.visibility === '公开'}
              >
                <SelectTrigger className="bg-input/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="时间">时间触发</SelectItem>
                  <SelectItem value="口令">口令解锁</SelectItem>
                  <SelectItem value="见证者签名">见证者签名</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.unlockCondition === '口令' && formData.visibility !== '公开' && (
            <div className="space-y-2">
              <Label htmlFor="unlockValue">设置解锁口令</Label>
              <Input
                id="unlockValue"
                type="password"
                value={formData.unlockValue}
                onChange={(e) => setFormData({ ...formData, unlockValue: e.target.value })}
                placeholder="设置解锁这个碎片的口令..."
                className="bg-input/50"
                disabled={isBusy}
              />
              <p className="text-xs text-muted-foreground">
                演示提示：可使用 "123" 作为通用解锁口令
              </p>
            </div>
          )}

          <div className="space-y-3 rounded-lg border border-border/40 bg-muted/10 p-4">
            <div className="flex items-start gap-3">
              <Checkbox
                id="shouldMint"
                checked={shouldMint}
                onCheckedChange={(checked) => setShouldMint(Boolean(checked))}
                disabled={isBusy}
              />
              <div className="space-y-1">
                <label htmlFor="shouldMint" className="text-sm font-medium text-foreground">
                  是否铸造为 NFT
                </label>
                <p className="text-xs text-muted-foreground">
                  勾选后会调用浏览器钱包，将内容通过智能合约铸造成 ERC-721 NFT，并在本地记录交易信息。
                </p>
              </div>
            </div>

            {shouldMint && minting && (
              <div className="flex flex-col gap-2 text-xs text-muted-foreground">
                <div className="flex flex-wrap items-center gap-2">
                  <span>钱包状态：</span>
                  <span className="font-mono text-foreground">
                    {minting.account ? shortenAddress(minting.account) : '未连接'}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      minting
                        .connectWallet()
                        .catch((error) =>
                          alert(error instanceof Error ? error.message : '连接钱包失败，请稍后再试。')
                        )
                    }
                    disabled={isBusy || minting.isConnecting}
                  >
                    {minting.isConnecting ? '连接中...' : minting.account ? '重新连接' : '连接钱包'}
                  </Button>
                </div>
                {minting.walletError && (
                  <p className="text-destructive">{minting.walletError}</p>
                )}
                {minting.mintError && (
                  <p className="text-destructive">{minting.mintError}</p>
                )}
              </div>
            )}
          </div>

          {shouldMint && (mintingProgress > 0 || minting?.isMinting) && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 text-starlight">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-medium">
                  {progressMessage || '正在铸造生命碎片...'}
                </span>
              </div>
              <Progress value={mintingProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {mintingProgress < 100
                  ? '请在钱包中确认后等待链上交易完成。'
                  : '铸造完成！碎片信息已保存至本地。'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isBusy}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-cosmic"
              disabled={isBusy}
            >
              {isBusy ? '处理中...' : shouldMint ? '铸造碎片' : '保存碎片'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          ⚠️ 铸造功能会发起链上交易，请确认已切换至正确的网络环境并确保 Gas 余额充足。
        </div>
      </DialogContent>
    </Dialog>
  );
};
