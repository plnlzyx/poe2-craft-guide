import React from 'react';
import styled from 'styled-components';
import { GuideStep, LinearStep, ConditionalStep } from '../types/core';

const TimelineContainer = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1.5rem;
  max-height: 600px;
  overflow-y: auto;
  border: 2px solid #34495e;
  
  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #2c3e50;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #3498db;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #2980b9;
  }
`;

const TimelineTitle = styled.h3`
  color: #3498db;
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  text-align: center;
`;

const StepsContainer = styled.div`
  position: relative;
`;

const TimelineLine = styled.div`
  position: absolute;
  left: 20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #3498db, #2980b9);
  z-index: 1;
`;

const StepContainer = styled.div<{ isActive?: boolean; isCompleted?: boolean }>`
  position: relative;
  margin-bottom: 1rem;
  padding-left: 3rem;
  z-index: 2;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  opacity: ${props => props.isCompleted ? 0.7 : 1};
  transform: ${props => props.isActive ? 'scale(1.02)' : 'scale(1)'};
  transition: all 0.3s ease;
`;

const StepNumber = styled.div<{ isActive?: boolean; isCompleted?: boolean; stepType?: string }>`
  position: absolute;
  left: 0;
  top: 8px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => {
    if (props.isCompleted) return 'linear-gradient(135deg, #27ae60, #229954)';
    if (props.isActive) return 'linear-gradient(135deg, #f39c12, #e67e22)';
    return 'linear-gradient(135deg, #3498db, #2980b9)';
  }};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  z-index: 3;
  border: 3px solid ${props => {
    if (props.stepType === 'conditional') return '#e67e22';
    return '#34495e';
  }};
  
  &::after {
    content: ${props => {
      if (props.isCompleted) return '"✓"';
      if (props.stepType === 'conditional') return '"?"';
      return '""';
    }};
    font-size: ${props => props.isCompleted ? '1.2rem' : '0.8rem'};
  }
`;

const StepContent = styled.div<{ isActive?: boolean }>`
  background: ${props => props.isActive ? 
    'linear-gradient(135deg, #34495e, #2c3e50)' : 
    'linear-gradient(135deg, #2c3e50, #34495e)'};
  border: 2px solid ${props => props.isActive ? '#f39c12' : '#555'};
  border-radius: 8px;
  padding: 1rem;
  box-shadow: ${props => props.isActive ? 
    '0 4px 12px rgba(243, 156, 18, 0.3)' : 
    '0 2px 4px rgba(0, 0, 0, 0.2)'};
  transition: all 0.3s ease;
`;

const StepHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
`;

const StepTitle = styled.div`
  color: #ecf0f1;
  font-weight: 600;
  font-size: 1rem;
  flex: 1;
`;

const StepType = styled.span<{ stepType: string }>`
  background: ${props => {
    switch (props.stepType) {
      case 'conditional': return '#e67e22';
      case 'branch': return '#9b59b6';
      case 'loop': return '#e74c3c';
      default: return '#3498db';
    }
  }};
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-left: 1rem;
`;

const StepDescription = styled.div`
  color: #bdc3c7;
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const StepNotes = styled.div`
  color: #95a5a6;
  font-size: 0.8rem;
  font-style: italic;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #444;
`;

const ConditionalBranches = styled.div`
  margin-top: 0.75rem;
  padding: 0.75rem;
  background: rgba(52, 73, 94, 0.3);
  border-radius: 4px;
  border-left: 3px solid #e67e22;
`;

const BranchTitle = styled.div`
  color: #e67e22;
  font-weight: 500;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Branch = styled.div<{ branchType: 'true' | 'false' }>`
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
  border-left: 3px solid ${props => props.branchType === 'true' ? '#27ae60' : '#e74c3c'};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const BranchLabel = styled.span<{ branchType: 'true' | 'false' }>`
  color: ${props => props.branchType === 'true' ? '#27ae60' : '#e74c3c'};
  font-weight: 500;
  font-size: 0.8rem;
  margin-right: 0.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-style: italic;
  padding: 2rem;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const ActionButton = styled.button`
  background: transparent;
  border: 1px solid #555;
  color: #bdc3c7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #3498db;
    color: #3498db;
  }
`;

interface StepTimelineProps {
  steps: GuideStep[];
  activeStepIndex?: number;
  completedSteps?: Set<number>;
  onStepClick?: (stepIndex: number) => void;
  onEditStep?: (stepIndex: number) => void;
  onDeleteStep?: (stepIndex: number) => void;
  onMoveStep?: (fromIndex: number, toIndex: number) => void;
  editable?: boolean;
}

const StepTimeline: React.FC<StepTimelineProps> = ({
  steps,
  activeStepIndex,
  completedSteps = new Set(),
  onStepClick,
  onEditStep,
  onDeleteStep,
  onMoveStep,
  editable = false
}) => {
  const handleStepClick = (index: number) => {
    if (onStepClick) {
      onStepClick(index);
    }
  };

  const getStepDisplayInfo = (step: GuideStep) => {
    switch (step.type) {
      case 'linear':
        return {
          title: step.description,
          action: `Action: ${step.actionId}`,
          notes: (step as LinearStep).notes
        };
      case 'conditional':
        const condStep = step as ConditionalStep;
        return {
          title: step.description,
          action: `If ${condStep.condition.target} ${condStep.condition.operator} ${condStep.condition.value}`,
          notes: undefined
        };
      default:
        return {
          title: step.description,
          action: `${step.type} step`,
          notes: undefined
        };
    }
  };

  if (steps.length === 0) {
    return (
      <TimelineContainer>
        <TimelineTitle>Guide Steps</TimelineTitle>
        <EmptyState>
          No steps added yet. Click "Add Step" to create your first crafting step.
        </EmptyState>
      </TimelineContainer>
    );
  }

  return (
    <TimelineContainer>
      <TimelineTitle>Guide Steps ({steps.length})</TimelineTitle>
      
      <StepsContainer>
        <TimelineLine />
        
        {steps.map((step, index) => {
          const isActive = activeStepIndex === index;
          const isCompleted = completedSteps.has(index);
          const stepInfo = getStepDisplayInfo(step);
          
          return (
            <StepContainer
              key={step.id}
              isActive={isActive}
              isCompleted={isCompleted}
              onClick={() => handleStepClick(index)}
            >
              <StepNumber
                isActive={isActive}
                isCompleted={isCompleted}
                stepType={step.type}
              >
                {!isCompleted && step.type !== 'conditional' && (index + 1)}
              </StepNumber>
              
              <StepContent isActive={isActive}>
                <StepHeader>
                  <StepTitle>{stepInfo.title}</StepTitle>
                  <StepType stepType={step.type}>{step.type}</StepType>
                </StepHeader>
                
                <StepDescription>{stepInfo.action}</StepDescription>
                
                {step.type === 'conditional' && (
                  <ConditionalBranches>
                    <BranchTitle>Conditional Branches:</BranchTitle>
                    <Branch branchType="true">
                      <BranchLabel branchType="true">TRUE:</BranchLabel>
                      {(step as ConditionalStep).trueStep.type === 'linear' ? 
                        `${((step as ConditionalStep).trueStep as LinearStep).actionId}` :
                        'Complex step'
                      }
                    </Branch>
                    <Branch branchType="false">
                      <BranchLabel branchType="false">FALSE:</BranchLabel>
                      {(step as ConditionalStep).falseStep.type === 'linear' ? 
                        `${((step as ConditionalStep).falseStep as LinearStep).actionId}` :
                        'Complex step'
                      }
                    </Branch>
                  </ConditionalBranches>
                )}
                
                {stepInfo.notes && (
                  <StepNotes>{stepInfo.notes}</StepNotes>
                )}
                
                {editable && (
                  <ActionButtons>
                    {onEditStep && (
                      <ActionButton onClick={(e) => { e.stopPropagation(); onEditStep(index); }}>
                        Edit
                      </ActionButton>
                    )}
                    {onDeleteStep && (
                      <ActionButton onClick={(e) => { e.stopPropagation(); onDeleteStep(index); }}>
                        Delete
                      </ActionButton>
                    )}
                    {onMoveStep && index > 0 && (
                      <ActionButton onClick={(e) => { e.stopPropagation(); onMoveStep(index, index - 1); }}>
                        ↑
                      </ActionButton>
                    )}
                    {onMoveStep && index < steps.length - 1 && (
                      <ActionButton onClick={(e) => { e.stopPropagation(); onMoveStep(index, index + 1); }}>
                        ↓
                      </ActionButton>
                    )}
                  </ActionButtons>
                )}
              </StepContent>
            </StepContainer>
          );
        })}
      </StepsContainer>
    </TimelineContainer>
  );
};

export default StepTimeline;