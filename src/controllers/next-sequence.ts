import { Request, RequestHandler, Response } from "express";
import db from "@/client";
import { sendErrorResponse } from "@/utils/helper";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";

// String method extend
// First, declare the type extensions
declare global {
  interface String {
    replaceLast(what: string, replacement: string): string;
    replaceFirst(what: string, replacement: string): string;
  }
}

// Then implement the methods with proper typing
String.prototype.replaceLast = function (
  what: string,
  replacement: string
): string {
  const pcs = this.split(what);
  const lastPc = pcs.pop();
  return pcs.join(what) + replacement + lastPc;
};

String.prototype.replaceFirst = function (
  what: string,
  replacement: string
): string {
  const pcs = this.split(what);
  const firstPc = pcs.shift();
  return firstPc + replacement + pcs.join(what);
};

// Replace the replaceFirst utility with lodash
const replaceFirst = (
  str: string,
  what: string,
  replacement: string
): string => {
  const parts = _.split(str, what);
  const firstPart = _.first(parts);
   return firstPart + replacement + _.join(_.tail(parts), what);
};

interface GetNextSeqParams {
  id: string;
  defaultVal?: string;
  removalPrefix?: string;
  defaultValFrom?: string;
}

// Get next sequence
export const getNextSequence: RequestHandler = async (req, res) => {
  try {
    // Add input validation
    const { id, defaultVal, removalPrefix, defaultValFrom } = req.query;
    if (_.isEmpty(id) || !_.isString(id)) {
       sendErrorResponse({
        message: "Invalid or missing sequence ID",
        status: StatusCodes.BAD_REQUEST,
        res,
      });
    }

    let seqVal = _.defaultTo(defaultVal, "1");

    // Improve error handling for defaultValFrom
    if (defaultValFrom) {
      const defaultSeq = await db.nextSequence.findFirst({
        where: {
          name: defaultValFrom as string,
        },
      });
      if (!defaultSeq) {
        sendErrorResponse({
          message: `Default sequence '${defaultValFrom}' not found`,
          status: StatusCodes.NOT_FOUND,
          res,
        });
      }
      if (defaultSeq.defaultValue) seqVal = defaultSeq.defaultValue;
    }

    const counter = await db.counter.findFirst({
      where: {
        id: {
          startsWith: id as string,
        },
      },
      orderBy: {
        seqVal: "desc",
      },
    });

    if (counter) {
      try {
        const lastSeq = counter.seqVal;
        const lastSeqRemovalPrefix = lastSeq.replaceFirst(
          _.toString(removalPrefix) || "",
          ""
        );
        const matches = lastSeqRemovalPrefix.match(/\d+/g);

        if (_.isEmpty(matches)) {
          throw new Error("No numeric sequence found in the counter value");
        }

        const lastSeqNumStr = _.last(matches);
        const lastSeqNum = _.parseInt(lastSeqNumStr);

        if (_.isNaN(lastSeqNum)) {
          throw new Error("Invalid numeric sequence");
        }

        const nextNum = lastSeqNum + 1;
        const tmpSeq = _.padStart(nextNum.toString(), lastSeqNumStr.length, "0");
        seqVal = lastSeq.replaceLast(lastSeqNumStr, tmpSeq);
      } catch (sequenceError) {
         sendErrorResponse({
          message: `Error processing sequence: ${sequenceError.message}`,
          status: StatusCodes.BAD_REQUEST,
          res,
        });
      }
    }

     res.status(StatusCodes.OK).json({ seqVal });
  } catch (error) {
     sendErrorResponse({
      message: "Failed to get next sequence",
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      res,
    });
  }
};

// Set sequence
export const setSequence: RequestHandler = async (req, res) => {
  try {
    const { id, seqVal } = req.body;

    const result = await db.counter.upsert({
      where: { id },
      update: { seqVal },
      create: { id, seqVal },
    });

    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    sendErrorResponse({
      message: "Failed to set sequence",
      status: 500,
      res,
    });
  }
};

// Get and set sequence
export const getAndSetSequence: RequestHandler = async (req, res) => {
  try {
    const { id, defaultVal, removalPrefix, defaultValFrom } = req.body as GetNextSeqParams;
    let seqVal = _.defaultTo(defaultVal, "1");

    if (defaultValFrom) {
      const defaultSeq = await db.nextSequence.findFirst({
        where: { name: defaultValFrom },
      });
      if (defaultSeq?.defaultValue) seqVal = defaultSeq.defaultValue;
    }

    const counter = await db.counter.findUnique({
      where: { id },
    });
    const inc = 1;

    if (counter) {
      const lastSeq = counter.seqVal;
      const lastSeqRemovalPrefix = replaceFirst(
        lastSeq,
        _.toString(removalPrefix) || "",
        ""
      );
      const matches = lastSeqRemovalPrefix.match(/\d+/g);
      const lastSeqNumStr = _.last(matches);

      if (lastSeqNumStr) {
        const lastSeqNum = _.parseInt(lastSeqNumStr);
        const nextNum = lastSeqNum + 1;
        const tmpSeq = _.padStart(nextNum.toString(), lastSeqNumStr.length, "0");
        seqVal = lastSeq.replaceLast(lastSeqNumStr, tmpSeq);
      }
    }

    // Set the sequence
    await db.counter.upsert({
      where: { id },
      update: { seqVal },
      create: { id, seqVal },
    });

    res.status(StatusCodes.OK).json({ seqVal });
  } catch (error) {
    sendErrorResponse({
      message: "Failed to get and set sequence",
      status: 500,
      res,
    });
  }
};
