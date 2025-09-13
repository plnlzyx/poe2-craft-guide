import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  background-color: #2c3e50;
  padding: 0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
`;

const NavList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  max-width: 1200px;
  margin: 0 auto;
`;

const NavItem = styled.li<{ isActive?: boolean }>`
  margin: 0;
  
  a {
    display: block;
    padding: 1rem 1.5rem;
    color: ${props => props.isActive ? '#3498db' : '#ecf0f1'};
    text-decoration: none;
    border-bottom: 3px solid ${props => props.isActive ? '#3498db' : 'transparent'};
    transition: all 0.2s ease;
    
    &:hover {
      background-color: #34495e;
      color: #3498db;
    }
  }
`;

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <Nav>
      <NavList>
        <NavItem isActive={location.pathname === '/guides' || location.pathname === '/'}>
          <Link to="/guides">Browse Guides</Link>
        </NavItem>
        <NavItem isActive={location.pathname === '/create'}>
          <Link to="/create">Create Guide</Link>
        </NavItem>
        <NavItem isActive={location.pathname === '/item-editor'}>
          <Link to="/item-editor">Item Editor</Link>
        </NavItem>
      </NavList>
    </Nav>
  );
};

export default Navigation;