import "reflect-metadata";

import express from 'express';
import productRoutes from './routes/product.routes';
import { handleError } from './filters/global-exception.filter';
import brandsRoutes from './routes/brands.routes';
import categoryRoutes from './routes/category.routes';

const app = express();
app.use(express.json());

app.use('/products', productRoutes);
app.use('/brands', brandsRoutes);
app.use('/categories', categoryRoutes);

app.use(handleError);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});

export default app;