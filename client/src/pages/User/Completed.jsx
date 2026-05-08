import { useState, useEffect } from "react";
import { Button, Modal, Label, TextArea } from "@heroui/react";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";

import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from "firebase/firestore";

import axios from "axios";
import API_BASE_URL from "../../lib/config";

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

export const Completed = ({ id, firebaseDocId }) => {
  const [image, setImage] = useState(null);
  const [rating, setRating] = useState(0);
  const [date, setDate] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [uid, setUid] = useState(null);
  const [goals, setGoals] = useState([]);
  const [error, setError] = useState(""); // Added missing error state

  const firebaseUid = auth.currentUser?.uid || null;

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's goals
  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setGoals(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [uid]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleComplete = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/goal/getItemByID`,
        { dbid: id },
      );
      const goal = response.data?.items?.[0];

      if (!goal) {
        alert("No details found for this goal.");
        return;
      }

      setSelectedGoal({ title: goal.title || "Untitled Goal" });
      setDate(new Date().toISOString().split("T")[0]);
      setNotes("");
      setImage(null);
      setPreview(null);
      setRating(0);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load goal details.");
    }
  };

  const handlemarkAsDone = async (e) => {
    e.preventDefault();
    if (rating === 0 || !date || !notes.trim() || !image) {
      alert("Please fill all fields, add a rating and upload a photo.");
      return;
    }

    setLoading(true);

    try {
      // Update Firestore status
      await updateDoc(doc(db, "bucketlist", firebaseDocId), {
        status: "completed",
      });

      const formData = new FormData();
      formData.append("title", selectedGoal.title);
      formData.append("description", notes);
      formData.append("date", date);
      formData.append("itemID", id);
      formData.append("rating", rating);
      formData.append("image", image);
      formData.append("firebaseUid", firebaseUid);

      await axios.post(`${API_BASE_URL}/api/complete/addComplete`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Goal completed successfully!");
      setIsOpen(false);
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Failed to save completion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <Button
        className="bg-white text-neutral-900 border border-neutral-300 hover:bg-neutral-100 font-medium"
        onClick={() => {
          setIsOpen(true);
          handleComplete();
        }}
      >
        Mark as Done
      </Button>

      {/* Backdrop & Dialog */}
      <Modal.Backdrop className="bg-black/60 backdrop-blur-md">
        <Modal.Container className="flex items-center justify-center min-h-screen px-4">
          <Modal.Dialog
            className={`p-8 bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900 transition-all
              ${preview ? "w-full max-w-4xl" : "w-full max-w-lg"}`}
          >
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-2xl font-semibold text-neutral-900">
                Complete Goal
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <div className="flex flex-col lg:flex-row gap-8 mt-4">
                {/* Left Side - Form */}
                <div className="flex-1">
                  <form onSubmit={handlemarkAsDone} className="space-y-6">
                    {selectedGoal && (
                      <h1 className="text-xl font-semibold text-center text-neutral-800">
                        {capitalizeFirstLetter(selectedGoal.title)}
                      </h1>
                    )}

                    {/* Rating & Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <Label className="text-neutral-700 font-medium">
                          Your Rating
                        </Label>
                        <div className="mt-2 bg-neutral-50 border border-neutral-200 p-4 rounded-2xl flex items-center gap-4">
                          <Rating
                            value={rating}
                            onChange={(e, newValue) => setRating(newValue)}
                            precision={0.5}
                            size="small"
                            sx={{
                              "& .MuiRating-iconFilled": { color: "#facc15" },
                            }}
                            emptyIcon={
                              <StarIcon
                                style={{ opacity: 0.3 }}
                                fontSize="inherit"
                              />
                            }
                          />
                          <span className="text-s font-medium text-neutral-700">
                            {labels[rating] || ""}
                          </span>
                        </div>
                      </div>

                      <div>
                        <Label className="text-neutral-700 font-medium">
                          Completed On
                        </Label>
                        <div className="mt-2 bg-neutral-50 border border-neutral-200 p-4 rounded-2xl">
                          <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="bg-transparent w-full outline-none text-neutral-800"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="space-y-2">
                      <Label className="text-neutral-700 font-medium text-sm tracking-wide">
                        My Experience
                      </Label>

                      <TextArea
                        placeholder="How was the experience? What did you learn?"
                        rows={5}
                        className="w-full bg-white border border-neutral-200 rounded-3xl p-5 
               text-neutral-800 placeholder:text-neutral-400 
               focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500
               min-h-[160px] resize-y"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label className="text-neutral-700 font-medium">
                        Upload Photo
                      </Label>
                      <label className="mt-2 border-2 border-dashed border-neutral-300 hover:border-neutral-400 rounded-2xl p-8 text-center cursor-pointer block transition">
                        <span className="text-neutral-500">
                          {image ? image.name : "Click to upload an image"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl"
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save Completion"}
                    </Button>
                  </form>
                </div>

                {/* Right Side - Image Preview */}
                {preview && (
                  <div className="flex-1 flex items-center justify-center bg-neutral-50 border border-neutral-200 rounded-3xl p-4">
                    <img
                      src={preview}
                      alt="Preview"
                      className="max-h-[480px] w-full object-contain rounded-2xl"
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
