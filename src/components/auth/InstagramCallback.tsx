import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

export const InstagramCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // The callback is handled by our Supabase Edge Function
    // This component just shows a loading state and handles any client-side errors
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    
    if (error) {
      console.error('Instagram auth error:', error);
      toast.error(`Instagram authentication failed: ${error}`);
      navigate('/influencer');
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Processing Instagram Authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we complete your Instagram connection.
        </p>
      </div>
    </div>
  );
};