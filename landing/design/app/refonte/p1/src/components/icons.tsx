/**
 * Icônes de l'application : dessins Hugeicons (gratuits, trait arrondi 1,5),
 * exportés sous les MÊMES noms que lucide-react pour que les pages n'aient qu'à
 * changer leur import (`from "lucide-react"` → `from "@/components/icons"`).
 * Chaque icône garde les classes `lucide lucide-<nom>` et les props de lucide
 * (className, size, color, strokeWidth, absoluteStrokeWidth, fill, style, aria-*).
 * Fichier généré depuis l'inventaire des icônes du SaaS (184 icônes) ; pour en
 * ajouter une : importer son dessin Hugeicons et l'exporter avec `make`.
 */
import { forwardRef, type ForwardRefExoticComponent, type RefAttributes, type SVGProps } from "react";
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ActivityIcon as hgActivity,
  AlertCircleIcon as hgAlertCircle,
  ApertureIcon as hgAperture,
  ArrowDownIcon as hgArrowDown,
  ArrowDownRightIcon as hgArrowDownRight,
  ArrowExpandDiagonal01Icon as hgArrowExpandDiagonal01,
  ArrowLeftIcon as hgArrowLeft,
  ArrowRightIcon as hgArrowRight,
  ArrowUpDownIcon as hgArrowUpDown,
  ArrowUpIcon as hgArrowUp,
  ArrowUpRightIcon as hgArrowUpRight,
  AudioWaveformIcon as hgAudioWaveform,
  BellIcon as hgBell,
  BookOpenIcon as hgBookOpen,
  BookTextIcon as hgBookText,
  BookmarkIcon as hgBookmark,
  BotIcon as hgBot,
  BoxIcon as hgBox,
  Building03Icon as hgBuilding03,
  CalendarDaysIcon as hgCalendarDays,
  CalendarIcon as hgCalendar,
  CameraIcon as hgCamera,
  CaptionsIcon as hgCaptions,
  ChartColumnIcon as hgChartColumn,
  CheckCheckIcon as hgCheckCheck,
  CheckIcon as hgCheck,
  ChevronDownIcon as hgChevronDown,
  ChevronLeftIcon as hgChevronLeft,
  ChevronRightIcon as hgChevronRight,
  ChevronUpIcon as hgChevronUp,
  CircleCheckBigIcon as hgCircleCheckBig,
  CircleCheckIcon as hgCircleCheck,
  CircleIcon as hgCircle,
  CircleXIcon as hgCircleX,
  ClapperboardIcon as hgClapperboard,
  ClockIcon as hgClock,
  CoffeeIcon as hgCoffee,
  CoinsIcon as hgCoins,
  CombineIcon as hgCombine,
  CompassIcon as hgCompass,
  CopyIcon as hgCopy,
  CornerDownLeftIcon as hgCornerDownLeft,
  CornerUpLeftIcon as hgCornerUpLeft,
  CpuIcon as hgCpu,
  CreditCardIcon as hgCreditCard,
  CropIcon as hgCrop,
  CrownIcon as hgCrown,
  Delete02Icon as hgDelete02,
  DownloadIcon as hgDownload,
  ExternalLinkIcon as hgExternalLink,
  EyeIcon as hgEye,
  EyeOffIcon as hgEyeOff,
  FacebookIcon as hgFacebook,
  FileTextIcon as hgFileText,
  FilmIcon as hgFilm,
  FlameIcon as hgFlame,
  FlaskConicalIcon as hgFlaskConical,
  FolderIcon as hgFolder,
  FolderInputIcon as hgFolderInput,
  FolderKanbanIcon as hgFolderKanban,
  FolderOpenIcon as hgFolderOpen,
  FolderPlusIcon as hgFolderPlus,
  FolderTreeIcon as hgFolderTree,
  GaugeIcon as hgGauge,
  GiftIcon as hgGift,
  GlobeIcon as hgGlobe,
  Grid3x3Icon as hgGrid3x3,
  GripVerticalIcon as hgGripVertical,
  HeartIcon as hgHeart,
  HelpCircleIcon as hgHelpCircle,
  HistoryIcon as hgHistory,
  HomeIcon as hgHome,
  ImageIcon as hgImage,
  ImageOffIcon as hgImageOff,
  ImagePlusIcon as hgImagePlus,
  ImagesIcon as hgImages,
  InboxIcon as hgInbox,
  InfoIcon as hgInfo,
  KeyboardIcon as hgKeyboard,
  LanguagesIcon as hgLanguages,
  Layers01Icon as hgLayers01,
  LayersIcon as hgLayers,
  LayoutDashboardIcon as hgLayoutDashboard,
  LayoutTemplateIcon as hgLayoutTemplate,
  LifebuoyIcon as hgLifebuoy,
  LightbulbIcon as hgLightbulb,
  Link02Icon as hgLink02,
  ListFilterIcon as hgListFilter,
  Loading03Icon as hgLoading03,
  LockIcon as hgLock,
  LogOutIcon as hgLogOut,
  MailCheckIcon as hgMailCheck,
  MailIcon as hgMail,
  MapPinIcon as hgMapPin,
  MaximizeIcon as hgMaximize,
  MegaphoneIcon as hgMegaphone,
  MenuIcon as hgMenu,
  MessageCircleIcon as hgMessageCircle,
  MessageSquareIcon as hgMessageSquare,
  MessageSquareTextIcon as hgMessageSquareText,
  MicIcon as hgMic,
  MicVocalIcon as hgMicVocal,
  MinusIcon as hgMinus,
  MonitorIcon as hgMonitor,
  MoonIcon as hgMoon,
  MoreHorizontalIcon as hgMoreHorizontal,
  MousePointerClickIcon as hgMousePointerClick,
  MusicIcon as hgMusic,
  PackageIcon as hgPackage,
  PaletteIcon as hgPalette,
  PanelLeftCloseIcon as hgPanelLeftClose,
  PanelLeftIcon as hgPanelLeft,
  PanelLeftOpenIcon as hgPanelLeftOpen,
  PanelRightCloseIcon as hgPanelRightClose,
  PanelRightOpenIcon as hgPanelRightOpen,
  PaperclipIcon as hgPaperclip,
  PauseCircleIcon as hgPauseCircle,
  PauseIcon as hgPause,
  PencilIcon as hgPencil,
  PhoneIcon as hgPhone,
  PlayCircleIcon as hgPlayCircle,
  PlayIcon as hgPlay,
  PlugIcon as hgPlug,
  PlusIcon as hgPlus,
  QuoteIcon as hgQuote,
  RadarIcon as hgRadar,
  RectangleHorizontalIcon as hgRectangleHorizontal,
  RectangleVerticalIcon as hgRectangleVertical,
  Redo02Icon as hgRedo02,
  RefreshCwIcon as hgRefreshCw,
  ReplyIcon as hgReply,
  RocketIcon as hgRocket,
  RotateCcwIcon as hgRotateCcw,
  RouteIcon as hgRoute,
  SaveIcon as hgSave,
  ScissorsIcon as hgScissors,
  ScrollTextIcon as hgScrollText,
  SearchIcon as hgSearch,
  SendIcon as hgSend,
  SettingsIcon as hgSettings,
  Share08Icon as hgShare08,
  ShieldAlertIcon as hgShieldAlert,
  ShieldCheckIcon as hgShieldCheck,
  ShieldPlusIcon as hgShieldPlus,
  ShoppingBagIcon as hgShoppingBag,
  ShoppingCartIcon as hgShoppingCart,
  SlidersHorizontalIcon as hgSlidersHorizontal,
  SmartphoneIcon as hgSmartphone,
  SparklesIcon as hgSparkles,
  SplitIcon as hgSplit,
  SquareIcon as hgSquare,
  SquareKanbanIcon as hgSquareKanban,
  SquareSplitHorizontalIcon as hgSquareSplitHorizontal,
  StarIcon as hgStar,
  StepForwardIcon as hgStepForward,
  SubtitleIcon as hgSubtitle,
  SunIcon as hgSun,
  TableIcon as hgTable,
  TargetIcon as hgTarget,
  ThumbsDownIcon as hgThumbsDown,
  ThumbsUpIcon as hgThumbsUp,
  TiktokIcon as hgTiktok,
  TrendingDownIcon as hgTrendingDown,
  TrendingUpIcon as hgTrendingUp,
  TriangleAlertIcon as hgTriangleAlert,
  TypeIcon as hgType,
  Undo02Icon as hgUndo02,
  UploadIcon as hgUpload,
  UserCircleIcon as hgUserCircle,
  UserIcon as hgUser,
  UserPlusIcon as hgUserPlus,
  UserRoundIcon as hgUserRound,
  UsersIcon as hgUsers,
  UsersRoundIcon as hgUsersRound,
  UtensilsCrossedIcon as hgUtensilsCrossed,
  VideoIcon as hgVideo,
  WalletIcon as hgWallet,
  WandSparklesIcon as hgWandSparkles,
  WrenchIcon as hgWrench,
  XIcon as hgX,
  ZapIcon as hgZap,
  ZoomInIcon as hgZoomIn,
  ZoomOutIcon as hgZoomOut,
} from "@hugeicons/core-free-icons";

export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  color?: string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
};
export type IconComponent = ForwardRefExoticComponent<IconProps & RefAttributes<SVGSVGElement>>;
/** Compatibilité avec le code qui typait ses icônes avec lucide. */
export type LucideIcon = IconComponent;
export type LucideProps = IconProps;

function make(icon: IconSvgElement, name: string): IconComponent {
  const C = forwardRef<SVGSVGElement, IconProps>(function Icon(
    { className, size = 24, color, strokeWidth, absoluteStrokeWidth, ...rest },
    ref,
  ) {
    return (
      <HugeiconsIcon
        ref={ref}
        icon={icon}
        size={size}
        color={color ?? "currentColor"}
        // Trait : celui du dessin (1,5) sauf si la page en demande un autre.
        strokeWidth={strokeWidth === undefined ? undefined : Number(strokeWidth)}
        absoluteStrokeWidth={absoluteStrokeWidth}
        className={className ? `lucide lucide-${name} ${className}` : `lucide lucide-${name}`}
        {...rest}
      />
    );
  });
  C.displayName = name;
  return C;
}

export const Activity = make(hgActivity, "activity");
export const ActivityIcon = Activity;
export const LucideActivity = Activity;
export const AlertCircle = make(hgAlertCircle, "alert-circle");
export const AlertCircleIcon = AlertCircle;
export const CircleAlert = AlertCircle;
export const CircleAlertIcon = AlertCircle;
export const LucideAlertCircle = AlertCircle;
export const LucideCircleAlert = AlertCircle;
export const AlertTriangle = make(hgTriangleAlert, "alert-triangle");
export const AlertTriangleIcon = AlertTriangle;
export const LucideAlertTriangle = AlertTriangle;
export const LucideTriangleAlert = AlertTriangle;
export const TriangleAlert = AlertTriangle;
export const TriangleAlertIcon = AlertTriangle;
export const Aperture = make(hgAperture, "aperture");
export const ApertureIcon = Aperture;
export const LucideAperture = Aperture;
export const ArrowDown = make(hgArrowDown, "arrow-down");
export const ArrowDownIcon = ArrowDown;
export const LucideArrowDown = ArrowDown;
export const ArrowDownRight = make(hgArrowDownRight, "arrow-down-right");
export const ArrowDownRightIcon = ArrowDownRight;
export const LucideArrowDownRight = ArrowDownRight;
export const ArrowLeft = make(hgArrowLeft, "arrow-left");
export const ArrowLeftIcon = ArrowLeft;
export const LucideArrowLeft = ArrowLeft;
export const ArrowRight = make(hgArrowRight, "arrow-right");
export const ArrowRightIcon = ArrowRight;
export const LucideArrowRight = ArrowRight;
export const ArrowUp = make(hgArrowUp, "arrow-up");
export const ArrowUpIcon = ArrowUp;
export const LucideArrowUp = ArrowUp;
export const ArrowUpDown = make(hgArrowUpDown, "arrow-up-down");
export const ArrowUpDownIcon = ArrowUpDown;
export const LucideArrowUpDown = ArrowUpDown;
export const ArrowUpRight = make(hgArrowUpRight, "arrow-up-right");
export const ArrowUpRightIcon = ArrowUpRight;
export const LucideArrowUpRight = ArrowUpRight;
export const AudioWaveform = make(hgAudioWaveform, "audio-waveform");
export const AudioWaveformIcon = AudioWaveform;
export const LucideAudioWaveform = AudioWaveform;
export const BarChart3 = make(hgChartColumn, "bar-chart-3");
export const BarChart3Icon = BarChart3;
export const ChartColumn = BarChart3;
export const ChartColumnIcon = BarChart3;
export const LucideBarChart3 = BarChart3;
export const LucideChartColumn = BarChart3;
export const Bell = make(hgBell, "bell");
export const BellIcon = Bell;
export const LucideBell = Bell;
export const BookOpen = make(hgBookOpen, "book-open");
export const BookOpenIcon = BookOpen;
export const LucideBookOpen = BookOpen;
export const BookText = make(hgBookText, "book-text");
export const BookTextIcon = BookText;
export const LucideBookText = BookText;
export const Bookmark = make(hgBookmark, "bookmark");
export const BookmarkIcon = Bookmark;
export const LucideBookmark = Bookmark;
export const Bot = make(hgBot, "bot");
export const BotIcon = Bot;
export const LucideBot = Bot;
export const Box = make(hgBox, "box");
export const BoxIcon = Box;
export const LucideBox = Box;
export const Building2 = make(hgBuilding03, "building-2");
export const Building2Icon = Building2;
export const LucideBuilding2 = Building2;
export const Calendar = make(hgCalendar, "calendar");
export const CalendarIcon = Calendar;
export const LucideCalendar = Calendar;
export const CalendarDays = make(hgCalendarDays, "calendar-days");
export const CalendarDaysIcon = CalendarDays;
export const LucideCalendarDays = CalendarDays;
export const Camera = make(hgCamera, "camera");
export const CameraIcon = Camera;
export const LucideCamera = Camera;
export const Captions = make(hgCaptions, "captions");
export const CaptionsIcon = Captions;
export const LucideCaptions = Captions;
export const LucideSubtitles = Captions;
export const Subtitles = Captions;
export const SubtitlesIcon = Captions;
export const Check = make(hgCheck, "check");
export const CheckIcon = Check;
export const LucideCheck = Check;
export const CheckCheck = make(hgCheckCheck, "check-check");
export const CheckCheckIcon = CheckCheck;
export const LucideCheckCheck = CheckCheck;
export const CheckCircle = make(hgCircleCheckBig, "check-circle");
export const CheckCircleIcon = CheckCircle;
export const CircleCheckBig = CheckCircle;
export const CircleCheckBigIcon = CheckCircle;
export const LucideCheckCircle = CheckCircle;
export const LucideCircleCheckBig = CheckCircle;
export const CheckCircle2 = make(hgCircleCheck, "check-circle-2");
export const CheckCircle2Icon = CheckCircle2;
export const CircleCheck = CheckCircle2;
export const CircleCheckIcon = CheckCircle2;
export const LucideCheckCircle2 = CheckCircle2;
export const LucideCircleCheck = CheckCircle2;
export const ChevronDown = make(hgChevronDown, "chevron-down");
export const ChevronDownIcon = ChevronDown;
export const LucideChevronDown = ChevronDown;
export const ChevronLeft = make(hgChevronLeft, "chevron-left");
export const ChevronLeftIcon = ChevronLeft;
export const LucideChevronLeft = ChevronLeft;
export const ChevronRight = make(hgChevronRight, "chevron-right");
export const ChevronRightIcon = ChevronRight;
export const LucideChevronRight = ChevronRight;
export const ChevronUp = make(hgChevronUp, "chevron-up");
export const ChevronUpIcon = ChevronUp;
export const LucideChevronUp = ChevronUp;
export const Circle = make(hgCircle, "circle");
export const CircleIcon = Circle;
export const LucideCircle = Circle;
export const Clapperboard = make(hgClapperboard, "clapperboard");
export const ClapperboardIcon = Clapperboard;
export const LucideClapperboard = Clapperboard;
export const Clock = make(hgClock, "clock");
export const ClockIcon = Clock;
export const LucideClock = Clock;
export const Coffee = make(hgCoffee, "coffee");
export const CoffeeIcon = Coffee;
export const LucideCoffee = Coffee;
export const Coins = make(hgCoins, "coins");
export const CoinsIcon = Coins;
export const LucideCoins = Coins;
export const Combine = make(hgCombine, "combine");
export const CombineIcon = Combine;
export const LucideCombine = Combine;
export const Compass = make(hgCompass, "compass");
export const CompassIcon = Compass;
export const LucideCompass = Compass;
export const Copy = make(hgCopy, "copy");
export const CopyIcon = Copy;
export const LucideCopy = Copy;
export const CornerDownLeft = make(hgCornerDownLeft, "corner-down-left");
export const CornerDownLeftIcon = CornerDownLeft;
export const LucideCornerDownLeft = CornerDownLeft;
export const CornerUpLeft = make(hgCornerUpLeft, "corner-up-left");
export const CornerUpLeftIcon = CornerUpLeft;
export const LucideCornerUpLeft = CornerUpLeft;
export const Cpu = make(hgCpu, "cpu");
export const CpuIcon = Cpu;
export const LucideCpu = Cpu;
export const CreditCard = make(hgCreditCard, "credit-card");
export const CreditCardIcon = CreditCard;
export const LucideCreditCard = CreditCard;
export const Crop = make(hgCrop, "crop");
export const CropIcon = Crop;
export const LucideCrop = Crop;
export const Crown = make(hgCrown, "crown");
export const CrownIcon = Crown;
export const LucideCrown = Crown;
export const Download = make(hgDownload, "download");
export const DownloadIcon = Download;
export const LucideDownload = Download;
export const ExternalLink = make(hgExternalLink, "external-link");
export const ExternalLinkIcon = ExternalLink;
export const LucideExternalLink = ExternalLink;
export const Eye = make(hgEye, "eye");
export const EyeIcon = Eye;
export const LucideEye = Eye;
export const EyeOff = make(hgEyeOff, "eye-off");
export const EyeOffIcon = EyeOff;
export const LucideEyeOff = EyeOff;
export const Facebook = make(hgFacebook, "facebook");
export const FacebookIcon = Facebook;
export const LucideFacebook = Facebook;
export const FileText = make(hgFileText, "file-text");
export const FileTextIcon = FileText;
export const LucideFileText = FileText;
export const Film = make(hgFilm, "film");
export const FilmIcon = Film;
export const LucideFilm = Film;
export const Flame = make(hgFlame, "flame");
export const FlameIcon = Flame;
export const LucideFlame = Flame;
export const FlaskConical = make(hgFlaskConical, "flask-conical");
export const FlaskConicalIcon = FlaskConical;
export const LucideFlaskConical = FlaskConical;
export const Folder = make(hgFolder, "folder");
export const FolderIcon = Folder;
export const LucideFolder = Folder;
export const FolderInput = make(hgFolderInput, "folder-input");
export const FolderInputIcon = FolderInput;
export const LucideFolderInput = FolderInput;
export const FolderKanban = make(hgFolderKanban, "folder-kanban");
export const FolderKanbanIcon = FolderKanban;
export const LucideFolderKanban = FolderKanban;
export const FolderOpen = make(hgFolderOpen, "folder-open");
export const FolderOpenIcon = FolderOpen;
export const LucideFolderOpen = FolderOpen;
export const FolderPlus = make(hgFolderPlus, "folder-plus");
export const FolderPlusIcon = FolderPlus;
export const LucideFolderPlus = FolderPlus;
export const FolderTree = make(hgFolderTree, "folder-tree");
export const FolderTreeIcon = FolderTree;
export const LucideFolderTree = FolderTree;
export const Gauge = make(hgGauge, "gauge");
export const GaugeIcon = Gauge;
export const LucideGauge = Gauge;
export const Gift = make(hgGift, "gift");
export const GiftIcon = Gift;
export const LucideGift = Gift;
export const Globe = make(hgGlobe, "globe");
export const GlobeIcon = Globe;
export const LucideGlobe = Globe;
export const Grid3x3 = make(hgGrid3x3, "grid-3x-3");
export const Grid = Grid3x3;
export const Grid3X3 = Grid3x3;
export const Grid3X3Icon = Grid3x3;
export const Grid3x3Icon = Grid3x3;
export const GridIcon = Grid3x3;
export const LucideGrid = Grid3x3;
export const LucideGrid3X3 = Grid3x3;
export const LucideGrid3x3 = Grid3x3;
export const GripVertical = make(hgGripVertical, "grip-vertical");
export const GripVerticalIcon = GripVertical;
export const LucideGripVertical = GripVertical;
export const Heart = make(hgHeart, "heart");
export const HeartIcon = Heart;
export const LucideHeart = Heart;
export const HelpCircle = make(hgHelpCircle, "help-circle");
export const CircleHelp = HelpCircle;
export const CircleHelpIcon = HelpCircle;
export const CircleQuestionMark = HelpCircle;
export const CircleQuestionMarkIcon = HelpCircle;
export const HelpCircleIcon = HelpCircle;
export const LucideCircleHelp = HelpCircle;
export const LucideCircleQuestionMark = HelpCircle;
export const LucideHelpCircle = HelpCircle;
export const History = make(hgHistory, "history");
export const HistoryIcon = History;
export const LucideHistory = History;
export const Home = make(hgHome, "home");
export const HomeIcon = Home;
export const House = Home;
export const HouseIcon = Home;
export const LucideHome = Home;
export const LucideHouse = Home;
export const Image = make(hgImage, "image");
export const ImageIcon = Image;
export const LucideImage = Image;
export const ImageOff = make(hgImageOff, "image-off");
export const ImageOffIcon = ImageOff;
export const LucideImageOff = ImageOff;
export const ImagePlus = make(hgImagePlus, "image-plus");
export const ImagePlusIcon = ImagePlus;
export const LucideImagePlus = ImagePlus;
export const Images = make(hgImages, "images");
export const ImagesIcon = Images;
export const LucideImages = Images;
export const Inbox = make(hgInbox, "inbox");
export const InboxIcon = Inbox;
export const LucideInbox = Inbox;
export const Info = make(hgInfo, "info");
export const InfoIcon = Info;
export const LucideInfo = Info;
export const KanbanSquare = make(hgSquareKanban, "kanban-square");
export const KanbanSquareIcon = KanbanSquare;
export const LucideKanbanSquare = KanbanSquare;
export const LucideSquareKanban = KanbanSquare;
export const SquareKanban = KanbanSquare;
export const SquareKanbanIcon = KanbanSquare;
export const Keyboard = make(hgKeyboard, "keyboard");
export const KeyboardIcon = Keyboard;
export const LucideKeyboard = Keyboard;
export const Languages = make(hgLanguages, "languages");
export const LanguagesIcon = Languages;
export const LucideLanguages = Languages;
export const Layers = make(hgLayers, "layers");
export const Layers3 = Layers;
export const Layers3Icon = Layers;
export const LayersIcon = Layers;
export const LucideLayers = Layers;
export const LucideLayers3 = Layers;
export const LayoutDashboard = make(hgLayoutDashboard, "layout-dashboard");
export const LayoutDashboardIcon = LayoutDashboard;
export const LucideLayoutDashboard = LayoutDashboard;
export const LayoutTemplate = make(hgLayoutTemplate, "layout-template");
export const LayoutTemplateIcon = LayoutTemplate;
export const LucideLayoutTemplate = LayoutTemplate;
export const LifeBuoy = make(hgLifebuoy, "life-buoy");
export const LifeBuoyIcon = LifeBuoy;
export const LucideLifeBuoy = LifeBuoy;
export const Lightbulb = make(hgLightbulb, "lightbulb");
export const LightbulbIcon = Lightbulb;
export const LucideLightbulb = Lightbulb;
export const Link2 = make(hgLink02, "link-2");
export const Link2Icon = Link2;
export const LucideLink2 = Link2;
export const ListFilter = make(hgListFilter, "list-filter");
export const ListFilterIcon = ListFilter;
export const LucideListFilter = ListFilter;
export const Loader2 = make(hgLoading03, "loader-2");
export const Loader2Icon = Loader2;
export const LoaderCircle = Loader2;
export const LoaderCircleIcon = Loader2;
export const LucideLoader2 = Loader2;
export const LucideLoaderCircle = Loader2;
export const Lock = make(hgLock, "lock");
export const LockIcon = Lock;
export const LucideLock = Lock;
export const LogOut = make(hgLogOut, "log-out");
export const LogOutIcon = LogOut;
export const LucideLogOut = LogOut;
export const Mail = make(hgMail, "mail");
export const LucideMail = Mail;
export const MailIcon = Mail;
export const MailCheck = make(hgMailCheck, "mail-check");
export const LucideMailCheck = MailCheck;
export const MailCheckIcon = MailCheck;
export const MapPin = make(hgMapPin, "map-pin");
export const LucideMapPin = MapPin;
export const MapPinIcon = MapPin;
export const Maximize = make(hgMaximize, "maximize");
export const LucideMaximize = Maximize;
export const MaximizeIcon = Maximize;
export const Maximize2 = make(hgArrowExpandDiagonal01, "maximize-2");
export const LucideMaximize2 = Maximize2;
export const Maximize2Icon = Maximize2;
export const Megaphone = make(hgMegaphone, "megaphone");
export const LucideMegaphone = Megaphone;
export const MegaphoneIcon = Megaphone;
export const Menu = make(hgMenu, "menu");
export const LucideMenu = Menu;
export const MenuIcon = Menu;
export const MessageCircle = make(hgMessageCircle, "message-circle");
export const LucideMessageCircle = MessageCircle;
export const MessageCircleIcon = MessageCircle;
export const MessageSquare = make(hgMessageSquare, "message-square");
export const LucideMessageSquare = MessageSquare;
export const MessageSquareIcon = MessageSquare;
export const MessageSquareText = make(hgMessageSquareText, "message-square-text");
export const LucideMessageSquareText = MessageSquareText;
export const MessageSquareTextIcon = MessageSquareText;
export const Mic = make(hgMic, "mic");
export const LucideMic = Mic;
export const MicIcon = Mic;
export const Mic2 = make(hgMicVocal, "mic-2");
export const LucideMic2 = Mic2;
export const LucideMicVocal = Mic2;
export const Mic2Icon = Mic2;
export const MicVocal = Mic2;
export const MicVocalIcon = Mic2;
export const Minus = make(hgMinus, "minus");
export const LucideMinus = Minus;
export const MinusIcon = Minus;
export const Monitor = make(hgMonitor, "monitor");
export const LucideMonitor = Monitor;
export const MonitorIcon = Monitor;
export const Moon = make(hgMoon, "moon");
export const LucideMoon = Moon;
export const MoonIcon = Moon;
export const MoreHorizontal = make(hgMoreHorizontal, "more-horizontal");
export const Ellipsis = MoreHorizontal;
export const EllipsisIcon = MoreHorizontal;
export const LucideEllipsis = MoreHorizontal;
export const LucideMoreHorizontal = MoreHorizontal;
export const MoreHorizontalIcon = MoreHorizontal;
export const MousePointerClick = make(hgMousePointerClick, "mouse-pointer-click");
export const LucideMousePointerClick = MousePointerClick;
export const MousePointerClickIcon = MousePointerClick;
export const Music = make(hgMusic, "music");
export const LucideMusic = Music;
export const MusicIcon = Music;
export const Music2 = make(hgTiktok, "music-2");
export const LucideMusic2 = Music2;
export const Music2Icon = Music2;
export const Package = make(hgPackage, "package");
export const LucidePackage = Package;
export const PackageIcon = Package;
export const Palette = make(hgPalette, "palette");
export const LucidePalette = Palette;
export const PaletteIcon = Palette;
export const PanelLeft = make(hgPanelLeft, "panel-left");
export const LucidePanelLeft = PanelLeft;
export const LucideSidebar = PanelLeft;
export const PanelLeftIcon = PanelLeft;
export const Sidebar = PanelLeft;
export const SidebarIcon = PanelLeft;
export const PanelLeftClose = make(hgPanelLeftClose, "panel-left-close");
export const LucidePanelLeftClose = PanelLeftClose;
export const LucideSidebarClose = PanelLeftClose;
export const PanelLeftCloseIcon = PanelLeftClose;
export const SidebarClose = PanelLeftClose;
export const SidebarCloseIcon = PanelLeftClose;
export const PanelLeftOpen = make(hgPanelLeftOpen, "panel-left-open");
export const LucidePanelLeftOpen = PanelLeftOpen;
export const LucideSidebarOpen = PanelLeftOpen;
export const PanelLeftOpenIcon = PanelLeftOpen;
export const SidebarOpen = PanelLeftOpen;
export const SidebarOpenIcon = PanelLeftOpen;
export const PanelRightClose = make(hgPanelRightClose, "panel-right-close");
export const LucidePanelRightClose = PanelRightClose;
export const PanelRightCloseIcon = PanelRightClose;
export const PanelRightOpen = make(hgPanelRightOpen, "panel-right-open");
export const LucidePanelRightOpen = PanelRightOpen;
export const PanelRightOpenIcon = PanelRightOpen;
export const Paperclip = make(hgPaperclip, "paperclip");
export const LucidePaperclip = Paperclip;
export const PaperclipIcon = Paperclip;
export const Pause = make(hgPause, "pause");
export const LucidePause = Pause;
export const PauseIcon = Pause;
export const PauseCircle = make(hgPauseCircle, "pause-circle");
export const CirclePause = PauseCircle;
export const CirclePauseIcon = PauseCircle;
export const LucideCirclePause = PauseCircle;
export const LucidePauseCircle = PauseCircle;
export const PauseCircleIcon = PauseCircle;
export const Pencil = make(hgPencil, "pencil");
export const LucidePencil = Pencil;
export const PencilIcon = Pencil;
export const Phone = make(hgPhone, "phone");
export const LucidePhone = Phone;
export const PhoneIcon = Phone;
export const Play = make(hgPlay, "play");
export const LucidePlay = Play;
export const PlayIcon = Play;
export const PlayCircle = make(hgPlayCircle, "play-circle");
export const CirclePlay = PlayCircle;
export const CirclePlayIcon = PlayCircle;
export const LucideCirclePlay = PlayCircle;
export const LucidePlayCircle = PlayCircle;
export const PlayCircleIcon = PlayCircle;
export const Plug = make(hgPlug, "plug");
export const LucidePlug = Plug;
export const PlugIcon = Plug;
export const Plus = make(hgPlus, "plus");
export const LucidePlus = Plus;
export const PlusIcon = Plus;
export const Quote = make(hgQuote, "quote");
export const LucideQuote = Quote;
export const QuoteIcon = Quote;
export const Radar = make(hgRadar, "radar");
export const LucideRadar = Radar;
export const RadarIcon = Radar;
export const RectangleHorizontal = make(hgRectangleHorizontal, "rectangle-horizontal");
export const LucideRectangleHorizontal = RectangleHorizontal;
export const RectangleHorizontalIcon = RectangleHorizontal;
export const RectangleVertical = make(hgRectangleVertical, "rectangle-vertical");
export const LucideRectangleVertical = RectangleVertical;
export const RectangleVerticalIcon = RectangleVertical;
export const Redo2 = make(hgRedo02, "redo-2");
export const LucideRedo2 = Redo2;
export const Redo2Icon = Redo2;
export const RefreshCw = make(hgRefreshCw, "refresh-cw");
export const LucideRefreshCw = RefreshCw;
export const RefreshCwIcon = RefreshCw;
export const Reply = make(hgReply, "reply");
export const LucideReply = Reply;
export const ReplyIcon = Reply;
export const Rocket = make(hgRocket, "rocket");
export const LucideRocket = Rocket;
export const RocketIcon = Rocket;
export const RotateCcw = make(hgRotateCcw, "rotate-ccw");
export const LucideRotateCcw = RotateCcw;
export const RotateCcwIcon = RotateCcw;
export const Route = make(hgRoute, "route");
export const LucideRoute = Route;
export const RouteIcon = Route;
export const Save = make(hgSave, "save");
export const LucideSave = Save;
export const SaveIcon = Save;
export const Scissors = make(hgScissors, "scissors");
export const LucideScissors = Scissors;
export const ScissorsIcon = Scissors;
export const ScrollText = make(hgScrollText, "scroll-text");
export const LucideScrollText = ScrollText;
export const ScrollTextIcon = ScrollText;
export const Search = make(hgSearch, "search");
export const LucideSearch = Search;
export const SearchIcon = Search;
export const Send = make(hgSend, "send");
export const LucideSend = Send;
export const SendIcon = Send;
export const Settings = make(hgSettings, "settings");
export const LucideSettings = Settings;
export const SettingsIcon = Settings;
export const Share2 = make(hgShare08, "share-2");
export const LucideShare2 = Share2;
export const Share2Icon = Share2;
export const ShieldAlert = make(hgShieldAlert, "shield-alert");
export const LucideShieldAlert = ShieldAlert;
export const ShieldAlertIcon = ShieldAlert;
export const ShieldCheck = make(hgShieldCheck, "shield-check");
export const LucideShieldCheck = ShieldCheck;
export const ShieldCheckIcon = ShieldCheck;
export const ShieldPlus = make(hgShieldPlus, "shield-plus");
export const LucideShieldPlus = ShieldPlus;
export const ShieldPlusIcon = ShieldPlus;
export const ShoppingBag = make(hgShoppingBag, "shopping-bag");
export const LucideShoppingBag = ShoppingBag;
export const ShoppingBagIcon = ShoppingBag;
export const ShoppingCart = make(hgShoppingCart, "shopping-cart");
export const LucideShoppingCart = ShoppingCart;
export const ShoppingCartIcon = ShoppingCart;
export const SlidersHorizontal = make(hgSlidersHorizontal, "sliders-horizontal");
export const LucideSlidersHorizontal = SlidersHorizontal;
export const SlidersHorizontalIcon = SlidersHorizontal;
export const Smartphone = make(hgSmartphone, "smartphone");
export const LucideSmartphone = Smartphone;
export const SmartphoneIcon = Smartphone;
export const Sparkles = make(hgSparkles, "sparkles");
export const LucideSparkles = Sparkles;
export const LucideStars = Sparkles;
export const SparklesIcon = Sparkles;
export const Stars = Sparkles;
export const StarsIcon = Sparkles;
export const Split = make(hgSplit, "split");
export const LucideSplit = Split;
export const SplitIcon = Split;
export const SplitSquareHorizontal = make(hgSquareSplitHorizontal, "split-square-horizontal");
export const LucideSplitSquareHorizontal = SplitSquareHorizontal;
export const LucideSquareSplitHorizontal = SplitSquareHorizontal;
export const SplitSquareHorizontalIcon = SplitSquareHorizontal;
export const SquareSplitHorizontal = SplitSquareHorizontal;
export const SquareSplitHorizontalIcon = SplitSquareHorizontal;
export const Square = make(hgSquare, "square");
export const LucideSquare = Square;
export const SquareIcon = Square;
export const Star = make(hgStar, "star");
export const LucideStar = Star;
export const StarIcon = Star;
export const StepForward = make(hgStepForward, "step-forward");
export const LucideStepForward = StepForward;
export const StepForwardIcon = StepForward;
export const Sun = make(hgSun, "sun");
export const LucideSun = Sun;
export const SunIcon = Sun;
export const Table2 = make(hgTable, "table-2");
export const LucideTable2 = Table2;
export const Table2Icon = Table2;
export const Target = make(hgTarget, "target");
export const LucideTarget = Target;
export const TargetIcon = Target;
export const ThumbsDown = make(hgThumbsDown, "thumbs-down");
export const LucideThumbsDown = ThumbsDown;
export const ThumbsDownIcon = ThumbsDown;
export const ThumbsUp = make(hgThumbsUp, "thumbs-up");
export const LucideThumbsUp = ThumbsUp;
export const ThumbsUpIcon = ThumbsUp;
export const Trash2 = make(hgDelete02, "trash-2");
export const LucideTrash2 = Trash2;
export const Trash2Icon = Trash2;
export const TrendingDown = make(hgTrendingDown, "trending-down");
export const LucideTrendingDown = TrendingDown;
export const TrendingDownIcon = TrendingDown;
export const TrendingUp = make(hgTrendingUp, "trending-up");
export const LucideTrendingUp = TrendingUp;
export const TrendingUpIcon = TrendingUp;
export const Type = make(hgType, "type");
export const LucideType = Type;
export const TypeIcon = Type;
export const Undo2 = make(hgUndo02, "undo-2");
export const LucideUndo2 = Undo2;
export const Undo2Icon = Undo2;
export const Upload = make(hgUpload, "upload");
export const LucideUpload = Upload;
export const UploadIcon = Upload;
export const User = make(hgUser, "user");
export const LucideUser = User;
export const UserIcon = User;
export const UserCircle = make(hgUserCircle, "user-circle");
export const CircleUser = UserCircle;
export const CircleUserIcon = UserCircle;
export const LucideCircleUser = UserCircle;
export const LucideUserCircle = UserCircle;
export const UserCircleIcon = UserCircle;
export const UserCircle2 = make(hgUserCircle, "user-circle-2");
export const CircleUserRound = UserCircle2;
export const CircleUserRoundIcon = UserCircle2;
export const LucideCircleUserRound = UserCircle2;
export const LucideUserCircle2 = UserCircle2;
export const UserCircle2Icon = UserCircle2;
export const UserPlus = make(hgUserPlus, "user-plus");
export const LucideUserPlus = UserPlus;
export const UserPlusIcon = UserPlus;
export const UserRound = make(hgUserRound, "user-round");
export const LucideUser2 = UserRound;
export const LucideUserRound = UserRound;
export const User2 = UserRound;
export const User2Icon = UserRound;
export const UserRoundIcon = UserRound;
export const Users = make(hgUsers, "users");
export const LucideUsers = Users;
export const UsersIcon = Users;
export const Users2 = make(hgUsersRound, "users-2");
export const LucideUsers2 = Users2;
export const LucideUsersRound = Users2;
export const Users2Icon = Users2;
export const UsersRound = Users2;
export const UsersRoundIcon = Users2;
export const UtensilsCrossed = make(hgUtensilsCrossed, "utensils-crossed");
export const ForkKnifeCrossed = UtensilsCrossed;
export const ForkKnifeCrossedIcon = UtensilsCrossed;
export const LucideForkKnifeCrossed = UtensilsCrossed;
export const LucideUtensilsCrossed = UtensilsCrossed;
export const UtensilsCrossedIcon = UtensilsCrossed;
export const Video = make(hgVideo, "video");
export const LucideVideo = Video;
export const VideoIcon = Video;
export const Wallet = make(hgWallet, "wallet");
export const LucideWallet = Wallet;
export const WalletIcon = Wallet;
export const Wand2 = make(hgWandSparkles, "wand-2");
export const LucideWand2 = Wand2;
export const LucideWandSparkles = Wand2;
export const Wand2Icon = Wand2;
export const WandSparkles = Wand2;
export const WandSparklesIcon = Wand2;
export const Wrench = make(hgWrench, "wrench");
export const LucideWrench = Wrench;
export const WrenchIcon = Wrench;
export const X = make(hgX, "x");
export const LucideX = X;
export const XIcon = X;
export const XCircle = make(hgCircleX, "x-circle");
export const CircleX = XCircle;
export const CircleXIcon = XCircle;
export const LucideCircleX = XCircle;
export const LucideXCircle = XCircle;
export const XCircleIcon = XCircle;
export const Zap = make(hgZap, "zap");
export const LucideZap = Zap;
export const ZapIcon = Zap;
export const ZoomIn = make(hgZoomIn, "zoom-in");
export const LucideZoomIn = ZoomIn;
export const ZoomInIcon = ZoomIn;
export const ZoomOut = make(hgZoomOut, "zoom-out");
export const LucideZoomOut = ZoomOut;
export const ZoomOutIcon = ZoomOut;
