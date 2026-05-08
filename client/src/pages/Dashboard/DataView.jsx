import { useEffect, useState, useMemo } from "react";
import ViewList from "../User/ViewList";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../../lib/firebase";
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import {
  collection,
  onSnapshot,
  query,
  where,
} from "firebase/firestore";
import { Doughnut, Bar } from "react-chartjs-2";
import API_BASE_URL from "../../lib/config";
import axios from "axios";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DataView() {
  const [rating, setRating] = useState(0);
  const [pendingGoals, setPendingGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [uid, setUid] = useState(null);

  // AUTH
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

  // FIRESTORE LISTENERS
  useEffect(() => {
    if (!uid) {
      setPendingGoals([]);
      setCompletedGoals([]);
      return;
    }

    const pendingQuery = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
      where("status", "==", "in-progress")
    );

    const completedQuery = query(
      collection(db, "bucketlist"),
      where("firebaseUid", "==", uid),
      where("status", "==", "completed")
    );

    const unsubscribePending = onSnapshot(pendingQuery, (snapshot) => {
      setPendingGoals(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    const unsubscribeCompleted = onSnapshot(completedQuery, (snapshot) => {
      setCompletedGoals(
        snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
      );
    });

    return () => {
      unsubscribePending?.();
      unsubscribeCompleted?.();
    };
  }, [uid]);

  // RATING API
  useEffect(() => {
    if (!uid) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/complete/getCompleteByUser`,
          { firebaseUid: uid }
        );

        const data = res.data || [];

        const ratings = data
          .map((item) => Number(item.rating))
          .filter((r) => !isNaN(r));

        const average =
          ratings.length > 0
            ? ratings.reduce((a, b) => a + b, 0) / ratings.length
            : 0;

        if (isMounted) {
          setRating(Number(average.toFixed(1)));
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [uid]);

  // TOTAL (memoized)
  const total = useMemo(
    () => pendingGoals.length + completedGoals.length,
    [pendingGoals, completedGoals]
  );

  // STATS
  const stats = {
    totalGoals: total,
    completedGoals: completedGoals.length,
    pendingGoals: pendingGoals.length,
    averageRating: rating,
    completionRate:
      total > 0
        ? Math.round((completedGoals.length / total) * 100)
        : 0,
  };

  // DOUGHNUT DATA
  const doughnutData = {
    labels: ["Completed", "Pending"],
    datasets: [
      {
        data: [stats.completedGoals, stats.pendingGoals],
        backgroundColor: ["#86efac", "#fde68a"],
        borderWidth: 0,
      },
    ],
  };

  // CATEGORY COUNT
  const completedCategoryCounts = {};
  const pendingCategoryCounts = {};

  completedGoals.forEach((goal) => {
    const category = goal.category || "Uncategorized";
    completedCategoryCounts[category] =
      (completedCategoryCounts[category] || 0) + 1;
  });

  pendingGoals.forEach((goal) => {
    const category = goal.category || "Uncategorized";
    pendingCategoryCounts[category] =
      (pendingCategoryCounts[category] || 0) + 1;
  });

  const allCategories = [
    ...new Set([
      ...Object.keys(completedCategoryCounts),
      ...Object.keys(pendingCategoryCounts),
    ]),
  ];

  const sortedCategories = allCategories.sort((a, b) => {
    const totalA =
      (completedCategoryCounts[a] || 0) +
      (pendingCategoryCounts[a] || 0);

    const totalB =
      (completedCategoryCounts[b] || 0) +
      (pendingCategoryCounts[b] || 0);

    return totalB - totalA;
  });

  const safeCategories = sortedCategories.length
    ? sortedCategories
    : ["No Data"];

  const categoryData = {
    labels: safeCategories,
    datasets: [
      {
        label: "Completed",
        data: safeCategories.map(
          (c) => completedCategoryCounts[c] || 0
        ),
        backgroundColor: "#86efac",
        borderRadius: 6,
        barThickness: 18,
      },
      {
        label: "Pending",
        data: safeCategories.map(
          (c) => pendingCategoryCounts[c] || 0
        ),
        backgroundColor: "#fde68a",
        borderRadius: 6,
        barThickness: 18,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: {
        ticks: { color: "#6b7280", font: { size: 11 } },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#6b7280", font: { size: 11 } },
        grid: { color: "#f3f4f6" },
      },
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-gray-800">
      <h1 className="text-xl font-semibold mb-5">
        Dashboard Analytics
      </h1>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-3 mb-5">
        <StatCard title="Total Goals" value={stats.totalGoals} />
        <StatCard title="Completed" value={stats.completedGoals} />
        <StatCard title="Pending" value={stats.pendingGoals} />
        <StatCard title="Avg Rating" value={stats.averageRating} />
        <StatCard
          title="Completion %"
          value={`${stats.completionRate}%`}
        />
      </div>

      {/* CHARTS */}
      {/* CHARTS */}
{/* CHARTS */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">

  {/* DOUGHNUT */}
  <div className="bg-white border rounded-xl p-4 h-64">
  <h2 className="text-sm font-semibold mb-3">
    Goal Status
  </h2>

  {/* LEGEND + VALUES */}
  <div className="flex justify-center gap-4 mb-3 text-xs text-gray-600">
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-sm bg-[#86efac]" />
      Completed: {stats.completedGoals}
    </div>

    <div className="flex items-center gap-1">
      <span className="w-2 h-2 rounded-sm bg-[#fde68a]" />
      Pending: {stats.pendingGoals}
    </div>
  </div>

  <div className="h-44">
    <Doughnut
      data={doughnutData}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false, // ✅ enable legend
            position: "bottom",
            
          },
        },
      }}
      style={{margin:"auto", paddingBottom:"10px"}}
    />
  </div>
</div>

  {/* BAR */}
  <div className="bg-white border rounded-xl p-4 h-64">
    <h2 className="text-sm font-semibold mb-3">
      Goals by Category
    </h2>

    <div className="h-48">
      <Bar data={categoryData} options={chartOptions} />
    </div>
  </div>

</div>

      {/* LIST */}
      <div className="bg-white border rounded-xl p-4">
        <h2 className="font-semibold mb-3">Your Bucketlist</h2>
        <ViewList />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border rounded-xl p-3">
      <p className="text-xs text-gray-400">{title}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}

export default DataView;