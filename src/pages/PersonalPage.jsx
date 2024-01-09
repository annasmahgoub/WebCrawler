// FruitsPage.jsx
import React from 'react';
import { Typography, Container } from '@mui/material';
import SearchBar from '../components/SearchBar';

export const PersonalPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h2" align="center" gutterBottom>
        Football Clubs Search
      </Typography>
      <SearchBar category={"personal"}></SearchBar>
    </Container>
  );
}


