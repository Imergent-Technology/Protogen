/**
 * PropertyInspector - M1 Week 7-8
 * 
 * Property inspector for Card slides (text, image, layered).
 * Displayed in right Toolbar drawer.
 * 
 * Based on Spec 09: Card Scene Type
 */

import React from 'react';
import type { CardSlideUnion, TextSlide, ImageSlide, LayeredSlide } from '../../types/card-scene';

export interface PropertyInspectorProps {
  slide: CardSlideUnion;
  onChange: (updates: Partial<CardSlideUnion>) => void;
  className?: string;
}

export function PropertyInspector({
  slide,
  onChange,
  className = ''
}: PropertyInspectorProps) {
  return (
    <div className={`property-inspector ${className}`}>
      <h3 className="property-inspector__title">
        {slide.kind.charAt(0).toUpperCase() + slide.kind.slice(1)} Slide
      </h3>

      {slide.kind === 'text' && (
        <TextSlideInspector slide={slide} onChange={onChange} />
      )}

      {slide.kind === 'image' && (
        <ImageSlideInspector slide={slide} onChange={onChange} />
      )}

      {slide.kind === 'layered' && (
        <LayeredSlideInspector slide={slide} onChange={onChange} />
      )}

      {/* Common fields */}
      <div className="property-inspector__section">
        <h4>Metadata</h4>

        <label className="property-inspector__field">
          <span>Title (for ToC):</span>
          <input
            type="text"
            value={slide.title || ''}
            onChange={(e) => onChange({ title: e.target.value })}
            maxLength={100}
          />
        </label>

        <label className="property-inspector__field">
          <span>Notes:</span>
          <textarea
            value={slide.notes || ''}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={3}
          />
        </label>

        <label className="property-inspector__field">
          <span>Duration (ms):</span>
          <input
            type="number"
            value={slide.duration || ''}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) || undefined })}
            min={0}
          />
        </label>
      </div>
    </div>
  );
}

// Text Slide Inspector
function TextSlideInspector({
  slide,
  onChange
}: {
  slide: TextSlide;
  onChange: (updates: Partial<TextSlide>) => void;
}) {
  return (
    <>
      <div className="property-inspector__section">
        <h4>Content</h4>

        <label className="property-inspector__field">
          <span>Text:</span>
          <textarea
            value={slide.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={4}
            maxLength={500}
          />
        </label>
      </div>

      <div className="property-inspector__section">
        <h4>Typography</h4>

        <label className="property-inspector__field">
          <span>Font Size:</span>
          <input
            type="range"
            min={12}
            max={128}
            step={2}
            value={slide.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
          />
          <span>{slide.fontSize}px</span>
        </label>

        <label className="property-inspector__field">
          <span>Font Family:</span>
          <input
            type="text"
            value={slide.fontFamily || ''}
            onChange={(e) => onChange({ fontFamily: e.target.value })}
          />
        </label>

        <label className="property-inspector__field">
          <span>Alignment:</span>
          <select
            value={slide.alignment}
            onChange={(e) => onChange({ alignment: e.target.value as any })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>

      <div className="property-inspector__section">
        <h4>Colors</h4>

        <label className="property-inspector__field">
          <span>Text Color:</span>
          <input
            type="color"
            value={slide.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
          />
        </label>

        <label className="property-inspector__field">
          <span>Background Color:</span>
          <input
            type="color"
            value={slide.backgroundColor}
            onChange={(e) => onChange({ backgroundColor: e.target.value })}
          />
        </label>
      </div>
    </>
  );
}

// Image Slide Inspector
function ImageSlideInspector({
  slide,
  onChange
}: {
  slide: ImageSlide;
  onChange: (updates: Partial<ImageSlide>) => void;
}) {
  return (
    <>
      <div className="property-inspector__section">
        <h4>Image</h4>

        <label className="property-inspector__field">
          <span>Image Asset ID:</span>
          <input
            type="text"
            value={slide.imageAssetId}
            onChange={(e) => onChange({ imageAssetId: e.target.value })}
            readOnly
          />
          <button>Replace Image...</button>
        </label>

        <label className="property-inspector__field">
          <span>Fit:</span>
          <select
            value={slide.fit}
            onChange={(e) => onChange({ fit: e.target.value as any })}
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="fill">Fill</option>
          </select>
        </label>

        <label className="property-inspector__field">
          <span>Position X (%):</span>
          <input
            type="range"
            min={0}
            max={100}
            value={slide.position.x}
            onChange={(e) => onChange({
              position: { ...slide.position, x: parseInt(e.target.value) }
            })}
          />
          <span>{slide.position.x}%</span>
        </label>

        <label className="property-inspector__field">
          <span>Position Y (%):</span>
          <input
            type="range"
            min={0}
            max={100}
            value={slide.position.y}
            onChange={(e) => onChange({
              position: { ...slide.position, y: parseInt(e.target.value) }
            })}
          />
          <span>{slide.position.y}%</span>
        </label>
      </div>

      {/* Caption section */}
      <div className="property-inspector__section">
        <h4>Caption</h4>

        <label className="property-inspector__field">
          <input
            type="checkbox"
            checked={!!slide.caption}
            onChange={(e) => onChange({
              caption: e.target.checked ? {
                text: '',
                position: 'bottom',
                backgroundColor: '#000000',
                textColor: '#ffffff'
              } : undefined
            })}
          />
          <span>Show caption</span>
        </label>

        {slide.caption && (
          <>
            <label className="property-inspector__field">
              <span>Caption Text:</span>
              <input
                type="text"
                value={slide.caption.text}
                onChange={(e) => onChange({
                  caption: { ...slide.caption!, text: e.target.value }
                })}
                maxLength={200}
              />
            </label>

            <label className="property-inspector__field">
              <span>Position:</span>
              <select
                value={slide.caption.position}
                onChange={(e) => onChange({
                  caption: { ...slide.caption!, position: e.target.value as any }
                })}
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </label>
          </>
        )}
      </div>
    </>
  );
}

// Layered Slide Inspector
function LayeredSlideInspector({
  slide,
  onChange
}: {
  slide: LayeredSlide;
  onChange: (updates: Partial<LayeredSlide>) => void;
}) {
  return (
    <>
      <div className="property-inspector__section">
        <h4>Background Layer</h4>

        <label className="property-inspector__field">
          <span>Background Image:</span>
          <input
            type="text"
            value={slide.backgroundImageId}
            onChange={(e) => onChange({ backgroundImageId: e.target.value })}
            readOnly
          />
          <button>Change Background...</button>
        </label>

        <label className="property-inspector__field">
          <span>Background Fit:</span>
          <select
            value={slide.backgroundFit}
            onChange={(e) => onChange({ backgroundFit: e.target.value as any })}
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
          </select>
        </label>

        <label className="property-inspector__field">
          <span>Dim Background:</span>
          <input
            type="range"
            min={0}
            max={100}
            value={slide.backgroundDim}
            onChange={(e) => onChange({ backgroundDim: parseInt(e.target.value) })}
          />
          <span>{slide.backgroundDim}%</span>
        </label>
      </div>

      <div className="property-inspector__section">
        <h4>Text Layer</h4>

        <label className="property-inspector__field">
          <span>Text:</span>
          <textarea
            value={slide.text}
            onChange={(e) => onChange({ text: e.target.value })}
            rows={3}
            maxLength={300}
          />
        </label>

        <label className="property-inspector__field">
          <span>Font Size:</span>
          <input
            type="range"
            min={12}
            max={128}
            value={slide.fontSize}
            onChange={(e) => onChange({ fontSize: parseInt(e.target.value) })}
          />
          <span>{slide.fontSize}px</span>
        </label>

        <label className="property-inspector__field">
          <span>Text Color:</span>
          <input
            type="color"
            value={slide.textColor}
            onChange={(e) => onChange({ textColor: e.target.value })}
          />
        </label>

        <label className="property-inspector__field">
          <span>Vertical Position:</span>
          <select
            value={slide.textPosition.vertical}
            onChange={(e) => onChange({
              textPosition: { ...slide.textPosition, vertical: e.target.value as any }
            })}
          >
            <option value="top">Top</option>
            <option value="center">Center</option>
            <option value="bottom">Bottom</option>
          </select>
        </label>

        <label className="property-inspector__field">
          <span>Horizontal Position:</span>
          <select
            value={slide.textPosition.horizontal}
            onChange={(e) => onChange({
              textPosition: { ...slide.textPosition, horizontal: e.target.value as any }
            })}
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </label>
      </div>

      <div className="property-inspector__section">
        <h4>Text Animation</h4>

        <label className="property-inspector__field">
          <span>Delay (ms):</span>
          <input
            type="number"
            min={0}
            value={slide.textTiming.delay}
            onChange={(e) => onChange({
              textTiming: { ...slide.textTiming, delay: parseInt(e.target.value) || 0 }
            })}
          />
        </label>

        <label className="property-inspector__field">
          <span>Duration (ms):</span>
          <input
            type="number"
            min={0}
            value={slide.textTiming.duration}
            onChange={(e) => onChange({
              textTiming: { ...slide.textTiming, duration: parseInt(e.target.value) || 0 }
            })}
          />
        </label>

        <label className="property-inspector__field">
          <span>Animation:</span>
          <select
            value={slide.textTiming.animation}
            onChange={(e) => onChange({
              textTiming: { ...slide.textTiming, animation: e.target.value as any }
            })}
          >
            <option value="none">None</option>
            <option value="fade">Fade</option>
            <option value="slide-up">Slide Up</option>
            <option value="slide-down">Slide Down</option>
            <option value="zoom">Zoom</option>
          </select>
        </label>
      </div>
    </>
  );
}

// Export default
export default PropertyInspector;

