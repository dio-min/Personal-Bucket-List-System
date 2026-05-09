import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import { Button, Modal } from "@heroui/react";
import { CirclePlusFill } from "@gravity-ui/icons";
import API_BASE_URL from "../../lib/config";

function AddItem() {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e) => {
    e.preventDefault();

    if (!title || !description || !date || !category) {
      setError("All fields are required!");
      return;
    }
    if (title.length < 3) {
      setError("Minimum 3 characters required");
      return;
    }

    const currentUser = auth.currentUser;
    const firebaseUid = currentUser?.uid || null;

    if (!currentUser) {
      setError("You must be logged in.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const firestoreDoc = await addDoc(collection(db, "bucketlist"), {
        title,
        description,
        date,
        category,
        status: "in-progress",
        firebaseUid,
        createdAt: serverTimestamp(),
      });

      await axios.post(`${API_BASE_URL}/api/goal/addItem`, {
        title,
        description,
        date,
        category,
        firebaseUid,
        status: "in-progress",
        firestoreDocId: firestoreDoc.id,
      });

      setTitle("");
      setDescription("");
      setDate("");
      setCategory("");
      setSuccess("Goal added successfully!");
      setIsOpen(false);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add item.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={setIsOpen}>
      {/* Trigger Button */}
      <Button variant="default" onClick={() => setIsOpen(true)}>
        <CirclePlusFill className="size-6" />
      </Button>

      {/* Backdrop */}
      <Modal.Backdrop className="bg-black/70 backdrop-blur-sm">
        <Modal.Container className="flex items-center justify-center min-h-screen px-4">
          <Modal.Dialog className="w-full max-w-lg p-8 bg-white border border-neutral-200 rounded-3xl shadow-2xl text-neutral-900">
            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-2xl font-semibold text-neutral-900">
                Add New Goal
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <form onSubmit={handleAdd} className="space-y-6 mt-4">
                {error && (
                  <p className="text-red-600 text-sm font-medium">{error}</p>
                )}
                {success && (
                  <p className="text-emerald-600 text-sm font-medium">
                    {success}
                  </p>
                )}

                {/* Title */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Climb Mount Fuji"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 placeholder-neutral-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                    Description
                  </label>
                  <textarea
                    placeholder="Why is this goal important to you?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 placeholder-neutral-400 h-24 resize-y focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                    Target Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm font-medium text-neutral-700 block mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Learning">Learning</option>
                  </select>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] disabled:bg-neutral-300 disabled:text-neutral-500 rounded-2xl font-semibold text-white transition-all duration-200 text-base mt-2"
                >
                  {loading ? "Adding Goal..." : "Add to Bucketlist"}
                </button>
              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}

export default AddItem;