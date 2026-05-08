import { useEffect, useState } from "react";
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
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { Doughnut, Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend
);

function DataView() {
  const [pendingGoals, setPendingGoals] = useState([]);
  const [completedGoals, setCompletedGoals] = useState([]);
  const [uid, setUid] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUid(user?.uid ?? null);
    });

    return () => unsubscribeAuth();
  }, []);

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
      unsubscribePending();
      unsubscribeCompleted();
    };
  }, [uid]);

  const total = pendingGoals.length + completedGoals.length;

  const stats = {
    totalGoals: total,
    completedGoals: completedGoals.length,
    pendingGoals: pendingGoals.length,
    averageRating: 0,
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

  // CATEGORY COUNTS
  const completedCategoryCounts = {};
  const pendingCategoryCounts = {};

  completedGoals.forEach((goal) => {
    const category = goal.category || "Uncategorized";

    if (!completedCategoryCounts[category]) {
      completedCategoryCounts[category] = 0;
    }

    completedCategoryCounts[category] += 1;
  });

  pendingGoals.forEach((goal) => {
    const category = goal.category || "Uncategorized";

    if (!pendingCategoryCounts[category]) {
      pendingCategoryCounts[category] = 0;
    }

    pendingCategoryCounts[category] += 1;
  });

  // MERGE ALL CATEGORIES
  const allCategories = [
    ...new Set([
      ...Object.keys(completedCategoryCounts),
      ...Object.keys(pendingCategoryCounts),
    ]),
  ];

  // SORT BY TOTAL
  const sortedCategories = allCategories.sort((a, b) => {
    const totalA =
      (completedCategoryCounts[a] || 0) +
      (pendingCategoryCounts[a] || 0);

    const totalB =
      (completedCategoryCounts[b] || 0) +
      (pendingCategoryCounts[b] || 0);

    return totalB - totalA;
  });

  // BAR DATA
  const categoryData = {
    labels: sortedCategories,
    datasets: [
      {
        label: "Completed",
        data: sortedCategories.map(
          (category) => completedCategoryCounts[category] || 0
        ),
        backgroundColor: "#86efac",
        borderRadius: 6,
        barThickness: 18,
      },
      {
        label: "Pending",
        data: sortedCategories.map(
          (category) => pendingCategoryCounts[category] || 0
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
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        stacked: false,
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        stacked: false,
        ticks: {
          color: "#6b7280",
          font: {
            size: 11,
          },
        },
        grid: {
          color: "#f3f4f6",
        },
      },
    },
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 text-gray-800">
      <h1 className="text-xl font-semibold text-gray-800 mb-5">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
        {/* DOUGHNUT */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[280px]">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Goal Status
          </h2>

          <div className="flex gap-3 mb-3">
            <ChartLegend
              color="#86efac"
              label="Completed"
              value={stats.completedGoals}
            />

            <ChartLegend
              color="#fde68a"
              label="Pending"
              value={stats.pendingGoals}
            />
          </div>

          <div className="w-full h-56">
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>

        {/* BAR */}
        <div className="bg-white border border-gray-200 rounded-xl p-4 min-h-[280px]">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            Goals by Category
          </h2>

          <div className="flex gap-3 mb-3">
            <ChartLegend color="#86efac" label="Completed" />
            <ChartLegend color="#fde68a" label="Pending" />
          </div>

          <div className="w-full h-56">
            <Bar data={categoryData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* BUCKETLIST */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Your Bucketlist
        </h2>

        <ViewList />
      </div>
    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3">
      <p className="text-xs text-gray-400 mb-1">{title}</p>
      <p className="text-xl font-bold text-gray-800">{value}</p>
    </div>
  );
}

function ChartLegend({ color, label, value }) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-gray-500">
      <span
        style={{
          background: color,
          width: 8,
          height: 8,
          borderRadius: 2,
          display: "inline-block",
        }}
      />
      {label}
      {value !== undefined ? ` — ${value}` : ""}
    </span>
  );
}

export default DataView;