import {
  Home,
  MessageSquare,
  FolderOpen,
  Database,
  Settings,
  HelpCircle,
  X,
} from "lucide-react";
import logo from "../assets/logo.png";

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
  alphaFeaturesEnabled?: boolean;
  showChatHistoryIndicator?: boolean;
  onLogoClick?: () => void;
  onClose?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  alpha?: boolean;
}

const menuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
  { id: "clara", label: "Chat", icon: <MessageSquare className="w-5 h-5" /> },
  { id: "dossier", label: "Dossier", icon: <FolderOpen className="w-5 h-5" /> },
  { id: "database", label: "Database", icon: <Database className="w-5 h-5" /> },
];

const bottomMenuItems: MenuItem[] = [
  { id: "settings", label: "Settings", icon: <Settings className="w-5 h-5" /> },
  { id: "help", label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
];

/**
 * Sidebar - Menu de navigation complet
 * Affiche le menu avec Dashboard, Chat, Dossier, etc.
 */
const Sidebar = ({
  activePage,
  onPageChange,
  alphaFeaturesEnabled = true,
  onLogoClick,
  onClose,
}: SidebarProps) => {
  const filteredMenuItems = alphaFeaturesEnabled
    ? menuItems
    : menuItems.filter((item) => !item.alpha);

  return (
    <div className="main-nav-menu w-64 h-full flex flex-col z-[10000] bg-[#fcfcfc] dark:bg-[#111827] border-r border-gray-200 dark:border-gray-700" style={{ backgroundColor: 'var(--sidebar-bg, #fcfcfc)' }}>
      {/* Header avec logo et bouton fermer */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => onLogoClick?.()}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          title="Fermer le menu"
        >
          <img src={logo} alt="E-audit Logo" className="w-8 h-8" />
          <span className="text-gray-900 dark:text-gray-100 font-semibold text-lg">E-audit</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            title="Fermer"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </div>

      {/* Menu principal */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                data-page={item.id}
                onClick={() => {
                  // Pour dossier et database, ne pas changer de page (géré par les scripts JS)
                  if (item.id !== "dossier" && item.id !== "database") {
                    onPageChange(item.id);
                  }
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activePage === item.id
                    ? "bg-sakura-500/20 text-sakura-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                {item.alpha && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-yellow-500" title="Alpha feature" />
                )}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Menu du bas */}
      <div className="border-t border-gray-200 dark:border-gray-700 py-4">
        <ul className="space-y-1 px-2">
          {bottomMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  activePage === item.id
                    ? "bg-sakura-500/20 text-sakura-500"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
