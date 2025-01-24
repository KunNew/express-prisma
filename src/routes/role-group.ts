import { Router } from "express";
import { createRoleGroup, getRoleGroups, getRoleGroup, updateRoleGroup, deleteRoleGroup } from "@/controllers/role-group";

const roleGroupRouter = Router();

roleGroupRouter.get("/", getRoleGroups);


roleGroupRouter.post("/", createRoleGroup);

roleGroupRouter.get("/:id", getRoleGroup);

roleGroupRouter.put("/:id", updateRoleGroup);

roleGroupRouter.delete("/:id", deleteRoleGroup);

export default roleGroupRouter;
