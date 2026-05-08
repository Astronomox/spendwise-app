// controllers/userController.js
import prisma from "../config/prisma.js";
import { toNaira } from "../utils/money.js";
import { successResponse } from "../utils/apiResponse.js";

const formatUser = (u) => ({
  id:            u.id,
  fullName:      u.fullName,
  email:         u.email,
  monthlyBudget: toNaira(u.monthlyBudgetKobo),
  primaryBank:   u.primaryBank,
  smsEnabled:    u.smsEnabled,
  onboardingDone: u.onboardingDone,
});

// ── Get current user profile ──

export const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(successResponse(formatUser(user), "Profile fetched"));
  } catch (error) {
    console.error("getMe error:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// ── Update profile ──

export const updateProfile = async (req, res) => {
  try {
    const { fullName, email } = req.body;

    const data = {};
    if (fullName !== undefined) data.fullName = fullName.trim();
    if (email !== undefined) {
      // Check uniqueness
      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing && existing.id !== req.user.id) {
        return res.status(400).json({ message: "Email already in use" });
      }
      data.email = email.trim().toLowerCase();
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json(successResponse(formatUser(user), "Profile updated"));
  } catch (error) {
    console.error("updateProfile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// ── Update monthly budget ──

export const updateBudget = async (req, res) => {
  try {
    const { monthlyBudget } = req.body;

    if (monthlyBudget === undefined || Number(monthlyBudget) < 0) {
      return res.status(400).json({ message: "monthlyBudget must be >= 0" });
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { monthlyBudgetKobo: Math.round(Number(monthlyBudget) * 100) },
    });

    res.json(successResponse(formatUser(user), "Budget updated"));
  } catch (error) {
    console.error("updateBudget error:", error);
    res.status(500).json({ message: "Failed to update budget" });
  }
};

// ── Save onboarding preferences ──

export const saveOnboarding = async (req, res) => {
  try {
    const { primaryBank, smsEnabled } = req.body;

    const data = { onboardingDone: true };
    if (primaryBank !== undefined) data.primaryBank = primaryBank;
    if (smsEnabled !== undefined)  data.smsEnabled = smsEnabled;

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data,
    });

    res.json(successResponse(formatUser(user), "Onboarding saved"));
  } catch (error) {
    console.error("saveOnboarding error:", error);
    res.status(500).json({ message: "Failed to save onboarding" });
  }
};

// ── Export all user data ──

export const exportData = async (req, res) => {
  try {
    const [user, transactions, goals, alerts] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.id } }),
      prisma.transaction.findMany({
        where: { userId: req.user.id },
        include: { category: { select: { name: true } } },
        orderBy: { transactionDate: "desc" },
      }),
      prisma.savingsGoal.findMany({
        where: { userId: req.user.id },
        include: { deposits: true },
      }),
      prisma.alert.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json(successResponse({
      profile: formatUser(user),
      transactions: transactions.map(t => ({
        amount:   toNaira(t.amountKobo),
        type:     t.type,
        category: t.category?.name ?? "Uncategorized",
        description: t.description,
        date:     t.transactionDate,
      })),
      goals: goals.map(g => ({
        name:          g.name,
        targetAmount:  toNaira(g.targetAmountKobo),
        currentAmount: toNaira(g.currentAmountKobo),
        deadline:      g.deadline,
        deposits:      g.deposits.map(d => ({
          amount: toNaira(d.amountKobo),
          note:   d.note,
          date:   d.createdAt,
        })),
      })),
      alerts,
      exportedAt: new Date().toISOString(),
    }, "Data exported"));
  } catch (error) {
    console.error("exportData error:", error);
    res.status(500).json({ message: "Failed to export data" });
  }
};
