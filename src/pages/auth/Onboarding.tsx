import { useNavigate } from 'react-router-dom';
import { Button } from '@/src/components/ui/Button';

export default function OnboardingPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full p-6 justify-center items-center text-center space-y-8">
      <div className="w-20 h-2 bg-accent/20 rounded-full overflow-hidden">
        <div className="w-1/3 h-full bg-accent" />
      </div>
      
      <div className="space-y-2">
        <h1 className="text-[28px] font-black">Personalize your experience.</h1>
        <p className="text-text-secondary">Wisdom is building this 3-step wizard. For now, let's head to your dashboard.</p>
      </div>

      <div className="w-full space-y-4">
        <Button className="w-full" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
