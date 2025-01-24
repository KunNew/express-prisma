import { RequestHandler,request,response } from "express";
import db from "@/client";
import { StatusCodes } from "http-status-codes";
import { format } from "date-fns";

export const getCompanies: RequestHandler = async (req, res) => {
  const page = req.query.page as string;
  const pageSize = req.query.pageSize as string;
  const search = (req.query.search as string) || "";
  const skip = (Number(page) - 1) * Number(pageSize);
  const take = Number(pageSize);

  const companies = await db.company.findMany({
    skip,
    take,
    where: {
      OR: [
        {
          name: {
            contains: search,
            mode: "insensitive", // Add case-insensitive search
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          address: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          telephone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      code: true,
      name: true,
      email: true,
      address: true,
      telephone: true,
      logo: true,
      website: true,
      setting: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const total = await db.company.count();

  const formattedCompanies = companies.map((company) => ({
    ...company,
    createdAt: format(new Date(company.createdAt), "dd-MM-yyyy"),
    updatedAt: format(new Date(company.updatedAt), "dd-MM-yyyy"),
    setting: {
      ...company.setting,
      fiscalDate: format(new Date(company.setting.fiscalDate), "dd-MM-yyyy"),
    },
  }));

  res.status(StatusCodes.OK).json({ total, companies: formattedCompanies });
};

export const createCompany: RequestHandler = async (req, res) => {
  const { doc } = req.body;

  const company = await db.company.create({
    data: {
      code: doc.code,
      name: doc.name,
      email: doc.email,
      telephone: doc.telephone,
      address: doc.address,
      website: doc.website,
      industry: doc.industry,
      logo: doc.logo,
      logoPublicId: doc.logoPublicId,
      setting: {
        set: {
          // Use set for embedded document in MongoDB
          // fiscalDate: new Date(doc.setting.fiscalDate),
          baseCurrency: doc.setting.baseCurrency,
          decimalNumber: parseInt(doc.setting.decimalNumber),
          accountingIntegration: doc.setting.accountingIntegration || false,
          dateFormat: doc.setting.dateFormat,
          lang: doc.setting.lang,
        },
      },
    },
    include: {
      setting: true,
    },
  });

  res.status(StatusCodes.CREATED).json(company);
};

export const getCompanyById: RequestHandler = async (req, res) => {
  const { id } = req.params;
  let selector = { id };
  const company = await db.company.findUnique({
    where: selector,
    include: {
      setting: true,
    },
  });
  res.status(StatusCodes.OK).json({ company: company });
};

export const updateCompany: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { doc } = req.body;

  const updatedCompany = await db.company.update({
    where: {
      id: id,
    },
    data: {
      code: doc.code,
      name: doc.name,
      email: doc.email,
      telephone: doc.telephone,
      address: doc.address,
      website: doc.website,
      industry: doc.industry,
      logo: doc.logo,
      logoPublicId: doc.logoPublicId,
      setting: {
        set: {
          // Use set for updating embedded document
          baseCurrency: doc.setting.baseCurrency,
          decimalNumber: parseInt(doc.setting.decimalNumber),
          accountingIntegration: doc.setting.accountingIntegration || false,
          dateFormat: doc.setting.dateFormat,
          lang: doc.setting.lang,
        },
      },
    },
    include: {
      setting: true,
    },
  });

  res.status(StatusCodes.OK).json({
    message: "Company updated successfully",
    company: updatedCompany,
  });
};

export const deleteCompany: RequestHandler = async (req, res) => {
  const { id } = req.params;
  await db.company.delete({
    where: {
      id: id,
    },
  });
  res.status(StatusCodes.OK).json({ message: "Company deleted successfully" });
};

export const checkCompanyExistedCode: RequestHandler = async (req, res) => {
  const code = req.query.code as string;
  const showId = req.query.showId as string;

  const company = await db.company.findFirst({
    where: {
      code: {
        equals: code,
        mode: 'insensitive'
      },
      ...(showId && { NOT: { id: showId } })  // Exclude current company if showId is provided
    },
    select: {
      id: true,
      code: true
    }
  });

  res.status(StatusCodes.OK).json({ exists: !!company });
};
