// import { Button, Modal, Input } from "@heroui/react";
// import { db, auth } from "../../lib/firebase";
// import { onAuthStateChanged } from "firebase/auth";
// import {
//   collection,
//   onSnapshot,
//   query,
//   where,
//   doc,
//   updateDoc,
// } from "firebase/firestore";
// import { useState, useEffect } from "react";
// import API_BASE_URL from "../../lib/config";

// import axios from "axios";

// export const Update = ({ id, firebaseUid }) => {
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [goals, setGoals] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [uid, setUid] = useState(null);
  
 

//   // Get current user
//   useEffect(() => {
//     const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
//       setUid(user?.uid ?? null);
//     });

//     return () => unsubscribeAuth();
//   }, []);

//   // Fetch user's goals
//   useEffect(() => {
//     if (!uid) {
//       setLoading(false);
//       return;
//     }

//     const q = query(
//       collection(db, "bucketlist"),
//       where("firebaseUid", "==", uid)
//     );

//     const unsubscribe = onSnapshot(
//       q,
//       (snapshot) => {
//         const goalsList = snapshot.docs.map((doc) => ({
//           id: doc.id,
//           ...doc.data(),
//         }));
//         setGoals(goalsList);
//         setLoading(false);
//       },
//       (err) => {
//         console.error("Snapshot error:", err);
//         setError("Failed to load goals: " + err.message);
//         setLoading(false);
//       }
//     );

//     return () => unsubscribe(); 
//   }, [uid]);


//   useEffect(() => {
//     if (id && goals.length > 0) {
//       const goalToEdit = goals.find((goal) => goal.id === id);
//       if (goalToEdit) {
//         setTitle(goalToEdit.title || "");
//         setCategory(goalToEdit.category || "");
//       }
//     }
//   }, [id, goals]);

//   const handleUpdate = async (e) => {
//     e.preventDefault();

//     if (!id) {
//       alert("No goal ID provided");
//       return;
//     }

//     try {
//       const goalRef = doc(db, "bucketlist", id); 

//       await updateDoc(goalRef, {
//         title: title,
//         category: category,
//       });

//       const response = await axios.put(
//   `http://localhost:5050/api/goal/updateDocument`,
//   {
//     documentID: id,
//     title: title,
//     category: category
//   }
// );

//       console.log("Goal updated successfully!");
//       alert("Goal updated successfully!");
      
//     } catch (err) {
//       console.error("Update error:", err);
//       alert("Failed to update goal: " + err.message);
//     }
//   };

//   if (loading) return <p>Loading...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <>
//       <Modal>
//         <Button>Update Goal</Button>
//         <Modal.Backdrop>
//           <Modal.Container>
//             <Modal.Dialog>
//               <Modal.CloseTrigger/>
//               <Modal.Header>
//                 <Modal.Heading>Update Goal</Modal.Heading>
//               </Modal.Header>

//               <Modal.Body>
//                 <form onSubmit={handleUpdate} className="space-y-4">
//                   <Input
//                     label="Title"
//                     value={title}
//                     onChange={(e) => setTitle(e.target.value)}
//                     placeholder="Enter goal title"
//                     required
//                   />

//                   <Input
//                     label="Category"
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     placeholder="Enter category"
//                     required
//                   />

//                   <div className="flex justify-end gap-2 pt-4">
//                     <Button type="button" variant="ghost" slot="close">
//                       Cancel
//                     </Button>
//                     <Button type="submit" slot="close">Update Goal</Button>
//                   </div>
//                 </form>
//               </Modal.Body>
//             </Modal.Dialog>
//           </Modal.Container>
//         </Modal.Backdrop>
//       </Modal>
//     </>
//   );
// };