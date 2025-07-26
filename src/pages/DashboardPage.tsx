import { Card, CardContent, Grid, Typography, Box } from '@mui/material';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';


const StatCard = ({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) => (
  <Card sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
    <Box sx={{ flexShrink: 0, mr: 2 }}>
      {icon}
    </Box>
    <Box>
      <Typography variant="h6" color="text.secondary">
        {title}
      </Typography>
      <Typography variant="h5" component="div" fontWeight="bold">
        {value}
      </Typography>
    </Box>
  </Card>
);

export default function DashboardPage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Resumen General
      </Typography>
      
      
      <Grid container spacing={3}>
        <Grid>
          <StatCard
            title="Ventas del Día"
            value="$1,250.50"
            icon={<PointOfSaleIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
          />
        </Grid>
        <Grid>
          <StatCard
            title="Productos Activos"
            value="152"
            icon={<Inventory2Icon sx={{ fontSize: 40, color: 'primary.main' }} />}
          />
        </Grid>
        <Grid>
          <StatCard
            title="Última Venta"
            value="#3459"
            icon={<ReceiptLongIcon sx={{ fontSize: 40, color: 'primary.main' }} />}
          />
        </Grid>

    
        <Grid>
            <Card sx={{p: 2}}>
                <CardContent>
                    <Typography variant="h6">Próximamente...</Typography>
                    <Typography>
                        Gráfico de ventas semanales.
                    </Typography>
                </CardContent>
            </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
