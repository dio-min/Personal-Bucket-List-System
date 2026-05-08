import { useState, useEffect, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
  orderBy,
} from "firebase/firestore";

import { onAuthStateChanged } from "firebase/auth";

import { db, auth } from "../../lib/firebase";

import {
  TrashBin,
  CircleInfoFill,
  Funnel,
} from "@gravity-ui/icons";

import {
  SearchField,
  Label,
  Card,
  AlertDialog,
  Button,
  Table,
  EmptyState,
} from "@heroui/react";

import { Dropdown } from "@heroui/react";

import axios from "axios";

import AddItem from "./AddItem";
import API_BASE_URL from "../../lib/config";
import { Update } from "./Update";
import { Completed } from "./Completed";


function formatDate(dateString) {
  if (!dateString) return "No date";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }) + " • " + date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
function ViewList() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!uid) {
      setGoals([]);
      setLoading(false);
      return;
    }

    setError(null);

    const q = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
      where("status", "==", "in-progress"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setGoals(
          snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
        );

        setLoading(false);
      },
      (err) => {
        setError("Failed to load goals: " + err.message);
      }
    );

    return () => unsubscribe();
  }, [uid]);

  const filteredGoals = useMemo(() => {
    if (!searchTerm.trim()) return goals;

    const term = searchTerm.toLowerCase().trim();

    return goals.filter(
      (g) =>
        g.title?.toLowerCase().includes(term) ||
        g.category?.toLowerCase().includes(term)
    );
  }, [goals, searchTerm]);

  const viewGoalDetails = async (title) => {
    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/goal/getItemsByTitle`,
        { title }
      );

      const goal = data?.items?.[0];

      if (!goal) {
        alert("No details found for this goal.");
        return;
      }

      setSelectedGoal({
        title: goal.title || "Untitled Goal",
        firestoreDocId: goal.firestoreDocId || "N/A",
        description: goal.description || "No description provided",
        date: goal.date || "Not specified",
        category: goal.category || "Uncategorized",
        status: goal.status || "Pending",
        id: goal.id || "N/A",
      });
    } catch (err) {
      alert("Failed to fetch goal details.");
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "bucketlist", id));
  };

  if (error) {
    return (
      <div className="text-red-500 p-5">
        Error: {error}
      </div>
    );
  }

  return (
    <div
      className="
        flex flex-col lg:flex-row
        gap-6
        p-6
        rounded-[32px]
        
      "
    >
      {/* LEFT SIDE */}
      <div className="flex-1 min-w-0">

        {/* HEADER */}
        

        {/* SEARCH */}
        <div className="flex items-end gap-3 mb-6">

          <div className="flex-1">
            <SearchField
              value={searchTerm}
              onChange={setSearchTerm}
            >
              <Label>Search</Label>

              <SearchField.Group
                className="
                  bg-white/80
                  border border-gray-200
                  rounded-2xl
                  shadow-md
                  px-2
                "
              >
                <SearchField.SearchIcon />

                <SearchField.Input
                  className="w-full text-sm"
                  placeholder="Search by title or category"
                />

                <SearchField.ClearButton />

                {/* FILTER */}
                <Dropdown>
                  <Button
                    aria-label="Filter"
                    variant="default"
                    className="
                      rounded-xl
                      bg-transparent
                      hover:bg-gray-100
                      min-w-0
                    "
                  >
                    <Funnel className="size-5 text-gray-500" />
                  </Button>

                  <Dropdown.Popover>
                    <Dropdown.Menu
                      onAction={(key) =>
                        setSearchTerm(
                          key === "all" ? "" : key
                        )
                      }
                    >
                      <Dropdown.Item id="personal">
                        <Label>Personal</Label>
                      </Dropdown.Item>

                      <Dropdown.Item id="career">
                        <Label>Career</Label>
                      </Dropdown.Item>

                      <Dropdown.Item id="travel">
                        <Label>Travel</Label>
                      </Dropdown.Item>

                      <Dropdown.Item id="health">
                        <Label>Health</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="adventure">
                        <Label>Adventure</Label>
                      </Dropdown.Item>
                      <Dropdown.Item id="learning">
                        <Label>Learning</Label>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </SearchField.Group>
            </SearchField>
          </div>

          {/* ADD BUTTON */}
          <AddItem />
        </div>

        {/* TABLE */}
        <div
          className="
            rounded-3xl
            overflow-hidden
            border border-gray-200
            bg-white/70
            backdrop-blur-xl
            shadow-xl
          "
        >
          <Table className="h-[400px] overflow-auto">
            <Table.ScrollContainer>
              <Table.Content aria-label="Bucketlist">

                {/* HEADER */}
                <Table.Header
                  className="
                    sticky top-0 z-10
                    bg-white/90
                    backdrop-blur-md
                    border-b border-gray-100
                  "
                >
                  <Table.Column
                    isRowHeader
                    className="
                      text-gray-500
                      text-xs
                      uppercase
                      tracking-wider
                    "
                  >
                    Title
                  </Table.Column>

                  <Table.Column
                    className="
                      text-gray-500
                      text-xs
                      uppercase
                      tracking-wider
                    "
                  >
                    Category
                  </Table.Column>

                  <Table.Column
                    className="
                      text-gray-500
                      text-xs
                      uppercase
                      tracking-wider
                    "
                  >
                    Actions
                  </Table.Column>
                </Table.Header>

                {/* BODY */}
                <Table.Body
                  renderEmptyState={() => (
                    <EmptyState
                      className="
                        flex h-full w-full
                        flex-col
                        items-center
                        justify-center
                        text-center
                        gap-4
                      "
                    >
                      <p className="text-gray-400 text-sm">
                        {searchTerm
                          ? "No matching goals found."
                          : "Your bucketlist is empty."}
                      </p>
                    </EmptyState>
                  )}
                >
                  {filteredGoals.map((goal) => (
                    <Table.Row
                      key={goal.id}
                      className="
                        border-b border-gray-100
                        hover:bg-blue-50/60
                        transition-all
                      "
                    >
                      {/* TITLE */}
                      <Table.Cell className="font-medium text-gray-800">
                        {goal.title}
                      </Table.Cell>

                      {/* CATEGORY */}
                      <Table.Cell>
                        <span
                          className="
                            px-3 py-1
                            rounded-full
                            text-xs
                            font-medium
                            bg-gradient-to-r
                            from-pink-100
                            to-blue-100
                            text-gray-700
                          "
                        >
                          {goal.category}
                        </span>
                      </Table.Cell>

                      {/* ACTIONS */}
                      <Table.Cell>
                        <div className="flex items-center gap-2">

                          {/* VIEW */}
                          <Button
                            variant="default"
                            onClick={() =>
                              viewGoalDetails(goal.title)
                            }
                            className="
                              rounded-xl
                              bg-blue-50
                              hover:bg-blue-100
                              min-w-0
                            "
                          >
                            <CircleInfoFill className="size-4 text-blue-500" />
                          </Button>

                          {/* DELETE */}
                          <AlertDialog>
                            <Button
                              variant="default"
                              className="
                                rounded-xl
                                bg-red-50
                                hover:bg-red-100
                                min-w-0
                              "
                            >
                              <TrashBin className="size-4 text-red-500" />
                            </Button>

                            <AlertDialog.Backdrop>
                              <AlertDialog.Container>
                                <AlertDialog.Dialog
                                  className="
                                    w-full
                                    max-w-md
                                    p-6
                                    rounded-3xl
                                    border border-gray-200
                                    bg-white
                                    shadow-2xl
                                  "
                                >
                                  <AlertDialog.CloseTrigger />

                                  <AlertDialog.Header>
                                    <AlertDialog.Icon status="danger" />

                                    <AlertDialog.Heading
                                      className="
                                        font-semibold
                                        text-gray-800
                                      "
                                    >
                                      Delete permanently?
                                    </AlertDialog.Heading>
                                  </AlertDialog.Header>

                                  <AlertDialog.Body>
                                    <p className="text-sm text-gray-500">
                                      This will permanently delete{" "}
                                      <span className="font-medium text-gray-700">
                                        "{goal.title}"
                                      </span>
                                      .
                                    </p>
                                  </AlertDialog.Body>

                                  <AlertDialog.Footer>
                                    <Button
                                      slot="close"
                                      variant="tertiary"
                                    >
                                      Cancel
                                    </Button>

                                    <Button
                                      slot="close"
                                      variant="danger"
                                      onClick={() =>
                                        handleDelete(goal.id)
                                      }
                                    >
                                      Delete
                                    </Button>
                                  </AlertDialog.Footer>
                                </AlertDialog.Dialog>
                              </AlertDialog.Container>
                            </AlertDialog.Backdrop>
                          </AlertDialog>

                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Content>
            </Table.ScrollContainer>
          </Table>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="w-full lg:w-[360px] shrink-0">
        <Card
          className="
            h-[490px]
            bg-white/75
            backdrop-blur-2xl
            border border-white/30
            rounded-[32px]
            shadow-2xl
            overflow-hidden
          "
        >
          {/* HEADER */}
          <Card.Header
            className="
              px-6 py-5
              border-b border-gray-100
            "
          >
            <Card.Title
              className="
                text-lg
                font-bold
                text-gray-800
              "
            >
              Goal Details
            </Card.Title>
          </Card.Header>

          {/* CONTENT */}
          <Card.Content
            className="
              p-6
              overflow-auto
              h-full
            "
          >
            {selectedGoal ? (
              <div className="space-y-6">

                <DetailRow
                  label="Title"
                  value={selectedGoal.title}
                />

                <DetailRow
                  label="Description"
                  value={selectedGoal.description}
                />

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow
                    label="Date"
                    value={formatDate(selectedGoal.date)}
                  />

                  <DetailRow
                    label="Category"
                    value={selectedGoal.category}
                  />
                </div>

                {/* STATUS */}
                <div>
                  <p
                    className="
                      text-xs
                      uppercase
                      tracking-widest
                      text-gray-400
                      mb-2
                    "
                  >
                    Status
                  </p>

                  <span
                    className="
                      inline-flex
                      items-center
                      px-4 py-1.5
                      rounded-full
                      bg-emerald-100
                      text-emerald-700
                      text-xs
                      font-semibold
                    "
                  >
                    {selectedGoal.status}
                  </span>
                </div>

                {/* BUTTONS */}
                <div className="flex gap-3 pt-3">
                  <Completed
                    id={selectedGoal.id}
                    firebaseDocId={
                      selectedGoal.firestoreDocId
                    }
                  />

                  <Update
                    id={selectedGoal.id}
                    firebaseDocId={
                      selectedGoal.firestoreDocId
                    }
                  />
                </div>
              </div>
            ) : (
              <div
                className="
                  h-full
                  flex
                  items-center
                  justify-center
                  text-center
                "
              >
                <div>
                  <p className="text-lg font-semibold text-gray-500">
                    No Goal Selected
                  </p>

                  <p className="text-sm text-gray-400 mt-2">
                    Select a goal from the list
                    <br />
                    to view its details here.
                  </p>
                </div>
              </div>
            )}
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p
        className="
          text-xs
          uppercase
          tracking-widest
          text-gray-400
          mb-1
        "
      >
        {label}
      </p>

      <p className="text-gray-700 leading-relaxed">
        {value}
      </p>
    </div>
  );
}

export default ViewList;