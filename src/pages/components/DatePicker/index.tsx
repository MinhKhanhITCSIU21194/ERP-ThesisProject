import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import React from "react";
import { Dayjs } from "dayjs";

interface CustomDatePickerProps {
  label: string;
  value: Dayjs | null;
  onChange: (newValue: Dayjs | null) => void;
  minDate?: Dayjs;
  maxDate?: Dayjs;
  disabled?: boolean;
  required?: boolean;
  error?: boolean;
  helperText?: string;
}

function CustomDatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  required = false,
  error = false,
  helperText,
}: CustomDatePickerProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        label={label}
        value={value}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        disabled={disabled}
        slotProps={{
          textField: {
            fullWidth: true,
            required: required,
            error: error,
            helperText: helperText,
          },
        }}
      />
    </LocalizationProvider>
  );
}

export default CustomDatePicker;
