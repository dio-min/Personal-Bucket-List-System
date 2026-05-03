import { Button, Modal, Input } from "@heroui/react";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
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

export const Update = ({  id,firebaseDocId }) => {
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
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch user's goals
  useEffect(() => {
    if (!uid) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const goalsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGoals(goalsList);
        setLoading(false);
      },
      (err) => {
        console.error("Snapshot error:", err);
        setError("Failed to load goals: " + err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe(); 
  }, [uid]);


  useEffect(() => {
    if (firebaseDocId && goals.length > 0) {
      const goalToEdit = goals.find((goal) => goal.id === firebaseDocId);
      if (goalToEdit) {
        setTitle(goalToEdit.title || "");
        setCategory(goalToEdit.category || "");
        setDate(goalToEdit.date || "");
        setDescription(goalToEdit.description || "");
      }
    }
  }, [firebaseDocId, goals]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!firebaseDocId) {
      alert("No goal ID provided");
      return;
    }

    try {
      const goalRef = doc(db, "bucketlist", firebaseDocId); 

      await updateDoc(goalRef, {
        title: title,
        category: category,
        date: date,
        description: description,
      });

      const response = await axios.put(
  `${API_BASE_URL}/api/goal/updateDocument`,
  {
    documentID: id,
    title: title,
    category: category,
    date: date,
    description: description
  }
);

      console.log("Goal updated successfully!");
      alert("Goal updated successfully!");
      window.location.reload();
      
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update goal: " + err.message);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>
    <Modal>
      {/* Trigger */}
      <Button variant="default">
        Edit
      </Button>

      {/* Backdrop */}
      <Modal.Backdrop className="bg-black/80 backdrop-blur-sm">
        <Modal.Container className="flex items-center justify-center min-h-screen px-4">
          <Modal.Dialog className="w-full max-w-lg p-6 bg-black border border-neutral-800 rounded-2xl shadow-xl text-neutral-100">

            <Modal.CloseTrigger />

            <Modal.Header>
              <Modal.Heading className="text-lg font-semibold text-white">
                Update Goal
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body>
              <form onSubmit={handleUpdate} className="space-y-5">

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
                  Update Goal
                </button>

              </form>
            </Modal.Body>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
    
      {/* <Modal>
        <Button>Update Goal</Button>
        <Modal.Backdrop className="bg-black/80 backdrop-blur-sm">
          <Modal.Container>
            <Modal.Dialog className={`p-6 bg-black border border-neutral-800 rounded-2xl shadow-xl text-neutral-100 transition-all`}>
              <Modal.CloseTrigger/>
              <Modal.Header>
                <Modal.Heading className="text-white text-lg">Update Goal</Modal.Heading>
              </Modal.Header>

              <Modal.Body>
                <form onSubmit={handleUpdate} className="display-flex flex-col gap-4">
                  <Input
                    label="Title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter goal title"
                    required
                  />

                  <Input
                    label="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter description"
                    required
                  />
                  <Input
                    label="Date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="Enter date"
                    required
                  />
                  <Input
                    label="Category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category"
                    required
                  />
                  

                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="ghost" slot="close">
                      Cancel
                    </Button>
                    <Button type="submit" slot="close">Update Goal</Button>
                  </div>
                </form>
              </Modal.Body>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal> */}
    </>
  );
};