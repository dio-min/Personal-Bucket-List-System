import { useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import axios from "axios";
import { Button, Modal } from "@heroui/react";
import { CirclePlusFill } from "@gravity-ui/icons";
import API_BASE_URL from "../../lib/config";

function AddItem() {
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
        createdAt: new Date(),
        status: "in-progress",
        firebaseUid,
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
      setSuccess("Added successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add item.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      {/* Trigger */}
      <Button variant="default">
        <CirclePlusFill className="size-6" />
      </Button>

      {/* Backdrop */}
      <Modal.Backdrop className="bg-black/80 backdrop-blur-sm">
        <Modal.Container className="flex items-center justify-center min-h-screen px-4">
          <Modal.Dialog className="w-full max-w-lg p-6 bg-black border border-neutral-800 rounded-2xl shadow-xl text-neutral-100">

            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold text-white">
                Add New Goal
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <form onSubmit={handleAdd} className="space-y-5">

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}
                {success && (
                  <p className="text-green-400 text-sm">{success}</p>
                )}

                {/* Title */}
                <div>
                  <label className="text-sm text-white-500">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-white-500">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 placeholder-neutral-600 h-20 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Date */}
                <div>
                  <label className="text-sm text-white-500">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-blue-600"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm text-white-500">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 p-3 bg-neutral-900 border border-neutral-800 rounded-md text-neutral-100 focus:outline-none focus:border-blue-600"
                  >
                    <option value="" className="text-white-600">
                      Select a category
                    </option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                  </select>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-blue-800 hover:bg-blue-900 disabled:bg-neutral-900 rounded-md font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
                >
                  {loading ? "Adding..." : "Add to Bucketlist"}
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