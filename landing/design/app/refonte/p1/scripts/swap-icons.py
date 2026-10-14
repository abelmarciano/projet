"""Passage 1 : toutes les icônes de l'application passent en Hugeicons.

Remplace `from "lucide-react"` par `from "@/components/icons"` dans les fichiers
de src/, sauf les pages marketing (liste EXCLUS). Le module @/components/icons
exporte les mêmes noms que lucide-react : le JSX ne change pas.

Sécurité : le script lit d'abord TOUS les fichiers ; si un nom importé n'existe
pas dans @/components/icons, ou si un import a une forme inattendue, il s'arrête
SANS RIEN ÉCRIRE et liste les cas. Usage, depuis la racine du projet :
    python3 swap-icons.py            # vérifie puis applique
    python3 swap-icons.py --dry-run  # vérifie seulement
"""
import re, sys
from pathlib import Path

EXPORTS = set(["Activity", "ActivityIcon", "AlertCircle", "AlertCircleIcon", "AlertTriangle", "AlertTriangleIcon", "Aperture", "ApertureIcon", "ArrowDown", "ArrowDownIcon", "ArrowDownRight", "ArrowDownRightIcon", "ArrowLeft", "ArrowLeftIcon", "ArrowRight", "ArrowRightIcon", "ArrowUp", "ArrowUpDown", "ArrowUpDownIcon", "ArrowUpIcon", "ArrowUpRight", "ArrowUpRightIcon", "AudioWaveform", "AudioWaveformIcon", "BarChart3", "BarChart3Icon", "Bell", "BellIcon", "BookOpen", "BookOpenIcon", "BookText", "BookTextIcon", "Bookmark", "BookmarkIcon", "Bot", "BotIcon", "Box", "BoxIcon", "Building2", "Building2Icon", "Calendar", "CalendarDays", "CalendarDaysIcon", "CalendarIcon", "Camera", "CameraIcon", "Captions", "CaptionsIcon", "ChartColumn", "ChartColumnIcon", "Check", "CheckCheck", "CheckCheckIcon", "CheckCircle", "CheckCircle2", "CheckCircle2Icon", "CheckCircleIcon", "CheckIcon", "ChevronDown", "ChevronDownIcon", "ChevronLeft", "ChevronLeftIcon", "ChevronRight", "ChevronRightIcon", "ChevronUp", "ChevronUpIcon", "Circle", "CircleAlert", "CircleAlertIcon", "CircleCheck", "CircleCheckBig", "CircleCheckBigIcon", "CircleCheckIcon", "CircleHelp", "CircleHelpIcon", "CircleIcon", "CirclePause", "CirclePauseIcon", "CirclePlay", "CirclePlayIcon", "CircleQuestionMark", "CircleQuestionMarkIcon", "CircleUser", "CircleUserIcon", "CircleUserRound", "CircleUserRoundIcon", "CircleX", "CircleXIcon", "Clapperboard", "ClapperboardIcon", "Clock", "ClockIcon", "Coffee", "CoffeeIcon", "Coins", "CoinsIcon", "Combine", "CombineIcon", "Compass", "CompassIcon", "Copy", "CopyIcon", "CornerDownLeft", "CornerDownLeftIcon", "CornerUpLeft", "CornerUpLeftIcon", "Cpu", "CpuIcon", "CreditCard", "CreditCardIcon", "Crop", "CropIcon", "Crown", "CrownIcon", "Download", "DownloadIcon", "Ellipsis", "EllipsisIcon", "ExternalLink", "ExternalLinkIcon", "Eye", "EyeIcon", "EyeOff", "EyeOffIcon", "Facebook", "FacebookIcon", "FileText", "FileTextIcon", "Film", "FilmIcon", "Flame", "FlameIcon", "FlaskConical", "FlaskConicalIcon", "Folder", "FolderIcon", "FolderInput", "FolderInputIcon", "FolderKanban", "FolderKanbanIcon", "FolderOpen", "FolderOpenIcon", "FolderPlus", "FolderPlusIcon", "FolderTree", "FolderTreeIcon", "ForkKnifeCrossed", "ForkKnifeCrossedIcon", "Gauge", "GaugeIcon", "Gift", "GiftIcon", "Globe", "GlobeIcon", "Grid", "Grid3X3", "Grid3X3Icon", "Grid3x3", "Grid3x3Icon", "GridIcon", "GripVertical", "GripVerticalIcon", "Heart", "HeartIcon", "HelpCircle", "HelpCircleIcon", "History", "HistoryIcon", "Home", "HomeIcon", "House", "HouseIcon", "IconComponent", "IconProps", "Image", "ImageIcon", "ImageOff", "ImageOffIcon", "ImagePlus", "ImagePlusIcon", "Images", "ImagesIcon", "Inbox", "InboxIcon", "Info", "InfoIcon", "KanbanSquare", "KanbanSquareIcon", "Keyboard", "KeyboardIcon", "Languages", "LanguagesIcon", "Layers", "Layers3", "Layers3Icon", "LayersIcon", "LayoutDashboard", "LayoutDashboardIcon", "LayoutTemplate", "LayoutTemplateIcon", "LifeBuoy", "LifeBuoyIcon", "Lightbulb", "LightbulbIcon", "Link2", "Link2Icon", "ListFilter", "ListFilterIcon", "Loader2", "Loader2Icon", "LoaderCircle", "LoaderCircleIcon", "Lock", "LockIcon", "LogOut", "LogOutIcon", "LucideActivity", "LucideAlertCircle", "LucideAlertTriangle", "LucideAperture", "LucideArrowDown", "LucideArrowDownRight", "LucideArrowLeft", "LucideArrowRight", "LucideArrowUp", "LucideArrowUpDown", "LucideArrowUpRight", "LucideAudioWaveform", "LucideBarChart3", "LucideBell", "LucideBookOpen", "LucideBookText", "LucideBookmark", "LucideBot", "LucideBox", "LucideBuilding2", "LucideCalendar", "LucideCalendarDays", "LucideCamera", "LucideCaptions", "LucideChartColumn", "LucideCheck", "LucideCheckCheck", "LucideCheckCircle", "LucideCheckCircle2", "LucideChevronDown", "LucideChevronLeft", "LucideChevronRight", "LucideChevronUp", "LucideCircle", "LucideCircleAlert", "LucideCircleCheck", "LucideCircleCheckBig", "LucideCircleHelp", "LucideCirclePause", "LucideCirclePlay", "LucideCircleQuestionMark", "LucideCircleUser", "LucideCircleUserRound", "LucideCircleX", "LucideClapperboard", "LucideClock", "LucideCoffee", "LucideCoins", "LucideCombine", "LucideCompass", "LucideCopy", "LucideCornerDownLeft", "LucideCornerUpLeft", "LucideCpu", "LucideCreditCard", "LucideCrop", "LucideCrown", "LucideDownload", "LucideEllipsis", "LucideExternalLink", "LucideEye", "LucideEyeOff", "LucideFacebook", "LucideFileText", "LucideFilm", "LucideFlame", "LucideFlaskConical", "LucideFolder", "LucideFolderInput", "LucideFolderKanban", "LucideFolderOpen", "LucideFolderPlus", "LucideFolderTree", "LucideForkKnifeCrossed", "LucideGauge", "LucideGift", "LucideGlobe", "LucideGrid", "LucideGrid3X3", "LucideGrid3x3", "LucideGripVertical", "LucideHeart", "LucideHelpCircle", "LucideHistory", "LucideHome", "LucideHouse", "LucideIcon", "LucideImage", "LucideImageOff", "LucideImagePlus", "LucideImages", "LucideInbox", "LucideInfo", "LucideKanbanSquare", "LucideKeyboard", "LucideLanguages", "LucideLayers", "LucideLayers3", "LucideLayoutDashboard", "LucideLayoutTemplate", "LucideLifeBuoy", "LucideLightbulb", "LucideLink2", "LucideListFilter", "LucideLoader2", "LucideLoaderCircle", "LucideLock", "LucideLogOut", "LucideMail", "LucideMailCheck", "LucideMapPin", "LucideMaximize", "LucideMaximize2", "LucideMegaphone", "LucideMenu", "LucideMessageCircle", "LucideMessageSquare", "LucideMessageSquareText", "LucideMic", "LucideMic2", "LucideMicVocal", "LucideMinus", "LucideMonitor", "LucideMoon", "LucideMoreHorizontal", "LucideMousePointerClick", "LucideMusic", "LucideMusic2", "LucidePackage", "LucidePalette", "LucidePanelLeft", "LucidePanelLeftClose", "LucidePanelLeftOpen", "LucidePanelRightClose", "LucidePanelRightOpen", "LucidePaperclip", "LucidePause", "LucidePauseCircle", "LucidePencil", "LucidePhone", "LucidePlay", "LucidePlayCircle", "LucidePlug", "LucidePlus", "LucideProps", "LucideQuote", "LucideRadar", "LucideRectangleHorizontal", "LucideRectangleVertical", "LucideRedo2", "LucideRefreshCw", "LucideReply", "LucideRocket", "LucideRotateCcw", "LucideRoute", "LucideSave", "LucideScissors", "LucideScrollText", "LucideSearch", "LucideSend", "LucideSettings", "LucideShare2", "LucideShieldAlert", "LucideShieldCheck", "LucideShieldPlus", "LucideShoppingBag", "LucideShoppingCart", "LucideSidebar", "LucideSidebarClose", "LucideSidebarOpen", "LucideSlidersHorizontal", "LucideSmartphone", "LucideSparkles", "LucideSplit", "LucideSplitSquareHorizontal", "LucideSquare", "LucideSquareKanban", "LucideSquareSplitHorizontal", "LucideStar", "LucideStars", "LucideStepForward", "LucideSubtitles", "LucideSun", "LucideTable2", "LucideTarget", "LucideThumbsDown", "LucideThumbsUp", "LucideTrash2", "LucideTrendingDown", "LucideTrendingUp", "LucideTriangleAlert", "LucideType", "LucideUndo2", "LucideUpload", "LucideUser", "LucideUser2", "LucideUserCircle", "LucideUserCircle2", "LucideUserPlus", "LucideUserRound", "LucideUsers", "LucideUsers2", "LucideUsersRound", "LucideUtensilsCrossed", "LucideVideo", "LucideWallet", "LucideWand2", "LucideWandSparkles", "LucideWrench", "LucideX", "LucideXCircle", "LucideZap", "LucideZoomIn", "LucideZoomOut", "Mail", "MailCheck", "MailCheckIcon", "MailIcon", "MapPin", "MapPinIcon", "Maximize", "Maximize2", "Maximize2Icon", "MaximizeIcon", "Megaphone", "MegaphoneIcon", "Menu", "MenuIcon", "MessageCircle", "MessageCircleIcon", "MessageSquare", "MessageSquareIcon", "MessageSquareText", "MessageSquareTextIcon", "Mic", "Mic2", "Mic2Icon", "MicIcon", "MicVocal", "MicVocalIcon", "Minus", "MinusIcon", "Monitor", "MonitorIcon", "Moon", "MoonIcon", "MoreHorizontal", "MoreHorizontalIcon", "MousePointerClick", "MousePointerClickIcon", "Music", "Music2", "Music2Icon", "MusicIcon", "Package", "PackageIcon", "Palette", "PaletteIcon", "PanelLeft", "PanelLeftClose", "PanelLeftCloseIcon", "PanelLeftIcon", "PanelLeftOpen", "PanelLeftOpenIcon", "PanelRightClose", "PanelRightCloseIcon", "PanelRightOpen", "PanelRightOpenIcon", "Paperclip", "PaperclipIcon", "Pause", "PauseCircle", "PauseCircleIcon", "PauseIcon", "Pencil", "PencilIcon", "Phone", "PhoneIcon", "Play", "PlayCircle", "PlayCircleIcon", "PlayIcon", "Plug", "PlugIcon", "Plus", "PlusIcon", "Quote", "QuoteIcon", "Radar", "RadarIcon", "RectangleHorizontal", "RectangleHorizontalIcon", "RectangleVertical", "RectangleVerticalIcon", "Redo2", "Redo2Icon", "RefreshCw", "RefreshCwIcon", "Reply", "ReplyIcon", "Rocket", "RocketIcon", "RotateCcw", "RotateCcwIcon", "Route", "RouteIcon", "Save", "SaveIcon", "Scissors", "ScissorsIcon", "ScrollText", "ScrollTextIcon", "Search", "SearchIcon", "Send", "SendIcon", "Settings", "SettingsIcon", "Share2", "Share2Icon", "ShieldAlert", "ShieldAlertIcon", "ShieldCheck", "ShieldCheckIcon", "ShieldPlus", "ShieldPlusIcon", "ShoppingBag", "ShoppingBagIcon", "ShoppingCart", "ShoppingCartIcon", "Sidebar", "SidebarClose", "SidebarCloseIcon", "SidebarIcon", "SidebarOpen", "SidebarOpenIcon", "SlidersHorizontal", "SlidersHorizontalIcon", "Smartphone", "SmartphoneIcon", "Sparkles", "SparklesIcon", "Split", "SplitIcon", "SplitSquareHorizontal", "SplitSquareHorizontalIcon", "Square", "SquareIcon", "SquareKanban", "SquareKanbanIcon", "SquareSplitHorizontal", "SquareSplitHorizontalIcon", "Star", "StarIcon", "Stars", "StarsIcon", "StepForward", "StepForwardIcon", "Subtitles", "SubtitlesIcon", "Sun", "SunIcon", "Table2", "Table2Icon", "Target", "TargetIcon", "ThumbsDown", "ThumbsDownIcon", "ThumbsUp", "ThumbsUpIcon", "Trash2", "Trash2Icon", "TrendingDown", "TrendingDownIcon", "TrendingUp", "TrendingUpIcon", "TriangleAlert", "TriangleAlertIcon", "Type", "TypeIcon", "Undo2", "Undo2Icon", "Upload", "UploadIcon", "User", "User2", "User2Icon", "UserCircle", "UserCircle2", "UserCircle2Icon", "UserCircleIcon", "UserIcon", "UserPlus", "UserPlusIcon", "UserRound", "UserRoundIcon", "Users", "Users2", "Users2Icon", "UsersIcon", "UsersRound", "UsersRoundIcon", "UtensilsCrossed", "UtensilsCrossedIcon", "Video", "VideoIcon", "Wallet", "WalletIcon", "Wand2", "Wand2Icon", "WandSparkles", "WandSparklesIcon", "Wrench", "WrenchIcon", "X", "XCircle", "XCircleIcon", "XIcon", "Zap", "ZapIcon", "ZoomIn", "ZoomInIcon", "ZoomOut", "ZoomOutIcon"])

# Pages marketing : on n'y touche pas (elles gardent lucide-react).
EXCLUS_PREFIXES = (
    "src/components/Landing",
    "src/marketing/",
    "src/routes/blog.",
    "src/routes/tarifs",
)
EXCLUS = {
    "src/components/HeroFloatingCards.tsx",
    "src/components/AnnouncementBar.tsx",
    "src/components/AppHeader.tsx",
    "src/components/icons.tsx",
}

IMPORT_RE = re.compile(r'import\s+(type\s+)?\{([^}]*)\}\s*from\s*(["\'])lucide-react\3', re.S)
OTHER_RE = re.compile(r'(import\s+\*\s+as\s+\w+\s+from\s*["\']lucide-react["\'])|(from\s*["\']lucide-react/)|(import\(\s*["\']lucide-react)|(import\s+\w+\s*(,\s*\{[^}]*\})?\s*from\s*["\']lucide-react["\'])')

def exclu(rel: str) -> bool:
    return rel in EXCLUS or rel.startswith(EXCLUS_PREFIXES)

def main() -> None:
    dry = "--dry-run" in sys.argv
    root = Path("src")
    if not (root / "components").is_dir():
        sys.exit("Lance le script depuis la racine du projet (dossier qui contient src/).")
    if not (root / "components" / "icons.tsx").is_file():
        sys.exit("src/components/icons.tsx est absent : copie-le d'abord.")
    changes, problems, gardes = {}, [], []
    for f in sorted(list(root.rglob("*.tsx")) + list(root.rglob("*.ts"))):
        rel = f.as_posix()
        s = f.read_text(encoding="utf-8")
        if "lucide-react" not in s or rel == "src/components/icons.tsx":
            continue
        if exclu(rel):
            gardes.append(rel)
            continue
        if OTHER_RE.search(s):
            problems.append(f"{rel} : forme d'import lucide non prise en charge")
            continue
        n = 0
        for m in IMPORT_RE.finditer(s):
            n += 1
            for spec in m.group(2).split(","):
                spec = re.sub(r"^type\s+", "", spec.strip())
                if not spec:
                    continue
                name = spec.split(" as ")[0].strip()
                if name not in EXPORTS:
                    problems.append(f"{rel} : « {name} » n'existe pas dans @/components/icons")
        rest = IMPORT_RE.sub("", s)
        if "lucide-react" in rest:
            problems.append(f"{rel} : mention de lucide-react hors d'un import reconnu")
            continue
        if n:
            changes[rel] = IMPORT_RE.sub(lambda m: m.group(0)[: m.start(3) - m.start(0)] + m.group(3) + "@/components/icons" + m.group(3), s)
    if problems:
        print("ARRÊT, rien n'a été écrit. Cas à signaler :")
        for p in problems:
            print("  -", p)
        sys.exit(1)
    if not dry:
        for rel, s in changes.items():
            Path(rel).write_text(s, encoding="utf-8")
    print(("Vérification OK" if dry else "Imports remplacés") + f" : {len(changes)} fichiers.")
    print(f"Pages marketing laissées en lucide-react : {len(gardes)}")
    for g in gardes:
        print("  -", g)

main()
