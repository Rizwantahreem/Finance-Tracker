import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/AppError.js";
import { 
  createNewTransaction, 
  deleteTransactionById, 
  getAllTransactions, 
  getTransactionById, 
  updateTransactionById 
} from "../services/transaction.service.js";

// @Desc - Get all transactions
export const getTransactions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    // Support both path params (/pageNo/2/limit/3) 
    // for this - use req?.query  query params (?pageNo=2&limit=3)
    const pageNo = Number(req?.params?.pageNo);
    const limit = Number(req?.params?.limit);
    
    const transactionsData = await getAllTransactions(
      req?.user?.id, 
      pageNo, 
      limit
    );

    res
      .status(200)
      .json({
        transactions: transactionsData?.transactions,
        totalRecords: transactionsData?.totalRecords,
        message: "Fetched transactions"
      });
  } catch (error) {
    next(error);
  }
};

// @Desc - Get single transaction
export const getTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id;
  if (!id) {
    next(new AppError("Invalid ID.", 400));
    return;
  }

  try {
    const transaction = await getTransactionById(id)
    res.status(200).json(transaction);
  } catch (error) {
    next(error);
  }
};

// @Desc - Post Create transaction
export const createTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user?.id) {
      next(new AppError("User not authenticated", 401));
      return;
    }

    const id = await createNewTransaction(req?.body, req?.user?.id);
    res.status(201).json({
      message: `transaction with id ${id} created successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// @Desc - Delete transaction
export const deleteTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const id = req.params.id || '';

  try {
    await deleteTransactionById(id);
    res
      .status(200)
      .json({ message: `Transaction with id ${id} deleted successfully` });
  } catch (error) {
    next(error);
  }
};

// @Desc - Patch request
export const updateTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {

    const id = await updateTransactionById(req?.body, req?.params?.id || '');
    res.status(200).json({ message: `transaction with id ${id} updated.` });
  } catch (error) {
    next(error);
  }
};
