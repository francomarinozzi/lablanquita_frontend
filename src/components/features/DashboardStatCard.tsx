import { Card, CardContent, Typography, Box, CircularProgress } from '@mui/material';

interface DashboardStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  loading?: boolean;
}

export default function DashboardStatCard({ title, value, icon, loading = false }: DashboardStatCardProps) {
  return (
    <Card sx={{ display: 'flex', alignItems: 'center', p: 2, height: '100%' }}>
      <Box sx={{ flexShrink: 0, mr: 2, color: 'primary.main' }}>
        {icon}
      </Box>
      <Box>
        <Typography variant="body1" color="text.secondary">
          {title}
        </Typography>
        {loading ? (
          <CircularProgress size={24} sx={{ mt: 0.5 }} />
        ) : (
          <Typography variant="h5" component="div" fontWeight="bold">
            {value}
          </Typography>
        )}
      </Box>
    </Card>
  );
}