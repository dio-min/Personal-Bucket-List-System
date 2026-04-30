import { useState, useEffect, useMemo } from "react";
import Navigate from "./Navigate";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  updateDoc,
  Firestore,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import { TrashBin, Pencil, CircleInfoFill } from "@gravity-ui/icons";
import { Funnel } from "@gravity-ui/icons";
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
import { Skeleton, Dropdown } from "@heroui/react";
import AddItem from "./AddItem";
import API_BASE_URL from "../../lib/config";
import { Update } from "./Update";

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
    if (!searchTerm.trim()) return goals;

    const term = searchTerm.toLowerCase().trim();

    return goals.filter(
      (goal) =>
        goal.title?.toLowerCase().includes(term) ||
        goal.category?.toLowerCase().includes(term),
    );
  }, [goals, searchTerm]);

  const viewGoalDetails = async (title) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/goal/getitemsByTitle`,
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
        firestoreDocId: goal.firestoreDocId || "N/A",
        description: goal.description || "No description provided",
        date: goal.date || "Not specified",
        category: goal.category || "Uncategorized",
        status: goal.status || "Pending",
        id: goal.id || "N/A",
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

  
  if (error) {
    return <div className="text-red-400 p-4">Error: {error}</div>;
  }

  return (
    <>
    <Navigate />
    {loading ? (
      <div className="flex gap-8"style={{margin:"auto", paddingTop:"30px", maxWidth:"1200px"}}>
        {/* Left Side - Table Area */}
        <div className="flex-1 max-w-[720px] shadow-panel rounded-lg bg-transparent ">
          {/* Search + Add Button */}
          <div className="flex items-end gap-4 mb-8 shadow-panel rounded-lg bg-transparent">
            <Skeleton className="h-11 w-[520px] rounded-2xl" />
            <Skeleton className="h-11 w-11 rounded-2xl" />
          </div>

          {/* Table Container */}
          <div className="bg-[#1f1f1f] border border-white/10 rounded-3xl overflow-hidden shadow-panel rounded-lg ">
            {/* Table Header */}
            <div className="grid grid-cols-12 px-6 py-4 border-b border-white/10 bg-black/40">
              <div className="col-span-5">
                <Skeleton className="h-4 w-20 rounded" />
              </div>
              <div className="col-span-4">
                <Skeleton className="h-4 w-24 rounded" />
              </div>
              <div className="col-span-3 text-right">
                <Skeleton className="h-4 w-16 rounded ml-auto" />
              </div>
            </div>

            {/* Table Body - Skeleton Rows */}
            <div className="divide-y divide-white/10">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-12 px-6 py-5 items-center hover:bg-white/5"
                >
                  {/* Title */}
                  <div className="col-span-5">
                    <Skeleton className="h-3 w-[85%] rounded-md" />
                  </div>

                  {/* Category */}
                  <div className="col-span-4">
                    <Skeleton className="h-5 w-28 rounded-md" />
                  </div>

                  {/* Actions */}
                  <div className="col-span-3 flex justify-end gap-3">
                    <Skeleton className="h-5 w-8 rounded-xl" />
                    <Skeleton className="h-5 w-8 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Goal Details Card */}
        <div>
          <Card className="w-[420px] h-[520px] bg-[#1f1f1f] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <Card.Header className="px-6 py-5 border-b border-white/10">
              <Skeleton className="h-7 w-40 rounded-lg" />
            </Card.Header>

            <Card.Content className="p-6 space-y-8">
              {/* Placeholder content when nothing selected */}
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Skeleton className="h-6 w-6 rounded-full mb-4" />

                <Skeleton className="h-4 w-64 rounded mb-2" />
                <Skeleton className="h-4 w-52 rounded" />
              </div>

              {/* Optional: You can also show full skeleton details like in previous response */}
            </Card.Content>
          </Card>
        </div>
      </div>
    ) : (
      <div style={{ display: "flex", gap: "30px", margin:"auto", padding:"30px", maxWidth:"1200px" }}>
        <div>
          <div
            style={{ marginBottom: "30px", display: "flex", alignItems: "end" }}
        >
          <SearchField value={searchTerm} onChange={setSearchTerm}>
            <Label>Search</Label>
            <SearchField.Group>
              <SearchField.SearchIcon />
              <SearchField.Input
                className="w-[540px]"
                placeholder="Search..."
              />
              <SearchField.ClearButton />
              <Dropdown>
            <Button aria-label="Menu" variant="default">
              <Funnel className="size-5" />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu
                onAction={(key) => setSearchTerm(key === "all" ? "" : key)}

              >
                <Dropdown.Item id="personal" textValue="personal">
                  <Label>Personal</Label>
                </Dropdown.Item>
                <Dropdown.Item id="career" textValue="career">
                  <Label>Career</Label>
                </Dropdown.Item>
                <Dropdown.Item id="travel" textValue="travel">
                  <Label>Travel</Label>
                </Dropdown.Item>
                <Dropdown.Item id="health" textValue="health">
                  <Label>Health</Label>
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
            </SearchField.Group>
          </SearchField>
          
          <AddItem />
          
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
                  <Update
                    id={selectedGoal.id}
                    firebaseDocId={selectedGoal.firestoreDocId}
                  />
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
    )}
    </>
    
  );
}

export default ViewList;
