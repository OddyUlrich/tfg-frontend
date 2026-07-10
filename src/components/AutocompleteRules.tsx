import TextField from "@mui/material/TextField";
import { Autocomplete, Box, IconButton, InputAdornment } from "@mui/material";
import React, { useEffect, useState } from "react";
import { Exercise, Rule, RuleSearch } from "../Types";
import { Add, Delete, Search } from "@mui/icons-material";

import {useErrorHandler } from "../Utils";
import { enqueueSnackbar } from "notistack";
import Typography from "@mui/material/Typography";

interface Props {
  setExercise: React.Dispatch<React.SetStateAction<Exercise>>;
}

export default function AutocompleteRules({setExercise}: Props) {
  const [rulesFilter, setRulesFilter] = useState<string>("");
  const [results, setResults] = useState<RuleSearch[]>([])
  const [isLoading, setIsLoading] = React.useState(false);

  const errorHandler = useErrorHandler();



  const handleChange = (rule: RuleSearch | null) => {

    if (rule == null) return;

    const newRule:Rule = {id: rule.id, description: rule.description, type: rule.type};

    setExercise(prev => {
      return {
        ...prev,
        rules: [...prev.rules, newRule],
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

  const options = results.map((option) => {
    const firstLetter = option.exerciseName[0].toUpperCase();
    return {
      firstLetter: /[0-9]/.test(firstLetter) ? '0-9' : firstLetter,
      ...option,
    };
  });

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
          options={options.sort((a, b) => -b.firstLetter.localeCompare(a.firstLetter))}
          groupBy={(option) => option.exerciseName}
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
                    }}
                  >
                    <Add />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      console.log("HOLA");
                    }}
                  >
                    <Delete />
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