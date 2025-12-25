import * as React from "react";
import {
  DataGrid,
  GridColDef,
  GridRowSelectionModel,
  GridPaginationModel,
} from "@mui/x-data-grid";
import { Paper, SxProps } from "@mui/material";

type TableProps = {
  columns: GridColDef[];
  rows: any[];
  sx: SxProps;
  checkboxSelection?: boolean;
  onSelectionChange?: (a: GridRowSelectionModel) => void;
  onSelectAll?: (isSelected: boolean, selectedRows: any[]) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  paginationModel?: GridPaginationModel;
  rowCount?: number;
  paginationMode?: "client" | "server";
  loading?: boolean;
  getRowId?: (row: any) => string;
  onRowClick?: (params: any) => void;
};

export const CustomTable = ({
  columns,
  rows,
  sx,
  checkboxSelection = true,
  onSelectionChange,
  onSelectAll,
  onPaginationChange,
  paginationModel,
  rowCount,
  paginationMode = "client",
  loading = false,
  getRowId,
  onRowClick,
  ...props
}: TableProps) => {
  const [selectedRows, setSelectedRows] = React.useState<GridRowSelectionModel>(
    {
      type: "include",
      ids: new Set(),
    }
  );

  const handleSelectionChange = (
    newRowSelectionModel: GridRowSelectionModel
  ) => {
    setSelectedRows(newRowSelectionModel);

    if (onSelectionChange) {
      onSelectionChange(newRowSelectionModel);
    }
  };

  const handlePaginationChange = (newPaginationModel: GridPaginationModel) => {
    if (onPaginationChange) {
      onPaginationChange(newPaginationModel.page, newPaginationModel.pageSize);
    }
  };

  const defaultGetRowId = (row: any) => row.id || row.employeeId;

  return (
    <Paper style={{ minHeight: 400 }} sx={sx}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId || defaultGetRowId}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        checkboxSelection={checkboxSelection}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={handleSelectionChange}
        paginationMode={paginationMode}
        rowCount={rowCount}
        loading={loading}
        onRowClick={onRowClick}
        sx={{
          cursor: onRowClick ? "pointer" : "default",
          "& .MuiDataGrid-row:hover": onRowClick
            ? {
                backgroundColor: "action.hover",
              }
            : {},
        }}
        {...props}
      />
    </Paper>
  );
};
