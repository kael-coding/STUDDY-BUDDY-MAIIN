import { Schedule } from "../models/schedule.model.js";
import moment from "moment-timezone";

export const createTask = async (req, res) => {
    try {
        const { title, description, startDate, dueDate, priority, timeDue } = req.body;

        if (!startDate || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Start Date and Due Date are required."
            });
        }

        const startDateTime = moment.tz(startDate, "Asia/Manila").format("YYYY-MM-DD");
        const dueDateTime = moment.tz(dueDate, "Asia/Manila").format("YYYY-MM-DD");

        if (!moment(startDateTime, "YYYY-MM-DD", true).isValid() || !moment(dueDateTime, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please check the start and due date provided.",
            });
        }

        if (moment(startDateTime).isAfter(dueDateTime)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after due date.",
            });
        }

        const validPriorities = ["low", "medium", "high"];
        const normalizedPriority = (priority && priority.toLowerCase()) || "low";
        if (!validPriorities.includes(normalizedPriority)) {
            return res.status(400).json({
                success: false,
                message: "Invalid priority value. Valid values are: low, medium, high.",
            });
        }

        let customId;
        let isUnique = false;
        while (!isUnique) {
            const randomNum = Math.floor(10000 + Math.random() * 90000);
            customId = `50000${randomNum}`;
            const existingTask = await Schedule.findOne({ _id: customId });
            if (!existingTask) isUnique = true;
        }

        const newTask = new Schedule({
            _id: customId,
            userId: req.userId,
            title,
            description,
            startDate: startDateTime,
            dueDate: dueDateTime,
            priority: normalizedPriority,
            timeDue: timeDue || "00:00",
            status: "Pending",
            isCompleted: false,
        });

        await newTask.save();
        return res.status(201).json({
            success: true,
            message: "Task created successfully",
            task: newTask,
        });
    } catch (error) {
        console.error("Error in createTask:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const getTasks = async (req, res) => {
    try {
        const userId = req.userId;
        if (!userId) return res.status(400).json({ success: false, message: "User ID is required" });

        const tasks = await Schedule.find({ userId }).sort({ dueDate: 1 });

        const currentTime = moment().tz("Asia/Manila");

        // Update overdue tasks but keep completed tasks unchanged
        await Schedule.updateMany(
            {
                userId,
                status: { $ne: "Completed" },
                dueDate: { $lt: currentTime.format("YYYY-MM-DD") },
                timeDue: { $lt: currentTime.format("HH:mm") }
            },
            { $set: { status: "Overdue" } }
        );

        return res.status(200).json({ success: true, tasks });
    } catch (error) {
        console.error("Error in getTasks:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};

export const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, startDate, dueDate, priority, timeDue, status, isCompleted } = req.body;

        if (!id) {
            return res.status(400).json({ success: false, message: "Task ID is required." });
        }

        const task = await Schedule.findOne({ _id: id });

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        let resetNotifications = false;
        let resetStatus = false; // Track if we need to reset status

        if (title) task.title = title;
        if (description) task.description = description;

        if (startDate && startDate !== task.startDate) {
            const newStartDate = moment.tz(startDate, "Asia/Manila").format("YYYY-MM-DD");
            if (!moment(newStartDate, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).json({ success: false, message: "Invalid start date format." });
            }
            task.startDate = newStartDate;
            resetNotifications = true;
            resetStatus = true;
        }

        if (dueDate && dueDate !== task.dueDate) {
            const newDueDate = moment.tz(dueDate, "Asia/Manila").format("YYYY-MM-DD");
            if (!moment(newDueDate, "YYYY-MM-DD", true).isValid()) {
                return res.status(400).json({ success: false, message: "Invalid due date format." });
            }
            task.dueDate = newDueDate;
            resetNotifications = true;
            resetStatus = true;
        }

        if (task.startDate && task.dueDate && moment(task.startDate).isAfter(task.dueDate)) {
            return res.status(400).json({
                success: false,
                message: "Start date cannot be after the due date.",
            });
        }

        if (timeDue && timeDue !== task.timeDue) {
            task.timeDue = timeDue;
            resetNotifications = true;
            resetStatus = true;
        }

        if (priority) task.priority = priority;

        // Fix: Ensure completed and overdue tasks are not reset
        if (status) {
            if (task.status !== "Completed" && task.status !== "Overdue") {
                task.status = status;
            }
        }

        if (isCompleted !== undefined) task.isCompleted = isCompleted;

        if (resetNotifications) {
            task.isNotified = false;
            task.isPastDueNotified = false;
            task.isOneDayBeforeNotified = false;
        }

        await task.save();
        return res.status(200).json({
            success: true,
            message: "Task updated successfully",
            task,
        });

    } catch (error) {
        console.error("Error in updateTask:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

export const deleteTask = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ success: false, message: "Task ID is required." });
    }

    try {
        const task = await Schedule.findOne({ _id: id });

        if (!task) {
            return res.status(404).json({ success: false, message: "Task not found." });
        }

        await Schedule.findByIdAndDelete(id);
        return res.status(200).json({
            success: true,
            message: "Task deleted successfully",
        });

    } catch (error) {
        console.error("Error in deleteTask:", error);
        return res.status(500).json({ success: false, message: "Server error" });
    }
};
