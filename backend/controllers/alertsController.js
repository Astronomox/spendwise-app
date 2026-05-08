// controllers/alertsController.js
import prisma from "../config/prisma.js";
import { successResponse } from "../utils/apiResponse.js";

// ── List alerts ──

export const getAlerts = async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(successResponse(alerts, "Alerts fetched"));
  } catch (error) {
    console.error("getAlerts error:", error);
    res.status(500).json({ message: "Failed to fetch alerts" });
  }
};

// ── Mark single alert as read ──

export const markRead = async (req, res) => {
  try {
    const alert = await prisma.alert.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!alert) return res.status(404).json({ message: "Alert not found" });

    await prisma.alert.update({
      where: { id: req.params.id },
      data: { read: true },
    });

    res.json(successResponse(null, "Alert marked as read"));
  } catch (error) {
    console.error("markRead error:", error);
    res.status(500).json({ message: "Failed to mark alert" });
  }
};

// ── Mark all alerts as read ──

export const markAllRead = async (req, res) => {
  try {
    await prisma.alert.updateMany({
      where: { userId: req.user.id, read: false },
      data: { read: true },
    });

    res.json(successResponse(null, "All alerts marked as read"));
  } catch (error) {
    console.error("markAllRead error:", error);
    res.status(500).json({ message: "Failed to mark all alerts" });
  }
};

// ── Clear all alerts ──

export const clearAlerts = async (req, res) => {
  try {
    await prisma.alert.deleteMany({
      where: { userId: req.user.id },
    });

    res.json(successResponse(null, "All alerts cleared"));
  } catch (error) {
    console.error("clearAlerts error:", error);
    res.status(500).json({ message: "Failed to clear alerts" });
  }
};
