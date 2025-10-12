/**
 * UserMenuWidget - Displays current user with dropdown menu for logout
 */

import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../components/ui-primitives/dropdown-menu';
import { Button } from '../../../components/ui-primitives/button';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui-primitives/avatar';
import { User, LogOut, Settings, Shield } from 'lucide-react';
import { ToolbarWidgetProps } from '../types/widget';

export interface UserMenuWidgetData {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    is_admin?: boolean;
  } | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export const UserMenuWidget: React.FC<ToolbarWidgetProps> = ({ widgetId, data, isCollapsed }) => {
  const widgetData = data as UserMenuWidgetData | undefined;
  const user = widgetData?.user;

  // If no user, don't render anything
  if (!user) {
    return null;
  }

  // Get initials for avatar fallback
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = () => {
    widgetData?.onLogout?.();
  };

  const handleProfileClick = () => {
    widgetData?.onProfileClick?.();
  };

  const handleSettingsClick = () => {
    widgetData?.onSettingsClick?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full p-0 hover:bg-accent"
          aria-label="User menu"
        >
          <Avatar className="h-8 w-8">
            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none flex items-center gap-2">
              {user.name}
              {user.is_admin && (
                <Shield className="h-3 w-3 text-primary" />
              )}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        {handleProfileClick && (
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
        )}
        
        {handleSettingsClick && (
          <DropdownMenuItem onClick={handleSettingsClick}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Widget definition for registration
export const userMenuWidgetDefinition = {
  type: 'user-menu',
  name: 'User Menu',
  description: 'Displays current user with dropdown menu for profile and logout',
  component: UserMenuWidget,
  supportsCollapsed: true,
};

