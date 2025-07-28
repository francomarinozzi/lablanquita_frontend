import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, Paper } from '@mui/material';

interface DatosGrafico {
    fecha: string;
    total: number;
}

interface GraficoProps {
    data: DatosGrafico[];
    loading: boolean;
}

export default function GraficoVentasSemanales({ data, loading }: GraficoProps) {
    if (loading) {
        return <Typography>Cargando datos del gráfico...</Typography>;
    }

    return (
        <Paper sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
                Ventas de los Últimos 7 Días
            </Typography>
            <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="fecha" />
                        <YAxis tickFormatter={(value) => `$${value.toLocaleString('es-AR')}`} />
                        <Tooltip formatter={(value: number) => [`$${value.toLocaleString('es-AR', {minimumFractionDigits: 2})}`, 'Total']} />
                        <Legend />
                        <Bar dataKey="total" fill="#85622B" name="Total Recaudado" />
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Paper>
    );
}