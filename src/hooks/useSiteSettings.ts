import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSiteSettings, updateSiteSettings } from '@/lib/api';
import { toast } from 'sonner';

export const useSiteSettings = () => {
    const queryClient = useQueryClient();

    const { data: settings = {}, isLoading, error } = useQuery({
        queryKey: ['site-settings'],
        queryFn: getSiteSettings,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });

    const updateMutation = useMutation({
        mutationFn: updateSiteSettings,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['site-settings'] });
            toast.success('Settings updated successfully');
        },
        onError: (err: any) => {
            toast.error(err.message || 'Failed to update settings');
        }
    });

    const isEnabled = (key: string) => {
        const val = settings[key];
        return val === '1' || val === 1 || val === 'true' || val === true;
    };

    return {
        settings,
        isLoading,
        error,
        updateSettings: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        isEnabled
    };
};
