/**
 * FlowSystem - Core system for managing flows and flow instances
 * 
 * Singleton class that manages flow registration, instance lifecycle,
 * conditional evaluation, and branching logic.
 */

import { EventEmitter } from '../../../utils/EventEmitter';
import {
  Flow,
  FlowInstance,
  FlowState,
  FlowStep,
  FlowBranch,
  FlowTemplate,
  ConditionalRule,
  BranchCondition,
  FlowEvents,
} from '../types/flow';

export class FlowSystemClass extends EventEmitter<FlowEvents> {
  private flows: Map<string, Flow> = new Map();
  private instances: Map<string, FlowInstance> = new Map();
  private templates: Map<string, FlowTemplate> = new Map();
  private instanceCounter = 0;

  constructor() {
    super();
  }

  // ========================================
  // Flow Registration
  // ========================================

  /**
   * Register a flow for use
   */
  registerFlow(flow: Flow): void {
    this.flows.set(flow.id, flow);
  }

  /**
   * Get a registered flow
   */
  getFlow(flowId: string): Flow | undefined {
    return this.flows.get(flowId);
  }

  /**
   * Unregister a flow
   */
  unregisterFlow(flowId: string): void {
    this.flows.delete(flowId);
  }

  /**
   * Get all registered flows
   */
  getAllFlows(): Flow[] {
    return Array.from(this.flows.values());
  }

  // ========================================
  // Template System
  // ========================================

  /**
   * Register a flow template
   */
  registerTemplate(template: FlowTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * Get a flow template
   */
  getTemplate(templateId: string): FlowTemplate | undefined {
    return this.templates.get(templateId);
  }

  /**
   * Create a flow from a template
   */
  createFlowFromTemplate(
    templateId: string,
    overrides?: Partial<Flow>
  ): Flow | null {
    const template = this.templates.get(templateId);
    if (!template) {
      console.error(`Flow template not found: ${templateId}`);
      return null;
    }

    const flow: Flow = {
      ...template.template,
      id: overrides?.id || `${template.id}-${Date.now()}`,
      name: overrides?.name || template.template.name,
      description: overrides?.description || template.template.description,
      onComplete: overrides?.onComplete,
      onCancel: overrides?.onCancel,
      ...overrides,
    };

    return flow;
  }

  /**
   * Get all templates, optionally filtered by category
   */
  getAllTemplates(category?: string): FlowTemplate[] {
    const templates = Array.from(this.templates.values());
    if (category) {
      return templates.filter(t => t.category === category);
    }
    return templates;
  }

  // ========================================
  // Instance Management
  // ========================================

  /**
   * Start a new flow instance
   */
  startFlow(flowId: string, initialData?: Record<string, any>): string {
    const flow = this.flows.get(flowId);
    if (!flow) {
      throw new Error(`Flow not found: ${flowId}`);
    }

    // Generate unique instance ID
    const instanceId = `${flowId}-instance-${++this.instanceCounter}-${Date.now()}`;

    // Get first visible step
    const firstStep = this.getFirstVisibleStep(flow, initialData || {});
    if (!firstStep) {
      throw new Error(`No visible steps found in flow: ${flowId}`);
    }

    // Create flow state
    const state: FlowState = {
      flowId,
      currentStepId: firstStep.id,
      currentStepIndex: flow.steps.indexOf(firstStep),
      visitedSteps: [],
      data: { ...flow.initialData, ...initialData },
      errors: new Map(),
      isValidating: false,
      isComplete: false,
      isPaused: false,
      startedAt: new Date(),
    };

    // Create instance
    const instance: FlowInstance = {
      id: instanceId,
      flow,
      state,
    };

    this.instances.set(instanceId, instance);

    // Emit start event
    this.emit('flow-start', { instanceId, flow });

    // Call onEnter for first step
    if (firstStep.onEnter) {
      firstStep.onEnter(state.data);
    }

    // Emit step enter event
    this.emit('flow-step-enter', {
      instanceId,
      stepId: firstStep.id,
      step: firstStep,
    });

    return instanceId;
  }

  /**
   * Get a flow instance
   */
  getInstance(instanceId: string): FlowInstance | undefined {
    return this.instances.get(instanceId);
  }

  /**
   * Update flow instance data
   */
  updateInstanceData(
    instanceId: string,
    data: Partial<Record<string, any>>
  ): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return;
    }

    instance.state.data = {
      ...instance.state.data,
      ...data,
    };

    this.emit('flow-data-update', {
      instanceId,
      data: instance.state.data,
    });
  }

  /**
   * Complete a flow instance
   */
  async completeFlow(instanceId: string): Promise<void> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return;
    }

    instance.state.isComplete = true;
    instance.state.completedAt = new Date();

    // Call onComplete callback
    if (instance.flow.onComplete) {
      await instance.flow.onComplete(instance.state.data);
    }

    this.emit('flow-complete', {
      instanceId,
      data: instance.state.data,
    });

    // Clean up instance
    this.instances.delete(instanceId);
  }

  /**
   * Cancel a flow instance
   */
  cancelFlow(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return;
    }

    // Call onCancel callback
    if (instance.flow.onCancel) {
      instance.flow.onCancel();
    }

    this.emit('flow-cancel', { instanceId });

    // Clean up instance
    this.instances.delete(instanceId);
  }

  /**
   * Pause a flow instance
   */
  pauseFlow(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return;
    }

    instance.state.isPaused = true;
    this.emit('flow-pause', { instanceId });
  }

  /**
   * Resume a flow instance
   */
  resumeFlow(instanceId: string): void {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return;
    }

    instance.state.isPaused = false;
    this.emit('flow-resume', { instanceId });
  }

  // ========================================
  // Step Navigation
  // ========================================

  /**
   * Navigate to the next step in a flow
   */
  async nextStep(instanceId: string): Promise<boolean> {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return false;
    }

    const currentStep = this.getCurrentStep(instanceId);
    if (!currentStep) return false;

    // Call onExit for current step
    if (currentStep.onExit) {
      await currentStep.onExit(instance.state.data);
    }

    this.emit('flow-step-exit', {
      instanceId,
      stepId: currentStep.id,
      step: currentStep,
    });

    // Get next step (considering branches and conditions)
    const nextStep = this.getNextStep(instance);
    if (!nextStep) {
      // No more steps, complete the flow
      await this.completeFlow(instanceId);
      return false;
    }

    // Update state
    const previousStepId = instance.state.currentStepId;
    instance.state.currentStepId = nextStep.id;
    instance.state.currentStepIndex = instance.flow.steps.indexOf(nextStep);
    instance.state.visitedSteps.push(previousStepId);

    // Call onEnter for next step
    if (nextStep.onEnter) {
      await nextStep.onEnter(instance.state.data);
    }

    // Emit events
    this.emit('flow-step-change', {
      instanceId,
      fromStepId: previousStepId,
      toStepId: nextStep.id,
    });

    this.emit('flow-step-enter', {
      instanceId,
      stepId: nextStep.id,
      step: nextStep,
    });

    // Call onStepChange callback
    if (instance.flow.onStepChange) {
      instance.flow.onStepChange(nextStep.id, previousStepId);
    }

    return true;
  }

  /**
   * Navigate to the previous step in a flow
   */
  previousStep(instanceId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return false;
    }

    if (instance.state.visitedSteps.length === 0) {
      // Already at first step
      return false;
    }

    const currentStep = this.getCurrentStep(instanceId);
    if (!currentStep) return false;

    // Call onExit for current step
    if (currentStep.onExit) {
      currentStep.onExit(instance.state.data);
    }

    this.emit('flow-step-exit', {
      instanceId,
      stepId: currentStep.id,
      step: currentStep,
    });

    // Pop last visited step
    const previousStepId = instance.state.visitedSteps.pop()!;
    const previousStep = instance.flow.steps.find(s => s.id === previousStepId);
    if (!previousStep) return false;

    // Update state
    instance.state.currentStepId = previousStep.id;
    instance.state.currentStepIndex = instance.flow.steps.indexOf(previousStep);

    // Call onEnter for previous step
    if (previousStep.onEnter) {
      previousStep.onEnter(instance.state.data);
    }

    // Emit events
    this.emit('flow-step-change', {
      instanceId,
      fromStepId: currentStep.id,
      toStepId: previousStep.id,
    });

    this.emit('flow-step-enter', {
      instanceId,
      stepId: previousStep.id,
      step: previousStep,
    });

    // Call onStepChange callback
    if (instance.flow.onStepChange) {
      instance.flow.onStepChange(previousStep.id, currentStep.id);
    }

    return true;
  }

  /**
   * Navigate to a specific step by ID
   */
  goToStep(instanceId: string, stepId: string): boolean {
    const instance = this.instances.get(instanceId);
    if (!instance) {
      console.error(`Flow instance not found: ${instanceId}`);
      return false;
    }

    const targetStep = instance.flow.steps.find(s => s.id === stepId);
    if (!targetStep) {
      console.error(`Step not found: ${stepId}`);
      return false;
    }

    // Check if step is visible
    if (!this.isStepVisible(targetStep, instance.state.data)) {
      console.error(`Step is not visible: ${stepId}`);
      return false;
    }

    const currentStep = this.getCurrentStep(instanceId);
    if (!currentStep) return false;

    // Call onExit for current step
    if (currentStep.onExit) {
      currentStep.onExit(instance.state.data);
    }

    this.emit('flow-step-exit', {
      instanceId,
      stepId: currentStep.id,
      step: currentStep,
    });

    // Update state
    const previousStepId = instance.state.currentStepId;
    instance.state.currentStepId = targetStep.id;
    instance.state.currentStepIndex = instance.flow.steps.indexOf(targetStep);
    instance.state.visitedSteps.push(previousStepId);

    // Call onEnter for target step
    if (targetStep.onEnter) {
      targetStep.onEnter(instance.state.data);
    }

    // Emit events
    this.emit('flow-step-change', {
      instanceId,
      fromStepId: previousStepId,
      toStepId: targetStep.id,
    });

    this.emit('flow-step-enter', {
      instanceId,
      stepId: targetStep.id,
      step: targetStep,
    });

    // Call onStepChange callback
    if (instance.flow.onStepChange) {
      instance.flow.onStepChange(targetStep.id, previousStepId);
    }

    return true;
  }

  /**
   * Get the current step for an instance
   */
  getCurrentStep(instanceId: string): FlowStep | null {
    const instance = this.instances.get(instanceId);
    if (!instance) return null;

    return instance.flow.steps.find(
      s => s.id === instance.state.currentStepId
    ) || null;
  }

  // ========================================
  // Conditional Logic
  // ========================================

  /**
   * Evaluate a conditional rule
   */
  evaluateCondition(rule: ConditionalRule, data: Record<string, any>): boolean {
    const fieldValue = data[rule.field];

    // Handle nested rules (AND/OR logic)
    if (rule.rules && rule.rules.length > 0) {
      const results = rule.rules.map(r => this.evaluateCondition(r, data));

      if (rule.logic === 'or') {
        return results.some(r => r);
      } else {
        // Default to 'and'
        return results.every(r => r);
      }
    }

    // Evaluate individual rule
    switch (rule.operator) {
      case 'equals':
        return fieldValue === rule.value;
      case 'not_equals':
        return fieldValue !== rule.value;
      case 'contains':
        return Array.isArray(fieldValue) && fieldValue.includes(rule.value);
      case 'not_contains':
        return Array.isArray(fieldValue) && !fieldValue.includes(rule.value);
      case 'greater_than':
        return typeof fieldValue === 'number' && fieldValue > rule.value;
      case 'less_than':
        return typeof fieldValue === 'number' && fieldValue < rule.value;
      case 'greater_than_or_equal':
        return typeof fieldValue === 'number' && fieldValue >= rule.value;
      case 'less_than_or_equal':
        return typeof fieldValue === 'number' && fieldValue <= rule.value;
      case 'exists':
        return fieldValue !== undefined && fieldValue !== null;
      case 'not_exists':
        return fieldValue === undefined || fieldValue === null;
      default:
        console.warn(`Unknown operator: ${rule.operator}`);
        return true;
    }
  }

  /**
   * Check if a step should be visible based on its condition
   */
  isStepVisible(step: FlowStep, data: Record<string, any>): boolean {
    if (!step.condition) return true;
    return this.evaluateCondition(step.condition, data);
  }

  // ========================================
  // Branching Logic
  // ========================================

  /**
   * Evaluate a branch condition
   */
  evaluateBranch(branch: FlowBranch, data: Record<string, any>): boolean {
    switch (branch.condition.type) {
      case 'field':
        if (!branch.condition.rule) return false;
        return this.evaluateCondition(branch.condition.rule, data);

      case 'expression':
        if (!branch.condition.expression) return false;
        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('data', `return ${branch.condition.expression}`);
          return fn(data);
        } catch (error) {
          console.error(`Error evaluating branch expression:`, error);
          return false;
        }

      case 'custom':
        if (!branch.condition.evaluate) return false;
        return branch.condition.evaluate(data);

      default:
        console.warn(`Unknown branch condition type: ${branch.condition.type}`);
        return false;
    }
  }

  /**
   * Get the next step considering branches and conditions
   */
  private getNextStep(instance: FlowInstance): FlowStep | null {
    const currentStep = this.getCurrentStep(instance.id);
    if (!currentStep) return null;

    // Check for branches from current step
    const branches = (instance.flow.branches || [])
      .filter(b => b.from_step_id === currentStep.id)
      .sort((a, b) => (b.priority || 0) - (a.priority || 0)); // Higher priority first

    // Find first matching branch
    for (const branch of branches) {
      if (this.evaluateBranch(branch, instance.state.data)) {
        const targetStep = instance.flow.steps.find(
          s => s.id === branch.target_step_id
        );
        if (targetStep && this.isStepVisible(targetStep, instance.state.data)) {
          return targetStep;
        }
      }
    }

    // No branch matched, get next sequential visible step
    const currentIndex = instance.state.currentStepIndex;
    for (let i = currentIndex + 1; i < instance.flow.steps.length; i++) {
      const step = instance.flow.steps[i];
      if (this.isStepVisible(step, instance.state.data)) {
        return step;
      }
    }

    // No more visible steps
    return null;
  }

  /**
   * Get the first visible step in a flow
   */
  private getFirstVisibleStep(
    flow: Flow,
    data: Record<string, any>
  ): FlowStep | null {
    for (const step of flow.steps) {
      if (this.isStepVisible(step, data)) {
        return step;
      }
    }
    return null;
  }
}

// Export singleton instance
export const flowSystem = new FlowSystemClass();

