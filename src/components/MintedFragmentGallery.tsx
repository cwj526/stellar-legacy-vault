import { useMemo } from 'react';
import { ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ClipboardCopy, Flame } from 'lucide-react';
import { shortenAddress } from '@/lib/utils';
import type { MintedLifeFragment } from '@/hooks/use-life-fragment-nft';

type MintedFragmentGalleryProps = {
  items: MintedLifeFragment[];
  onBurn: (id: string) => void;
};

export const MintedFragmentGallery = ({ items, onBurn }: MintedFragmentGalleryProps) => {
  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat('zh-CN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }),
    []
  );

  const copyHash = async (hash: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      alert('当前环境不支持复制，请手动选择文本。');
      return;
    }
    try {
      await navigator.clipboard.writeText(hash);
      alert('交易哈希已复制到剪贴板');
    } catch (error) {
      console.warn('Failed to copy hash', error);
      alert('复制失败，请手动选择文本复制');
    }
  };

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-border/50 p-8 text-center text-sm text-muted-foreground">
        当前还没有已铸造的生命碎片。勾选“是否铸造为 NFT”让你的故事化作星辰吧。
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((item) => (
        <Card key={item.id} className="p-6 bg-card/90 backdrop-blur border border-border/70 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            <Badge variant="outline" className="border-starlight-gold/40 text-xs">
              {item.tokenId ? `生命碎片 #${item.tokenId}` : '生命碎片 NFT'}
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => onBurn(item.id)}
            >
              <Flame className="w-4 h-4 mr-1" />
              删除本地记录
            </Button>
          </div>

          {/* 判断内容是否为图片 */}
          {typeof item.text === 'string' && item.text.startsWith('data:image/') ? (
            <div className="rounded-lg overflow-hidden border border-border/50">
              <img
                src={item.text}
                alt="生命碎片"
                className="w-full h-48 object-cover"
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap break-words">
              {item.text}
            </p>
          )}

          <div className="space-y-2 text-xs text-muted-foreground break-words">
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground/80">铸造时间</span>
              <span>{formatter.format(new Date(item.mintedAt))}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-muted-foreground/80">铸造地址</span>
              <span className="font-mono">{shortenAddress(item.mintedBy)}</span>
            </div>
            <div className="space-y-1">
              <span className="text-muted-foreground/80">交易哈希</span>
              <div className="flex items-center gap-2">
                <code className="text-[11px] break-all">{item.txHash}</code>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => copyHash(item.txHash)}
                  className="h-7 w-7"
                >
                  <ClipboardCopy className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => window.open(`https://sepolia.etherscan.io/tx/${item.txHash}`, '_blank')}
                  className="h-7 w-7"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default MintedFragmentGallery;
