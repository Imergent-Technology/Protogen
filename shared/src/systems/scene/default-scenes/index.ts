/**
 * Default System Scenes
 * 
 * System scenes that ship with the platform
 */

import React from 'react';
import {
  SystemHomeScene,
  SystemHomeSceneMetadata,
  SYSTEM_HOME_SCENE_ID,
  type SystemSceneMetadata
} from './SystemHomeScene';

import {
  SystemExploreScene,
  SystemExploreSceneMetadata,
  SYSTEM_EXPLORE_SCENE_ID
} from './SystemExploreScene';

import {
  SystemProfileScene,
  SystemProfileSceneMetadata,
  SYSTEM_PROFILE_SCENE_ID
} from './SystemProfileScene';

import {
  SystemSettingsScene,
  SystemSettingsSceneMetadata,
  SYSTEM_SETTINGS_SCENE_ID
} from './SystemSettingsScene';

// Re-export all
export {
  SystemHomeScene,
  SystemHomeSceneMetadata,
  SYSTEM_HOME_SCENE_ID,
  SystemExploreScene,
  SystemExploreSceneMetadata,
  SYSTEM_EXPLORE_SCENE_ID,
  SystemProfileScene,
  SystemProfileSceneMetadata,
  SYSTEM_PROFILE_SCENE_ID,
  SystemSettingsScene,
  SystemSettingsSceneMetadata,
  SYSTEM_SETTINGS_SCENE_ID,
  type SystemSceneMetadata
};

// Map of system scene IDs to their components
export const SYSTEM_SCENE_COMPONENTS = {
  'system-home': SystemHomeScene,
  'system-explore': SystemExploreScene,
  'system-profile': SystemProfileScene,
  'system-settings': SystemSettingsScene
} as const;

// Map of system scene IDs to their metadata
export const SYSTEM_SCENE_METADATA = {
  'system-home': SystemHomeSceneMetadata,
  'system-explore': SystemExploreSceneMetadata,
  'system-profile': SystemProfileSceneMetadata,
  'system-settings': SystemSettingsSceneMetadata
} as const;

// Get a system scene component by ID
export function getSystemSceneComponent(sceneId: string): React.FC | undefined {
  return SYSTEM_SCENE_COMPONENTS[sceneId as keyof typeof SYSTEM_SCENE_COMPONENTS];
}

// Get system scene metadata by ID
export function getSystemSceneMetadata(sceneId: string) {
  return SYSTEM_SCENE_METADATA[sceneId as keyof typeof SYSTEM_SCENE_METADATA];
}

// Check if a scene ID is a system scene
export function isSystemScene(sceneId: string): boolean {
  return sceneId in SYSTEM_SCENE_COMPONENTS;
}

