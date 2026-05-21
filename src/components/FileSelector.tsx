import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export interface selectorProps {
  filenames: string[];
  value: string;
  onChange: React.Dispatch<React.SetStateAction<string>>;
}

export default function FileSelector(props: selectorProps) {

  const handleChange = (event: SelectChangeEvent) => {
    props.onChange(event.target.value);
  };

  return (
    <div>
      <FormControl sx={{ my: 1, minWidth: 80 }}>
        <InputLabel id="fileSelector">Fichero</InputLabel>
        <Select
          labelId="FileSelector"
          id="FileSelector"
          value={props.value}
          onChange={handleChange}
          autoWidth
          label="FileName"
        >
          {props.filenames.map((file) => (
            <MenuItem key={file} value={file}>{file}</MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
}