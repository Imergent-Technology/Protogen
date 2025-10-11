/**
 * SystemSettingsScene
 * 
 * Application settings scene
 */

import React from 'react';
import type { SystemSceneMetadata } from './SystemHomeScene';

export const SYSTEM_SETTINGS_SCENE_ID = 'system-settings';

export const SystemSettingsSceneMetadata: SystemSceneMetadata = {
  id: SYSTEM_SETTINGS_SCENE_ID,
  name: 'Settings',
  description: 'Application settings',
  slug: 'settings'
};

export const SystemSettingsScene: React.FC = () => {
  return (
    <div className="h-full p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your application preferences</p>

        <div className="space-y-6">
          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Appearance</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Theme</p>
                  <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
                </div>
                <select className="px-3 py-2 border rounded-md">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates</p>
                </div>
                <input type="checkbox" className="toggle" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Comment Replies</p>
                  <p className="text-sm text-muted-foreground">Get notified of replies</p>
                </div>
                <input type="checkbox" className="toggle" defaultChecked />
              </div>
            </div>
          </div>

          <div className="p-6 bg-card rounded-lg border">
            <h3 className="text-lg font-semibold mb-4">Privacy</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Profile Visibility</p>
                  <p className="text-sm text-muted-foreground">Control who can see your profile</p>
                </div>
                <select className="px-3 py-2 border rounded-md">
                  <option>Public</option>
                  <option>Friends</option>
                  <option>Private</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettingsScene;

