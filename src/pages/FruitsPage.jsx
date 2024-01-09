// FruitsPage.jsx
import React from 'react';
import { Typography, Container } from '@mui/material';
import SearchBar from '../components/SearchBar';

export const FruitsPage = () => {
  return (
    <Container maxWidth="lg">
      <Typography variant="h2" align="center" gutterBottom>
        Fruits Search
      </Typography>
      <SearchBar category={"fruits"}></SearchBar>
    </Container>
  );
}

