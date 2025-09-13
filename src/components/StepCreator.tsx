import React, { useState } from 'react';
import styled from 'styled-components';
import { GuideStep, Condition } from '../types/core';
import { ActionRegistryManager } from '../utils/actionSystem';
import { createLinearStep, createConditionalStep } from '../utils/guideSystem';
import { createCondition } from '../utils/actionSystem';

const Container = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h3`
  color: #3498db;
  margin: 0 0 1rem 0;
  font-size: 1.2rem;
`;

const StepTypeSelector = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const StepTypeButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'linear-gradient(135deg, #3498db, #2980b9)' : '#34495e'};
  color: white;
  border: 2px solid ${props => props.active ? '#3498db' : '#555'};
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3498db;
    transform: translateY(-1px);
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  color: #ecf0f1;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  background-color: #34495e;
  border: 2px solid #555;
  color: #ecf0f1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const Select = styled.select`
  width: 100%;
  background-color: #34495e;
  border: 2px solid #555;
  color: #ecf0f1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  option {
    background-color: #34495e;
    color: #ecf0f1;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background-color: #34495e;
  border: 2px solid #555;
  color: #ecf0f1;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  min-height: 80px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const ConditionBuilder = styled.div`
  background-color: #2c3e50;
  border: 2px solid #3498db;
  border-radius: 4px;
  padding: 1rem;
  margin: 1rem 0;
`;

const ConditionTitle = styled.h4`
  color: #3498db;
  margin: 0 0 0.75rem 0;
  font-size: 1rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled(Button)`
  background: linear-gradient(135deg, #95a5a6, #7f8c8d);
`;

type StepType = 'linear' | 'conditional';

interface StepCreatorProps {
  actionRegistry: ActionRegistryManager;
  onStepCreated: (step: GuideStep) => void;
  onCancel: () => void;
}

const StepCreator: React.FC<StepCreatorProps> = ({ actionRegistry, onStepCreated, onCancel }) => {
  const [stepType, setStepType] = useState<StepType>('linear');
  const [description, setDescription] = useState('');
  const [notes, setNotes] = useState('');
  
  // Linear step fields
  const [selectedActionId, setSelectedActionId] = useState('');
  
  // Conditional step fields
  const [conditionType, setConditionType] = useState('property');
  const [conditionTarget, setConditionTarget] = useState('');
  const [conditionOperator, setConditionOperator] = useState<Condition['operator']>('equals');
  const [conditionValue, setConditionValue] = useState('');
  const [trueActionId, setTrueActionId] = useState('');
  const [falseActionId, setFalseActionId] = useState('');

  const availableActions = Object.values(actionRegistry.actions);

  const handleCreateLinearStep = () => {
    if (!selectedActionId || !description) return;
    
    const step = createLinearStep(selectedActionId, description, notes || undefined);
    onStepCreated(step);
    resetForm();
  };

  const handleCreateConditionalStep = () => {
    if (!description || !conditionTarget || !trueActionId || !falseActionId) return;
    
    const condition = createCondition(
      conditionType,
      conditionOperator,
      conditionTarget,
      conditionValue
    );
    
    const trueStep = createLinearStep(trueActionId, `If true: ${description}`);
    const falseStep = createLinearStep(falseActionId, `If false: ${description}`);
    
    const step = createConditionalStep(condition, trueStep, falseStep, description);
    onStepCreated(step);
    resetForm();
  };

  const resetForm = () => {
    setDescription('');
    setNotes('');
    setSelectedActionId('');
    setConditionTarget('');
    setConditionValue('');
    setTrueActionId('');
    setFalseActionId('');
  };

  const canCreateStep = () => {
    if (!description) return false;
    
    if (stepType === 'linear') {
      return selectedActionId !== '';
    } else {
      return conditionTarget !== '' && trueActionId !== '' && falseActionId !== '';
    }
  };

  return (
    <Container>
      <SectionTitle>Add New Step</SectionTitle>
      
      <StepTypeSelector>
        <StepTypeButton 
          active={stepType === 'linear'} 
          onClick={() => setStepType('linear')}
        >
          Linear Step
        </StepTypeButton>
        <StepTypeButton 
          active={stepType === 'conditional'} 
          onClick={() => setStepType('conditional')}
        >
          Conditional Step
        </StepTypeButton>
      </StepTypeSelector>
      
      <FormGroup>
        <Label>Step Description *</Label>
        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this step does..."
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Notes (Optional)</Label>
        <TextArea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes or tips for this step..."
        />
      </FormGroup>

      {stepType === 'linear' && (
        <FormGroup>
          <Label>Action *</Label>
          <Select
            value={selectedActionId}
            onChange={(e) => setSelectedActionId(e.target.value)}
          >
            <option value="">Select an action...</option>
            {availableActions.map(action => (
              <option key={action.id} value={action.id}>
                {action.name} - {action.description}
              </option>
            ))}
          </Select>
        </FormGroup>
      )}

      {stepType === 'conditional' && (
        <>
          <ConditionBuilder>
            <ConditionTitle>Condition Setup</ConditionTitle>
            
            <FormGrid>
              <FormGroup>
                <Label>Condition Type</Label>
                <Select
                  value={conditionType}
                  onChange={(e) => setConditionType(e.target.value)}
                >
                  <option value="property">Item Property</option>
                  <option value="modifier">Has Modifier</option>
                  <option value="custom">Custom</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Target *</Label>
                <Input
                  value={conditionTarget}
                  onChange={(e) => setConditionTarget(e.target.value)}
                  placeholder={conditionType === 'property' ? 'e.g., rarity, itemLevel' : 'e.g., modifier name'}
                />
              </FormGroup>
              
              <FormGroup>
                <Label>Operator</Label>
                <Select
                  value={conditionOperator}
                  onChange={(e) => setConditionOperator(e.target.value as Condition['operator'])}
                >
                  <option value="equals">Equals</option>
                  <option value="notEquals">Not Equals</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                  <option value="contains">Contains</option>
                  <option value="hasModifier">Has Modifier</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Value</Label>
                <Input
                  value={conditionValue}
                  onChange={(e) => setConditionValue(e.target.value)}
                  placeholder="Comparison value..."
                />
              </FormGroup>
            </FormGrid>
          </ConditionBuilder>
          
          <FormGrid>
            <FormGroup>
              <Label>Action if Condition is True *</Label>
              <Select
                value={trueActionId}
                onChange={(e) => setTrueActionId(e.target.value)}
              >
                <option value="">Select action for true...</option>
                {availableActions.map(action => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Action if Condition is False *</Label>
              <Select
                value={falseActionId}
                onChange={(e) => setFalseActionId(e.target.value)}
              >
                <option value="">Select action for false...</option>
                {availableActions.map(action => (
                  <option key={action.id} value={action.id}>
                    {action.name}
                  </option>
                ))}
              </Select>
            </FormGroup>
          </FormGrid>
        </>
      )}

      <ButtonGroup>
        <Button 
          onClick={stepType === 'linear' ? handleCreateLinearStep : handleCreateConditionalStep}
          disabled={!canCreateStep()}
        >
          Add Step
        </Button>
        <CancelButton onClick={onCancel}>
          Cancel
        </CancelButton>
      </ButtonGroup>
    </Container>
  );
};

export default StepCreator;