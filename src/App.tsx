import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Dashboard from "./components/Dashboard";
import Settings from "./components/Settings";
import Debug from "./components/Debug";
import Onboarding from "./components/Onboarding";
import ImageGen from "./components/ImageGen";
import Gallery from "./components/Gallery";
import Help from "./components/Help";
import N8N from "./components/N8N";
import Servers from "./components/Servers";
import AgentStudio from "./components/AgentStudio";
import AgentManager from "./components/AgentManager";
import AgentRunnerSDK from "./components/AgentRunnerSDK";
import Lumaui from "./components/Lumaui";
import LumaUILite from "./components/LumaUILite";
import Notebooks from "./components/Notebooks";
import { db } from "./db/index";
import { ProvidersProvider } from "./contexts/ProvidersContext";
import ClaraAssistant from "./components/ClaraAssistant";
import { StartupService } from "./services/startupService";
import AuthPage from './components/Auth/AuthPage';
import AdminDashboard from './components/Auth/AdminDashboard';
import { applyTheme, getCurrentTheme } from './utils/themeManager';
import NotificationContainer from './components/NotificationContainer';
import XRefSidebarWrapper from './components/Clara_Components/XRefSidebarWrapper';

function App() {
  const [activePage, setActivePage] = useState(
    () => localStorage.getItem("activePage") || "clara"
  );
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string } | null>(null);
  const [, setCurrentUser] = useState<any>(null);
  const [alphaFeaturesEnabled, setAlphaFeaturesEnabled] = useState(false);
  const [agentMode, setAgentMode] = useState<"manager" | "studio" | "runner">(
    "manager"
  );
  const [editingAgentId, setEditingAgentId] = useState<string | null>(null);
  const [runningAgentId, setRunningAgentId] = useState<string | null>(null);

  useEffect(() => {
    const checkUserInfo = async () => {
      console.log('🔍 App: Checking user authentication on page load...');
      
      // Check if there's a current user logged in
      const currentUserId = await db.getCurrentUser();
      console.log('👤 App: Current user ID from storage:', currentUserId);
      
      if (currentUserId) {
        const user = await db.getUser(currentUserId);
        console.log('👤 App: User data retrieved:', user ? { id: user.id, name: user.name, email: user.email } : 'null');
        
        if (user) {
          setCurrentUser(user);
          setUserInfo({ name: user.name });
          setShowAuth(false);
          setShowOnboarding(false);
          console.log('✅ App: User authenticated successfully, hiding auth page');
          return;
        } else {
          console.log('❌ App: User ID found but user data not found, clearing session');
          await db.clearCurrentUser();
        }
      }

      // Check for legacy personal info (backward compatibility)
      const info = await db.getPersonalInfo();
      console.log('🔄 App: Legacy personal info:', info ? { name: info.name } : 'null');
      
      if (info && info.name) {
        setUserInfo({ name: info.name });
        setShowAuth(false);
        setShowOnboarding(false);
        console.log('✅ App: Using legacy personal info');
      } else {
        // No user logged in, show auth page
        setShowAuth(true);
        setShowOnboarding(false);
        setUserInfo(null);
        console.log('🔐 App: No user found, showing auth page');
      }
    };
    checkUserInfo();

    // Add db to window for debugging in development
    if (import.meta.env.DEV) {
      (window as typeof window & { db: typeof db }).db = db;
    }
  }, []);

  useEffect(() => {
    db.getAlphaFeaturesEnabled?.().then((val) =>
      setAlphaFeaturesEnabled(!!val)
    );
  }, []);

  useEffect(() => {
    // Apply startup settings
    StartupService.getInstance().applyStartupSettings();
  }, []);

  // Listen for global shortcut trigger to navigate to Clara chat
  useEffect(() => {
    let lastTriggerTime = 0;
    const debounceDelay = 300; // 300ms debounce

    const handleGlobalClaraShortcut = () => {
      const now = Date.now();

      // Check if we're within the debounce period
      if (now - lastTriggerTime < debounceDelay) {
        console.log(
          "Global shortcut navigation debounced - too soon after last trigger"
        );
        return;
      }

      lastTriggerTime = now;
      console.log("Global shortcut triggered - navigating to Clara chat");
      setActivePage("clara");
    };

    // Add listener for the trigger-new-chat event
    if (window.electron && window.electron.receive) {
      window.electron.receive("trigger-new-chat", handleGlobalClaraShortcut);
    }

    // Cleanup listener on unmount
    return () => {
      if (window.electron && window.electron.removeListener) {
        window.electron.removeListener(
          "trigger-new-chat",
          handleGlobalClaraShortcut
        );
      }
    };
  }, []);

  const handleOnboardingComplete = async () => {
    setShowOnboarding(false);
    
    // Refresh user info after onboarding
    const info = await db.getPersonalInfo();
    if (info && info.name) {
      setUserInfo({ name: info.name });
      
      // Apply gray theme after onboarding completion
      // IMPORTANT: Only apply dark mode if explicitly selected, not for "system"
      const isDarkMode = info.theme_preference === 'dark';
      
      console.log('🎨 App: Applying gray theme after onboarding');
      console.log('🎨 App: User theme preference:', info.theme_preference);
      console.log('🎨 App: Dark mode will be:', isDarkMode);
      
      // Force apply gray theme immediately in LIGHT mode by default
      applyTheme('gray', isDarkMode);
      
      // Apply again after a short delay to ensure it sticks
      setTimeout(() => {
        console.log('🎨 App: Re-applying gray theme to ensure it sticks');
        applyTheme('gray', isDarkMode);
      }, 200);
    }
  };

  const handleSignIn = async (userData: any) => {
    console.log('🔄 App: User signed in, updating state:', userData.name);
    setCurrentUser(userData);
    setUserInfo({ name: userData.name });
    setShowAuth(false);
    setShowOnboarding(false);
    
    // Apply gray theme after sign in if no custom theme is set
    const currentTheme = getCurrentTheme();
    // Only apply dark mode if explicitly selected, not for "system"
    const isDarkMode = userData.personalInfo?.theme_preference === 'dark';
    
    if (currentTheme === 'gray' || !localStorage.getItem('e-audit-theme')) {
      console.log('🎨 App: Applying gray theme after sign in with dark mode:', isDarkMode);
      setTimeout(() => {
        applyTheme('gray', isDarkMode);
      }, 100);
    }
  };

  const handleSignUp = () => {
    setShowAuth(false);
    setShowOnboarding(true);
  };

  const handleAdminAccess = () => {
    setShowAuth(false);
    setShowAdminDashboard(true);
  };

  // Logout function will be used later for logout button integration
  const handleLogout = async () => {
    console.log('🚪 App: User logging out, clearing state');
    await db.clearCurrentUser();
    setCurrentUser(null);
    setUserInfo(null);
    setShowAuth(true);
    setShowOnboarding(false);
    setShowAdminDashboard(false);
    console.log('✅ App: Logout complete, auth page should show');
  };
  
  // Expose logout function for use in components
  useEffect(() => {
    (window as any).handleLogout = handleLogout;
  }, [handleLogout]);

  const handleBackToAuth = () => {
    setShowAdminDashboard(false);
    setShowAuth(true);
  };

  useEffect(() => {
    console.log("Storing activePage:", activePage);
    localStorage.setItem("activePage", activePage);

    // Reset agent mode when navigating away from agents page
    if (activePage !== "agents") {
      setAgentMode("manager");
      setEditingAgentId(null);
    }
  }, [activePage]);

  const renderContent = () => {
    if (activePage === "assistant") {
      return <ClaraAssistant onPageChange={setActivePage} />;
    }

    // Clara is now always mounted but conditionally visible
    // This allows it to run in the background

    if (activePage === "agents") {
      const handleEditAgent = (agentId: string) => {
        setEditingAgentId(agentId);
        setAgentMode("studio");
      };

      const handleOpenAgent = (agentId: string) => {
        setRunningAgentId(agentId);
        setAgentMode("runner");
      };

      const handleCreateAgent = () => {
        setEditingAgentId(null);
        setAgentMode("studio");
      };

      const handleBackToManager = () => {
        setAgentMode("manager");
        setEditingAgentId(null);
        setRunningAgentId(null);
      };

      if (agentMode === "manager") {
        return (
          <AgentManager
            onPageChange={setActivePage}
            onEditAgent={handleEditAgent}
            onOpenAgent={handleOpenAgent}
            onCreateAgent={handleCreateAgent}
            userName={userInfo?.name}
          />
        );
      } else if (agentMode === "studio") {
        return (
          <AgentStudio
            onPageChange={handleBackToManager}
            userName={userInfo?.name}
            editingAgentId={editingAgentId}
          />
        );
      } else if (agentMode === "runner" && runningAgentId) {
        return (
          <AgentRunnerSDK
            agentId={runningAgentId}
            onClose={handleBackToManager}
          />
        );
      }
    }

    if (activePage === "image-gen") {
      return <ImageGen onPageChange={setActivePage} />;
    }

    if (activePage === "gallery") {
      return <Gallery onPageChange={setActivePage} />;
    }

    if (activePage === "n8n") {
      return <N8N onPageChange={setActivePage} />;
    }

    if (activePage === "servers") {
      return <Servers onPageChange={setActivePage} />;
    }

    return (
      <div className="flex h-screen">
        <Sidebar
          activePage={activePage}
          onPageChange={setActivePage}
          alphaFeaturesEnabled={alphaFeaturesEnabled}
        />

        <div className="flex-1 flex flex-col">
          <Topbar userName={userInfo?.name} onPageChange={setActivePage} />

          <main className="">
            {(() => {
              switch (activePage) {
                case "settings":
                  return <Settings />;
                case "debug":
                  return <Debug />;
                case "help":
                  return <Help />;
                case "notebooks":
                  return <Notebooks />;
                case "lumaui":
                  return <Lumaui />;
                case "lumaui-lite":
                  return <LumaUILite />;
                case "dashboard":
                default:
                  return <Dashboard />;
              }
            })()}
          </main>
        </div>
      </div>
    );
  };

  return (
    <ProvidersProvider>
      <div className="min-h-screen bg-gradient-to-br from-white to-sakura-100 dark:from-gray-900 dark:to-sakura-100">
        {showAuth ? (
          <AuthPage 
            onSignIn={handleSignIn}
            onSignUp={handleSignUp}
            onAdminAccess={handleAdminAccess}
          />
        ) : showAdminDashboard ? (
          <AdminDashboard 
            onBack={handleBackToAuth}
          />
        ) : showOnboarding ? (
          <Onboarding onComplete={handleOnboardingComplete} />
        ) : (
          <>
            {/* Always render Clara in background - visible when activePage is 'clara' */}
            <div
              className={activePage === "clara" ? "block" : "hidden"}
              data-clara-container
            >
              <ClaraAssistant onPageChange={setActivePage} />
            </div>

            {/* Render other content when not on Clara page */}
            {activePage !== "clara" && renderContent()}
          </>
        )}
        
        {/* Notification Container - always rendered */}
        <NotificationContainer />
        
        {/* XRef Sidebar Wrapper - always rendered to listen for menu.js events */}
        <XRefSidebarWrapper />
      </div>
    </ProvidersProvider>
  );
}

export default App;
