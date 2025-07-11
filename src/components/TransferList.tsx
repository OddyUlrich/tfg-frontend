import * as React from 'react';
import Grid from '@mui/material/Grid';
import List from '@mui/material/List';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import { Rule } from '../Types';

export default function TransferList() {
  const [checkedLeft, setCheckedLeft] = React.useState<Rule[]>([]);
  const [checkedRight, setCheckedRight] = React.useState<Rule[]>([]);
  const [right, setRight] = React.useState<{ rule: Rule; count: number }[]>([]);
  const [left] = React.useState<Rule[]>([
    { id: 0, name: 'Bucle For' },
    { id: 1, name: 'Bucle While' },
    { id: 2, name: 'Int' },
    { id: 3, name: 'Double' },
  ]);

  const handleToggle = (
    rule: Rule,
    checkedList: Rule[],
    setCheckedList: React.Dispatch<React.SetStateAction<Rule[]>>
  ) => () => {
    const isChecked = checkedList.some((r) => r.id === rule.id);
    if (isChecked) {
      setCheckedList(checkedList.filter((r) => r.id !== rule.id));
    } else {
      setCheckedList([...checkedList, rule]);
    }
  };

  const handleCheckedRight = () => {
    const newRight = [...right];

    checkedLeft.forEach((rule) => {
      const existing = newRight.find((item) => item.rule.id === rule.id);
      if (existing) {
        existing.count += 1;
      } else {
        newRight.push({ rule, count: 1 });
      }
    });
    setRight(newRight);
    setCheckedLeft([]);
  };

  const handleCheckedLeft = () => {
    const newRight = right.filter(
      (item) => !checkedRight.some((r) => r.id === item.rule.id)
    );
    setRight(newRight);
    setCheckedRight([]);
  };

  const customList = (
    title: React.ReactNode,
    rules: readonly Rule[] | { rule: Rule; count: number }[],
    checkedList: Rule[],
    setCheckedList: React.Dispatch<React.SetStateAction<Rule[]>>,
    isRightList?: boolean
  ) => {
    const isRight = isRightList ?? false;
    return (
      <Card>
        <CardHeader
          sx={{ px: 2, py: 1 }}
          title={title}
        />
        <Divider />
        <List
          sx={{
            width: 240,
            height: 230,
            bgcolor: 'background.paper',
            overflow: 'auto',
          }}
          dense
          component="div"
          role="list"
        >
          {(isRight ? (rules as { rule: Rule; count: number }[]) : (rules as Rule[])).map((item) => {

            let rule: Rule;
            if ('rule' in item) {
              rule = item.rule;
            } else {
              rule = item;
            }

            const labelId = `transfer-list-item-${rule.id}-label`;
            const isChecked = checkedList.some((r) => r.id === rule.id);

            return (
              <ListItemButton
                key={rule.id}
                role="listitem"
                onClick={handleToggle(rule, checkedList, setCheckedList)}
              >
                <ListItemIcon>
                  <Checkbox
                    checked={isChecked}
                    tabIndex={-1}
                    disableRipple
                    slotProps={{
                      input: {
                        'aria-labelledby': labelId,
                      },
                    }}
                  />
                </ListItemIcon>
                <ListItemText
                  id={labelId}
                  primary={`${rule.name}${isRight ? ` x${(item as { rule: Rule; count: number }).count}` : ''}`}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Card>
    );
  };

  return (
    <Grid container spacing={2} sx={{ justifyContent: 'center', alignItems: 'center' }}>
      <Grid>{customList('Reglas posibles', left, checkedLeft, setCheckedLeft)}</Grid>
      <Grid>
        <Grid container direction="column" sx={{ alignItems: 'center' }}>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedRight}
            disabled={checkedLeft.length === 0}
          >
            &gt;
          </Button>
          <Button
            sx={{ my: 0.5 }}
            variant="outlined"
            size="small"
            onClick={handleCheckedLeft}
            disabled={checkedRight.length === 0}
          >
            &lt;
          </Button>
        </Grid>
      </Grid>
      <Grid>{customList('Reglas elegidas', right, checkedRight, setCheckedRight, true)}</Grid>
    </Grid>
  );
}