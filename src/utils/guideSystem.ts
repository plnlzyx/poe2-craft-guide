import { v4 as uuidv4 } from 'uuid';
import {
  CraftGuide,
  GuideStep,
  LinearStep,
  ConditionalStep,
  BranchStep,
  LoopStep,
  GuideExecutionState,
  Item,
  Condition
} from '../types/core';
import { ActionRegistryManager } from './actionSystem';
import { ConditionEvaluator } from './actionSystem';
import { cloneItem } from './itemUtils';

export interface GuideStepResult {
  success: boolean;
  item: Item;
  message: string;
  nextStepIndex?: number;
  branchPath?: string;
  shouldLoop?: boolean;
}

export interface GuideExecutionOptions {
  maxSteps?: number;
  maxLoopIterations?: number;
  debugMode?: boolean;
}

// Guide execution engine
export class GuideExecutor {
  private actionRegistry: ActionRegistryManager;
  private conditionEvaluator: ConditionEvaluator;

  constructor(actionRegistry: ActionRegistryManager) {
    this.actionRegistry = actionRegistry;
    this.conditionEvaluator = new ConditionEvaluator();
  }

  // Execute a single step
  executeStep(
    step: GuideStep,
    item: Item,
    executionState: GuideExecutionState,
    options: GuideExecutionOptions = {}
  ): GuideStepResult {
    switch (step.type) {
      case 'linear':
        return this.executeLinearStep(step, item, executionState, options);
      case 'conditional':
        return this.executeConditionalStep(step, item, executionState, options);
      case 'branch':
        return this.executeBranchStep(step, item, executionState, options);
      case 'loop':
        return this.executeLoopStep(step, item, executionState, options);
      default:
        return {
          success: false,
          item,
          message: `Unknown step type: ${(step as any).type}`
        };
    }
  }

  private executeLinearStep(
    step: LinearStep,
    item: Item,
    executionState: GuideExecutionState,
    options: GuideExecutionOptions
  ): GuideStepResult {
    try {
      if (!this.actionRegistry.canExecuteAction(step.actionId, item)) {
        return {
          success: false,
          item,
          message: `Cannot execute action: preconditions not met for ${step.actionId}`
        };
      }

      const result = this.actionRegistry.executeAction(step.actionId, item);
      
      // Log the step execution
      this.logStepExecution(executionState, step.id, item, result.item);

      return {
        success: true,
        item: result.item,
        message: `Successfully executed ${step.actionId}: ${result.outcome.description}`
      };
    } catch (error) {
      return {
        success: false,
        item,
        message: `Error executing step: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  private executeConditionalStep(
    step: ConditionalStep,
    item: Item,
    executionState: GuideExecutionState,
    options: GuideExecutionOptions
  ): GuideStepResult {
    const conditionMet = this.conditionEvaluator.evaluate(step.condition, item);
    const nextStep = conditionMet ? step.trueStep : step.falseStep;

    const result = this.executeStep(nextStep, item, executionState, options);
    
    return {
      ...result,
      message: `Condition ${conditionMet ? 'met' : 'not met'}: ${result.message}`,
      branchPath: conditionMet ? 'true' : 'false'
    };
  }

  private executeBranchStep(
    step: BranchStep,
    item: Item,
    executionState: GuideExecutionState,
    options: GuideExecutionOptions
  ): GuideStepResult {
    // Find the first matching branch
    for (const branch of step.branches) {
      if (this.conditionEvaluator.evaluate(branch.condition, item)) {
        // Execute all steps in the matching branch
        let currentItem = item;
        let lastResult: GuideStepResult | null = null;

        for (const branchStep of branch.steps) {
          const stepResult = this.executeStep(branchStep, currentItem, executionState, options);
          
          if (!stepResult.success) {
            return {
              ...stepResult,
              branchPath: branch.label
            };
          }

          currentItem = stepResult.item;
          lastResult = stepResult;
        }

        return {
          success: true,
          item: currentItem,
          message: `Executed branch '${branch.label}': ${lastResult?.message || 'completed'}`,
          branchPath: branch.label
        };
      }
    }

    return {
      success: false,
      item,
      message: 'No matching branch found'
    };
  }

  private executeLoopStep(
    step: LoopStep,
    item: Item,
    executionState: GuideExecutionState,
    options: GuideExecutionOptions
  ): GuideStepResult {
    let currentItem = item;
    let iterations = 0;
    const maxIterations = step.maxIterations || options.maxLoopIterations || 10;

    while (this.conditionEvaluator.evaluate(step.condition, currentItem) && iterations < maxIterations) {
      // Execute all steps in the loop
      for (const loopStep of step.steps) {
        const stepResult = this.executeStep(loopStep, currentItem, executionState, options);
        
        if (!stepResult.success) {
          return {
            ...stepResult,
            message: `Loop iteration ${iterations + 1} failed: ${stepResult.message}`
          };
        }

        currentItem = stepResult.item;
      }

      iterations++;
    }

    const conditionStillMet = this.conditionEvaluator.evaluate(step.condition, currentItem);
    
    return {
      success: true,
      item: currentItem,
      message: `Loop completed after ${iterations} iterations${conditionStillMet ? ' (max iterations reached)' : ''}`,
      shouldLoop: conditionStillMet && iterations >= maxIterations
    };
  }

  private logStepExecution(
    executionState: GuideExecutionState,
    stepId: string,
    itemBefore: Item,
    itemAfter: Item
  ) {
    executionState.stepHistory.push({
      stepId,
      itemBefore: cloneItem(itemBefore),
      itemAfter: cloneItem(itemAfter),
      timestamp: new Date()
    });
  }
}

// Guide management system
export class GuideManager {
  private guides: Record<string, CraftGuide> = {};
  private guideExecutor: GuideExecutor;

  constructor(actionRegistry: ActionRegistryManager) {
    this.guideExecutor = new GuideExecutor(actionRegistry);
  }

  // Guide CRUD operations
  createGuide(guide: Omit<CraftGuide, 'id' | 'createdAt' | 'updatedAt'>): CraftGuide {
    const newGuide: CraftGuide = {
      ...guide,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.guides[newGuide.id] = newGuide;
    return newGuide;
  }

  updateGuide(id: string, updates: Partial<CraftGuide>): CraftGuide | null {
    const guide = this.guides[id];
    if (!guide) return null;

    const updatedGuide = {
      ...guide,
      ...updates,
      id, // Ensure ID doesn't change
      updatedAt: new Date()
    };

    this.guides[id] = updatedGuide;
    return updatedGuide;
  }

  deleteGuide(id: string): boolean {
    if (this.guides[id]) {
      delete this.guides[id];
      return true;
    }
    return false;
  }

  getGuide(id: string): CraftGuide | null {
    return this.guides[id] || null;
  }

  getAllGuides(): CraftGuide[] {
    return Object.values(this.guides);
  }

  getGuidesByAuthor(author: string): CraftGuide[] {
    return Object.values(this.guides).filter(guide => guide.author === author);
  }

  // Guide step management
  addStep(guideId: string, step: GuideStep, position?: number): boolean {
    const guide = this.guides[guideId];
    if (!guide) return false;

    if (position !== undefined && position >= 0 && position <= guide.steps.length) {
      guide.steps.splice(position, 0, step);
    } else {
      guide.steps.push(step);
    }

    guide.updatedAt = new Date();
    return true;
  }

  removeStep(guideId: string, stepId: string): boolean {
    const guide = this.guides[guideId];
    if (!guide) return false;

    const stepIndex = guide.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return false;

    guide.steps.splice(stepIndex, 1);
    guide.updatedAt = new Date();
    return true;
  }

  updateStep(guideId: string, stepId: string, updates: Partial<GuideStep>): boolean {
    const guide = this.guides[guideId];
    if (!guide) return false;

    const stepIndex = guide.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return false;

    // Only update fields that exist on the original step to maintain type safety
    const currentStep = guide.steps[stepIndex];
    guide.steps[stepIndex] = { ...currentStep, ...updates, id: currentStep.id, type: currentStep.type } as GuideStep;
    guide.updatedAt = new Date();
    return true;
  }

  moveStep(guideId: string, stepId: string, newPosition: number): boolean {
    const guide = this.guides[guideId];
    if (!guide) return false;

    const stepIndex = guide.steps.findIndex(step => step.id === stepId);
    if (stepIndex === -1) return false;

    const [step] = guide.steps.splice(stepIndex, 1);
    guide.steps.splice(Math.max(0, Math.min(newPosition, guide.steps.length)), 0, step);
    
    guide.updatedAt = new Date();
    return true;
  }

  // Guide execution
  createExecutionState(guideId: string, startingItem: Item): GuideExecutionState {
    return {
      guideId,
      currentItem: cloneItem(startingItem),
      currentStepIndex: 0,
      stepHistory: [],
      variables: {}
    };
  }

  executeNextStep(
    executionState: GuideExecutionState,
    options: GuideExecutionOptions = {}
  ): GuideStepResult {
    const guide = this.guides[executionState.guideId];
    if (!guide) {
      return {
        success: false,
        item: executionState.currentItem,
        message: 'Guide not found'
      };
    }

    if (executionState.currentStepIndex >= guide.steps.length) {
      return {
        success: true,
        item: executionState.currentItem,
        message: 'Guide completed'
      };
    }

    const step = guide.steps[executionState.currentStepIndex];
    const result = this.guideExecutor.executeStep(step, executionState.currentItem, executionState, options);

    if (result.success) {
      // Update execution state
      executionState.currentItem = result.item;
      
      if (result.nextStepIndex !== undefined) {
        executionState.currentStepIndex = result.nextStepIndex;
      } else if (!result.shouldLoop) {
        executionState.currentStepIndex++;
      }
    }

    return result;
  }

  executeGuide(
    guideId: string,
    startingItem: Item,
    options: GuideExecutionOptions = {}
  ): { success: boolean; executionState: GuideExecutionState; results: GuideStepResult[] } {
    const guide = this.guides[guideId];
    if (!guide) {
      throw new Error(`Guide not found: ${guideId}`);
    }

    const executionState = this.createExecutionState(guideId, startingItem);
    const results: GuideStepResult[] = [];
    const maxSteps = options.maxSteps || 100;
    let stepCount = 0;

    while (executionState.currentStepIndex < guide.steps.length && stepCount < maxSteps) {
      const result = this.executeNextStep(executionState, options);
      results.push(result);

      if (!result.success) {
        return { success: false, executionState, results };
      }

      stepCount++;
    }

    const success = executionState.currentStepIndex >= guide.steps.length;
    return { success, executionState, results };
  }

  // Validation
  validateGuide(guide: CraftGuide): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check if all steps are valid
    guide.steps.forEach((step, index) => {
      const stepErrors = this.validateStep(step, index);
      errors.push(...stepErrors);
    });

    // Check for circular references in conditional steps
    if (this.hasCircularReferences(guide.steps)) {
      errors.push('Guide contains circular references in conditional steps');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validateStep(step: GuideStep, index: number): string[] {
    const errors: string[] = [];
    const prefix = `Step ${index + 1} (${step.type})`;

    switch (step.type) {
      case 'linear':
        if (!step.actionId) {
          errors.push(`${prefix}: Missing action ID`);
        }
        break;

      case 'conditional':
        if (!step.condition) {
          errors.push(`${prefix}: Missing condition`);
        }
        if (!step.trueStep) {
          errors.push(`${prefix}: Missing true step`);
        }
        if (!step.falseStep) {
          errors.push(`${prefix}: Missing false step`);
        }
        break;

      case 'branch':
        if (!step.branches || step.branches.length === 0) {
          errors.push(`${prefix}: No branches defined`);
        }
        break;

      case 'loop':
        if (!step.condition) {
          errors.push(`${prefix}: Missing loop condition`);
        }
        if (!step.steps || step.steps.length === 0) {
          errors.push(`${prefix}: No steps defined in loop`);
        }
        break;
    }

    return errors;
  }

  private hasCircularReferences(steps: GuideStep[]): boolean {
    // Simplified circular reference detection
    // In a real implementation, this would be more sophisticated
    return false;
  }

  // Export/Import
  exportGuide(guideId: string): string {
    const guide = this.guides[guideId];
    if (!guide) {
      throw new Error(`Guide not found: ${guideId}`);
    }
    return JSON.stringify(guide, null, 2);
  }

  importGuide(guideJson: string): CraftGuide {
    const guideData = JSON.parse(guideJson);
    
    // Validate the imported guide
    const validation = this.validateGuide(guideData);
    if (!validation.isValid) {
      throw new Error(`Invalid guide: ${validation.errors.join(', ')}`);
    }

    // Generate new ID and timestamps
    const guide: CraftGuide = {
      ...guideData,
      id: uuidv4(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.guides[guide.id] = guide;
    return guide;
  }
}

// Utility functions for creating steps
export const createLinearStep = (actionId: string, description: string, notes?: string): LinearStep => ({
  type: 'linear',
  id: uuidv4(),
  actionId,
  description,
  notes
});

export const createConditionalStep = (
  condition: Condition,
  trueStep: GuideStep,
  falseStep: GuideStep,
  description: string
): ConditionalStep => ({
  type: 'conditional',
  id: uuidv4(),
  condition,
  trueStep,
  falseStep,
  description
});

export const createBranchStep = (
  branches: { condition: Condition; steps: GuideStep[]; label: string }[],
  description: string
): BranchStep => ({
  type: 'branch',
  id: uuidv4(),
  branches,
  description
});

export const createLoopStep = (
  condition: Condition,
  steps: GuideStep[],
  description: string,
  maxIterations?: number
): LoopStep => ({
  type: 'loop',
  id: uuidv4(),
  condition,
  steps,
  maxIterations,
  description
});