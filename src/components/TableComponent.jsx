import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { Link } from "react-router-dom";

const Paper = (props) => <div {...props} />;

const headCells = [
  { id: "title", alignment: "left", label: "Title" },
  { id: "url", alignment: "left", label: "URL" },
  { id: "pageRank", alignment: "left", label: "Page Rank" },
  { id: "score", alignment: "left", label: "Score" },
];

const EnhancedTableHead = ({ data }) => {
  if (!data || data.length === 0) return null;

  return (
    <TableHead>
      <TableRow>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id} align={headCell.alignment}>
            {headCell.label}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const TableComponent = ({ data, category }) => {
  return (
    <div>
      <Paper>
        <TableContainer>
          <Table>
            <EnhancedTableHead data={data} />
            <TableBody>
              {data.map((row, index) => (
                <TableRow key={row.href}>
                  <TableCell align="left">
                    <Link to={row.ref} state={{ data: row, category: category}}>
                      {row.title}
                    </Link>
                  </TableCell>
                  <TableCell align="left">
                    <Link to={row.url} target="_blank">
                      {row.url}
                    </Link>
                  </TableCell>
                  <TableCell align="left">{row.pr}</TableCell>
                  <TableCell align="left">{row.score}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};

export default TableComponent;
