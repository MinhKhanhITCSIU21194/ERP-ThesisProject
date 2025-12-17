import React, { useState, useEffect, useRef } from "react";
import { TextField, InputAdornment, IconButton } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface CustomSearchFieldProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  sx?: any;
  debounceMs?: number;
}

export function CustomSearchField({
  placeholder = "Search...",
  onSearch,
  sx,
  debounceMs = 500,
}: CustomSearchFieldProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer to trigger search after user stops typing
    debounceTimer.current = setTimeout(() => {
      onSearch(value);
    }, debounceMs);
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

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
