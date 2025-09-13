import React from 'react';
import styled from 'styled-components';
import { Item } from '../types/core';

const ItemContainer = styled.div`
  background: linear-gradient(135deg, #1a0e0a, #2d1b0f);
  border: 2px solid #8b6914;
  border-radius: 8px;
  padding: 1rem;
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 0.9rem;
  line-height: 1.4;
  box-shadow: 
    0 0 10px rgba(139, 105, 20, 0.3),
    inset 0 0 20px rgba(0, 0, 0, 0.5);
  position: relative;
  min-width: 280px;
  max-width: 400px;
`;

const ItemHeader = styled.div`
  text-align: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #444;
`;

const ItemName = styled.div<{ rarity: string }>`
  font-size: 1.1rem;
  font-weight: bold;
  color: ${props => {
    switch (props.rarity) {
      case 'normal': return '#c8c8c8';
      case 'magic': return '#8888ff';
      case 'rare': return '#ffff77';
      case 'unique': return '#af6025';
      default: return '#c8c8c8';
    }
  }};
  text-shadow: 0 0 4px currentColor;
  margin-bottom: 0.25rem;
`;

const ItemType = styled.div`
  color: #c8c8c8;
  font-size: 0.85rem;
`;

const ItemStats = styled.div`
  margin-bottom: 0.75rem;
`;

const StatLine = styled.div<{ statType?: 'damage' | 'defense' | 'requirement' | 'special' }>`
  color: ${props => {
    switch (props.statType) {
      case 'damage': return '#ff6060';
      case 'defense': return '#7f7fff';
      case 'requirement': return '#c8c8c8';
      case 'special': return '#d0d0d0';
      default: return '#c8c8c8';
    }
  }};
  margin-bottom: 0.1rem;
  
  &:first-child {
    margin-top: 0.5rem;
  }
`;

const QualityLine = styled.div`
  color: #8888ff;
`;

const ItemLevelLine = styled.div`
  color: #c8c8c8;
  font-size: 0.85rem;
`;

const RequirementsSection = styled.div`
  margin: 0.75rem 0;
  padding-top: 0.5rem;
  border-top: 1px solid #444;
  color: #c8c8c8;
`;

const ModifiersSection = styled.div`
  margin-top: 0.75rem;
  padding-top: 0.5rem;
  border-top: 1px solid #444;
`;

const ModifierLine = styled.div<{ modType: string }>`
  color: ${props => {
    switch (props.modType) {
      case 'implicit': return '#8888ff';
      case 'prefix': return '#8888ff';
      case 'suffix': return '#8888ff';
      case 'enchant': return '#ff8000';
      case 'corrupted': return '#d20000';
      default: return '#8888ff';
    }
  }};
  margin-bottom: 0.1rem;
  
  &:before {
    content: ${props => {
      switch (props.modType) {
        case 'implicit': return '"◦ "';
        case 'enchant': return '"✦ "';
        case 'corrupted': return '"◈ "';
        default: return '""';
      }
    }};
    color: ${props => props.modType === 'implicit' ? '#8888ff' : 'inherit'};
  }
`;

const CorruptedTag = styled.div`
  color: #d20000;
  font-weight: bold;
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.85rem;
  text-transform: uppercase;
`;

const Separator = styled.div`
  height: 1px;
  background: #444;
  margin: 0.5rem 0;
`;

interface ItemDisplayProps {
  item: Item;
  compact?: boolean;
  showHeader?: boolean;
}

const ItemDisplay: React.FC<ItemDisplayProps> = ({ item, compact = false, showHeader = true }) => {
  const formatModifierValue = (modifier: any) => {
    // This would normally parse the modifier values and format them properly
    // For now, we'll just display the name
    return modifier.name;
  };

  return (
    <ItemContainer>
      {showHeader && (
        <ItemHeader>
          <ItemName rarity={item.rarity}>{item.name}</ItemName>
          <ItemType>{item.baseType}</ItemType>
        </ItemHeader>
      )}

      <ItemStats>
        {item.quality > 0 && (
          <QualityLine>Quality: +{item.quality}%</QualityLine>
        )}
        
        {/* Base stats - these would come from item properties */}
        {item.properties.physicalDamage && (
          <StatLine statType="damage">
            Physical Damage: {item.properties.physicalDamage.value}
          </StatLine>
        )}
        
        {item.properties.criticalStrikeChance && (
          <StatLine>
            Critical Strike Chance: {item.properties.criticalStrikeChance.value}%
          </StatLine>
        )}
        
        {item.properties.attacksPerSecond && (
          <StatLine>
            Attacks per Second: {item.properties.attacksPerSecond.value}
          </StatLine>
        )}

        <ItemLevelLine>Item Level: {item.itemLevel}</ItemLevelLine>
      </ItemStats>

      {!compact && (
        <RequirementsSection>
          <div>Requires Level {Math.floor(item.itemLevel * 0.8)}</div>
        </RequirementsSection>
      )}

      {/* Implicit modifiers */}
      {item.modifiers.filter(mod => mod.type === 'implicit').length > 0 && (
        <>
          <Separator />
          <ModifiersSection>
            {item.modifiers
              .filter(mod => mod.type === 'implicit')
              .map((modifier, index) => (
                <ModifierLine key={modifier.id} modType="implicit">
                  {formatModifierValue(modifier)}
                </ModifierLine>
              ))}
          </ModifiersSection>
        </>
      )}

      {/* Explicit modifiers (prefix/suffix) */}
      {item.modifiers.filter(mod => mod.type === 'prefix' || mod.type === 'suffix').length > 0 && (
        <>
          {item.modifiers.filter(mod => mod.type === 'implicit').length === 0 && <Separator />}
          <ModifiersSection>
            {item.modifiers
              .filter(mod => mod.type === 'prefix' || mod.type === 'suffix')
              .map((modifier, index) => (
                <ModifierLine key={modifier.id} modType={modifier.type}>
                  {formatModifierValue(modifier)}
                </ModifierLine>
              ))}
          </ModifiersSection>
        </>
      )}

      {/* Enchant modifiers */}
      {item.modifiers.filter(mod => mod.type === 'enchant').length > 0 && (
        <>
          <Separator />
          <ModifiersSection>
            {item.modifiers
              .filter(mod => mod.type === 'enchant')
              .map((modifier, index) => (
                <ModifierLine key={modifier.id} modType="enchant">
                  {formatModifierValue(modifier)}
                </ModifierLine>
              ))}
          </ModifiersSection>
        </>
      )}

      {item.isCorrupted && <CorruptedTag>Corrupted</CorruptedTag>}
    </ItemContainer>
  );
};

export default ItemDisplay;