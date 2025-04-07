'use client';
import { Card, CardContent, Typography, Chip } from '@mui/material';

export default function Post({ title, content, date, status }) {
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="body2">{content}</Typography>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="caption">{date}</Typography>
          <Chip label={status} color={status === 'CONCLUÍDA' ? 'success' : 'warning'} />
        </div>
      </CardContent>
    </Card>
  );
}