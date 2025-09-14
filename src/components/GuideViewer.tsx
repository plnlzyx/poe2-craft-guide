import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { GuideManager } from '../utils/guideSystem';
import { ActionRegistryManager } from '../utils/actionSystem';
import { CraftGuide, Item } from '../types/core';
import { createEmptyItem, addProperty } from '../utils/itemUtils';
import StepTimeline from './StepTimeline';
import ItemDisplay from './ItemDisplay';

const Container = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
  margin-bottom: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
`;

const GuideMeta = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const Title = styled.h2`
  color: #ecf0f1;
  margin: 0 0 1rem 0;
  font-size: 2rem;
`;

const Section = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
`;

const SectionTitle = styled.h3`
  color: #3498db;
  margin: 0 0 1rem 0;
  font-size: 1.3rem;
`;

const Description = styled.p`
  color: #bdc3c7;
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const MetadataGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const MetadataItem = styled.div`
  color: #95a5a6;
  font-size: 0.8rem;
`;

const MetadataLabel = styled.span`
  color: #ecf0f1;
  font-weight: 500;
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 400px 1fr;
  gap: 2rem;
  margin-top: 2rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RightColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ItemSection = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1rem;
  
  h4 {
    color: #3498db;
    margin: 0 0 1rem 0;
    font-size: 1.1rem;
  }
`;

const ExecuteButton = styled.button`
  background: linear-gradient(135deg, #27ae60, #229954);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-bottom: 1rem;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  background-color: #c0392b20;
  padding: 1rem;
  border-radius: 4px;
  border-left: 4px solid #e74c3c;
`;

interface GuideViewerProps {
  guideManager: GuideManager;
  actionRegistry: ActionRegistryManager;
}

const GuideViewer: React.FC<GuideViewerProps> = ({ guideManager, actionRegistry }) => {
  const { id } = useParams<{ id: string }>();
  const [guide, setGuide] = useState<CraftGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentItem, setCurrentItem] = useState<Item | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isExecuting, setIsExecuting] = useState(false);

  useEffect(() => {
    if (!id) {
      setError('No guide ID provided');
      setLoading(false);
      return;
    }

    try {
      const foundGuide = guideManager.getGuide(id);
      if (!foundGuide) {
        setError(`Guide not found: ${id}`);
      } else {
        setGuide(foundGuide);
        
        // Initialize starting item
        const baseItem = createEmptyItem(
          foundGuide.startingItem.baseType || 'Sword',
          foundGuide.startingItem.name || 'Gemini Bow'
        );
        
        // Set rarity and properties using spread operator
        const startingItem = {
          ...baseItem,
          rarity: foundGuide.startingItem.rarity || 'normal',
          isCorrupted: foundGuide.startingItem.isCorrupted || false,
          quality: 20,
          itemLevel: 100
        };
        
        // Add the POE2 bow properties from the screenshot
        let enhancedItem = addProperty(
          addProperty(
            addProperty(startingItem, 'physicalDamage', '46 to 86', 'string'),
            'criticalStrikeChance', '5.00', 'string'
          ),
          'attacksPerSecond', '1.10', 'string'
        );
        
        // Copy properties and modifiers from guide if they exist
        if (foundGuide.startingItem.properties) {
          Object.keys(foundGuide.startingItem.properties).forEach(key => {
            const prop = foundGuide.startingItem.properties![key];
            enhancedItem = addProperty(enhancedItem, key, prop.value, prop.type);
          });
        }
        
        if (foundGuide.startingItem.modifiers) {
          enhancedItem = {
            ...enhancedItem,
            modifiers: [...foundGuide.startingItem.modifiers]
          };
        }
        
        setCurrentItem(enhancedItem);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [id, guideManager]);

  const handleExecuteStep = async () => {
    if (!guide || !currentItem || activeStepIndex >= guide.steps.length) return;
    
    setIsExecuting(true);
    
    try {
      const executionState = guideManager.createExecutionState(guide.id, currentItem);
      executionState.currentStepIndex = activeStepIndex;
      
      const result = guideManager.executeNextStep(executionState);
      
      if (result.success) {
        setCurrentItem(result.item);
        setCompletedSteps(prev => {
          const newSet = new Set(prev);
          newSet.add(activeStepIndex);
          return newSet;
        });
        setActiveStepIndex(prev => prev + 1);
      } else {
        alert(`Step execution failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Error executing step: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setActiveStepIndex(stepIndex);
  };

  const handleResetExecution = () => {
    if (window.confirm('Reset guide execution? This will restore the starting item.')) {
      setActiveStepIndex(0);
      setCompletedSteps(new Set());
      
      if (guide) {
        // Reinitialize the starting item
        const baseItem = createEmptyItem(
          guide.startingItem.baseType || 'Sword',
          guide.startingItem.name || 'Gemini Bow'
        );
        
        const startingItem = {
          ...baseItem,
          rarity: guide.startingItem.rarity || 'normal',
          quality: 20,
          itemLevel: 100
        };
        
        let enhancedItem = addProperty(
          addProperty(
            addProperty(startingItem, 'physicalDamage', '46 to 86', 'string'),
            'criticalStrikeChance', '5.00', 'string'
          ),
          'attacksPerSecond', '1.10', 'string'
        );
        
        setCurrentItem(enhancedItem);
      }
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-CA').format(new Date(date));
  };

  if (loading) {
    return <Container><div style={{textAlign: 'center', padding: '2rem'}}>Loading guide...</div></Container>;
  }

  if (error) {
    return (
      <Container>
        <ErrorMessage>{error}</ErrorMessage>
      </Container>
    );
  }

  if (!guide || !currentItem) {
    return (
      <Container>
        <ErrorMessage>Guide not found</ErrorMessage>
      </Container>
    );
  }

  const canExecuteStep = activeStepIndex < guide.steps.length && !isExecuting;
  const isCompleted = activeStepIndex >= guide.steps.length;

  return (
    <Container>
      <Header>
        {guide.targetItem && (
          <ItemSection>
            <h4>End Goal Item</h4>
            <ItemDisplay 
              item={{
                ...currentItem,
                ...guide.targetItem,
                id: 'target-' + currentItem.id
              } as Item} 
            />
          </ItemSection>
        )}
        
        <GuideMeta>
          <Title>{guide.title}</Title>
          <Description>{guide.description}</Description>
          
          <MetadataGrid>
            <MetadataItem>
              <MetadataLabel>Author:</MetadataLabel> {guide.author}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Version:</MetadataLabel> {guide.version}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Created:</MetadataLabel> {formatDate(guide.createdAt)}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Updated:</MetadataLabel> {formatDate(guide.updatedAt)}
            </MetadataItem>
            <MetadataItem>
              <MetadataLabel>Steps:</MetadataLabel> {guide.steps.length}
            </MetadataItem>
          </MetadataGrid>
        </GuideMeta>
      </Header>

      <MainLayout>
        <LeftColumn>
          <ItemSection>
            <h4>Current Item</h4>
            <ItemDisplay item={currentItem} />
          </ItemSection>
          
          {guide.estimatedCost && (
            <ItemSection>
              <h4>Estimated Cost</h4>
              {Object.entries(guide.estimatedCost).map(([currency, amount]) => (
                <div key={currency} style={{ color: '#bdc3c7', marginBottom: '0.25rem' }}>
                  <MetadataLabel>{currency}:</MetadataLabel> {amount}
                </div>
              ))}
            </ItemSection>
          )}
        </LeftColumn>
        
        <RightColumn>
          <Section>
            <SectionTitle>Interactive Guide Execution</SectionTitle>
            
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <ExecuteButton 
                onClick={handleExecuteStep}
                disabled={!canExecuteStep}
              >
                {isExecuting ? 'Executing...' : isCompleted ? 'Guide Completed!' : `Execute Step ${activeStepIndex + 1}`}
              </ExecuteButton>
              
              <ExecuteButton 
                onClick={handleResetExecution}
                style={{ background: 'linear-gradient(135deg, #e67e22, #d35400)' }}
              >
                Reset
              </ExecuteButton>
            </div>
            
            <StepTimeline
              steps={guide.steps}
              activeStepIndex={activeStepIndex}
              completedSteps={completedSteps}
              onStepClick={handleStepClick}
            />
          </Section>
        </RightColumn>
      </MainLayout>
    </Container>
  );
};

export default GuideViewer;