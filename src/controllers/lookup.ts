import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import db from "@/client";

export const lookupPermissions = async (req: Request, res: Response) => {
  const groupedPermissions = await db.permission.aggregateRaw({
    pipeline: [
   
      {
        $group: {
          _id: "$label",
          index: {$last: "$index"},
          permissions: { $push: "$$ROOT" },
        },
      },
      {
        $project: {
          label: "$_id", 
          index: 1,
          permissions: 1,
          _id: 0,
        },
      },
      {
        $sort: {
          index: 1,
        },
      },
    ],
  });
  res.status(StatusCodes.OK).json({
    permissions: groupedPermissions,
  });
};

export const lookupRoleGroups = async (req: Request, res: Response) => {
  const { id } = req.params;
  let selector: Record<string, unknown> = {};
  if (id) selector._id = id;

  console.log(selector);
  
  
  const roleGroups = await db.roleGroup.aggregateRaw({
    pipeline: [
      {
        $match: selector as any
      },
      
      {
        $project: {
          value: "$_id",
          label: "$name",
          permissions: "$permissions",
          createdAt: 1,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
    ],
  });
  

  res.status(StatusCodes.OK).json({
    roleGroups,
  });
};
