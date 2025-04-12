'use client';
import { Paper, Typography } from "@mui/material";

const Blog = ({ latestPost }) => {
  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" sx={{ color: '#2e8b57', mb: 2 }}>
        Blog: Educação Ambiental
      </Typography>
      <Typography>
        {latestPost}
      </Typography>
    </Paper>
  );
};

export default Blog;
