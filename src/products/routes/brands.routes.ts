import { Router } from "express";
import { BrandController } from "../controllers/brand.controller";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/update-brand.dto";
import { containerInjector } from "../../common/config/container-injector.config";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";

const brandController = containerInjector.resolve(BrandController);
const brandsRoutes = Router();

brandsRoutes
    .get("/", brandController.findAll)
    .get('/:id', brandController.findById)
    .post("/", validateRequest(CreateBrandDto, 'body'), brandController.createBrand)
    .patch('/:id', validateRequest(UpdateBrandDto, 'body'), brandController.updateBrand)
    .delete('/:id', brandController.delete);
    
export default brandsRoutes;