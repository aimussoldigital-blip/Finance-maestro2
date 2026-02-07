import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import BottomNav from './BottomNav';
import NewRecordSheet from '@/components/records/NewRecordSheet';
import { Loader2 } from 'lucide-react';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [isNewRecordOpen, setIsNewRecordOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <main className={isMobile ? 'max-w-lg mx-auto' : 'max-w-4xl mx-auto'}>
        {children}
      </main>
      <BottomNav onNewRecord={() => setIsNewRecordOpen(true)} />
      <NewRecordSheet open={isNewRecordOpen} onOpenChange={setIsNewRecordOpen} />
    </div>
  );
};

export default AppLayout;
