// controllers/goalsController.js
import prisma from "../config/prisma.js";
import { toNaira } from "../utils/money.js";
import { successResponse } from "../utils/apiResponse.js";

// ── Format helpers ──

const formatGoal = (g) => ({
  id:            g.id,
  userId:        g.userId,
  name:          g.name,
  targetAmount:  toNaira(g.targetAmountKobo),
  currentAmount: toNaira(g.currentAmountKobo),
  deadline:      g.deadline.toISOString(),
  icon:          g.icon,
  createdAt:     g.createdAt.toISOString(),
  deposits:      (g.deposits ?? []).map(formatDeposit),
});

const formatDeposit = (d) => ({
  id:     d.id,
  amount: toNaira(d.amountKobo),
  date:   d.createdAt.toISOString(),
  note:   d.note ?? null,
});

// ── List all goals ──

export const getGoals = async (req, res) => {
  try {
    const goals = await prisma.savingsGoal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: { deposits: { orderBy: { createdAt: "desc" } } },
    });

    res.json(successResponse(goals.map(formatGoal), "Goals fetched"));
  } catch (error) {
    console.error("getGoals error:", error);
    res.status(500).json({ message: "Failed to fetch goals" });
  }
};

// ── Get single goal ──

export const getGoalById = async (req, res) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { deposits: { orderBy: { createdAt: "desc" } } },
    });

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    res.json(successResponse(formatGoal(goal), "Goal fetched"));
  } catch (error) {
    console.error("getGoalById error:", error);
    res.status(500).json({ message: "Failed to fetch goal" });
  }
};

// ── Create goal ──

export const createGoal = async (req, res) => {
  try {
    const { name, targetAmount, deadline, icon } = req.body;

    if (!name || !targetAmount || !deadline) {
      return res.status(400).json({
        message: "name, targetAmount, and deadline are required",
      });
    }

    if (Number(targetAmount) <= 0) {
      return res.status(400).json({ message: "targetAmount must be positive" });
    }

    const parsedDeadline = new Date(deadline);
    if (isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: "Invalid deadline date" });
    }

    const goal = await prisma.savingsGoal.create({
      data: {
        userId:           req.user.id,
        name:             name.trim(),
        targetAmountKobo: Math.round(Number(targetAmount) * 100),
        deadline:         parsedDeadline,
        icon:             icon || "savings",
      },
      include: { deposits: true },
    });

    res.status(201).json(successResponse(formatGoal(goal), "Goal created"));
  } catch (error) {
    console.error("createGoal error:", error);
    res.status(500).json({ message: "Failed to create goal" });
  }
};

// ── Update goal ──

export const updateGoal = async (req, res) => {
  try {
    const existing = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ message: "Goal not found" });

    const { name, targetAmount, deadline, icon } = req.body;

    const data = {};
    if (name !== undefined)         data.name = name.trim();
    if (targetAmount !== undefined)  data.targetAmountKobo = Math.round(Number(targetAmount) * 100);
    if (deadline !== undefined) {
      const d = new Date(deadline);
      if (isNaN(d.getTime())) return res.status(400).json({ message: "Invalid deadline" });
      data.deadline = d;
    }
    if (icon !== undefined) data.icon = icon;

    const goal = await prisma.savingsGoal.update({
      where: { id: req.params.id },
      data,
      include: { deposits: { orderBy: { createdAt: "desc" } } },
    });

    res.json(successResponse(formatGoal(goal), "Goal updated"));
  } catch (error) {
    console.error("updateGoal error:", error);
    res.status(500).json({ message: "Failed to update goal" });
  }
};

// ── Delete goal ──

export const deleteGoal = async (req, res) => {
  try {
    const existing = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) return res.status(404).json({ message: "Goal not found" });

    await prisma.savingsGoal.delete({ where: { id: req.params.id } });

    res.json(successResponse(null, "Goal deleted"));
  } catch (error) {
    console.error("deleteGoal error:", error);
    res.status(500).json({ message: "Failed to delete goal" });
  }
};

// ── Add deposit ──

export const addDeposit = async (req, res) => {
  try {
    const goal = await prisma.savingsGoal.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!goal) return res.status(404).json({ message: "Goal not found" });

    const { amount, note } = req.body;

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: "amount must be a positive number" });
    }

    const amountKobo = Math.round(Number(amount) * 100);

    // Create deposit + update goal in a transaction
    const [deposit, updatedGoal] = await prisma.$transaction([
      prisma.goalDeposit.create({
        data: {
          goalId:     goal.id,
          amountKobo,
          note:       note?.trim() || null,
        },
      }),
      prisma.savingsGoal.update({
        where: { id: goal.id },
        data: {
          currentAmountKobo: { increment: amountKobo },
        },
        include: { deposits: { orderBy: { createdAt: "desc" } } },
      }),
    ]);

    res.status(201).json(successResponse(formatGoal(updatedGoal), "Deposit added"));
  } catch (error) {
    console.error("addDeposit error:", error);
    res.status(500).json({ message: "Failed to add deposit" });
  }
};
