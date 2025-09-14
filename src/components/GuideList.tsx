import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { GuideManager } from '../utils/guideSystem';
import { CraftGuide } from '../types/core';

const Container = styled.div`
  padding: 2rem 0;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  color: #ecf0f1;
  margin: 0;
  font-size: 1.8rem;
`;

const SearchBar = styled.input`
  background-color: #34495e;
  border: 2px solid #555;
  color: #ecf0f1;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 1rem;
  width: 300px;
  
  &:focus {
    outline: none;
    border-color: #3498db;
  }
  
  &::placeholder {
    color: #bdc3c7;
  }
`;

const GuideGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
`;

const GuideCard = styled.div`
  background: linear-gradient(135deg, #2c3e50, #34495e);
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
  }
`;

const GuideTitle = styled.h3`
  color: #3498db;
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
  
  a {
    color: inherit;
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const GuideDescription = styled.p`
  color: #bdc3c7;
  margin: 0 0 1rem 0;
  line-height: 1.5;
`;

const GuideMetadata = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1rem;
`;

const GuideInfo = styled.div`
  font-size: 0.9rem;
  color: #95a5a6;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 1.2rem;
  padding: 4rem 2rem;
`;

const CreateButton = styled(Link)`
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  display: inline-block;
  font-weight: 500;
  transition: transform 0.2s ease;
  
  &:hover {
    transform: translateY(-1px);
  }
`;

interface GuideListProps {
  guideManager: GuideManager;
}

const GuideList: React.FC<GuideListProps> = ({ guideManager }) => {
  const [guides, setGuides] = useState<CraftGuide[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredGuides, setFilteredGuides] = useState<CraftGuide[]>([]);

  useEffect(() => {
    const allGuides = guideManager.getAllGuides();
    setGuides(allGuides);
    setFilteredGuides(allGuides);
  }, [guideManager]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredGuides(guides);
    } else {
      const filtered = guides.filter(guide =>
        guide.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guide.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredGuides(filtered);
    }
  }, [searchTerm, guides]);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <Container>
      <Header>
        <Title>Craft Guides</Title>
        <SearchBar
          type="text"
          placeholder="Search guides..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Header>

      {filteredGuides.length === 0 && guides.length === 0 ? (
        <EmptyState>
          <p>No guides available yet.</p>
          <CreateButton to="/create">Create Your First Guide</CreateButton>
        </EmptyState>
      ) : filteredGuides.length === 0 ? (
        <EmptyState>
          <p>No guides match your search.</p>
        </EmptyState>
      ) : (
        <GuideGrid>
          {filteredGuides.map((guide) => (
            <GuideCard key={guide.id}>
              <GuideTitle>
                <Link to={`/guide/${guide.id}`}>{guide.title}</Link>
              </GuideTitle>
              
              <GuideDescription>{guide.description}</GuideDescription>
              
              <GuideMetadata>
                <GuideInfo>
                  <div>By {guide.author}</div>
                  <div>Updated {formatDate(guide.updatedAt)}</div>
                  <div>{guide.steps.length} steps</div>
                </GuideInfo>
              </GuideMetadata>
            </GuideCard>
          ))}
        </GuideGrid>
      )}
    </Container>
  );
};

export default GuideList;