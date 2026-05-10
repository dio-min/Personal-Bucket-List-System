import { Button, Modal, Input } from "@heroui/react";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { PencilToSquare } from '@gravity-ui/icons';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useState, useEffect } from "react";
import API_BASE_URL from "../../lib/config";
import axios from "axios";

export const Update = ({ id, firebaseDocId }) => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsubscribe();
  }, []);

  // Fetch user's goals
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(collection(db, "bucketlist"), where("firebaseUid", "==", uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const goalsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGoals(goalsList);
      setLoading(false);
    }, (err) => {
      console.error("Snapshot error:", err);
      setError("Failed to load goals");
      setLoading(false);
    });

    return () => unsubscribe();
  }, [uid]);

  // Load selected goal data
  useEffect(() => {
    if (!goals.length) return;

    const lookupId = firebaseDocId || id;
    if (!lookupId) return;

    const goalToEdit = goals.find(
      (goal) =>
        goal.id === lookupId ||
        goal.firestoreDocId === lookupId ||
        goal.firestoreDocId === firebaseDocId ||
        goal.id === firebaseDocId,
    );

    if (goalToEdit) {
      setTitle(goalToEdit.title || "");
      setCategory(goalToEdit.category || "");
      setDate(goalToEdit.date || "");
      setDescription(goalToEdit.description || "");
    }
  }, [firebaseDocId, id, goals]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    const requestId = firebaseDocId || id;
    if (!requestId) {
      alert("No goal ID provided");
      return;
    }

    try {
      const goalRef = doc(db, "bucketlist", firebaseDocId || id);
      await updateDoc(goalRef, {
        title,
        category,
        date,
        description,
      });

      await axios.put(`${API_BASE_URL}/api/goal/updateDocument`, {
        documentID: requestId,
        firestoreDocId: firebaseDocId,
        title,
        category,
        date,
        description,
      });

      alert("Goal updated successfully!");
      window.location.reload();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update goal: " + err.message);
    }
  };

  if (loading) return <p className="text-neutral-500">Loading...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <Modal>
      {/* Trigger Button */}
      <Button variant="default" className="hover:bg-neutral-100">
        <PencilToSquare className="size-5" />
      </Button>

      {/* Modal Content */}
      <Modal.Backdrop className="bg-black/60 backdrop-blur-md">
        <Modal.Container className="flex items-center justify-center min-h-screen px-4">
          <Modal.Dialog className="w-full max-w-lg p-8 bg-white border border-neutral-200 rounded-3xl shadow-2xl">

            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-2xl font-semibold text-neutral-900">
                Update Goal
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <form onSubmit={handleUpdate} className="space-y-6 mt-4">

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
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your goal..."
                    rows={4}
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
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
                    className="w-full p-3.5 bg-white border border-neutral-300 rounded-2xl text-neutral-900 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Travel">Travel</option>
                    <option value="Health">Health</option>
                    <option value="Career">Career</option>
                    <option value="Personal">Personal</option>
                    <option value="Adventure">Adventure</option>
                  </select>
                </div>

                {/* Submit Button */}
                <Button
  type="submit"
  className="w-full bg-[#96bb7b] hover:bg-[#86ab6f] active:bg-[#789e63] text-white font-semibold py-3.5 rounded-2xl mt-6 transition-colors"
>
  Update Goal
</Button>

              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
};