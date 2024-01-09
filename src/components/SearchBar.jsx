import { React, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import {
  IconButton,
  InputBase,
  Paper,
  Switch,
  Typography,
  Select,
  MenuItem,
  Button,
  Table,
} from "@mui/material";
import { Icon } from "@iconify/react";
import TableComponent from "./TableComponent";
import { CircularProgress } from "@mui/material";
const SearchBar = ({ category }) => {
  const [searchText, setSearchText] = useState("");
  const [results, setResults] = useState(10);
  const [boost, setBoost] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [firstLoad, setFirstLoad] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };

  const handleResultsChange = (event) => {
    setResults(event.target.value);
  };

  const handleBoostChange = (event) => {
    setBoost(event.target.checked);
  };

  const parseQueryParams = (searchString) => {
    return searchString
      .substring(1)
      .split("&")
      .reduce((acc, pair) => {
        const [key, value] = pair.split("=");
        acc[key] = decodeURIComponent(value);
        return acc;
      }, {});
  }; 

  const fetchDataAndNavigate = (params) => {
    setLoading(true);
    const query = params?.q || searchText;
    const boostParam = params?.boost !== undefined ? params.boost : boost;
    const limit = params?.limit || results;

    const queryParams = `?q=${query}&boost=${boostParam}&limit=${limit}`;
    const apiUrl = `http://134.117.128.51:4000/${category}${queryParams}`;
    axios
      .get(apiUrl)
      .then((response) => {
        setData(response.data);
        navigate(`/${category}${queryParams}`);
      })
      .catch((error) => {
        console.error("There was an error fetching the data: ", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleClearAndNavigate = () => {
    setSearchText("");
    setData([]);
    navigate(`/${category}`);
  };

  useEffect(() => {
    if (firstLoad) {
      const params = parseQueryParams(location.search);
      console.log("ran ", params, "first load: ", firstLoad);
      setFirstLoad(false);
      if (params.q) {
        setSearchText(params.q);
        setBoost(params.boost === "true");
        setResults(params.limit);
        fetchDataAndNavigate(params);
      }
    }
  }, [location.search]);

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <IconButton
          color="primary"
          aria-label="home"
          size="large"
          onClick={() => navigate("/")}
        >
          <Icon icon="fa:home" />
        </IconButton>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "8px",
            borderRadius: "10px",
            width: "100%",
          }}
        >
          <Typography variant="body1" style={{ marginRight: "8px" }}>
            Searching:
          </Typography>
          <InputBase
            value={searchText}
            onChange={handleSearchTextChange}
            style={{ flex: 1, marginLeft: "8px" }}
            placeholder={`.../${category}`}
            inputProps={{ "aria-label": "search..." }}
          />
          <IconButton
            type="submit"
            aria-label="search"
            size="small"
            onClick={fetchDataAndNavigate}
          >
            <Icon icon="fa:search" />
          </IconButton>
        </Paper>
        <Paper
          variant="outlined"
          style={{
            display: "flex",
            alignItems: "center",
            padding: "5px",
            borderRadius: "10px",
          }}
        >
          <Typography
            variant="body1"
            style={{ marginRight: "4px", marginLeft: "4px" }}
          >
            Results
          </Typography>
          <Select
            value={results}
            onChange={handleResultsChange}
            displayEmpty
            size="small"
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={50}>50</MenuItem>
          </Select>
        </Paper>

        <Typography variant="body1">Boost</Typography>
        <Switch color="primary" checked={boost} onChange={handleBoostChange} />

        <Button
          style={{ marginLeft: "10px" }}
          variant="contained"
          onClick={handleClearAndNavigate}
        >
          Clear
        </Button>
      </div>
      <div>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              padding:"20px",
              marginTop:"250px"
            }}
          >
            <CircularProgress />
          </div>
        ) : (
          data && <TableComponent data={data} category={category} />
        )}
      </div>
    </>
  );
};

export default SearchBar;