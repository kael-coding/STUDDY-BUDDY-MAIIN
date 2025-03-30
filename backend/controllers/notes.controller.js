import { Note } from "../models/notes.model.js";

export const createNote = async (req, res) => {
    const { title, description, isPinned } = req.body;

    if (!title || !description) {
        return res.status(400).json({
            success: false,
            message: "Required to fill"
        });
    }

    let customId;
    let isUnique = false;
    while (!isUnique) {
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        customId = `300090${randomNum}`;
        const existingNotes = await Note.findOne({ _id: customId });
        if (!existingNotes) isUnique = true;
    }

    // Manually format the current date to 'MM/DD/YYYY'
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US'); // This will give the format 'MM/DD/YYYY'

    const newNotes = new Note({
        _id: customId,
        userId: req.userId,
        title,
        description,
        isPinned: isPinned || false,  // Default to false if not provided
        date: formattedDate // Store only the formatted date here
    });

    await newNotes.save();

    return res.status(201).json({
        success: true,
        message: "Added",
        notes: newNotes
    });
};

export const getNotes = async (req, res) => {
    try {
        // Sort notes by 'isPinned' (true will come first, then false)
        const notes = await Note.find({ userId: req.userId }).sort({ isPinned: -1 });

        return res.status(200).json({
            success: true,
            notes
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch notes",
            error: error.message
        });
    }
};

export const updateNote = async (req, res) => {
    const { id } = req.params;
    const { title, description, isPinned } = req.body;

    try {
        const updatedNote = await Note.findByIdAndUpdate(
            id,
            { title, description, isPinned }, // Include isPinned in the update
            { new: true, runValidators: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note updated successfully",
            note: updatedNote
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to update note",
            error: error.message
        });
    }
};

export const deleteNote = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedNote = await Note.findByIdAndDelete(id);

        if (!deletedNote) {
            return res.status(404).json({
                success: false,
                message: "Note not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note deleted successfully",
            note: deletedNote
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete note",
            error: error.message
        });
    }
};
