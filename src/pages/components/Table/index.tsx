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
  onSelectionChange?: (a: GridRowSelectionModel) => void;
  onSelectAll?: (isSelected: boolean, selectedRows: any[]) => void;
  onPaginationChange?: (page: number, pageSize: number) => void;
  paginationModel?: GridPaginationModel;
  rowCount?: number;
  paginationMode?: "client" | "server";
  loading?: boolean;
  getRowId?: (row: any) => string;
};

export const CustomTable = ({
  columns,
  rows,
  sx,
  onSelectionChange,
  onSelectAll,
  onPaginationChange,
  paginationModel,
  rowCount,
  paginationMode = "client",
  loading = false,
  getRowId,
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

  const defaultGetRowId = (row: any) => row.employeeId || row.id;

  return (
    <Paper style={{ minHeight: 400 }} sx={sx}>
      <DataGrid
        rows={rows}
        columns={columns}
        getRowId={getRowId || defaultGetRowId}
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[5, 10, 20, 50, 100]}
        checkboxSelection={true}
        rowSelectionModel={selectedRows}
        onRowSelectionModelChange={handleSelectionChange}
        paginationMode={paginationMode}
        rowCount={rowCount}
        loading={loading}
        {...props}
      />
    </Paper>
  );
};
