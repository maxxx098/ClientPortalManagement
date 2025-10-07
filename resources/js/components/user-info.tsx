import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';
import { type User } from '@/types';
import { usePage } from '@inertiajs/react';

export function UserInfo({
    user,
    showEmail = false,
}: {
    user: User;
    showEmail?: boolean;
}) {
    const getInitials = useInitials();
    const { props } = usePage<{
        auth?: {
            client_key_id?: string;
            is_client?: boolean;
        };
    }>();

    const clientKeyId = props.auth?.client_key_id;
    
    // Use the same logic as AppSidebar to determine if user is a client
    let isClient = props.auth?.is_client ?? false;
    
    // If is_client is false but user role is 'client' or email starts with 'client-', override it
    if (!isClient && user) {
        if (user.role === 'client' || user.email?.startsWith('client-') || user.email === 'client@system.local') {
            isClient = true;
        }
    }

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={user.name ?? ''} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(user.name ?? '')}
                </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                    {isClient ? 'Client User' : user.name}
                </span>
                {showEmail && (
                    <span className="truncate text-xs text-muted-foreground">
                        {isClient && clientKeyId ? (
                            <span className="font-mono" title={clientKeyId}>
                                Key: {clientKeyId.slice(0, 8)}...{clientKeyId.slice(-4)}
                            </span>
                        ) : (
                            user.email
                        )}
                    </span>
                )}
            </div>
        </>
    );
}