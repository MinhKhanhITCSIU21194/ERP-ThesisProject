import React, { useState } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface CustomSearchFieldProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  sx?: any;
}

export function CustomSearchField({
  placeholder = "Search...",
  onSearch,
  sx,
}: CustomSearchFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    // Trigger search on every keystroke (debouncing can be added if needed)
    onSearch(value);
  };

  const handleClear = () => {
    setSearchTerm("");
    onSearch("");
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearch(searchTerm);
    }
  };

  return (
    <TextField
      value={searchTerm}
      onChange={handleSearchChange}
      onKeyPress={handleKeyPress}
      placeholder={placeholder}
      size="small"
      sx={{
        minWidth: 250,
        ...sx,
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton size="small" onClick={handleClear} edge="end">
              <ClearIcon fontSize="small" />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
}

export default CustomSearchField;
