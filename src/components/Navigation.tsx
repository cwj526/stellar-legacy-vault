import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Star, Sparkles } from 'lucide-react';

interface NavigationProps {
  onSectionClick: (section: string) => void;
  activeSection: string;
}

export const Navigation = ({
  onSectionClick,
  activeSection,
}: NavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'hero', label: '首页', icon: Star },
    { id: 'values', label: '核心价值', icon: Sparkles },
    { id: 'demo', label: '功能体验', icon: Sparkles },
    { id: 'process', label: '用户流程', icon: Sparkles },
    { id: 'architecture', label: '平台服务', icon: Sparkles },
  ];

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-starlight-gold to-nebula-purple flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-starlight">数字生命档案馆</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleSectionClick(item.id)}
                className={`
                  text-sm font-medium transition-colors hover:text-starlight
                  ${activeSection === item.id ? 'text-starlight' : 'text-muted-foreground'}
                `}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border/30 mt-2 pt-4">
            <div className="space-y-3">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleSectionClick(item.id)}
                  className={`
                    block w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${activeSection === item.id 
                      ? 'text-starlight bg-starlight-gold/10' 
                      : 'text-muted-foreground hover:text-starlight hover:bg-muted/50'
                    }
                  `}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
