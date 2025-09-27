import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Upload, Zap } from 'lucide-react';

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

interface CreateFragmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (fragment: Omit<LifeFragment, 'id' | 'hash' | 'createdAt' | 'isUnlocked'>) => void;
}

type FormDataType = {
  title: string;
  type: '文本' | '图片' | '音频' | '视频';
  content: string;
  visibility: '私密' | '锁定' | '公开';
  unlockCondition: '时间' | '口令' | '见证者签名';
  unlockValue: string;
};

export const CreateFragmentModal = ({ isOpen, onClose, onSave }: CreateFragmentModalProps) => {
  const [formData, setFormData] = useState<FormDataType>({
    title: '',
    type: '文本',
    content: '',
    visibility: '锁定',
    unlockCondition: '时间',
    unlockValue: '',
  });
  const [mintingProgress, setMintingProgress] = useState(0);
  const [isMinting, setIsMinting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      alert('请填写完整信息');
      return;
    }

    setIsMinting(true);
    setMintingProgress(0);

    // 模拟铸造过程
    const mintingSteps = [
      { progress: 20, message: '正在验证内容...' },
      { progress: 40, message: '生成加密哈希...' },
      { progress: 60, message: '创建智能合约...' },
      { progress: 80, message: '上链铸造中...' },
      { progress: 100, message: '铸造完成！' },
    ];

    for (const step of mintingSteps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setMintingProgress(step.progress);
    }

    onSave(formData);
    
    // 重置表单
    setFormData({
      title: '',
      type: '文本',
      content: '',
      visibility: '锁定',
      unlockCondition: '时间',
      unlockValue: '',
    });
    setMintingProgress(0);
    setIsMinting(false);
    onClose();
  };

  const handleClose = () => {
    if (!isMinting) {
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
                disabled={isMinting}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">内容类型</Label>
              <Select 
                value={formData.type}
                onValueChange={(value) => 
                  setFormData({ ...formData, type: value as '文本' | '图片' | '音频' | '视频' })
                }
                disabled={isMinting}
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
                disabled={isMinting}
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
                  disabled={isMinting}
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
                disabled={isMinting}
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
                disabled={isMinting || formData.visibility === '公开'}
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
                disabled={isMinting}
              />
              <p className="text-xs text-muted-foreground">
                演示提示：可使用 "星辰永恒" 作为通用解锁口令
              </p>
            </div>
          )}

          {isMinting && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/20">
              <div className="flex items-center gap-2 text-starlight">
                <Zap className="w-5 h-5 animate-pulse" />
                <span className="font-medium">正在铸造生命碎片...</span>
              </div>
              <Progress value={mintingProgress} className="h-2" />
              <p className="text-sm text-muted-foreground text-center">
                {mintingProgress < 100 ? '请勿关闭窗口，铸造过程中...' : '铸造完成！碎片已加入星图'}
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={isMinting}
            >
              取消
            </Button>
            <Button
              type="submit"
              className="flex-1 btn-cosmic"
              disabled={isMinting}
            >
              {isMinting ? '铸造中...' : '铸造碎片'}
            </Button>
          </div>
        </form>

        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border/30">
          ⚠️ 当前为演示版本，所有"上链/铸造"流程均为模拟，不涉及真实区块链交互
        </div>
      </DialogContent>
    </Dialog>
  );
};