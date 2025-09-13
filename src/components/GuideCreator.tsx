import React, { useState } from 'react';
import styled from 'styled-components';
import { ActionRegistryManager } from '../utils/actionSystem';
import { GuideManager } from '../utils/guideSystem';
import { Item, CraftGuide, GuideStep } from '../types/core';
import { addProperty } from '../utils/itemUtils';
import StepCreator from './StepCreator';
import StepTimeline from './StepTimeline';
import ItemDisplay from './ItemDisplay';

const Container = styled.div`
  padding: 2rem 0;
`;

const Title = styled.h2`
  color: #ecf0f1;
  margin: 0 0 2rem 0;
  font-size: 1.8rem;
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
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  background-color: #34495e;
  border: 2px solid #555;
  color: #ecf0f1;
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  
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
  padding: 0.75rem;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  option {
    background-color: #34495e;
    color: #ecf0f1;
  }
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-right: 1rem;
  
  &:hover {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const MainLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 400px;
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

const AddStepButton = styled(Button)`
  background: linear-gradient(135deg, #27ae60, #229954);
  margin-bottom: 1rem;
  
  &:disabled {
    background: linear-gradient(135deg, #95a5a6, #7f8c8d);
  }
`;

const PreviewSection = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1rem;
  
  h4 {
    color: #3498db;
    margin: 0 0 1rem 0;
  }
`;

interface GuideCreatorProps {
  actionRegistry: ActionRegistryManager;
  guideManager: GuideManager;
  currentItem: Item;
  setCurrentItem: (item: Item) => void;
}

const GuideCreator: React.FC<GuideCreatorProps> = ({
  actionRegistry,
  guideManager,
  currentItem,
  setCurrentItem
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [difficulty, setDifficulty] = useState<CraftGuide['difficulty']>('beginner');
  const [tags, setTags] = useState('');
  const [steps, setSteps] = useState<GuideStep[]>([]);
  const [showStepCreator, setShowStepCreator] = useState(false);
  const [targetItem, setTargetItem] = useState<Item | null>(null);

  // Initialize starting item with some sample properties
  React.useEffect(() => {
    // Only initialize once when currentItem is first created
    if (currentItem.properties.physicalDamage) {
      return; // Already initialized
    }
    
    const enhancedItem = addProperty(
      addProperty(
        addProperty(currentItem, 'physicalDamage', '46 to 86', 'string'),
        'criticalStrikeChance', '5.00', 'string'
      ),
      'attacksPerSecond', '1.10', 'string'
    );
    setCurrentItem(enhancedItem);
  }, [currentItem, setCurrentItem]);

  const handleSave = () => {
    if (!title.trim() || !description.trim() || !author.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      const guide = guideManager.createGuide({
        title: title.trim(),
        description: description.trim(),
        author: author.trim(),
        version: '1.0',
        startingItem: {
          baseType: currentItem.baseType,
          name: currentItem.name,
          rarity: currentItem.rarity,
          isCorrupted: currentItem.isCorrupted,
          properties: currentItem.properties,
          modifiers: currentItem.modifiers
        },
        targetItem: targetItem ? {
          baseType: targetItem.baseType,
          name: targetItem.name,
          rarity: targetItem.rarity,
          isCorrupted: targetItem.isCorrupted,
          properties: targetItem.properties,
          modifiers: targetItem.modifiers
        } : undefined,
        steps,
        tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        difficulty,
        isPublic: true
      });

      alert(`Guide "${guide.title}" created successfully with ${steps.length} steps!`);
      
      // Reset form
      setTitle('');
      setDescription('');
      setAuthor('');
      setDifficulty('beginner');
      setTags('');
      setSteps([]);
      setTargetItem(null);
    } catch (error) {
      alert('Error creating guide: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const handleStepCreated = (step: GuideStep) => {
    setSteps(prev => [...prev, step]);
    setShowStepCreator(false);
  };

  const handleDeleteStep = (stepIndex: number) => {
    if (window.confirm('Are you sure you want to delete this step?')) {
      setSteps(prev => prev.filter((_, index) => index !== stepIndex));
    }
  };

  const handleMoveStep = (fromIndex: number, toIndex: number) => {
    setSteps(prev => {
      const newSteps = [...prev];
      const [movedStep] = newSteps.splice(fromIndex, 1);
      newSteps.splice(toIndex, 0, movedStep);
      return newSteps;
    });
  };

  return (
    <Container>
      <Title>Create New Craft Guide</Title>
      
      <Section>
        <SectionTitle>Basic Information</SectionTitle>
        
        <FormGroup>
          <Label>Title *</Label>
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter guide title..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Description *</Label>
          <TextArea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe what this guide teaches..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Author *</Label>
          <Input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name or username..."
          />
        </FormGroup>
        
        <FormGroup>
          <Label>Difficulty</Label>
          <Select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as CraftGuide['difficulty'])}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
            <option value="expert">Expert</option>
          </Select>
        </FormGroup>
        
        <FormGroup>
          <Label>Tags</Label>
          <Input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags separated by commas (e.g., sword, rare, endgame)..."
          />
        </FormGroup>
      </Section>

      <MainLayout>
        <LeftColumn>
          <Section>
            <SectionTitle>Guide Steps ({steps.length})</SectionTitle>
            
            <AddStepButton 
              onClick={() => setShowStepCreator(!showStepCreator)}
            >
              {showStepCreator ? 'Cancel Step Creation' : '+ Add New Step'}
            </AddStepButton>
            
            {showStepCreator && (
              <StepCreator
                actionRegistry={actionRegistry}
                onStepCreated={handleStepCreated}
                onCancel={() => setShowStepCreator(false)}
              />
            )}
            
            <StepTimeline
              steps={steps}
              editable={true}
              onDeleteStep={handleDeleteStep}
              onMoveStep={handleMoveStep}
            />
          </Section>
        </LeftColumn>
        
        <RightColumn>
          <PreviewSection>
            <h4>Starting Item</h4>
            <ItemDisplay item={currentItem} />
          </PreviewSection>
          
          {targetItem && (
            <PreviewSection>
              <h4>Target Item (Optional)</h4>
              <ItemDisplay item={targetItem} />
            </PreviewSection>
          )}
          
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: 'column' }}>
            <Button 
              onClick={handleSave}
              disabled={!title.trim() || !description.trim() || !author.trim()}
            >
              Create Guide ({steps.length} steps)
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/item-editor'}
              style={{ background: 'linear-gradient(135deg, #8e44ad, #9b59b6)' }}
            >
              Edit Starting Item
            </Button>
          </div>
        </RightColumn>
      </MainLayout>
    </Container>
  );
};

export default GuideCreator;