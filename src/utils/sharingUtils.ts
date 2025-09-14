import { CraftGuide } from '../types/core';
import { GuideManager } from './guideSystem';

// Sharing and export/import utilities
export class SharingManager {
  private guideManager: GuideManager;

  constructor(guideManager: GuideManager) {
    this.guideManager = guideManager;
  }

  // Export guide to JSON
  exportGuideToJson(guideId: string): string {
    const guide = this.guideManager.getGuide(guideId);
    if (!guide) {
      throw new Error(`Guide not found: ${guideId}`);
    }

    return JSON.stringify(guide, null, 2);
  }

  // Export guide to shareable format with metadata
  exportGuideToShareFormat(guideId: string): string {
    const guide = this.guideManager.getGuide(guideId);
    if (!guide) {
      throw new Error(`Guide not found: ${guideId}`);
    }

    const shareData = {
      version: '1.0',
      type: 'poe2-craft-guide',
      exportedAt: new Date().toISOString(),
      guide: {
        ...guide,
        // Remove internal fields for sharing
        id: undefined,
        shareId: guide.shareId || this.generateShareId()
      }
    };

    return JSON.stringify(shareData, null, 2);
  }

  // Import guide from JSON
  importGuideFromJson(jsonData: string): CraftGuide {
    try {
      const data = JSON.parse(jsonData);
      
      // Check if it's in share format or raw guide format
      if (data.type === 'poe2-craft-guide' && data.guide) {
        return this.guideManager.importGuide(JSON.stringify(data.guide));
      } else {
        return this.guideManager.importGuide(jsonData);
      }
    } catch (error) {
      throw new Error(`Invalid guide format: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Generate URL for sharing (placeholder - would integrate with backend)
  generateShareUrl(guideId: string): string {
    const guide = this.guideManager.getGuide(guideId);
    if (!guide) {
      throw new Error(`Guide not found: ${guideId}`);
    }

    const shareId = guide.shareId || this.generateShareId();
    
    // Update guide with share ID
    this.guideManager.updateGuide(guideId, { shareId, isPublic: true });
    
    // In a real app, this would be a proper URL to your backend
    return `https://poe2-crafting-guides.com/guide/${shareId}`;
  }

  // Load guide from share URL (placeholder)
  loadGuideFromShareUrl(shareUrl: string): Promise<CraftGuide> {
    return new Promise((resolve, reject) => {
      // This would make an API call to fetch the guide data
      // For now, it's just a placeholder
      setTimeout(() => {
        reject(new Error('Share URL loading not implemented yet - use import from JSON instead'));
      }, 1000);
    });
  }

  // Generate a unique share ID
  private generateShareId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Download guide as file
  downloadGuideAsFile(guideId: string, filename?: string): void {
    try {
      const jsonData = this.exportGuideToShareFormat(guideId);
      const guide = this.guideManager.getGuide(guideId);
      
      if (!guide) {
        throw new Error(`Guide not found: ${guideId}`);
      }

      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `${guide.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error(`Failed to download guide: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Upload guide from file
  uploadGuideFromFile(file: File): Promise<CraftGuide> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const jsonData = e.target?.result as string;
          const importedGuide = this.importGuideFromJson(jsonData);
          resolve(importedGuide);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  }

  // Get all public guides (placeholder for future backend integration)
  getPublicGuides(): CraftGuide[] {
    return this.guideManager.getAllGuides().filter(guide => guide.isPublic);
  }

  // Search public guides (placeholder)
  searchPublicGuides(query: string): CraftGuide[] {
    const publicGuides = this.getPublicGuides();
    
    return publicGuides.filter(guide => {
      const matchesQuery = !query || 
        guide.title.toLowerCase().includes(query.toLowerCase()) ||
        guide.description.toLowerCase().includes(query.toLowerCase()) ||
        guide.author.toLowerCase().includes(query.toLowerCase());
      
      return matchesQuery;
    });
  }
}

// Utility functions for clipboard operations
export const copyToClipboard = async (text: string): Promise<void> => {
  try {
    await navigator.clipboard.writeText(text);
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (fallbackError) {
      throw new Error('Failed to copy to clipboard');
    } finally {
      document.body.removeChild(textArea);
    }
  }
};

export const readFromClipboard = async (): Promise<string> => {
  try {
    return await navigator.clipboard.readText();
  } catch (error) {
    throw new Error('Failed to read from clipboard. Please paste manually.');
  }
};