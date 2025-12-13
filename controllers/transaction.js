let transactions = [
    { id: 1, amount: 10, purpose: 'transport', sentTo: 'coursera' },
    { id: 2, amount: 50, purpose: 'shoping', sentTo: 'amazon test' },
    { id: 3, amount: 700, purpose: 'sent home', sentTo: 'home' },
    { id: 4, amount: 200, purpose: 'rental', sentTo: 'groveries' },
    { id: 5, amount: 50, purpose: 'one time groceries', sentTo: 'transportation' },
    { id: 6, amount: 30, purpose: 'gym and sports', sentTo: 'sports club' },
    { id: 7, amount: 50, purpose: 'subscriptions', sentTo: 'self care' },
];


// @Desc - Get alltransaction
export const getTransactions = (req, res, next) => {
    res.status(200).json(transactions);
    next()
}

// @Desc - Get single transaction
export const getTransaction = (req, res, next) => {
    const id = req.params.id;

    if (!id)  return res.status(400).json({messaeg: "Invalid ID."})
    
    const transaction = transactions.find((transaction) => transaction.id == id);

    if (!transaction) return res.status(404).json({messaeg: "No transaction Found."})

    res.json(transaction);
    
}

// @Desc - Post Create transaction
export const createTransactionRecord = (req, res, next) => {
    const body = req.body;

    const id = transactions[transactions.length -1].id + 1;
    transactions.push({
        id: id,
        amount: body.amount,
        purpose: body.purpose,
        sentTo: body.sendTo
    });

    res.status(201).json({message: 'transaction record created successfully.'})
}

// @Desc - Delete Create transaction
export const deleteTransaction = (req, res, next) => {
    const id = Number(req.params.id);
    if (!id || isNaN(id)) return res.status(400).json({"message": "Invalid id"});

    const index = transactions.findIndex((transaction) => transaction.id == id);
    if(index == -1) return res.status(404).json({"message": "No transaction Found"});

    transactions.splice(index, 1);
    res.status(200).json({message: `transaction with id ${id} deleted successfully`})
}

export const updateTransaction = (req, res, next) => {
    const body = req.body;
    const id = Number(req.params.id);

    if (!id || isNaN(id)) return res.status(400).json({ message: 'Invalid ID' })
    
    const index = transactions.findIndex((transaction) => transaction.id == id);
    if (index == -1) return res.status(404).json({ 'message': `transaction with id ${id} not found` });

    const updatedTransaction = {
        amount: body?.amount || transactions[index]?.amount,
        sentTo: body?.sentTo ||  transactions[index]?.sentTo,
        purpose: body?.purpose || transactions[index]?.purpose,
        id: transactions[index]?.id
    }

    transactions[index] = {...updatedTransaction};
    res.status(200).json({'message': `transaction with id ${id} updated.`})
}