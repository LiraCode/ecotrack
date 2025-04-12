'use client';
import { Paper, Typography } from "@mui/material";

const Meta = ({ latestGoal }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2e8b57', mb: 2 }}>
        Última Meta
      </Typography>
      <Typography>
        {latestGoal}
      </Typography>
    </Paper>
  );
};

export default Meta;
