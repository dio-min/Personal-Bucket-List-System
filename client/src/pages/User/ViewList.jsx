import { useState, useEffect, useRef, useMemo } from "react";
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
  return (
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) +
    " • " +
    date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  );
}

function useSlideUp(delay = 0) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          }, delay);
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  return ref;
}

/* ── category colour map ── */
const CATEGORY_STYLES = {
  personal:  { bg: "bg-violet-50",  text: "text-violet-600",  dot: "bg-violet-400"  },
  career:    { bg: "bg-blue-50",    text: "text-blue-600",    dot: "bg-blue-400"    },
  travel:    { bg: "bg-teal-50",    text: "text-teal-600",    dot: "bg-teal-400"    },
  health:    { bg: "bg-emerald-50", text: "text-emerald-600", dot: "bg-emerald-400" },
  adventure: { bg: "bg-orange-50",  text: "text-orange-600",  dot: "bg-orange-400"  },
  learning:  { bg: "bg-amber-50",   text: "text-amber-600",   dot: "bg-amber-400"   },
};

function CategoryBadge({ category }) {
  const key = category?.toLowerCase();
  const style = CATEGORY_STYLES[key] ?? {
    bg: "bg-gray-100",
    text: "text-gray-500",
    dot: "bg-gray-400",
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5
        px-2.5 py-1 rounded-full
        text-xs font-medium
        ${style.bg} ${style.text}
      `}
    >
      <span className={`size-1.5 rounded-full shrink-0 ${style.dot}`} />
      {category}
    </span>
  );
}

/* ── animated table row ── */
function AnimatedRow({ goal, index, onView, onDelete }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.opacity = "0";
    el.style.transform = "translateY(12px)";

    const t = setTimeout(() => {
      el.style.transition = "opacity 0.35s ease, transform 0.35s ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    }, 40 + index * 55);

    return () => clearTimeout(t);
  }, [index]);

  return (
    <Table.Row
      ref={ref}
      className="
        group
        border-b border-gray-100/80
        hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30
        transition-colors duration-200
      "
    >
      {/* INDEX */}
      <Table.Cell className="w-8 pr-0 pl-4">
        <span className="text-xs text-gray-300 font-mono tabular-nums select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
      </Table.Cell>

      {/* TITLE */}
      <Table.Cell className="py-3.5">
        <span className="font-medium text-gray-800 text-sm leading-snug">
          {goal.title}
        </span>
      </Table.Cell>

      {/* CATEGORY */}
      <Table.Cell className="py-3.5">
        <CategoryBadge category={goal.category} />
      </Table.Cell>

      {/* ACTIONS */}
      <Table.Cell className="py-3.5">
        <div className="flex items-center gap-1 ">

          {/* VIEW */}
          <Button
            variant="default"
            onClick={() => onView(goal.title)}
            className="
              rounded-xl
              bg-transparent hover:bg-blue-100
              text-blue-500
              min-w-0 p-1.5
              transition-colors duration-150
            "
          >
            <CircleInfoFill className="size-4" />
          </Button>

          {/* DELETE */}
          <AlertDialog>
            <Button
              variant="default"
              className="
                rounded-xl
                bg-transparent hover:bg-red-100
                text-red-400
                min-w-0 p-1.5
                transition-colors duration-150
              "
            >
              <TrashBin className="size-4" />
            </Button>

            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog
                  className="
                    w-full max-w-md p-6
                    rounded-3xl border border-gray-200
                    bg-white shadow-2xl
                  "
                >
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger" />
                    <AlertDialog.Heading className="font-semibold text-gray-800">
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
                    <Button slot="close" variant="tertiary">Cancel</Button>
                    <Button
                      slot="close"
                      variant="danger"
                      onClick={() => onDelete(goal.id)}
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
  );
}

function ViewList() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uid, setUid] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGoal, setSelectedGoal] = useState(null);

  const leftRef  = useSlideUp(0);
  const rightRef = useSlideUp(150);

  const slideBaseStyle = {
    opacity: 0,
    transform: "translateY(40px)",
    transition: "opacity 0.6s ease, transform 0.6s ease",
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!uid) { setGoals([]); setLoading(false); return; }

    setError(null);

    const q = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
      where("status", "==", "in-progress"),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        setGoals(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => setError("Failed to load goals: " + err.message)
    );

    return () => unsub();
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
      if (!goal) { alert("No details found for this goal."); return; }
      setSelectedGoal({
        title:          goal.title          || "Untitled Goal",
        firestoreDocId: goal.firestoreDocId || "N/A",
        description:    goal.description   || "No description provided",
        date:           goal.date          || "Not specified",
        category:       goal.category      || "Uncategorized",
        status:         goal.status        || "Pending",
        id:             goal.id            || "N/A",
      });
    } catch {
      alert("Failed to fetch goal details.");
    }
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "bucketlist", id));
  };

  if (error) return <div className="text-red-500 p-5">Error: {error}</div>;

  return (
    <div className="flex flex-col lg:flex-row">

      {/* LEFT SIDE */}
      <div ref={leftRef} style={slideBaseStyle} className="flex-1 min-w-0">

        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <SearchField value={searchTerm} onChange={setSearchTerm}>
              <Label>Search</Label>
              <SearchField.Group className="bg-white/80 border border-gray-200 rounded-2xl">
                <SearchField.SearchIcon />
                <SearchField.Input
                  className="w-full text-sm"
                  placeholder="Search by title or category"
                />
                <SearchField.ClearButton />

                <Dropdown>
                  <Button
                    aria-label="Filter"
                    variant="default"
                    className="rounded-xl bg-transparent hover:bg-gray-100 min-w-0"
                  >
                    <Funnel className="size-5 text-gray-500" />
                  </Button>
                  <Dropdown.Popover>
                    <Dropdown.Menu
                      onAction={(key) => setSearchTerm(key === "all" ? "" : key)}
                    >
                      {["personal","career","travel","health","adventure","learning"].map((cat) => (
                        <Dropdown.Item key={cat} id={cat}>
                          <Label className="capitalize">{cat}</Label>
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              </SearchField.Group>
            </SearchField>
          </div>
          <AddItem />
        </div>

        {/* TABLE */}
        <div className="rounded-2xl overflow-hidden border border-gray-100  ">
          <Table className="h-[400px] overflow-auto">
            <Table.ScrollContainer>
              <Table.Content aria-label="Bucketlist">

                {/* HEADER */}
                <Table.Header
                  className="
                    sticky top-0 z-10
                    bg-gray-50/95 backdrop-blur-md
                    border-b border-gray-100
                  "
                >
                  {/* index col */}
                  <Table.Column className="w-8 pr-0" />

                  <Table.Column
                    isRowHeader
                    className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold py-3"
                  >
                    Title
                  </Table.Column>

                  <Table.Column
                    className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold py-3"
                  >
                    Category
                  </Table.Column>

                  <Table.Column
                    className="text-gray-400 text-[11px] uppercase tracking-widest font-semibold py-3"
                  >
                    Actions
                  </Table.Column>
                </Table.Header>

                {/* BODY */}
                <Table.Body
                  renderEmptyState={() => (
                    <EmptyState className="flex h-full w-full flex-col items-center justify-center text-center gap-3 py-16">
                      <div className="size-10 rounded-2xl flex items-center justify-center">
                        <span className="text-xl">🎯</span>
                      </div>
                      <p className="text-gray-400 text-sm font-medium">
                        {searchTerm
                          ? "No matching goals found."
                          : "Your bucketlist is empty."}
                      </p>
                      {!searchTerm && (
                        <p className="text-gray-300 text-xs">
                          Add your first goal to get started
                        </p>
                      )}
                    </EmptyState>
                  )}
                >
                  {filteredGoals.map((goal, index) => (
                    <AnimatedRow
                      key={goal.id}
                      goal={goal}
                      index={index}
                      onView={viewGoalDetails}
                      onDelete={handleDelete}
                    />
                  ))}
                </Table.Body>

              </Table.Content>
            </Table.ScrollContainer>
          </Table>

          {/* FOOTER COUNT */}
         
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div ref={rightRef} style={slideBaseStyle} className="w-full lg:w-[360px] shrink-0">
        <Card
          className="
            h-[490px]
            bg-white/75 backdrop-blur-2xl
            border-grey/10
            rounded-[32px] 
            overflow-hidden
          "
        >
          <Card.Header className="px-6 py-2 border-b border-gray-100">
            <Card.Title className="text-s font-bold text-gray-800">
              Goal Details
            </Card.Title>
          </Card.Header>

          <Card.Content className="p-6 overflow-auto h-full text-xs">
            {selectedGoal ? (
              <div className="space-y-3">
                <DetailRow label="Title"       value={selectedGoal.title} />
                <DetailRow label="Description" value={selectedGoal.description} />

                <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Date"     value={formatDate(selectedGoal.date)} />
                  <DetailRow label="Category" value={selectedGoal.category} />
                </div>

                <div>
                  <p className="text-xs uppercase tracking-widest text-gray-400 mb-2">
                    Status
                  </p>
                  <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                    {selectedGoal.status}
                  </span>
                </div>

                <div className="flex gap-3 pt-3">
                  <Completed id={selectedGoal.id} firebaseDocId={selectedGoal.firestoreDocId} />
                  <Update    id={selectedGoal.id} firebaseDocId={selectedGoal.firestoreDocId} />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-center">
                <div>
                  <p className="text-lg font-semibold text-gray-500">No Goal Selected</p>
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
      <p className="text-xs uppercase tracking-widest text-gray-400 mb-1">{label}</p>
      <p className="text-gray-700 leading-relaxed">{value}</p>
    </div>
  );
}

export default ViewList;