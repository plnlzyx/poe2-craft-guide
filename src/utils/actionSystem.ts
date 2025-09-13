import { v4 as uuidv4 } from 'uuid';
import { 
  Item, 
  Condition, 
  CraftAction, 
  ActionOutcome, 
  ItemChange, 
  ActionRegistry 
} from '../types/core';
import {
  hasProperty,
  getPropertyValue,
  hasModifier,
  getModifier,
  addModifier,
  removeModifier,
  updateProperty,
  addSocket,
  removeSocket,
  linkSockets,
  corruptItem,
  createModifier,
  createSocket
} from './itemUtils';

// Condition evaluation engine
export class ConditionEvaluator {
  private customEvaluators: Record<string, (condition: Condition, item: Item, context?: any) => boolean> = {};

  constructor() {
    // Register built-in evaluators
    this.registerEvaluator('corruption_check', this.evaluateCorruptionCheck);
    this.registerEvaluator('socket_check', this.evaluateSocketCheck);
    this.registerEvaluator('modifier_tier_check', this.evaluateModifierTierCheck);
  }

  registerEvaluator(name: string, evaluator: (condition: Condition, item: Item, context?: any) => boolean) {
    this.customEvaluators[name] = evaluator;
  }

  evaluate(condition: Condition, item: Item, context?: any): boolean {
    switch (condition.operator) {
      case 'equals':
        return this.evaluateEquals(condition, item, context);
      case 'notEquals':
        return !this.evaluateEquals(condition, item, context);
      case 'greaterThan':
        return this.evaluateGreaterThan(condition, item, context);
      case 'lessThan':
        return this.evaluateLessThan(condition, item, context);
      case 'contains':
        return this.evaluateContains(condition, item, context);
      case 'hasModifier':
        return this.evaluateHasModifier(condition, item, context);
      case 'hasProperty':
        return this.evaluateHasProperty(condition, item, context);
      case 'and':
        return this.evaluateAnd(condition, item, context);
      case 'or':
        return this.evaluateOr(condition, item, context);
      case 'not':
        return this.evaluateNot(condition, item, context);
      default:
        if (condition.customEvaluator && this.customEvaluators[condition.customEvaluator]) {
          return this.customEvaluators[condition.customEvaluator](condition, item, context);
        }
        throw new Error(`Unknown condition operator: ${condition.operator}`);
    }
  }

  private evaluateEquals(condition: Condition, item: Item, context?: any): boolean {
    const value = this.getTargetValue(condition.target!, item);
    return value === condition.value;
  }

  private evaluateGreaterThan(condition: Condition, item: Item, context?: any): boolean {
    const value = this.getTargetValue(condition.target!, item);
    return Number(value) > Number(condition.value);
  }

  private evaluateLessThan(condition: Condition, item: Item, context?: any): boolean {
    const value = this.getTargetValue(condition.target!, item);
    return Number(value) < Number(condition.value);
  }

  private evaluateContains(condition: Condition, item: Item, context?: any): boolean {
    const value = this.getTargetValue(condition.target!, item);
    if (Array.isArray(value)) {
      return value.includes(condition.value);
    }
    return String(value).includes(String(condition.value));
  }

  private evaluateHasModifier(condition: Condition, item: Item, context?: any): boolean {
    return hasModifier(item, condition.value);
  }

  private evaluateHasProperty(condition: Condition, item: Item, context?: any): boolean {
    return hasProperty(item, condition.value);
  }

  private evaluateAnd(condition: Condition, item: Item, context?: any): boolean {
    if (!condition.conditions) return true;
    return condition.conditions.every(c => this.evaluate(c, item, context));
  }

  private evaluateOr(condition: Condition, item: Item, context?: any): boolean {
    if (!condition.conditions) return false;
    return condition.conditions.some(c => this.evaluate(c, item, context));
  }

  private evaluateNot(condition: Condition, item: Item, context?: any): boolean {
    if (!condition.conditions || condition.conditions.length === 0) return true;
    return !this.evaluate(condition.conditions[0], item, context);
  }

  private getTargetValue(target: string, item: Item): any {
    const parts = target.split('.');
    
    switch (parts[0]) {
      case 'item':
        return this.getNestedValue(item, parts.slice(1));
      case 'property':
        return getPropertyValue(item, parts[1]);
      case 'modifier':
        const modifier = getModifier(item, parts[1]);
        return parts.length > 2 ? this.getNestedValue(modifier, parts.slice(2)) : modifier;
      default:
        return this.getNestedValue(item, parts);
    }
  }

  private getNestedValue(obj: any, path: string[]): any {
    return path.reduce((current, key) => current?.[key], obj);
  }

  // Custom evaluators
  private evaluateCorruptionCheck = (condition: Condition, item: Item): boolean => {
    return item.isCorrupted === condition.value;
  }

  private evaluateSocketCheck = (condition: Condition, item: Item): boolean => {
    const socketCount = item.sockets.length;
    return socketCount >= condition.value;
  }

  private evaluateModifierTierCheck = (condition: Condition, item: Item): boolean => {
    const modifier = getModifier(item, condition.target!);
    return modifier ? modifier.tier >= condition.value : false;
  }
}

// Action execution engine
export class ActionExecutor {
  private conditionEvaluator: ConditionEvaluator;
  private customHandlers: Record<string, (item: Item, action: CraftAction, context?: any) => Item> = {};

  constructor(conditionEvaluator: ConditionEvaluator) {
    this.conditionEvaluator = conditionEvaluator;
    
    // Register built-in handlers
    this.registerHandler('chaos_orb', this.handleChaosOrb);
    this.registerHandler('alchemy_orb', this.handleAlchemyOrb);
    this.registerHandler('regal_orb', this.handleRegalOrb);
    this.registerHandler('exalted_orb', this.handleExaltedOrb);
    this.registerHandler('divine_orb', this.handleDivineOrb);
  }

  registerHandler(name: string, handler: (item: Item, action: CraftAction, context?: any) => Item) {
    this.customHandlers[name] = handler;
  }

  canExecuteAction(action: CraftAction, item: Item, context?: any): boolean {
    return action.preconditions.every(condition => 
      this.conditionEvaluator.evaluate(condition, item, context)
    );
  }

  executeAction(action: CraftAction, item: Item, context?: any): { item: Item; outcome: ActionOutcome } {
    if (!this.canExecuteAction(action, item, context)) {
      throw new Error(`Cannot execute action ${action.name}: preconditions not met`);
    }

    // Use custom handler if available
    if (action.customHandler && this.customHandlers[action.customHandler]) {
      const modifiedItem = this.customHandlers[action.customHandler](item, action, context);
      // For custom handlers, we assume they handle the outcome selection
      return { item: modifiedItem, outcome: action.outcomes[0] };
    }

    // Select outcome based on conditions and probability
    const validOutcomes = action.outcomes.filter(outcome => 
      !outcome.conditions || outcome.conditions.every(condition =>
        this.conditionEvaluator.evaluate(condition, item, context)
      )
    );

    if (validOutcomes.length === 0) {
      throw new Error(`No valid outcomes for action ${action.name}`);
    }

    const selectedOutcome = this.selectOutcomeByProbability(validOutcomes);
    const modifiedItem = this.applyChanges(item, selectedOutcome.changes);

    return { item: modifiedItem, outcome: selectedOutcome };
  }

  private selectOutcomeByProbability(outcomes: ActionOutcome[]): ActionOutcome {
    // Normalize probabilities
    const totalProbability = outcomes.reduce((sum, outcome) => sum + outcome.probability, 0);
    
    if (totalProbability <= 0) {
      return outcomes[0]; // Fallback to first outcome
    }

    const random = Math.random() * totalProbability;
    let accumulator = 0;

    for (const outcome of outcomes) {
      accumulator += outcome.probability;
      if (random <= accumulator) {
        return outcome;
      }
    }

    return outcomes[outcomes.length - 1]; // Fallback to last outcome
  }

  private applyChanges(item: Item, changes: ItemChange[]): Item {
    let modifiedItem = item;

    for (const change of changes) {
      switch (change.type) {
        case 'addModifier':
          if (change.modifierId) {
            const modifier = createModifier(change.target!, change.value?.tier || 1);
            modifiedItem = addModifier(modifiedItem, modifier);
          }
          break;
        
        case 'removeModifier':
          if (change.modifierId) {
            modifiedItem = removeModifier(modifiedItem, change.modifierId);
          }
          break;

        case 'modifyProperty':
          if (change.target) {
            modifiedItem = updateProperty(modifiedItem, change.target, change.value);
          }
          break;

        case 'addSocket':
          const newSocket = createSocket(change.value?.color || 'white');
          modifiedItem = addSocket(modifiedItem, newSocket);
          break;

        case 'removeSocket':
          if (change.socketId) {
            modifiedItem = removeSocket(modifiedItem, change.socketId);
          }
          break;

        case 'linkSockets':
          if (change.value?.socketIds) {
            modifiedItem = linkSockets(modifiedItem, change.value.socketIds);
          }
          break;

        case 'corrupt':
          modifiedItem = corruptItem(modifiedItem);
          break;

        case 'custom':
          if (change.customHandler && this.customHandlers[change.customHandler]) {
            // Custom change handlers would need to be implemented
            console.warn(`Custom change handler ${change.customHandler} not implemented`);
          }
          break;

        default:
          console.warn(`Unknown change type: ${change.type}`);
      }
    }

    return modifiedItem;
  }

  // Built-in action handlers
  private handleChaosOrb = (item: Item, action: CraftAction): Item => {
    // Chaos Orb: rerolls all modifiers on a rare item
    let modifiedItem: Item = { ...item, modifiers: [] };
    
    // Add random modifiers (simplified implementation)
    const numPrefixes = Math.floor(Math.random() * 4); // 0-3
    const numSuffixes = Math.floor(Math.random() * 4); // 0-3
    
    for (let i = 0; i < numPrefixes; i++) {
      const modifier = createModifier(`Random Prefix ${i + 1}`, 1, 'prefix');
      modifiedItem = addModifier(modifiedItem, modifier);
    }
    
    for (let i = 0; i < numSuffixes; i++) {
      const modifier = createModifier(`Random Suffix ${i + 1}`, 1, 'suffix');
      modifiedItem = addModifier(modifiedItem, modifier);
    }
    
    return modifiedItem;
  }

  private handleAlchemyOrb = (item: Item, action: CraftAction): Item => {
    // Alchemy Orb: upgrades normal item to rare with random modifiers
    let modifiedItem: Item = { ...item, rarity: 'rare', modifiers: [] };
    
    // Add 4-6 random modifiers
    const numModifiers = 4 + Math.floor(Math.random() * 3);
    const numPrefixes = Math.min(3, Math.floor(numModifiers / 2) + Math.floor(Math.random() * 2));
    const numSuffixes = Math.min(3, numModifiers - numPrefixes);
    
    for (let i = 0; i < numPrefixes; i++) {
      const modifier = createModifier(`Alch Prefix ${i + 1}`, 1, 'prefix');
      modifiedItem = addModifier(modifiedItem, modifier);
    }
    
    for (let i = 0; i < numSuffixes; i++) {
      const modifier = createModifier(`Alch Suffix ${i + 1}`, 1, 'suffix');
      modifiedItem = addModifier(modifiedItem, modifier);
    }
    
    return modifiedItem;
  }

  private handleRegalOrb = (item: Item, action: CraftAction): Item => {
    // Regal Orb: upgrades magic item to rare and adds a modifier
    let modifiedItem: Item = { ...item, rarity: 'rare' };
    
    const modifierType = Math.random() < 0.5 ? 'prefix' : 'suffix';
    const modifier = createModifier(`Regal ${modifierType}`, 1, modifierType);
    modifiedItem = addModifier(modifiedItem, modifier);
    
    return modifiedItem;
  }

  private handleExaltedOrb = (item: Item, action: CraftAction): Item => {
    // Exalted Orb: adds a random modifier to rare item
    const modifierType = Math.random() < 0.5 ? 'prefix' : 'suffix';
    const modifier = createModifier(`Exalted ${modifierType}`, 1, modifierType);
    return addModifier(item, modifier);
  }

  private handleDivineOrb = (item: Item, action: CraftAction): Item => {
    // Divine Orb: rerolls the values of all modifiers
    const modifiedItem = {
      ...item,
      modifiers: item.modifiers.map(mod => ({
        ...mod,
        tier: Math.max(1, mod.tier + Math.floor(Math.random() * 3) - 1) // ±1 tier variation
      }))
    };
    return modifiedItem;
  }
}

// Action registry for managing all actions
export class ActionRegistryManager implements ActionRegistry {
  public actions: Record<string, CraftAction> = {};
  public conditionEvaluators: Record<string, (condition: Condition, item: Item, context?: any) => boolean> = {};
  public customHandlers: Record<string, (item: Item, action: CraftAction, context?: any) => Item> = {};
  
  private conditionEvaluator: ConditionEvaluator;
  private actionExecutor: ActionExecutor;

  constructor() {
    this.conditionEvaluator = new ConditionEvaluator();
    this.actionExecutor = new ActionExecutor(this.conditionEvaluator);
    this.initializeDefaultActions();
  }

  registerAction(action: CraftAction) {
    this.actions[action.id] = action;
  }

  getAction(id: string): CraftAction | undefined {
    return this.actions[id];
  }

  getActionsByCategory(category: string): CraftAction[] {
    return Object.values(this.actions).filter(action => action.category === category);
  }

  canExecuteAction(actionId: string, item: Item, context?: any): boolean {
    const action = this.getAction(actionId);
    if (!action) return false;
    return this.actionExecutor.canExecuteAction(action, item, context);
  }

  executeAction(actionId: string, item: Item, context?: any): { item: Item; outcome: ActionOutcome } {
    const action = this.getAction(actionId);
    if (!action) {
      throw new Error(`Action not found: ${actionId}`);
    }
    return this.actionExecutor.executeAction(action, item, context);
  }

  private initializeDefaultActions() {
    // Chaos Orb
    this.registerAction({
      id: 'chaos_orb',
      name: 'Chaos Orb',
      description: 'Rerolls all modifiers on a rare item',
      category: 'currency',
      preconditions: [
        { id: uuidv4(), type: 'property', operator: 'equals', target: 'rarity', value: 'rare' },
        { id: uuidv4(), type: 'property', operator: 'equals', target: 'isCorrupted', value: false }
      ],
      requirements: { currency: { 'Chaos Orb': 1 } },
      outcomes: [
        {
          id: uuidv4(),
          probability: 1.0,
          description: 'Rerolls all modifiers',
          changes: [{ type: 'reroll' }]
        }
      ],
      customHandler: 'chaos_orb',
      tags: ['orb', 'reroll'],
      isEnabled: true
    });

    // Alchemy Orb
    this.registerAction({
      id: 'alchemy_orb',
      name: 'Alchemy Orb',
      description: 'Upgrades a normal item to rare with random modifiers',
      category: 'currency',
      preconditions: [
        { id: uuidv4(), type: 'property', operator: 'equals', target: 'rarity', value: 'normal' },
        { id: uuidv4(), type: 'property', operator: 'equals', target: 'isCorrupted', value: false }
      ],
      requirements: { currency: { 'Alchemy Orb': 1 } },
      outcomes: [
        {
          id: uuidv4(),
          probability: 1.0,
          description: 'Upgrades to rare with 4-6 modifiers',
          changes: [
            { type: 'modifyProperty', target: 'rarity', value: 'rare' }
          ]
        }
      ],
      customHandler: 'alchemy_orb',
      tags: ['orb', 'upgrade'],
      isEnabled: true
    });

    // Add more default actions...
  }
}

// Factory function for creating conditions
export const createCondition = (
  type: string,
  operator: Condition['operator'],
  target?: string,
  value?: any,
  conditions?: Condition[],
  customEvaluator?: string
): Condition => ({
  id: uuidv4(),
  type,
  operator,
  target,
  value,
  conditions,
  customEvaluator
});

// Utility functions for common conditions
export const createCorruptionCondition = (isCorrupted: boolean): Condition =>
  createCondition('property', 'equals', 'isCorrupted', isCorrupted);

export const createRarityCondition = (rarity: string): Condition =>
  createCondition('property', 'equals', 'rarity', rarity);

export const createModifierCondition = (modifierName: string): Condition =>
  createCondition('modifier', 'hasModifier', undefined, modifierName);

export const createCompositeCondition = (operator: 'and' | 'or', conditions: Condition[]): Condition =>
  createCondition('composite', operator, undefined, undefined, conditions);