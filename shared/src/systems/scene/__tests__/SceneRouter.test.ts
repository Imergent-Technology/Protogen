/**
 * SceneRouter Tests
 * 
 * Tests for the SceneRouter class - context-to-scene mapping logic.
 */

import { SceneRouter } from '../SceneRouter';

describe('SceneRouter', () => {
  let router: SceneRouter;

  beforeEach(() => {
    router = new SceneRouter();
  });

  describe('Default Scene', () => {
    it('should return default scene when no overrides match', () => {
      router.setDefaultScene('default-scene');
      
      const sceneId = router.getSceneForContext('/unknown-path');
      
      expect(sceneId).toBe('default-scene');
    });

    it('should return null when no default scene is set', () => {
      const sceneId = router.getSceneForContext('/unknown-path');
      
      expect(sceneId).toBeNull();
    });

    it('should update default scene', () => {
      router.setDefaultScene('scene-1');
      expect(router.getSceneForContext('/unknown')).toBe('scene-1');
      
      router.setDefaultScene('scene-2');
      expect(router.getSceneForContext('/unknown')).toBe('scene-2');
    });
  });

  describe('Exact Pattern Matching', () => {
    it('should match exact path', () => {
      router.setSceneOverride('/home', 'home-scene', 10);
      
      const sceneId = router.getSceneForContext('/home');
      
      expect(sceneId).toBe('home-scene');
    });

    it('should not match partial path', () => {
      router.setDefaultScene('default');
      router.setSceneOverride('/home', 'home-scene', 10);
      
      const sceneId = router.getSceneForContext('/home/settings');
      
      // Should not match /home, should return default
      expect(sceneId).not.toBe('home-scene');
    });

    it('should match multiple exact patterns', () => {
      router.setSceneOverride('/home', 'home-scene', 10);
      router.setSceneOverride('/explore', 'explore-scene', 10);
      router.setSceneOverride('/profile', 'profile-scene', 10);
      
      expect(router.getSceneForContext('/home')).toBe('home-scene');
      expect(router.getSceneForContext('/explore')).toBe('explore-scene');
      expect(router.getSceneForContext('/profile')).toBe('profile-scene');
    });
  });

  describe('Glob Pattern Matching', () => {
    it('should match wildcard pattern', () => {
      router.setSceneOverride('/profile*', 'profile-scene', 10);
      
      expect(router.getSceneForContext('/profile')).toBe('profile-scene');
      expect(router.getSceneForContext('/profile/settings')).toBe('profile-scene');
      expect(router.getSceneForContext('/profile/posts')).toBe('profile-scene');
    });

    it('should match deep wildcard', () => {
      router.setSceneOverride('/admin/**', 'admin-scene', 10);
      
      expect(router.getSceneForContext('/admin')).toBe('admin-scene');
      expect(router.getSceneForContext('/admin/users')).toBe('admin-scene');
      expect(router.getSceneForContext('/admin/users/edit/123')).toBe('admin-scene');
    });

    it('should match middle wildcard', () => {
      router.setSceneOverride('/user/*/posts', 'user-posts-scene', 10);
      
      expect(router.getSceneForContext('/user/123/posts')).toBe('user-posts-scene');
      expect(router.getSceneForContext('/user/abc/posts')).toBe('user-posts-scene');
    });
  });

  describe('Priority Sorting', () => {
    it('should prefer higher priority routes', () => {
      router.setSceneOverride('/home', 'low-priority-scene', 5);
      router.setSceneOverride('/home', 'high-priority-scene', 20);
      
      const sceneId = router.getSceneForContext('/home');
      
      expect(sceneId).toBe('high-priority-scene');
    });

    it('should prefer exact match over glob', () => {
      router.setSceneOverride('/profile*', 'wildcard-scene', 10);
      router.setSceneOverride('/profile', 'exact-scene', 10);
      
      const sceneId = router.getSceneForContext('/profile');
      
      // Same priority, but exact should win
      expect(sceneId).toBe('exact-scene');
    });

    it('should prefer more specific patterns', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/admin/**', 'admin-scene', 10);
      router.setSceneOverride('/admin/users', 'admin-users-scene', 10);
      
      expect(router.getSceneForContext('/admin/posts')).toBe('admin-scene');
      expect(router.getSceneForContext('/admin/users')).toBe('admin-users-scene');
    });

    it('should sort by priority then specificity', () => {
      // Lower priority, more specific
      router.setSceneOverride('/settings/account', 'account-scene', 5);
      // Higher priority, less specific
      router.setSceneOverride('/settings*', 'settings-scene', 15);
      
      // Higher priority should win
      expect(router.getSceneForContext('/settings/account')).toBe('settings-scene');
    });
  });

  describe('Scene Override Management', () => {
    it('should add new override', () => {
      router.setSceneOverride('/test', 'test-scene', 10);
      
      expect(router.getSceneForContext('/test')).toBe('test-scene');
    });

    it('should update existing override', () => {
      router.setSceneOverride('/test', 'scene-1', 10);
      router.setSceneOverride('/test', 'scene-2', 10);
      
      expect(router.getSceneForContext('/test')).toBe('scene-2');
    });

    it('should remove override', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/test', 'test-scene', 10);
      
      expect(router.getSceneForContext('/test')).toBe('test-scene');
      
      router.removeSceneOverride('/test');
      
      expect(router.getSceneForContext('/test')).toBe('default-scene');
    });

    it('should clear all overrides', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/home', 'home-scene', 10);
      router.setSceneOverride('/explore', 'explore-scene', 10);
      router.setSceneOverride('/profile', 'profile-scene', 10);
      
      router.clearSceneOverrides();
      
      expect(router.getSceneForContext('/home')).toBe('default-scene');
      expect(router.getSceneForContext('/explore')).toBe('default-scene');
      expect(router.getSceneForContext('/profile')).toBe('default-scene');
    });
  });

  describe('Configuration Load/Export', () => {
    it('should export configuration', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/home', 'home-scene', 10);
      router.setSceneOverride('/explore', 'explore-scene', 15);
      
      const config = router.exportConfig();
      
      expect(config.defaultScene).toBe('default-scene');
      expect(config.overrides).toHaveLength(2);
      expect(config.overrides.find(o => o.pattern === '/home')).toBeDefined();
      expect(config.overrides.find(o => o.pattern === '/explore')).toBeDefined();
    });

    it('should load configuration', () => {
      const config = {
        defaultScene: 'loaded-default',
        overrides: [
          { pattern: '/test1', sceneId: 'test1-scene', priority: 10 },
          { pattern: '/test2', sceneId: 'test2-scene', priority: 20 },
        ],
      };
      
      router.loadConfig(config);
      
      expect(router.getSceneForContext('/unknown')).toBe('loaded-default');
      expect(router.getSceneForContext('/test1')).toBe('test1-scene');
      expect(router.getSceneForContext('/test2')).toBe('test2-scene');
    });

    it('should replace existing config when loading', () => {
      router.setDefaultScene('old-default');
      router.setSceneOverride('/old', 'old-scene', 10);
      
      router.loadConfig({
        defaultScene: 'new-default',
        overrides: [
          { pattern: '/new', sceneId: 'new-scene', priority: 10 },
        ],
      });
      
      expect(router.getSceneForContext('/unknown')).toBe('new-default');
      expect(router.getSceneForContext('/new')).toBe('new-scene');
      expect(router.getSceneForContext('/old')).toBe('new-default'); // Should not match old pattern
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty path', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/', 'root-scene', 10);
      
      expect(router.getSceneForContext('/')).toBe('root-scene');
      expect(router.getSceneForContext('')).toBe('root-scene');
    });

    it('should handle paths with query parameters', () => {
      router.setSceneOverride('/search', 'search-scene', 10);
      
      // Query params should be ignored in matching
      const sceneId = router.getSceneForContext('/search?q=test&page=1');
      
      expect(sceneId).toBe('search-scene');
    });

    it('should handle paths with hash fragments', () => {
      router.setSceneOverride('/docs', 'docs-scene', 10);
      
      // Hash should be ignored in matching
      const sceneId = router.getSceneForContext('/docs#section-1');
      
      expect(sceneId).toBe('docs-scene');
    });

    it('should handle trailing slashes consistently', () => {
      router.setSceneOverride('/home', 'home-scene', 10);
      
      expect(router.getSceneForContext('/home')).toBe('home-scene');
      expect(router.getSceneForContext('/home/')).toBe('home-scene');
    });

    it('should be case-sensitive by default', () => {
      router.setDefaultScene('default-scene');
      router.setSceneOverride('/Home', 'home-scene', 10);
      
      expect(router.getSceneForContext('/Home')).toBe('home-scene');
      expect(router.getSceneForContext('/home')).toBe('default-scene'); // Should not match
    });

    it('should handle special characters in patterns', () => {
      router.setSceneOverride('/user-profile', 'profile-scene', 10);
      router.setSceneOverride('/api/v1', 'api-scene', 10);
      
      expect(router.getSceneForContext('/user-profile')).toBe('profile-scene');
      expect(router.getSceneForContext('/api/v1')).toBe('api-scene');
    });
  });

  describe('Performance', () => {
    it('should handle many overrides efficiently', () => {
      // Add 100 overrides
      for (let i = 0; i < 100; i++) {
        router.setSceneOverride(`/route-${i}`, `scene-${i}`, Math.floor(Math.random() * 100));
      }
      
      const startTime = Date.now();
      
      // Test 1000 lookups
      for (let i = 0; i < 1000; i++) {
        router.getSceneForContext(`/route-${i % 100}`);
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete in reasonable time (< 100ms for 1000 lookups)
      expect(duration).toBeLessThan(100);
    });
  });
});

