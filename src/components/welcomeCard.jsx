import React from 'react';
import { styled } from '@mui/system';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { Icon } from '@iconify/react';
import { Link } from 'react-router-dom';

const StyledPaper = styled(Paper)({
  padding: '24px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  width: '100%',
  maxWidth: 1200,
  margin: '0 auto',
  '@media (max-width: 768px)': {
    padding: '16px',
  },
});

const ImagesContainer = styled('div')({
  display: 'flex',
  justifyContent: 'space-between',
  width: '100%',
  maxWidth: 400,
  marginBottom: '24px',
});

function WelcomeCard() {
  return (
    <StyledPaper elevation={3}>
      <Typography variant="h5" marginBottom={2}>
        Welcome to our Search Engine!
      </Typography>
      <ImagesContainer>
        <Icon icon="fa:compass" width={60} height={60}/>
        <Icon icon="fa:search" width={60} height={60}/>
        <Icon icon="fa:lightbulb-o" width={60} height={60}/>
      </ImagesContainer>
      <Typography variant="body1" marginBottom={2}>
        Here are our available query routes:
      </Typography>
      <Typography>
        <Link to="/fruits">/fruits</Link> <br/> <Link to="/personal">/personal (Football)</Link>
      </Typography>
    </StyledPaper>
  );
}

export default WelcomeCard;
