import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { ActionRegistryManager } from './utils/actionSystem';
import { GuideManager } from './utils/guideSystem';
import { createEmptyItem } from './utils/itemUtils';
import { Item } from './types/core';
import GuideCreator from './components/GuideCreator';
import GuideViewer from './components/GuideViewer';
import GuideList from './components/GuideList';
import ItemEditor from './components/ItemEditor';
import Navigation from './components/Navigation';

const AppContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #ffffff;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
`;

const MainContent = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  padding: 1rem 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const HeaderTitle = styled.h1`
  margin: 0;
  color: #ecf0f1;
  font-size: 2rem;
  font-weight: 300;
`;

const HeaderSubtitle = styled.p`
  margin: 0.5rem 0 0 0;
  color: #bdc3c7;
  font-size: 1rem;
`;

function App() {
  const [actionRegistry] = useState(() => new ActionRegistryManager());
  const [guideManager] = useState(() => new GuideManager(actionRegistry));
  const [currentItem, setCurrentItem] = useState<Item>(() => 
    createEmptyItem('Gemini Bow', 'Gemini Bow')
  );

  // Initialize some sample data
  useEffect(() => {
    // Create a sample guide with POE2 Bow data
    const sampleGuide = guideManager.createGuide({
      title: 'Crafting Project: Gemini Bow',
      description: 'Transform a normal Gemini Bow into a powerful rare weapon with high physical damage and elemental modifiers',
      author: 'CraftMaster',
      version: '1.0',
      startingItem: {
        baseType: 'Gemini Bow',
        name: 'Gemini Bow',
        rarity: 'normal',
        isCorrupted: false,
        properties: {
          physicalDamage: { id: 'phys-dmg', name: 'Physical Damage', value: '46 to 86', type: 'string' },
          criticalStrikeChance: { id: 'crit-chance', name: 'Critical Strike Chance', value: '5.00', type: 'string' },
          attacksPerSecond: { id: 'aps', name: 'Attacks per Second', value: '1.10', type: 'string' }
        },
        modifiers: []
      },
      targetItem: {
        properties: {
          fireDamage: { id: 'fire-dmg', name: 'Fire Damage', value: '47-8', type: 'string' }
        }
      },
      steps: [],
      isPublic: true
    });

    console.log('Created sample POE2 bow guide:', sampleGuide);
  }, []);

  return (
    <Router>
      <AppContainer>
        <Header>
          <HeaderTitle>POE2 Craft Guide Creator</HeaderTitle>
          <HeaderSubtitle>Create and share step-by-step crafting guides for Path of Exile 2</HeaderSubtitle>
        </Header>
        
        <Navigation />
        
        <MainContent>
          <Routes>
            <Route path="/" element={<Navigate to="/guides" replace />} />
            <Route 
              path="/guides" 
              element={<GuideList guideManager={guideManager} />} 
            />
            <Route 
              path="/create" 
              element={
                <GuideCreator 
                  actionRegistry={actionRegistry}
                  guideManager={guideManager}
                  currentItem={currentItem}
                  setCurrentItem={setCurrentItem}
                />
              } 
            />
            <Route 
              path="/guide/:id" 
              element={
                <GuideViewer 
                  guideManager={guideManager}
                  actionRegistry={actionRegistry}
                />
              } 
            />
            <Route 
              path="/item-editor" 
              element={
                <ItemEditor 
                  item={currentItem}
                  onChange={setCurrentItem}
                />
              } 
            />
          </Routes>
        </MainContent>
      </AppContainer>
    </Router>
  );
}

export default App;
