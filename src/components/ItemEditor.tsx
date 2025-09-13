import React, { useState } from 'react';
import styled from 'styled-components';
import { Item, ItemModifier } from '../types/core';
import { 
  addModifier, 
  removeModifier, 
  createModifier,
  validateItem 
} from '../utils/itemUtils';

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

const Checkbox = styled.input`
  margin-right: 0.5rem;
  transform: scale(1.2);
`;

const Button = styled.button`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s ease;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

const DangerButton = styled(Button)`
  background: linear-gradient(135deg, #e74c3c, #c0392b);
`;

const ModifierItem = styled.div<{ $type: string }>`
  background-color: #2c3e50;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-left: 4px solid ${props => {
    switch (props.$type) {
      case 'prefix': return '#3498db';
      case 'suffix': return '#e67e22';
      case 'implicit': return '#9b59b6';
      default: return '#95a5a6';
    }
  }};
`;

const ModifierInfo = styled.div`
  flex-grow: 1;
`;

const ModifierName = styled.div`
  color: #ecf0f1;
  font-weight: 500;
  margin-bottom: 0.25rem;
`;

const ModifierDetails = styled.div`
  color: #bdc3c7;
  font-size: 0.8rem;
`;

const ValidationMessage = styled.div<{ isError?: boolean }>`
  background-color: ${props => props.isError ? '#c0392b20' : '#27ae6020'};
  border-left: 4px solid ${props => props.isError ? '#e74c3c' : '#27ae60'};
  color: ${props => props.isError ? '#e74c3c' : '#27ae60'};
  padding: 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
`;

interface ItemEditorProps {
  item: Item;
  onChange: (item: Item) => void;
}

const ItemEditor: React.FC<ItemEditorProps> = ({ item, onChange }) => {
  const [newModifierName, setNewModifierName] = useState('');
  const [newModifierType, setNewModifierType] = useState<ItemModifier['type']>('prefix');
  const [newModifierTier, setNewModifierTier] = useState(1);

  const handleBasicPropertyChange = (property: keyof Item, value: any) => {
    const updatedItem = { ...item, [property]: value };
    onChange(updatedItem);
  };

  const handleAddModifier = () => {
    if (!newModifierName.trim()) return;
    
    const modifier = createModifier(
      newModifierName.trim(),
      newModifierTier,
      newModifierType
    );
    
    const updatedItem = addModifier(item, modifier);
    onChange(updatedItem);
    
    setNewModifierName('');
    setNewModifierTier(1);
  };

  const handleRemoveModifier = (modifierId: string) => {
    const updatedItem = removeModifier(item, modifierId);
    onChange(updatedItem);
  };

  const validation = validateItem(item);

  return (
    <Container>
      <Title>Item Editor</Title>
      
      {!validation.isValid && (
        <ValidationMessage isError>
          <strong>Validation Errors:</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
            {validation.errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </ValidationMessage>
      )}
      
      <Section>
        <SectionTitle>Basic Properties</SectionTitle>
        
        <FormGrid>
          <FormGroup>
            <Label>Name</Label>
            <Input
              type="text"
              value={item.name}
              onChange={(e) => handleBasicPropertyChange('name', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Base Type</Label>
            <Input
              type="text"
              value={item.baseType}
              onChange={(e) => handleBasicPropertyChange('baseType', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Item Level</Label>
            <Input
              type="number"
              min="1"
              max="100"
              value={item.itemLevel}
              onChange={(e) => handleBasicPropertyChange('itemLevel', parseInt(e.target.value) || 1)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Quality</Label>
            <Input
              type="number"
              min="0"
              max="30"
              value={item.quality}
              onChange={(e) => handleBasicPropertyChange('quality', parseInt(e.target.value) || 0)}
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Rarity</Label>
            <Select
              value={item.rarity}
              onChange={(e) => handleBasicPropertyChange('rarity', e.target.value as Item['rarity'])}
            >
              <option value="normal">Normal</option>
              <option value="magic">Magic</option>
              <option value="rare">Rare</option>
              <option value="unique">Unique</option>
            </Select>
          </FormGroup>
        </FormGrid>
        
        <FormGroup>
          <Label>
            <Checkbox
              type="checkbox"
              checked={item.isCorrupted}
              onChange={(e) => handleBasicPropertyChange('isCorrupted', e.target.checked)}
            />
            Corrupted
          </Label>
        </FormGroup>
        
        <FormGroup>
          <Label>
            <Checkbox
              type="checkbox"
              checked={item.isIdentified}
              onChange={(e) => handleBasicPropertyChange('isIdentified', e.target.checked)}
            />
            Identified
          </Label>
        </FormGroup>
      </Section>
      
      <Section>
        <SectionTitle>Modifiers ({item.modifiers.length})</SectionTitle>
        
        {item.modifiers.map((modifier) => (
          <ModifierItem key={modifier.id} $type={modifier.type}>
            <ModifierInfo>
              <ModifierName>{modifier.name}</ModifierName>
              <ModifierDetails>
                Type: {modifier.type} | Tier: {modifier.tier}
              </ModifierDetails>
            </ModifierInfo>
            <DangerButton onClick={() => handleRemoveModifier(modifier.id)}>
              Remove
            </DangerButton>
          </ModifierItem>
        ))}
        
        <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#34495e', borderRadius: '4px' }}>
          <h4 style={{ color: '#ecf0f1', margin: '0 0 1rem 0' }}>Add New Modifier</h4>
          
          <FormGrid>
            <FormGroup>
              <Label>Modifier Name</Label>
              <Input
                type="text"
                value={newModifierName}
                onChange={(e) => setNewModifierName(e.target.value)}
                placeholder="e.g., +10 to Strength"
              />
            </FormGroup>
            
            <FormGroup>
              <Label>Type</Label>
              <Select
                value={newModifierType}
                onChange={(e) => setNewModifierType(e.target.value as ItemModifier['type'])}
              >
                <option value="prefix">Prefix</option>
                <option value="suffix">Suffix</option>
                <option value="implicit">Implicit</option>
                <option value="enchant">Enchant</option>
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label>Tier</Label>
              <Input
                type="number"
                min="1"
                max="10"
                value={newModifierTier}
                onChange={(e) => setNewModifierTier(parseInt(e.target.value) || 1)}
              />
            </FormGroup>
          </FormGrid>
          
          <Button onClick={handleAddModifier} disabled={!newModifierName.trim()}>
            Add Modifier
          </Button>
        </div>
      </Section>
      
      <Section>
        <SectionTitle>Sockets ({item.sockets.length})</SectionTitle>
        <p style={{ color: '#bdc3c7' }}>
          Socket editing will be available in a future iteration.
        </p>
      </Section>
      
      {validation.isValid && (
        <ValidationMessage>
          ✓ Item is valid and ready to use
        </ValidationMessage>
      )}
    </Container>
  );
};

export default ItemEditor;