import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Typography,
  Paper,
  Box,
  Button,
  Link,
  Collapse,
  Card,
  CardActions,
  CardContent,
  IconButton,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const DetailsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { data, category } = location.state || {};
  const [showIncoming, setShowIncoming] = useState(false);
  const [showOutgoing, setShowOutgoing] = useState(false);

  const formatKeywordOccurrences = (wordFrequency) => {
    return Object.entries(wordFrequency)
      .map(([word, count]) => `${word} (${count})`)
      .join(", ");
  };

  console.log(category);
  return (
    <Box sx={{ padding: "20px" }}>
      <Button
        variant="contained"
        startIcon={<ArrowBackIcon />} // Add the icon to the start of the button
        onClick={() => navigate(`/${category}`)}
        sx={{ marginBottom: "20px" }}
      >
        Return
      </Button>

      <Card elevation={3}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Title: {data.title}
          </Typography>
          <Typography variant="subtitle1" gutterBottom component="div">
            URL: <Link href={data.url}>{data.url}</Link>
          </Typography>
          <Typography variant="subtitle1">
            Page Rank: {data.pr}
          </Typography>
          <Typography variant="subtitle1">Score: {data.score}</Typography>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="h6" gutterBottom>
              Keyword Occurrences:
            </Typography>
            <Typography variant="body2">
              {formatKeywordOccurrences(data.wordFrequency)}
            </Typography>
          </Box>
          <Box sx={{ marginTop: "20px" }}>
            <Typography variant="h6" gutterBottom>
              Content:
            </Typography>
            <Typography variant="body2">
              {Object.keys(data.wordFrequency).join(" ")}
            </Typography>
          </Box>
        </CardContent>
        <CardActions disableSpacing>
          <IconButton
            onClick={() => setShowIncoming(!showIncoming)}
            aria-expanded={showIncoming}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
          <Typography variant="h6" component="span">
            Show incoming links ({data.incomingLinks.length})
          </Typography>
        </CardActions>
        <Collapse in={showIncoming} timeout="auto" unmountOnExit>
          <CardContent>
            <ul>
              {data.incomingLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link}>{link}</Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Collapse>
        <CardActions disableSpacing>
          <IconButton
            onClick={() => setShowOutgoing(!showOutgoing)}
            aria-expanded={showOutgoing}
            aria-label="show more"
          >
            <ExpandMoreIcon />
          </IconButton>
          <Typography variant="h6" component="span">
            Show outgoing links ({data.outgoingLinks.length})
          </Typography>
        </CardActions>
        <Collapse in={showOutgoing} timeout="auto" unmountOnExit>
          <CardContent>
            <ul>
              {data.outgoingLinks.map((link, index) => (
                <li key={index}>
                  <Link href={link}>{link}</Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Collapse>
      </Card>
    </Box>
  );
};

export default DetailsPage;
