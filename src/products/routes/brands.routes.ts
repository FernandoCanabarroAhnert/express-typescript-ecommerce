import { Router } from "express";
import { BrandController } from "../controllers/brand.controller";
import { CreateBrandDto } from "../dto/brand/create-brand.dto";
import { UpdateBrandDto } from "../dto/brand/update-brand.dto";
import { containerInjector } from "../../common/config/container-injector.config";
import { validateRequest } from "../../common/middlewares/validate-request.middleware";
import { PaginationParamsDto } from "../../common/dto/page/pagination-params.dto";
import { AuthMiddleware } from "../../common/middlewares/auth.middleware";
import { PreAuthorizeMiddleware } from "../../common/middlewares/pre-authorize.middleware";
import { RolesEnum } from "../../common/enums/roles.enum";

const brandController = containerInjector.resolve(BrandController);
const authMiddleware = containerInjector.resolve(AuthMiddleware);
const preAuthorizeMiddleware = containerInjector.resolve(PreAuthorizeMiddleware);
const brandsRoutes = Router();

brandsRoutes
    .get("/", validateRequest(PaginationParamsDto, 'query'), brandController.findAll)
    .get('/:id', brandController.findById)
    .post("/", authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(CreateBrandDto, 'body'), brandController.createBrand)
    .patch('/:id', authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), validateRequest(UpdateBrandDto, 'body'), brandController.updateBrand)
    .delete('/:id', authMiddleware.execute, preAuthorizeMiddleware.execute(RolesEnum.ADMIN), brandController.delete);
    
export default brandsRoutes;