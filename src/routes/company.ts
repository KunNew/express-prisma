import {
    checkCompanyExistedCode,
    deleteCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
} from "@/controllers/company";
import { Router } from "express";
import { createCompany } from "@/controllers/company";

const companyRouter = Router();

companyRouter.get("/existed-code", checkCompanyExistedCode);

companyRouter.get("/", getCompanies);
companyRouter.post("/", createCompany);
companyRouter.get("/:id/:code?", getCompanyById);
companyRouter.put("/:id", updateCompany);
companyRouter.delete("/:id", deleteCompany);

companyRouter.get("/existed-code",checkCompanyExistedCode)


export default companyRouter;
