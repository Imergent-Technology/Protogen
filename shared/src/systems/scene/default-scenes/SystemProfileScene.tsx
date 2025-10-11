/**
 * SystemProfileScene
 * 
 * User profile scene
 */

import React from 'react';
import type { SystemSceneMetadata } from './SystemHomeScene';

export const SYSTEM_PROFILE_SCENE_ID = 'system-profile';

export const SystemProfileSceneMetadata: SystemSceneMetadata = {
  id: SYSTEM_PROFILE_SCENE_ID,
  name: 'Profile',
  description: 'User profile',
  slug: 'profile'
};

export const SystemProfileScene: React.FC = () => {
  return (
    <div className="h-full p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start gap-6 mb-8">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center">
            <span className="text-3xl">👤</span>
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">User Profile</h1>
            <p className="text-muted-foreground">Manage your profile and settings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Your profile information and bio</p>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Activity</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Your recent activity and contributions</p>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Bookmarks</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Your saved content and bookmarks</p>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Comments</h3>
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">Your comments and discussions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemProfileScene;

