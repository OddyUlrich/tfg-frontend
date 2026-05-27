import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import { Exercise, Rule } from "../Types";
import { AddRuleDialog } from "./dialogs/addRuleDialog";
import { JSX, useEffect } from "react";

function not(a: Rule[], b: Map<number, string>) {
  const filteredRules: Rule[] = [];

  a.forEach((rule) => {
    if (!b.has(rule.id)) {
      filteredRules.push({id: rule.id, type: rule.type, name: rule.name});
    }
  });

  return filteredRules;
}


function intersection<T>(
  checkedIds: readonly number[],
  items: T[],
  getId: (item: T) => number,
  getValue: (item: T) => string
): Map<number, string> {
  const filteredMap = new Map<number, string>();

  items.forEach((item) => {
    const id = getId(item);
    if (checkedIds.includes(id)) {
      filteredMap.set(id, getValue(item));
    }
  });

  return filteredMap;
}

interface TransferListProps {
  setExercise:  React.Dispatch<React.SetStateAction<Exercise>>;
}

export default function TransferList(props: TransferListProps): JSX.Element {
  const idCounter = React.useRef(4);

  //Dialog
  const [OpenRuleDialog, setOpenRuleDialog] = React.useState(false);

  //Dialog's variables
  const [varRuleType, setVarRuleTypeDialog] = React.useState("");

  const [pendingRules, setPendingRules] = React.useState<string[]>([]);
  const [currentRule, setCurrentRule] = React.useState<string | null>(null);

  //Variables
  const [checked, setChecked] = React.useState<readonly number[]>([]);
  const [right, setRight] = React.useState<Rule[]>([]);
  const [left, setLeft] = React.useState<Map<number, string>>(
    new Map([
      [0, "Bucle for"],
      [1, "Bucle while"],
      [2, "int"],
      [3, "double"]
    ])
  );

  const leftChecked = intersection(checked, [...left.entries()], ([id, ]) => id, ([, value]) => value);
  const rightChecked = intersection(checked, right, (rule) => rule.id, (rule) => rule.type);


  //We open a dialogs to process the addition of a new rule for each time "currentRule" changes
  useEffect(() => {
    if (currentRule) {
      handleRuleDialogOpen(currentRule);
    }
  }, [currentRule]);


  // Functions to control the addTagDialog
  const handleRuleDialogClose = (confirmed: boolean, inputValue? : string) => {

    if (confirmed && inputValue && currentRule) {
      const newRule:Rule = {
        id: idCounter.current++,
        type: currentRule,
        name: inputValue
      }

      const newRules = [...right, newRule];

      setRight(newRules);

      props.setExercise(prev => ({
        ...prev,
        rules: newRules
      }));
    }

    const next = pendingRules.slice(1);

    //currentRule changes and we eliminate the processed rule from the <strong>{varType}</strong>Pending List
    setPendingRules(next);
    setCurrentRule(next[0] ?? null);
    setOpenRuleDialog(false);
  };

  const handleRuleDialogOpen = (varType: string) => {
    setOpenRuleDialog(true);
    setVarRuleTypeDialog(varType)
  };

  const handleToggle = (id: number) => () => {

    //Si ese id existe, lo eliminamos de la lista "checked", si no existe, lo agregamos
    setChecked(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const handleCheckedRight = () => {


    //TODO añadir los tipos faltantes:
    // Utilizar un for, while, for-each, un interator, etc (en una variable en concreto o donde sea).
    // Utilizar un determinado tipo de dato numérico (int, double, float, ...?).
    // Utilizar excepciones o una excepción en concreto (if Exception: ¿tipo y nombre?).


    const values = [...leftChecked.values()];
    setPendingRules(values);
    setCurrentRule(values[0] ?? null);

    setChecked([]);
  };


  const handleCheckedLeft = () => {
    const newRules = not(right, rightChecked);

    setRight(newRules);

    props.setExercise(prev => ({
      ...prev,
      rules: newRules
    }));

    setChecked(prev => prev.filter(id => !rightChecked.has(id)));
  };

  const leftList = (items: Map<number,string>) => (
    <Paper sx={{ width: 250, height: 230, overflow: 'auto' }}>
      <List dense component="div" role="list">
        {[...items.entries()].map(([id, value]) => {
          const labelId = `transfer-list-item-${value}-label`;

          return (
            <ListItemButton
              key={id}
              role="listitem"
              onClick={handleToggle(id)}
              disableRipple
            >
              <ListItemIcon>
                <Checkbox
                  checked={leftChecked.has(id)}
                  tabIndex={-1}
                  disableRipple
                  slotProps={{
                    input: {
                      'aria-labelledby': labelId,
                    },
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={value} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  const rightList = (items: Rule[]) => (
    <Paper sx={{ width: 250, height: 230, overflow: 'auto' }}>
      <List dense component="div" role="list">
        {[...items].map((rule) => {
          const labelId = `transfer-list-item-${rule.type}-${rule.name}-label`;
          const completeName = `${rule.type} - ${rule.name}`;

          return (
            <ListItemButton
              key={rule.id}
              role="listitem"
              onClick={handleToggle(rule.id)}
              disableRipple
            >
              <ListItemIcon>
                <Checkbox
                  checked={rightChecked.has(rule.id)}
                  tabIndex={-1}
                  disableRipple
                  slotProps={{
                    input: {
                      'aria-labelledby': labelId,
                    },
                  }}
                />
              </ListItemIcon>
              <ListItemText id={labelId} primary={completeName} />
            </ListItemButton>
          );
        })}
      </List>
    </Paper>
  );

  return (

    <>
      <AddRuleDialog open={OpenRuleDialog} handleClose={handleRuleDialogClose} varType={varRuleType}/><Grid
          container
          spacing={2}
          sx={{ height: 230, justifyContent: 'center', alignItems: 'center' }}
      >
      <Grid>{leftList(left)}</Grid>
        <Grid>
            <Grid container direction="column" sx={{ alignItems: 'center' }}>

                <Button
                    sx={{ my: 0.5, py: 0.1, px: 1.5, lineHeight: 1, minWidth: 'unset', minHeight: 'unset', fontSize: '2rem' }}
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedRight}
                    disabled={leftChecked.size === 0}
                    aria-label="move selected right"
                >
                    +
                </Button>
                <Button
                    sx={{ my: 0.5, py: 0.1, px: 2, lineHeight: 1, minWidth: 'unset', minHeight: 'unset', fontSize: '2rem' }}
                    variant="outlined"
                    size="small"
                    onClick={handleCheckedLeft}
                    disabled={rightChecked.size === 0}
                    aria-label="move selected left"
                >
                    -
                </Button>
            </Grid>
        </Grid>
        <Grid>{rightList(right)}</Grid>
      </Grid>
    </>
  );
}