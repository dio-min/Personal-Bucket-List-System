import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { TrashBin, Pencil, CircleInfoFill } from "@gravity-ui/icons";
import {
  SearchField,
  Label,
  Card,
  AlertDialog,
  Button,
  Table,
  EmptyState,
  Modal,
} from "@heroui/react";
import axios from "axios";

import AddItem from "./AddItem";
import API_BASE_URL from "../../lib/config";

function ViewList() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [selectedGoal, setSelectedGoal] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDate, setEditDate] = useState("");
  const [editCategory, setEditCategory] = useState("");

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    if (!uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const q = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
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
        setError("Failed to load goals: " + err.message);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [uid]);

  const filteredGoals = useMemo(() => {
    if (!searchTerm.trim()) return goals; // If search is empty, show all goals

    const term = searchTerm.toLowerCase().trim(); // Convert to lowercase for case-insensitive search

    return goals.filter(
      (goal) =>
        goal.title?.toLowerCase().includes(term) || // Search in title
        goal.category?.toLowerCase().includes(term), // Search in category
    );
  }, [goals, searchTerm]);

  const viewGoalDetails = async (title) => {
    

    try {
      const response = await axios.post(
        `/api/goal/getitemsByTitle`,
        {
          title: title,
        },
      );

      const data = response.data;

      console.log("Title sent to backend:", data);

      // Safely extract the goal from backend response
      const goal = data?.items?.[0];

      if (!goal) {
        alert("No details found for this goal.");
        return;
      }

      // Clean data for UI display
      const goalDetails = {
        title: goal.title || "Untitled Goal",
        description: goal.description || "No description provided",
        date: goal.date || "Not specified",
        category: goal.category || "Uncategorized",
        status: goal.status || "Pending",
      };

      setSelectedGoal(goalDetails);
      setShowDetails(true);
    } catch (err) {
      console.error("Error fetching goal details:", err);
      alert("Failed to fetch goal details. Please try again later.");
    }
  };

  const handleDelete = async (id) => {
    // Implement delete functionality here
    const docRef = doc(db, "bucketlist", id);
    await deleteDoc(docRef);
    console.log("Delete item with id:", id);
  };

  if (loading) {
    return <div className="text-white p-4">Loading your bucketlist...</div>;
  }

  if (error) {
    return <div className="text-red-400 p-4">Error: {error}</div>;
  }

  return (
    <div style={{ display: "flex", gap: "30px" }}>
      <AddItem />
      <div>
        <div style={{ marginBottom: "30px" }}>
          <SearchField value={searchTerm} onChange={setSearchTerm}>
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                className="w-[280px]"
                placeholder="Search..."
              />
              <SearchField.ClearButton />
            </SearchField.Group>
          </SearchField>
        </div>

        <Table className="h-[400px] overflow-auto ">
          <Table.ScrollContainer>
            <Table.Content aria-label="Bucketlist" className="min-w-[600px]">
              <Table.Header className="sticky top-0 z-10 bg-surface-secondary">
                <Table.Column isRowHeader>Title</Table.Column>
                <Table.Column>Category</Table.Column>
                <Table.Column>Action</Table.Column>
              </Table.Header>
              <Table.Body
                renderEmptyState={() => (
                  <EmptyState className="flex h-full w-full flex-col items-center justify-center gap-4 text-center">
                    <span className="text-sm text-muted">
                      {searchTerm
                        ? "No matching goals found."
                        : "Your bucketlist is empty."}
                    </span>
                  </EmptyState>
                )}
              >
                {filteredGoals.map((goal) => (
                  <Table.Row key={goal.id} className="hover:bg-purple-50">
                    <Table.Cell>{goal.title}</Table.Cell>
                    <Table.Cell>{goal.category}</Table.Cell>
                    <Table.Cell>
                      {/* view details */}
                      <Button
                        variant="default"
                        onClick={() => viewGoalDetails(goal.title)}
                      >
                        <CircleInfoFill className="size-5" />
                      </Button>

                      {/* delete button */}
                      <AlertDialog>
                        <Button variant="default">
                          <TrashBin />
                        </Button>
                        <AlertDialog.Backdrop>
                          <AlertDialog.Container>
                            <AlertDialog.Dialog className="w-full max-w-lg p-6 bg-black border border-white-700 rounded-2xl shadow-xl text-white">
                              <AlertDialog.CloseTrigger />
                              <AlertDialog.Header>
                                <AlertDialog.Icon status="danger" />
                                <AlertDialog.Heading className="text-white">
                                  Delete project permanently?
                                </AlertDialog.Heading>
                              </AlertDialog.Header>
                              <AlertDialog.Body className="text-grey">
                                <p>
                                  This will permanently delete
                                  {goal.title} from your bucketlist. Are you
                                  sure you want to proceed? This action cannot
                                  be undone.
                                </p>
                              </AlertDialog.Body>
                              <AlertDialog.Footer>
                                <Button
                                  slot="close"
                                  variant="tertiary"
                                  className="text-black"
                                >
                                  Cancel
                                </Button>
                                <Button
                                  slot="close"
                                  variant="danger"
                                  onClick={() => handleDelete(goal.id)}
                                >
                                  Delete Item
                                </Button>
                              </AlertDialog.Footer>
                            </AlertDialog.Dialog>
                          </AlertDialog.Container>
                        </AlertDialog.Backdrop>
                      </AlertDialog>

                      {/* update button */}
                      <Modal>
                        <Button variant="default">
                          <Pencil />
                        </Button>
                        <Modal.Backdrop className="bg-black/80 backdrop-opaque-sm">
                          <Modal.Container>
                            <Modal.Dialog className="w-full max-w-lg p-6 bg-black border border-white-700 rounded-2xl shadow-xl text-white">
                              <Modal.CloseTrigger />
                              <Modal.Header>
                                <Modal.Icon className="bg-default text-foreground">
                                  <Pencil />
                                </Modal.Icon>
                                <Modal.Heading className="text-xl font-semibold text-white">Update Details</Modal.Heading>
                              </Modal.Header>
                              <Modal.Body>
                                

                              </Modal.Body>
                              <Modal.Footer>
                                
                              </Modal.Footer>
                            </Modal.Dialog>
                          </Modal.Container>
                        </Modal.Backdrop>
                      </Modal>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </div>

      <div>
        <Card className="w-[400px] h-[490px] bg-grey border border-white-700 rounded-2xl shadow-xl text-white overflow-hidden ">
          <Card.Header className="px-6 pt-6 pb-4 border-b border-white/10">
            <Card.Title className="text-xl font-semibold">
              Goal Details
            </Card.Title>
          </Card.Header>

          <Card.Content className="p-6 space-y-5 text-sm overflow-auto h-full ">
            {selectedGoal ? (
              <div className="space-y-4">
                <div>
                  <p className="text-muted text-xs uppercase tracking-widest mb-1">
                    TITLE
                  </p>
                  <p className="font-medium">{selectedGoal.title}</p>
                </div>

                <div>
                  <p className="text-muted text-xs uppercase tracking-widest mb-1">
                    DESCRIPTION
                  </p>
                  <p className="leading-relaxed">{selectedGoal.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-muted text-xs uppercase tracking-widest mb-1">
                      DATE
                    </p>
                    <p>{selectedGoal.date}</p>
                  </div>
                  <div>
                    <p className="text-muted text-xs uppercase tracking-widest mb-1">
                      CATEGORY
                    </p>
                    <p>{selectedGoal.category}</p>
                  </div>
                </div>

                <div>
                  <p className="text-muted text-xs uppercase tracking-widest mb-1">
                    STATUS
                  </p>
                  <p className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                    {selectedGoal.status}
                  </p>
                </div>

                <div>
                  <Button style={{ display: "flex", justifySelf: "right" }}>
                    Mark As Done
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <p className="text-muted">
                  Select a goal from the list
                  <br />
                  to view its details here.
                </p>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

export default ViewList;
