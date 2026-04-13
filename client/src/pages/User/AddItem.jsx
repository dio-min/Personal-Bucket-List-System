import { useState } from "react";
import { db, auth } from "../../lib/firebase"; // Adjust path if needed
import { collection, addDoc, updateDoc, doc } from "firebase/firestore";
import axios from "axios";
import { Button, Modal} from "@heroui/react";
import {CirclePlusFill} from '@gravity-ui/icons';



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

    const currentUser = auth.currentUser;
    const firebaseUid = currentUser?.uid || null;

    if (!currentUser) {
      setError("You must be logged in to add an item.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {

      
      // 1) Add to Firestore
      const firestoreDoc = await addDoc(collection(db, "bucketlist"), {
        title,
        description,
        date,
        category,
        createdAt: new Date(),
        status: "in-progress",
        firebaseUid,
        
      });

      // 2) Add to backend MongoDB
      const response = await axios.post(
        "http://localhost:5050/api/goal/addItem",
        {
          title,
          description,
          date,
          category,
          firebaseUid,
          status: "in-progress",
          firestoreDocId: firestoreDoc.id, // Send Firestore doc ID to backend for reference
          
          
        },
      );

      console.log("Firestore doc id:", firestoreDoc.id);
      console.log("MongoDB response:", response.data);

      setSuccess("Item added successfully ");

      // Clear the form
      setTitle("");
      setDescription("");
      setDate("");
      setCategory("");
    } catch (err) {
      console.error("Add item error:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to add item.";
      setError(errorMessage);
      // Clear the form
      setTitle("");
      setDescription("");
      setDate("");
      setCategory("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Modal>
        <Button variant="default" >
          <CirclePlusFill className="size-7" />
        </Button>
        <Modal.Backdrop className="bg-black/80 backdrop-opaque-sm">
          <Modal.Container className="flex items-center justify-center min-h-screen px-4">
            <Modal.Dialog className="w-full max-w-lg p-6 bg-black border border-white-700 rounded-2xl shadow-xl text-white">
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading className="text-xl font-semibold text-white">
                  Add New Goal
                </Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <form onSubmit={handleAdd} className="space-y-5">
                  {error && (
                    <p className="text-red-400 text-sm font-medium">{error}</p>
                  )}
                  {success && (
                    <p className="text-green-400 text-sm font-medium">
                      {success}
                    </p>
                  )}
                  <label className="block text-sm text-white">Goal Title</label>
                  <input
                    type="text"
                    placeholder="Goal Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-slate-600 rounded-xl text-white placeholder-white-400 focus:outline-none focus:border-purple-500"
                  />
                  <label className="block text-sm text-white">
                    Description
                  </label>
                  <textarea
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 h-20 focus:outline-none focus:border-purple-500"
                  />

                  <label className="block text-sm text-white">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  />

                  <label className="block text-sm text-white">Category</label>
                  <select
                    name="category"
                    id=""
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-4 bg-zinc-800 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500"
                  >
                    <option value="" className="text-slate-400">
                      Select a category
                    </option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-xl font-semibold text-white transition"
                  >
                    {loading ? "Adding..." : "Add to Bucketlist"}
                  </button>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}

export default AddItem;
