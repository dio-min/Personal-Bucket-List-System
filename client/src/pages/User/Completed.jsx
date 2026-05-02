import { useState, useEffect, use } from "react";
import { Button, Modal, Label, TextArea } from "@heroui/react";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

import { onAuthStateChanged } from "firebase/auth";

import API_BASE_URL from "../../lib/config";
import axios from "axios";
import { documentId } from "firebase/firestore";

const labels = {
  0.5: "Useless",
  1: "Useless+",
  1.5: "Poor",
  2: "Poor+",
  2.5: "Ok",
  3: "Ok+",
  3.5: "Good",
  4: "Good+",
  4.5: "Excellent",
  5: "Excellent+",
};
function capitalizeFirstLetter(str) {
  if (typeof str !== "string" || str.length === 0) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const Completed = ({ id }) => {
  const [image, setImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [preview, setPreview] = useState(null); // Image preview URL
  const [status, setStatus] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };
  const handleComplete = async (e) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/goal/getItemByID`,
        {
          dbid: id,
        },
      );
      const data = response.data;
      console.log("Data received from backend:", data);
      const goal = data?.items?.[0];

      if (!goal) {
        alert("No details found for this goal.");
        return;
      }

      // Clean data for UI display
      const goalDetails = {
        title: goal.title || "Untitled Goal",

        status: goal.status || "Pending",
      };
      setSelectedGoal(goalDetails);
      setDate(new Date().toISOString().split("T")[0]); // Default to today
      setNotes(""); // Clear notes
      setImage(null); // Clear image
      setPreview(null); // Clear preview
      setRating(0); // Reset rating
      setStatus(goal.status || "Pending"); // Set status from goal
    } catch (error) {
      console.error("get data error:", error);
      setError(error.response?.data?.message || "Failed to get goal");
    }
  };

  const handlemarkAsDone = async (e) => {
    e.preventDefault();

    try {
     const response = await axios.put(
  `${API_BASE_URL}/api/goal/updateStatus`,
  {
    dbid: id,
    status: "completed"
  }
);
      console.log("Status update response:", response.data);
      alert("Goal marked as completed!");
      
    } catch (error) {
      console.error("Status update error:", error);
      alert("Failed to update status");
    }
    try {
      if (rating === 0|| !date || notes.trim() === "" || !image || notes === "") {
        alert("Please fill in all fields and provide a rating.");
        return;
      }
    const formData = new FormData();

    formData.append("title", selectedGoal.title);
    formData.append("description", notes);
    formData.append("date", date);
    formData.append("itemID", id);
    formData.append("rating", rating);
    formData.append("image", image); // MUST match upload.single("image")

    const response = await axios.post(
      `${API_BASE_URL}/api/complete/addComplete`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    console.log("Complete submission response:", response.data);
    alert("Goal marked as completed and journal entry saved!");
    } catch (error) {
      console.error("Error preparing form data:", error);
      alert("Failed to prepare data for submission");
      return;
    }

  };

  return (
    <Modal>
      {/* Trigger */}
      <Button
        className="bg-black text-white border border-neutral-700 hover:bg-neutral-900"
        onClick={handleComplete}
      >
        Mark as done
      </Button>

      {/* Backdrop */}
      <Modal.Backdrop className="bg-black/80 backdrop-blur-sm">
        <Modal.Container>
          <Modal.Dialog
            className={`p-6 bg-black border border-neutral-800 rounded-2xl shadow-xl text-neutral-100 transition-all
        ${preview ? "w-full max-w-4xl" : "w-full max-w-lg"}`}
          >
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-white text-lg">
                Journal
              </Modal.Heading>
            </Modal.Header>

            {/* RESPONSIVE LAYOUT */}
            <Modal.Body>
              <div className="flex flex-col md:flex-row gap-6">
                {/* LEFT SIDE (FORM) */}
                <div className="flex-1">
                  <form onSubmit={handleComplete} className="space-y-5">
                    {selectedGoal && (
                      <h1 className="text-lg font-semibold text-white text-center">
                        {capitalizeFirstLetter(selectedGoal.title)}
                      </h1>
                    )}

                    <hr className="border-neutral-800" />

                    {/* Rating + Date */}
                    <div className="flex flex-col md:flex-row gap-4 md:justify-between">
                      <div>
                        <Label className="text-white">Rating</Label>
                        <div className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 p-3 rounded-md">
                          <Rating
                            value={rating}
                            onChange={(e, newValue) => setRating(newValue)}
                            precision={0.5}
                            sx={{
                              "& .MuiRating-iconFilled": { color: "#ffb300" },
                              "& .MuiRating-iconEmpty": { color: "#404040" },
                            }}
                            emptyIcon={
                              <StarIcon
                                style={{ opacity: 0.3 }}
                                fontSize="inherit"
                              />
                            }
                          />
                          <span className="text-sm text-neutral-400">
                            {labels[rating] || ""}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-white">Completion Date</Label>
                        <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-md">
                          <input
                            type="date"
                            className="bg-transparent text-white outline-none"
                            onChange={(e) => setDate(e.target.value)}
                            value={date}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-1">
                      <Label className="text-white">Detailed notes</Label>
                      <TextArea
                        placeholder="Write your notes..."
                        rows={5}
                        className="bg-neutral-900 border border-neutral-800 text-white rounded-md p-2 placeholder-neutral-600"
                        onChange={(e) => setNotes(e.target.value)}
                        value={notes}
                      />
                    </div>

                    {/* Upload */}
                    <div className="flex flex-col gap-2">
                      <Label className="text-white">Upload image</Label>

                      <label className="border-2 border-dashed border-neutral-800 rounded-md p-4 text-center cursor-pointer hover:bg-neutral-900 transition">
                        <span className="text-sm text-neutral-500">
                          {image ? image.name : "Click to upload"}
                        </span>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full bg-neutral-800 hover:bg-neutral-700 text-white"
                      onClick={handlemarkAsDone}
                    >
                      Save
                    </Button>
                  </form>
                </div>

                {/* RIGHT SIDE (IMAGE PREVIEW) */}
                {preview && (
                  <div className="flex-1 flex items-center justify-center">
                    <img
                      src={preview}
                      alt="Preview"
                      className="w-full max-h-[500px] object-contain rounded-md border border-neutral-800"
                    />
                  </div>
                )}
              </div>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};
