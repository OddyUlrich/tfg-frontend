import * as React from 'react';
import {
  Box,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  SelectChangeEvent,
  Typography,
  TextField
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = [
  "Bucle for",
  "Bucle while",
  "Bucle do-while",
  "int",
  "float",
  "double",
  "string",

];

interface Selection {
  name: string;
  count: number;
  alias: string;
}

export default function MultipleSelectWithCounts() {
  const [selections, setSelections] = React.useState<Selection[]>([]);

  const handleChange = (event: SelectChangeEvent<string[]>) => {
    const {
      target: { value },
    } = event;

    const selectedNames = typeof value === 'string' ? value.split(',') : value;

    setSelections((prev) => {
      return selectedNames.map((name) => {
        const existing = prev.find((s) => s.name === name);
        return {
          name,
          count: existing?.count ?? 1,
          alias: existing?.alias ?? ''
        };
      });
    });
  };

  const handleCountChange = (name: string, count: number) => {
    setSelections((prev) =>
      prev.map((s) => (s.name === name ? { ...s, count } : s))
    );
  };

  const handleAliasChange = (name: string, alias: string) => {
    setSelections((prev) =>
      prev.map((s) => (s.name === name ? { ...s, alias } : s))
    );
  };

  const selectedNames = selections.map((s) => s.name);

  return (
    <Box sx={{ m: 2, width: 500 }}>
      <FormControl fullWidth>
        <InputLabel id="multi-select-label">Seleccionar nombres</InputLabel>
        <Select
          labelId="multi-select-label"
          multiple
          value={selectedNames}
          onChange={handleChange}
          input={<OutlinedInput label="Seleccionar nombres" />}
          renderValue={(selected) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((name) => {
                const item = selections.find((s) => s.name === name);
                return (
                  <Chip
                    key={name}
                    label={`${item?.alias || name} x${item?.count ?? 1}`}
                  />
                );
              })}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {names.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selections.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1">Detalles por nombre:</Typography>
          {selections.map((sel) => (
            <Box
              key={sel.name}
              sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 2 }}
            >
              <Typography sx={{ width: 130 }}>{sel.name}</Typography>

              <Select<number>
                size="small"
                value={sel.count}
                onChange={(e) => handleCountChange(sel.name, e.target.value)}
              >
                {[1, 2, 3, 4, 5].map((count) => (
                  <MenuItem key={count} value={count}>
                    {count}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                size="small"
                label="Alias"
                value={sel.alias}
                onChange={(e) => handleAliasChange(sel.name, e.target.value)}
              />
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}