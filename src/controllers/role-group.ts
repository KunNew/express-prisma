import { Request, RequestHandler, Response } from "express";
import { StatusCodes } from "http-status-codes";
import db from "@/client";
import { Prisma } from "@prisma/client";
import { sendErrorResponse } from "@/utils/helper";
import { format } from "date-fns";

export const createRoleGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, permissions } = req.body;
    const roleGroup = await db.roleGroup.create({
      data: {
        name,
        permissions,
      },
    });

    res.status(StatusCodes.CREATED).json({
      roleGroup,
    });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return sendErrorResponse({
        message: "Name already exists",
        status: StatusCodes.CONFLICT,
        res,
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to create role group",
      error: err,
    });
  }
};

export const getRoleGroups: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { page = 1, pageSize = 20, search = "" } = req.query;
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);
  const roleGroups = await db.roleGroup.findMany({
    skip,
    take,
    where: {
      name: {
        contains: search as string,
        mode: "insensitive",
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedRoleGroups = roleGroups.map((roleGroup) => ({
    ...roleGroup,
    createdAt: format(new Date(roleGroup.createdAt), "dd-MM-yyyy"),
    updatedAt: format(new Date(roleGroup.updatedAt), "dd-MM-yyyy"),
  }));

  const total = await db.roleGroup.count();
  res.status(StatusCodes.OK).json({
    roleGroups: formattedRoleGroups,
    total,
  });
};

export const getRoleGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  const roleGroup = await db.roleGroup.findUnique({
    where: { id },
  });
  res.status(StatusCodes.OK).json({ roleGroup });
};

export const updateRoleGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, permissions } = req.body;

    const [roleGroup] = await db.$transaction([
      db.roleGroup.update({
        where: { id },
        data: { name, permissions },
      }),
      // Update profiles with new permissions where roleGroup matches
     
      db.profile.updateMany({
        where: {
          roleGroup: {
            has: id,
          },
        },
        data: {
          permissions: permissions,
        },
      }),
    ]);

    res.status(StatusCodes.OK).json({ roleGroup });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return sendErrorResponse({
        message: "Name already exists",
        status: StatusCodes.CONFLICT,
        res,
      });
    }
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: "Failed to update role group",
      error: err,
    });
  }
};

export const deleteRoleGroup: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const { id } = req.params;
  await db.roleGroup.delete({ where: { id } });
  res
    .status(StatusCodes.OK)
    .json({ message: "Role group deleted successfully" });
};
