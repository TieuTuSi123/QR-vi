// constants.js

export const EXTENSION_NAME = "qr-assistant";

// --- Công tắc dành cho nhà phát triển ---
// Khi đặt là true, bảng cài đặt giao diện hiển thị thẻ "Nhật ký hệ thống" (chọn cấp độ log, xem/tải log)
// Mặc định là false, người dùng bình thường không cần xem thông tin gỡ lỗi
export const DEBUG_MODE = false;

// --- Danh sách trắng (Whitelist) tích hợp sẵn có thể cấu hình bởi nhà phát triển ---
export const BUILTIN_WHITELIST = [
    'input_helper_toolbar',
    'custom_buttons_container' 
];

// --- CSS Classes ---
export const CLASS_ENABLED = 'qr-menu-enabled';
export const CLASS_DISABLED = 'qr-menu-disabled';

// --- ID các phần tử DOM ---
export const ID_ROCKET_BUTTON = 'quick-reply-rocket-button';
export const ID_MENU = 'qr-assistant';
export const ID_BACKDROP = 'quick-reply-backdrop';

// ID liên quan đến bảng cài đặt
export const ID_SETTINGS_CONTAINER = `${EXTENSION_NAME}-settings`;
export const ID_SETTINGS_ENABLED_DROPDOWN = `${EXTENSION_NAME}-enabled`;
export const ID_ICON_TYPE_DROPDOWN = `${EXTENSION_NAME}-icon-type`;

// ID dropdown chọn chủ đề giao diện (UI Theme)
export const ID_UI_THEME_DROPDOWN = `${EXTENSION_NAME}-ui-theme`;

// --- ID giao diện cài đặt biểu tượng (Icon) mới ---
    // Khung chứa bố cục
    export const ID_ICON_SETTINGS_LAYOUT = `${EXTENSION_NAME}-icon-layout`;

    // Dropdown chuyển đổi nguồn biểu tượng (thay thế thanh bên cũ)
    export const ID_ICON_SOURCE_SELECT = `${EXTENSION_NAME}-icon-source-select`;

    // Bảng nội dung
    export const ID_PANEL_BUILTIN = `${EXTENSION_NAME}-panel-builtin`;
    export const ID_PANEL_CUSTOM = `${EXTENSION_NAME}-panel-custom`;
    export const ID_PANEL_CHARACTER = `${EXTENSION_NAME}-panel-character`;

    // Nút điều khiển biểu tượng tích hợp sẵn
    export const ID_BUILTIN_DROPDOWN = `${EXTENSION_NAME}-builtin-select`;
    export const ID_BUILTIN_PREVIEW = `${EXTENSION_NAME}-builtin-preview`;

    // Điều khiển kích thước biểu tượng tích hợp sẵn
    export const ID_BUILTIN_SIZE_SELECT = `${EXTENSION_NAME}-builtin-size-select`;
    export const ID_BUILTIN_SIZE_INPUT = `${EXTENSION_NAME}-builtin-size-input`;

    // Nút điều khiển biểu tượng tùy chỉnh
    export const ID_CUSTOM_DROPDOWN = `${EXTENSION_NAME}-custom-select`;
    export const ID_CUSTOM_PREVIEW = `${EXTENSION_NAME}-custom-preview`;
    export const ID_BTN_MANAGE_CUSTOM = `${EXTENSION_NAME}-btn-manage`;
    export const ID_BTN_ADD_CUSTOM = `${EXTENSION_NAME}-btn-add`;

    // Liên quan đến popup (modal)
    export const ID_MODAL_OVERLAY = `${EXTENSION_NAME}-modal-overlay`;
    export const ID_MODAL_MANAGE = `${EXTENSION_NAME}-modal-manage`;
    export const ID_MODAL_ADD = `${EXTENSION_NAME}-modal-add`;

    // Nút điều khiển trong popup
    export const ID_INPUT_ADD_NAME = `${EXTENSION_NAME}-add-name`;
    export const ID_INPUT_ADD_URL = `${EXTENSION_NAME}-add-url`;
    export const ID_INPUT_ADD_SIZE = `${EXTENSION_NAME}-add-size`; // Mới thêm: ID ô nhập kích thước biểu tượng
    export const ID_PREVIEW_ADD = `${EXTENSION_NAME}-add-preview`;
    export const ID_BTN_SAVE_NEW = `${EXTENSION_NAME}-btn-save-new`;

    // Nút điều khiển popup quản lý
    export const ID_LIST_MANAGE = `${EXTENSION_NAME}-list-manage`;
    export const ID_BTN_CLOSE_MANAGE = `${EXTENSION_NAME}-btn-close-manage`;

// Liên quan đến quản lý Danh sách trắng
// ID_WHITELIST_BUTTON đã bị gỡ bỏ
// ID_WHITELIST_PANEL đã bị gỡ bỏ (hiện được nhúng trực tiếp trong Trang Cài đặt)

// Tự động thu gọn
export const ID_AUTO_SHRINK_CHECKBOX = `${EXTENSION_NAME}-auto-shrink-enabled`;
export const ID_AUTO_SHRINK_STYLE_TAG = 'qrq-auto-shrink-style-tag';
export const ID_BACKDROP_ENABLED_CHECKBOX = `${EXTENSION_NAME}-backdrop-enabled`;
export const ID_COMBINED_BUTTONS_CHECKBOX = `${EXTENSION_NAME}-combined-buttons`;

// --- Tên lớp giao diện (UI Classes) ---
export const CLASS_ACTION_ITEM = 'action-item';
export const CLASS_ACTION_ITEM_ACTIVE = 'active';

// --- Tùy chọn biểu tượng mặc định ---
export const ICON_TYPES = {
    ROCKET: 'rocket',
    COMMENT: 'comment',
    STAR: 'star',
    BOLT: 'bolt',
    FAN: 'fan',
    PENCIL: 'pencil',
    BOOK: 'book',
    MUG: 'mug',
    CROWN: 'crown',
    GEM: 'gem',
    HEADPHONES: 'headphones',
    FONTAWESOME: 'fontawesome',
    CUSTOM: 'custom',
    CHARACTER_CARD: 'character'
};

export const ICON_CLASS_MAP = {
    [ICON_TYPES.ROCKET]: 'fa-rocket',
    [ICON_TYPES.COMMENT]: 'fa-palette',
    [ICON_TYPES.STAR]: 'fa-star-and-crescent',
    [ICON_TYPES.BOLT]: 'fa-star-of-david',
    [ICON_TYPES.FAN]: 'fa-fan',
    [ICON_TYPES.PENCIL]: 'fa-pencil',
    [ICON_TYPES.BOOK]: 'fa-book-open',
    [ICON_TYPES.MUG]: 'fa-mug-hot',
    [ICON_TYPES.CROWN]: 'fa-crown',
    [ICON_TYPES.GEM]: 'fa-gem',
    [ICON_TYPES.HEADPHONES]: 'fa-headphones',
    [ICON_TYPES.CUSTOM]: '',
    [ICON_TYPES.FONTAWESOME]: '',
    [ICON_TYPES.CHARACTER_CARD]: ''
};

// --- ID liên quan đến các Tab ở trang cài đặt ---
export const ID_SETTINGS_TAB_BAR = `${EXTENSION_NAME}-settings-tab-bar`;
export const ID_TAB_MAIN = `${EXTENSION_NAME}-tab-main`;
export const ID_TAB_WHITELIST = `${EXTENSION_NAME}-tab-whitelist`;
export const ID_TAB_ICON = `${EXTENSION_NAME}-tab-icon`;

export const ID_PAGE_MAIN = `${EXTENSION_NAME}-page-main`;
export const ID_PAGE_WHITELIST = `${EXTENSION_NAME}-page-whitelist`;
export const ID_PAGE_ICON = `${EXTENSION_NAME}-page-icon`;

// Mới thêm: ID nút trợ giúp ở trang chính
export const ID_BTN_OPEN_HELP = `${EXTENSION_NAME}-btn-open-help`;

// --- ID liên quan đến Cập nhật ---
export const ID_BTN_CHECK_UPDATE = `${EXTENSION_NAME}-btn-check-update`;
export const ID_NEW_VERSION_BADGE = `${EXTENSION_NAME}-new-version-badge`;
export const ID_VERSION_DISPLAY = `${EXTENSION_NAME}-version-display`;
export const ID_MODAL_UPDATE = `${EXTENSION_NAME}-modal-update`;
export const ID_CHANGELOG_CONTENT = `${EXTENSION_NAME}-changelog-content`;
export const ID_BTN_CONFIRM_UPDATE = `${EXTENSION_NAME}-btn-confirm-update`;

// ID popup trợ giúp
export const ID_MODAL_HELP = `${EXTENSION_NAME}-modal-help`;
export const ID_BTN_TOGGLE_SIDEBAR = `${EXTENSION_NAME}-btn-toggle-sidebar`;

// ID popup thông báo
export const ID_MODAL_ANNOUNCEMENT = `${EXTENSION_NAME}-modal-announcement`;
export const ID_BTN_CLOSE_ANNOUNCEMENT = `${EXTENSION_NAME}-btn-close-announcement`;

// ID popup nhật ký (Log)
export const ID_MODAL_LOG = `${EXTENSION_NAME}-modal-log`;
export const ID_LOG_VIEWER = `${EXTENSION_NAME}-log-viewer`;
export const ID_BTN_COPY_LOG = `${EXTENSION_NAME}-btn-copy-log`;
export const ID_BTN_DOWNLOAD_LOG = `${EXTENSION_NAME}-btn-download-log`;
export const ID_BTN_CLEAR_LOG = `${EXTENSION_NAME}-btn-clear-log`;

// --- ID thanh cài đặt trong lần chạy đầu tiên ---
export const ID_ONBOARDING_HEADER = `${EXTENSION_NAME}-onboarding-header`;
export const ID_ONBOARDING_THEME_SELECT = `${EXTENSION_NAME}-onboarding-theme`;
export const ID_ONBOARDING_BLUR_CHECK = `${EXTENSION_NAME}-onboarding-blur`;
export const ID_ONBOARDING_BTN_DONE = `${EXTENSION_NAME}-onboarding-done`;
export const ID_ONBOARDING_ICON_SOURCE = `${EXTENSION_NAME}-onboarding-icon-source`;
export const ID_ONBOARDING_ICON_MENU = `${EXTENSION_NAME}-onboarding-icon-menu`;

// --- ID khu vực hướng dẫn danh sách trắng ---
export const ID_WHITELIST_HELP_BOX = `${EXTENSION_NAME}-whitelist-help-box`;
export const ID_BTN_DISMISS_WHITELIST_HELP = `${EXTENSION_NAME}-btn-dismiss-whitelist-help`;

// --- Hằng số chủ đề giao diện (UI Themes) ---
export const UI_THEMES = {
    LIGHT: 'light',         // Mặc định (Tương ứng với phong cách Ceramic hoặc Paper)
    SYSTEM: 'system',       // Theo hệ thống SillyTavern (Tavern)
    PAPER: 'theme-paper',
    AURORA: 'theme-aurora',
    SMOKED: 'theme-smoked',
    CERAMIC: 'theme-ceramic',
    LAVENDER: 'theme-lavender',
    FOREST: 'theme-forest',
    DARK: 'theme-dark',
    CUTE: 'theme-cute',         // Phong cách thiếu nữ
    CLASSICAL: 'theme-classical' // Phong cách cổ điển
};

// --- ID popup quản lý sắp xếp ---
export const ID_MODAL_SORT = `${EXTENSION_NAME}-modal-sort`;
export const ID_BTN_OPEN_SORT = `${EXTENSION_NAME}-btn-open-sort`;
export const ID_SORT_MODE_TOGGLE = `${EXTENSION_NAME}-sort-mode-toggle`;
export const ID_SORT_HELP_TOGGLE = `${EXTENSION_NAME}-sort-help-toggle`;
export const ID_SORT_DESC = `${EXTENSION_NAME}-sort-desc`;

// ID popup hướng dẫn của các mục cài đặt
export const ID_MODAL_SETTING_HELP = `${EXTENSION_NAME}-modal-setting-help`;
export const ID_BTN_CLOSE_SETTING_HELP = `${EXTENSION_NAME}-btn-close-setting-help`;
