import { StrictMode, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { registerSW } from "virtual:pwa-register";
import { Button } from "@heroui/react";

function PWAApp() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [updateSW, setUpdateSW] = useState(null);

  useEffect(() => {
    const updateSWInstance = registerSW({
      immediate: true,
      onNeedRefresh() {
        setShowUpdatePrompt(true);
        setUpdateSW(() => updateSWInstance);
      },
      onOfflineReady() {
        console.log("PWA ready to work offline");
      },
    });
  }, []);

  const handleUpdate = () => {
    if (updateSW) {
      updateSW(true);
      setShowUpdatePrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <StrictMode>
      <main className="text-foreground min-h-screen relative">
        <App />

        {/* UPDATE PROMPT */}
        {showUpdatePrompt && (
          <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Update Available</h3>
                <p className="text-sm text-gray-600 mt-1">
                  A new version of Laya is available. Refresh to get the latest features.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onPress={handleDismiss}
                  className="text-gray-500"
                >
                  Later
                </Button>
                <Button
                  size="sm"
                  onPress={handleUpdate}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Update
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<PWAApp />);