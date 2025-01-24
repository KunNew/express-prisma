import { lookupPermissions, lookupRoleGroups } from "@/controllers/lookup";
import { Router } from "express";

const lookupRouter = Router();

lookupRouter.get("/permissions", lookupPermissions);

lookupRouter.get("/role-groups/:id?", lookupRoleGroups);

export default lookupRouter;
