// Core type definitions for POE2 Craft Guide Creator

export interface ItemProperty {
  id: string;
  name: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
}

export interface ItemModifier {
  id: string;
  name: string;
  tier: number;
  values: Record<string, any>;
  type: 'prefix' | 'suffix' | 'implicit' | 'enchant' | 'corrupted';
  tags: string[];
}

export interface ItemSocket {
  id: string;
  color: 'red' | 'green' | 'blue' | 'white';
  links: string[]; // IDs of connected sockets
}

export interface Item {
  id: string;
  name: string;
  baseType: string;
  itemLevel: number;
  quality: number;
  isCorrupted: boolean;
  isIdentified: boolean;
  rarity: 'normal' | 'magic' | 'rare' | 'unique';
  
  // Flexible property system
  properties: Record<string, ItemProperty>;
  modifiers: ItemModifier[];
  sockets: ItemSocket[];
  
  // Custom properties for extensibility
  customData: Record<string, any>;
  tags: string[];
}

// Condition system for flexible rule evaluation
export interface Condition {
  id: string;
  type: string; // 'property', 'modifier', 'composite', 'custom'
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'hasModifier' | 'hasProperty' | 'and' | 'or' | 'not';
  target?: string; // property/modifier path
  value?: any;
  conditions?: Condition[]; // for composite conditions
  customEvaluator?: string; // for custom logic
}

// Action outcome definition
export interface ActionOutcome {
  id: string;
  probability: number; // 0-1
  description: string;
  changes: ItemChange[];
  conditions?: Condition[]; // conditions that must be met for this outcome
}

export interface ItemChange {
  type: 'addModifier' | 'removeModifier' | 'modifyProperty' | 'addSocket' | 'removeSocket' | 'linkSockets' | 'reroll' | 'corrupt' | 'custom';
  target?: string;
  value?: any;
  modifierId?: string;
  socketId?: string;
  customHandler?: string;
}

// Action definition
export interface CraftAction {
  id: string;
  name: string;
  description: string;
  category: string;
  iconUrl?: string;
  
  // Preconditions that must be met to perform this action
  preconditions: Condition[];
  
  // Cost/requirements
  requirements: {
    currency?: Record<string, number>;
    level?: number;
    other?: string[];
  };
  
  // Possible outcomes
  outcomes: ActionOutcome[];
  
  // Custom logic for complex actions
  customHandler?: string;
  
  // Metadata
  tags: string[];
  isEnabled: boolean;
}

// Guide step types
export interface LinearStep {
  type: 'linear';
  id: string;
  actionId: string;
  description: string;
  notes?: string;
}

export interface ConditionalStep {
  type: 'conditional';
  id: string;
  condition: Condition;
  trueStep: GuideStep;
  falseStep: GuideStep;
  description: string;
}

export interface BranchStep {
  type: 'branch';
  id: string;
  branches: {
    condition: Condition;
    steps: GuideStep[];
    label: string;
  }[];
  description: string;
}

export interface LoopStep {
  type: 'loop';
  id: string;
  condition: Condition;
  steps: GuideStep[];
  maxIterations?: number;
  description: string;
}

export type GuideStep = LinearStep | ConditionalStep | BranchStep | LoopStep;

// Guide definition
export interface CraftGuide {
  id: string;
  title: string;
  description: string;
  author: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Starting item template
  startingItem: Partial<Item>;
  
  // Target item (optional, for reference)
  targetItem?: Partial<Item>;
  
  // Guide steps
  steps: GuideStep[];
  
  // Metadata
  estimatedCost?: Record<string, number>;
  successRate?: number;
  
  // Sharing
  isPublic: boolean;
  shareId?: string;
}

// Guide execution state
export interface GuideExecutionState {
  guideId: string;
  currentItem: Item;
  currentStepIndex: number;
  stepHistory: {
    stepId: string;
    itemBefore: Item;
    itemAfter: Item;
    timestamp: Date;
  }[];
  variables: Record<string, any>; // for storing temporary values during execution
}

// System configuration for extensibility
export interface ActionRegistry {
  actions: Record<string, CraftAction>;
  conditionEvaluators: Record<string, (condition: Condition, item: Item, context?: any) => boolean>;
  customHandlers: Record<string, (item: Item, action: CraftAction, context?: any) => Item>;
}