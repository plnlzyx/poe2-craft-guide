import { v4 as uuidv4 } from 'uuid';
import { Item, ItemProperty, ItemModifier, ItemSocket } from '../types/core';
import { produce } from 'immer';

// Item factory functions
export const createEmptyItem = (baseType: string, name: string = 'Unknown Item'): Item => ({
  id: uuidv4(),
  name,
  baseType,
  itemLevel: 1,
  quality: 0,
  isCorrupted: false,
  isIdentified: true,
  rarity: 'normal',
  properties: {},
  modifiers: [],
  sockets: [],
  customData: {},
  tags: []
});

export const createProperty = (name: string, value: any, type: ItemProperty['type'] = 'string'): ItemProperty => ({
  id: uuidv4(),
  name,
  value,
  type
});

export const createModifier = (
  name: string,
  tier: number = 1,
  type: ItemModifier['type'] = 'prefix',
  values: Record<string, any> = {},
  tags: string[] = []
): ItemModifier => ({
  id: uuidv4(),
  name,
  tier,
  values,
  type,
  tags
});

export const createSocket = (
  color: ItemSocket['color'] = 'white',
  links: string[] = []
): ItemSocket => ({
  id: uuidv4(),
  color,
  links
});

// Item modification utilities
export const addProperty = (item: Item, name: string, value: any, type: ItemProperty['type'] = 'string'): Item => {
  return produce(item, draft => {
    const property = createProperty(name, value, type);
    draft.properties[name] = property;
  });
};

export const updateProperty = (item: Item, name: string, value: any): Item => {
  return produce(item, draft => {
    if (draft.properties[name]) {
      draft.properties[name].value = value;
    }
  });
};

export const removeProperty = (item: Item, name: string): Item => {
  return produce(item, draft => {
    delete draft.properties[name];
  });
};

export const addModifier = (item: Item, modifier: ItemModifier): Item => {
  return produce(item, draft => {
    draft.modifiers.push(modifier);
  });
};

export const removeModifier = (item: Item, modifierId: string): Item => {
  return produce(item, draft => {
    draft.modifiers = draft.modifiers.filter(mod => mod.id !== modifierId);
  });
};

export const updateModifier = (item: Item, modifierId: string, updates: Partial<ItemModifier>): Item => {
  return produce(item, draft => {
    const modifier = draft.modifiers.find(mod => mod.id === modifierId);
    if (modifier) {
      Object.assign(modifier, updates);
    }
  });
};

export const addSocket = (item: Item, socket: ItemSocket): Item => {
  return produce(item, draft => {
    draft.sockets.push(socket);
  });
};

export const removeSocket = (item: Item, socketId: string): Item => {
  return produce(item, draft => {
    draft.sockets = draft.sockets.filter(socket => socket.id !== socketId);
  });
};

export const linkSockets = (item: Item, socketIds: string[]): Item => {
  return produce(item, draft => {
    // Clear existing links for these sockets
    draft.sockets.forEach(socket => {
      if (socketIds.includes(socket.id)) {
        socket.links = socketIds.filter(id => id !== socket.id);
      }
    });
  });
};

export const corruptItem = (item: Item): Item => {
  return produce(item, draft => {
    draft.isCorrupted = true;
  });
};

// Item query utilities
export const hasProperty = (item: Item, propertyName: string): boolean => {
  return propertyName in item.properties;
};

export const getPropertyValue = (item: Item, propertyName: string): any => {
  return item.properties[propertyName]?.value;
};

export const hasModifier = (item: Item, modifierName: string): boolean => {
  return item.modifiers.some(mod => mod.name === modifierName);
};

export const getModifier = (item: Item, modifierName: string): ItemModifier | undefined => {
  return item.modifiers.find(mod => mod.name === modifierName);
};

export const getModifiersByType = (item: Item, type: ItemModifier['type']): ItemModifier[] => {
  return item.modifiers.filter(mod => mod.type === type);
};

export const getPrefixCount = (item: Item): number => {
  return item.modifiers.filter(mod => mod.type === 'prefix').length;
};

export const getSuffixCount = (item: Item): number => {
  return item.modifiers.filter(mod => mod.type === 'suffix').length;
};

export const getSocketCount = (item: Item): number => {
  return item.sockets.length;
};

export const getLinkedSocketGroups = (item: Item): string[][] => {
  const visited = new Set<string>();
  const groups: string[][] = [];

  const findLinkedGroup = (socketId: string): string[] => {
    const group: string[] = [];
    const queue = [socketId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (visited.has(currentId)) continue;
      
      visited.add(currentId);
      group.push(currentId);
      
      const socket = item.sockets.find(s => s.id === currentId);
      if (socket) {
        socket.links.forEach(linkedId => {
          if (!visited.has(linkedId)) {
            queue.push(linkedId);
          }
        });
      }
    }
    
    return group;
  };

  item.sockets.forEach(socket => {
    if (!visited.has(socket.id)) {
      const group = findLinkedGroup(socket.id);
      if (group.length > 1) {
        groups.push(group);
      }
    }
  });

  return groups;
};

export const canModifyWithOrbs = (item: Item): boolean => {
  return !item.isCorrupted;
};

export const canModifySockets = (item: Item): boolean => {
  // In POE, you can modify sockets even on corrupted items with certain methods
  return true;
};

export const getMaxModifiers = (item: Item): { prefix: number; suffix: number } => {
  switch (item.rarity) {
    case 'normal':
      return { prefix: 0, suffix: 0 };
    case 'magic':
      return { prefix: 1, suffix: 1 };
    case 'rare':
      return { prefix: 3, suffix: 3 };
    case 'unique':
      return { prefix: 6, suffix: 6 }; // Uniques can have many mods
    default:
      return { prefix: 0, suffix: 0 };
  }
};

export const canAddModifier = (item: Item, modifierType: ItemModifier['type']): boolean => {
  if (item.isCorrupted) return false;
  
  const maxMods = getMaxModifiers(item);
  const currentCount = modifierType === 'prefix' ? getPrefixCount(item) : getSuffixCount(item);
  const maxCount = modifierType === 'prefix' ? maxMods.prefix : maxMods.suffix;
  
  return currentCount < maxCount;
};

// Item validation
export const validateItem = (item: Item): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check modifier counts
  const maxMods = getMaxModifiers(item);
  const prefixCount = getPrefixCount(item);
  const suffixCount = getSuffixCount(item);

  if (prefixCount > maxMods.prefix) {
    errors.push(`Too many prefix modifiers: ${prefixCount}/${maxMods.prefix}`);
  }

  if (suffixCount > maxMods.suffix) {
    errors.push(`Too many suffix modifiers: ${suffixCount}/${maxMods.suffix}`);
  }

  // Check for duplicate modifier names (generally not allowed)
  const modifierNames = item.modifiers.map(mod => mod.name);
  const duplicates = modifierNames.filter((name, index) => modifierNames.indexOf(name) !== index);
  if (duplicates.length > 0) {
    errors.push(`Duplicate modifiers: ${duplicates.join(', ')}`);
  }

  // Validate socket links
  item.sockets.forEach(socket => {
    socket.links.forEach(linkedId => {
      const linkedSocket = item.sockets.find(s => s.id === linkedId);
      if (!linkedSocket) {
        errors.push(`Socket ${socket.id} linked to non-existent socket ${linkedId}`);
      } else if (!linkedSocket.links.includes(socket.id)) {
        errors.push(`Socket link is not bidirectional: ${socket.id} -> ${linkedId}`);
      }
    });
  });

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Item comparison and cloning
export const cloneItem = (item: Item): Item => {
  return produce(item, draft => {
    // Immer handles deep cloning
    draft.id = uuidv4(); // Give cloned item a new ID
  });
};

export const itemsEqual = (item1: Item, item2: Item): boolean => {
  // Compare everything except ID and timestamps
  const { id: id1, ...rest1 } = item1;
  const { id: id2, ...rest2 } = item2;
  
  return JSON.stringify(rest1) === JSON.stringify(rest2);
};

// Item export/import utilities
export const exportItem = (item: Item): string => {
  return JSON.stringify(item, null, 2);
};

export const importItem = (itemJson: string): Item => {
  const imported = JSON.parse(itemJson);
  // Validate the imported item structure
  const validation = validateItem(imported);
  if (!validation.isValid) {
    throw new Error(`Invalid item: ${validation.errors.join(', ')}`);
  }
  return imported;
};