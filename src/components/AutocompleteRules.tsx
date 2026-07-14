import TextField from "@mui/material/TextField";
import { Autocomplete, Box, IconButton, InputAdornment } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Exercise, RuleSearch } from "../Types";
import { Add, Search } from "@mui/icons-material";

import {useErrorHandler } from "../Utils";
import { enqueueSnackbar } from "notistack";
import Typography from "@mui/material/Typography";

interface Props {
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
  exercise: Exercise;
}

export default function AutocompleteRules({setExercise, exercise}: Props) {
  const [rulesFilter, setRulesFilter] = useState<string>("");
  const [results, setResults] = useState<RuleSearch[]>([])
  const [isLoading, setIsLoading] = React.useState(false);
  const [open, setOpen] = useState(false)

  const errorHandler = useErrorHandler();

  const filteredOptions = results.filter(
    (rule) => rule.exerciseName !== exercise.name
  );

  const handleChange = (rule: RuleSearch) => {
    setExercise(prev => {

      if (!rule) return prev;

      if (prev.rules.some((e) => e.databaseId === rule.id)){
        enqueueSnackbar("Esa regla ya está añadida",{
          variant: "error"
        });
        return prev;
      }

      return {
        ...prev,
        rules: [
          ...prev.rules,
          {
            databaseId: rule.id,
            localId: crypto.randomUUID(),
            description: rule.description,
            type: rule.type,
          },
        ],
      }
    });
  }

  //DEBOUNCE TO AVOID SEVERAL PETITIONS EVERY TIME THE USER WRITES
  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      void fetchRules(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [rulesFilter]);

  const fetchRules = async (signal?: AbortSignal) => {
    try {

      const params = new URLSearchParams();
      if (rulesFilter) params.append("rulesFilter", rulesFilter);

      const response = await fetch(`http://localhost:8080/rules?${params.toString()}`,
        {
          method: "GET",
          credentials: "include",
          signal,
        });

      await errorHandler(response);

      const rules: RuleSearch[] = await response.json();
      setResults(rules);

    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.log("Network error: " + error.message);
      }
    }
  };

  return (
    <>
      <Box
        sx={{
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          display: "flex",
          flexGrow: 1,
          mb: 0
        }}
      >

        <Autocomplete
          open={open}
          onOpen={() => setOpen(true)}
          onClose={() => setOpen(false)}
          options={
            [...filteredOptions].sort((a, b) => {
            const group = a.exerciseName.localeCompare(b.exerciseName);
            if (group !== 0) return group;

            return a.description.localeCompare(b.description);
            })
          }
          groupBy={(option) => option.exerciseName || "Sin ejercicio"}
          value={null}
          sx={{ width: 650 }}
          filterOptions={(x) => x}
          getOptionLabel={(o) => o.description}
          noOptionsText="No se han encontrado reglas..."
          inputValue={rulesFilter}
          onInputChange={(_, value) => setRulesFilter(value)}
          onChange={(_, newValue) => {
            setRulesFilter("");
          }}

          slotProps={{
            paper: {
              elevation: 4,
              sx: {
                border: (theme) => `1px solid ${theme.palette.divider}`,
                borderRadius: 2,
                boxShadow: (theme) => theme.shadows[6],
              },
            },
          }}

          renderOption={(props, option) => (
            <li {...props}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <Box>
                  <Typography>{option.description}</Typography>
                </Box>

                <Box sx={{ ml: "auto", display: "flex", gap: 0.5 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleChange(option);
                      setOpen(false)
                    }}
                  >
                    <Add />
                  </IconButton>
                </Box>
              </Box>
            </li>
          )}

          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Ejercicio de la regla o descripcion..."
              sx={{ width: "100%"}}
              size="small"
              slotProps={{
                input: {
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <Search fontSize="small" />
                      </InputAdornment>

                      {params.InputProps.startAdornment}
                    </>
                  ),
                },
              }}
            />
          )}
        />
      </Box>
    </>

  );
}