
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

type ProfileType = {
  name: string;
  surname: string;
  block_number: number;
  unit_number: number;
  mobile_number: string;
};

const Account = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          throw error;
        }

        setProfile(data);
      } catch (error: any) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile information');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, navigate]);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Loading...</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">My Account</CardTitle>
          </CardHeader>
          <CardContent>
            {profile && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="text-lg font-medium">{profile.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Surname</p>
                    <p className="text-lg font-medium">{profile.surname}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Block Number</p>
                    <p className="text-lg font-medium">{profile.block_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Number</p>
                    <p className="text-lg font-medium">{profile.unit_number}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Mobile Number</p>
                  <p className="text-lg font-medium">{profile.mobile_number}</p>
                </div>

                <Button 
                  onClick={handleSignOut} 
                  variant="destructive" 
                  className="w-full mt-6"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Account;
