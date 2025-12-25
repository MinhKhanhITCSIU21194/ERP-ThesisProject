import React, { useState, useEffect, useCallback } from "react";
import { Autocomplete, TextField, CircularProgress } from "@mui/material";

interface CustomSearchDropDownMenuProps<T> {
  label: string;
  placeholder?: string;
  options: T[];
  loading?: boolean;
  value: T | null;
  onChange: (value: T | null) => void;
  onInputChange?: (value: string) => void;
  getOptionLabel: (option: T) => string;
  disabled?: boolean;
  size?: "small" | "medium";
  sx?: any;
  delay?: number; // Debounce delay in milliseconds
}

function CustomSearchDropDownMenu<T>({
  label,
  placeholder = "Type to search...",
  options,
  loading = false,
  value,
  onChange,
  onInputChange,
  getOptionLabel,
  disabled = false,
  size = "small",
  sx,
  delay = 2000,
}: CustomSearchDropDownMenuProps<T>) {
  const [inputValue, setInputValue] = useState("");
  const [debouncedValue, setDebouncedValue] = useState("");

  // Debounce the input value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(inputValue);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [inputValue, delay]);

  // Trigger search when debounced value changes
  useEffect(() => {
    if (debouncedValue && onInputChange) {
      onInputChange(debouncedValue);
    }
  }, [debouncedValue, onInputChange]);

  const handleInputChange = (
    event: any,
    newInputValue: string,
    reason: string
  ) => {
    // Only update input value if user is typing, not when selecting
    if (reason !== "reset") {
      setInputValue(newInputValue);
    }
  };

  const handleChange = (event: any, newValue: T | null) => {
    onChange(newValue);
    // Clear input after selection
    setInputValue("");
  };

  return (
    <Autocomplete
      sx={sx}
      options={options}
      getOptionLabel={getOptionLabel}
      value={value}
      onChange={handleChange}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      loading={loading}
      disabled={disabled}
      size={size}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
}

export default CustomSearchDropDownMenu;
