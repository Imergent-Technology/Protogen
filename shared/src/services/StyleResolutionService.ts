// Style Resolution Service
// This service handles resolution and application of styles for snapshots and scenes

import { 
  SceneStyle,
  NodeStyle,
  EdgeStyle,
  NodeStylePresets,
  EdgeStylePresets
} from '../types/scene';

export class StyleResolutionService {
  private defaultTheme: SceneStyle;
  private themeCache: Map<string, SceneStyle> = new Map();

  constructor() {
    this.defaultTheme = this.createDefaultTheme();
  }

  /**
   * Resolve styles for a scene with fallbacks and inheritance
   */
  public resolveSceneStyle(
    sceneStyle: Partial<SceneStyle> = {},
    themeName?: string
  ): SceneStyle {
    // Get base theme
    const baseTheme = themeName ? this.getTheme(themeName) : this.defaultTheme;
    
    // Merge with scene-specific styles
    const resolvedStyle: SceneStyle = {
      theme: sceneStyle.theme || baseTheme.theme || 'default',
      colorScheme: sceneStyle.colorScheme || baseTheme.colorScheme || 'light',
      nodeStyles: this.resolveNodeStylePresets(sceneStyle.nodeStyles, baseTheme.nodeStyles),
      edgeStyles: this.resolveEdgeStylePresets(sceneStyle.edgeStyles, baseTheme.edgeStyles),
      background: this.resolveBackgroundStyle(sceneStyle.background, baseTheme.background),
      fonts: this.resolveFontSettings(sceneStyle.fonts, baseTheme.fonts)
    };

    return resolvedStyle;
  }

  /**
   * Resolve node styles with inheritance and presets
   */
  public resolveNodeStyle(
    nodeStyle: Partial<NodeStyle> = {},
    presetName: string = 'default',
    sceneStyle: SceneStyle
  ): NodeStyle {
    // Get preset style
    const presetStyle = sceneStyle.nodeStyles?.[presetName] || this.getDefaultNodeStyle();
    
    // Merge with node-specific styles
    const resolvedStyle: NodeStyle = {
      // Visual properties
      backgroundColor: nodeStyle.backgroundColor || presetStyle.backgroundColor || '#ffffff',
      borderColor: nodeStyle.borderColor || presetStyle.borderColor || '#cccccc',
      borderWidth: nodeStyle.borderWidth ?? presetStyle.borderWidth ?? 1,
      borderRadius: nodeStyle.borderRadius ?? presetStyle.borderRadius ?? 4,
      shadow: nodeStyle.shadow || presetStyle.shadow,
      
      // Icon and content
      icon: nodeStyle.icon || presetStyle.icon,
      iconColor: nodeStyle.iconColor || presetStyle.iconColor || '#666666',
      iconSize: nodeStyle.iconSize ?? presetStyle.iconSize ?? 16,
      textColor: nodeStyle.textColor || presetStyle.textColor || '#000000',
      fontSize: nodeStyle.fontSize ?? presetStyle.fontSize ?? 14,
      fontWeight: nodeStyle.fontWeight || presetStyle.fontWeight || 'normal',
      
      // State-based styles
      hover: this.resolveStateStyle(nodeStyle.hover, presetStyle.hover),
      selected: this.resolveStateStyle(nodeStyle.selected, presetStyle.selected),
      active: this.resolveStateStyle(nodeStyle.active, presetStyle.active),
      disabled: this.resolveStateStyle(nodeStyle.disabled, presetStyle.disabled),
      
      // Animation
      transition: nodeStyle.transition || presetStyle.transition,
      
      // Custom properties
      ...nodeStyle
    };

    return resolvedStyle;
  }

  /**
   * Resolve edge styles with inheritance and presets
   */
  public resolveEdgeStyle(
    edgeStyle: Partial<EdgeStyle> = {},
    presetName: string = 'default',
    sceneStyle: SceneStyle
  ): EdgeStyle {
    // Get preset style
    const presetStyle = sceneStyle.edgeStyles?.[presetName] || this.getDefaultEdgeStyle();
    
    // Merge with edge-specific styles
    const resolvedStyle: EdgeStyle = {
      // Line properties
      color: edgeStyle.color || presetStyle.color || '#666666',
      width: edgeStyle.width ?? presetStyle.width ?? 2,
      style: edgeStyle.style || presetStyle.style || 'solid',
      opacity: edgeStyle.opacity ?? presetStyle.opacity ?? 1,
      
      // Arrow properties
      sourceArrow: edgeStyle.sourceArrow || presetStyle.sourceArrow,
      targetArrow: edgeStyle.targetArrow || presetStyle.targetArrow,
      
      // State-based styles
      hover: this.resolveEdgeStateStyle(edgeStyle.hover, presetStyle.hover),
      selected: this.resolveEdgeStateStyle(edgeStyle.selected, presetStyle.selected),
      active: this.resolveEdgeStateStyle(edgeStyle.active, presetStyle.active),
      
      // Animation
      animation: edgeStyle.animation || presetStyle.animation,
      
      // Custom properties
      ...edgeStyle
    };

    return resolvedStyle;
  }

  /**
   * Apply theme to a scene style
   */
  public applyTheme(sceneStyle: SceneStyle, themeName: string): SceneStyle {
    const theme = this.getTheme(themeName);
    
    return {
      ...sceneStyle,
      theme: themeName,
      colorScheme: theme.colorScheme || sceneStyle.colorScheme,
      nodeStyles: this.mergeStylePresets(sceneStyle.nodeStyles, theme.nodeStyles),
      edgeStyles: this.mergeStylePresets(sceneStyle.edgeStyles, theme.edgeStyles),
      background: { ...theme.background, ...sceneStyle.background },
      fonts: { ...theme.fonts, ...sceneStyle.fonts }
    };
  }

  /**
   * Get a theme by name
   */
  public getTheme(themeName: string): SceneStyle {
    if (this.themeCache.has(themeName)) {
      return this.themeCache.get(themeName)!;
    }

    // Load theme (in a real implementation, this would load from a theme registry)
    const theme = this.loadTheme(themeName);
    this.themeCache.set(themeName, theme);
    
    return theme;
  }

  /**
   * Register a custom theme
   */
  public registerTheme(themeName: string, theme: SceneStyle): void {
    this.themeCache.set(themeName, theme);
  }

  /**
   * Get all available themes
   */
  public getAvailableThemes(): string[] {
    return Array.from(this.themeCache.keys());
  }

  /**
   * Clear theme cache
   */
  public clearThemeCache(): void {
    this.themeCache.clear();
  }

  /**
   * Resolve node style presets
   */
  private resolveNodeStylePresets(
    nodeStyles?: Partial<NodeStylePresets>,
    baseStyles?: NodeStylePresets
  ): NodeStylePresets {
    const resolved: NodeStylePresets = {};

    // Default preset
    resolved.default = this.resolveNodeStyle(
      nodeStyles?.default || {},
      'default',
      { nodeStyles: baseStyles } as SceneStyle
    );

    // Selected preset
    if (nodeStyles?.selected || baseStyles?.selected) {
      resolved.selected = this.resolveNodeStyle(
        nodeStyles?.selected || {},
        'selected',
        { nodeStyles: baseStyles } as SceneStyle
      );
    }

    // Hover preset
    if (nodeStyles?.hover || baseStyles?.hover) {
      resolved.hover = this.resolveNodeStyle(
        nodeStyles?.hover || {},
        'hover',
        { nodeStyles: baseStyles } as SceneStyle
      );
    }

    // Merge any additional presets
    Object.keys(nodeStyles || {}).forEach(key => {
      if (!resolved[key as keyof NodeStylePresets]) {
        resolved[key as keyof NodeStylePresets] = nodeStyles![key as keyof NodeStylePresets];
      }
    });

    return resolved;
  }

  /**
   * Resolve edge style presets
   */
  private resolveEdgeStylePresets(
    edgeStyles?: Partial<EdgeStylePresets>,
    baseStyles?: EdgeStylePresets
  ): EdgeStylePresets {
    const resolved: EdgeStylePresets = {};

    // Default preset
    resolved.default = this.resolveEdgeStyle(
      edgeStyles?.default || {},
      'default',
      { edgeStyles: baseStyles } as SceneStyle
    );

    // Selected preset
    if (edgeStyles?.selected || baseStyles?.selected) {
      resolved.selected = this.resolveEdgeStyle(
        edgeStyles?.selected || {},
        'selected',
        { edgeStyles: baseStyles } as SceneStyle
      );
    }

    // Hover preset
    if (edgeStyles?.hover || baseStyles?.hover) {
      resolved.hover = this.resolveEdgeStyle(
        edgeStyles?.hover || {},
        'hover',
        { edgeStyles: baseStyles } as SceneStyle
      );
    }

    // Merge any additional presets
    Object.keys(edgeStyles || {}).forEach(key => {
      if (!resolved[key as keyof EdgeStylePresets]) {
        resolved[key as keyof EdgeStylePresets] = edgeStyles![key as keyof EdgeStylePresets];
      }
    });

    return resolved;
  }

  /**
   * Resolve background style
   */
  private resolveBackgroundStyle(
    background?: any,
    baseBackground?: any
  ): any {
    return {
      color: background?.color || baseBackground?.color || '#ffffff',
      image: background?.image || baseBackground?.image,
      pattern: background?.pattern || baseBackground?.pattern || 'none',
      opacity: background?.opacity ?? baseBackground?.opacity ?? 1,
      ...background
    };
  }

  /**
   * Resolve font settings
   */
  private resolveFontSettings(
    fonts?: any,
    baseFonts?: any
  ): any {
    return {
      family: fonts?.family || baseFonts?.family || 'system-ui, sans-serif',
      size: fonts?.size ?? baseFonts?.size ?? 14,
      weight: fonts?.weight || baseFonts?.weight || 'normal',
      color: fonts?.color || baseFonts?.color || '#000000',
      ...fonts
    };
  }

  /**
   * Resolve state-based styles
   */
  private resolveStateStyle(
    stateStyle?: Partial<NodeStyle>,
    baseStateStyle?: Partial<NodeStyle>
  ): Partial<NodeStyle> | undefined {
    if (!stateStyle && !baseStateStyle) {
      return undefined;
    }

    return {
      ...baseStateStyle,
      ...stateStyle
    };
  }

  /**
   * Resolve edge state-based styles
   */
  private resolveEdgeStateStyle(
    stateStyle?: Partial<EdgeStyle>,
    baseStateStyle?: Partial<EdgeStyle>
  ): Partial<EdgeStyle> | undefined {
    if (!stateStyle && !baseStateStyle) {
      return undefined;
    }

    return {
      ...baseStateStyle,
      ...stateStyle
    };
  }

  /**
   * Merge style presets
   */
  private mergeStylePresets(
    customPresets?: any,
    basePresets?: any
  ): any {
    if (!customPresets && !basePresets) {
      return {};
    }

    return {
      ...basePresets,
      ...customPresets
    };
  }

  /**
   * Create default theme
   */
  private createDefaultTheme(): SceneStyle {
    return {
      theme: 'default',
      colorScheme: 'light',
      nodeStyles: {
        default: this.getDefaultNodeStyle(),
        selected: {
          backgroundColor: '#e3f2fd',
          borderColor: '#2196f3',
          borderWidth: 2,
          textColor: '#1976d2'
        },
        hover: {
          backgroundColor: '#f5f5f5',
          borderColor: '#999999',
          borderWidth: 2
        }
      },
      edgeStyles: {
        default: this.getDefaultEdgeStyle(),
        selected: {
          color: '#2196f3',
          width: 3,
          style: 'solid',
          opacity: 1
        },
        hover: {
          color: '#999999',
          width: 3,
          style: 'solid',
          opacity: 0.8
        }
      },
      background: {
        color: '#ffffff',
        pattern: 'none',
        opacity: 1
      },
      fonts: {
        family: 'system-ui, sans-serif',
        size: 14,
        weight: 'normal',
        color: '#000000'
      }
    };
  }

  /**
   * Get default node style
   */
  private getDefaultNodeStyle(): NodeStyle {
    return {
      backgroundColor: '#ffffff',
      borderColor: '#cccccc',
      borderWidth: 1,
      borderRadius: 4,
      textColor: '#000000',
      fontSize: 14,
      fontWeight: 'normal',
      iconColor: '#666666',
      iconSize: 16
    };
  }

  /**
   * Get default edge style
   */
  private getDefaultEdgeStyle(): EdgeStyle {
    return {
      color: '#666666',
      width: 2,
      style: 'solid',
      opacity: 1
    };
  }

  /**
   * Load theme (placeholder for theme loading logic)
   */
  private loadTheme(_themeName: string): SceneStyle {
    // In a real implementation, this would load from a theme registry
    // For now, return the default theme
    return this.createDefaultTheme();
  }
}

// Export singleton instance
export const styleResolutionService = new StyleResolutionService();
