import React, { useState } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

interface FilterSearchFieldProps {
  placeholder?: string;
  onSearchChange: (search: string) => void;
  onDepartmentChange?: (department: string | null) => void;
  onPositionChange?: (position: string | null) => void;
  departments?: Array<{ id: string; name: string }>;
  positions?: Array<{ id: string; name: string }>;
  sx?: any;
}

export const FilterSearchField: React.FC<FilterSearchFieldProps> = ({
  placeholder = "Search...",
  onSearchChange,
  onDepartmentChange,
  onPositionChange,
  departments = [],
  positions = [],
  sx,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setSearchTerm(value);
    onSearchChange(value);
  };

  const handleSearchKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter") {
      onSearchChange(searchTerm);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    onSearchChange("");
  };

  const handleDepartmentChange = (
    _event: any,
    newValue: { id: string; name: string } | null
  ) => {
    setSelectedDepartment(newValue);
    onDepartmentChange?.(newValue?.id || null);
  };

  const handlePositionChange = (
    _event: any,
    newValue: { id: string; name: string } | null
  ) => {
    setSelectedPosition(newValue);
    onPositionChange?.(newValue?.id || null);
  };

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", ...sx }}>
      {/* Main Search Field */}
      <TextField
        size="small"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearchChange}
        onKeyPress={handleSearchKeyPress}
        sx={{ minWidth: 250 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchTerm && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={handleClearSearch}>
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {/* Position Filter */}
      {onPositionChange && (
        <Autocomplete
          size="small"
          options={positions}
          getOptionLabel={(option) => option.name}
          value={selectedPosition}
          onChange={handlePositionChange}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Filter by Position" />
          )}
        />
      )}
      {/* Department Filter */}
      {onDepartmentChange && (
        <Autocomplete
          size="small"
          options={departments}
          getOptionLabel={(option) => option.name}
          value={selectedDepartment}
          onChange={handleDepartmentChange}
          sx={{ minWidth: 200 }}
          renderInput={(params) => (
            <TextField {...params} placeholder="Filter by Department" />
          )}
        />
      )}
    </Box>
  );
};
