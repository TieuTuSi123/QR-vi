// index.js - Điểm khởi đầu chính (Main Entry Point)
import * as Constants from './constants.js';
import { sharedState } from './state.js';
import { createMenuElement } from './ui.js';
import { createSettingsHtml, createModalOverlayHtml, loadAndApplySettings, setupEventListeners, refreshUpdateUI, populateWhitelistManagementUI, updateTabGliderState, updateIconDisplay, updateBuiltinPreview, updateCharacterPreview, openSortModal, showAnnouncementModalIfNeeded, syncCombinedCheckbox } from './settings.js';
import { applyWhitelistDOMChanges, observeBarMutations } from './whitelist.js';
import { setupEventListeners as setupMenuEvents, handleQuickReplyClick } from './events.js';
import { Logger, LogCategory } from './logger.js';
import { getCurrentLocale, addLocaleData, translate, applyLocale } from '../../../i18n.js';
import { dictionaries } from './dict.js';

// Định nghĩa cấu trúc cài đặt mặc định
const DEFAULT_SETTINGS = {
    enabled: true,
    firstTimeSetupPending: true, // Đánh dấu xem có cần hiển thị thanh thiết lập lần đầu không
    iconType: Constants.ICON_TYPES.STAR,
    customIconUrl: '',
    faIconCode: '',
    savedCustomIcons: [],
    whitelist: [],
    autoShrinkEnabled: false,
    uiTheme: Constants.UI_THEMES.LIGHT,
    enableBackdrop: false,
    migrated_from_v1: false, // Đánh dấu trạng thái chuyển đổi (migration)
    hideWhitelistHelp: false, // Có ẩn hướng dẫn trên trang danh sách trắng hay không
    logLevel: 1, // Mới thêm: Cấp độ log mặc định (1=INFO)
    builtinIconSize: 'match', // Kích thước biểu tượng tích hợp: 'match' = khớp với nút gửi, hoặc giá trị tùy chỉnh (đơn vị em)
    enableCustomSort: false, // Có bật chế độ sắp xếp tùy chỉnh hay không
    groupOrder: { left: [], right: [] }, // Bản thiết kế sắp xếp (Blueprint)
    enableAvatarRotation: false, // Điều khiển xem ảnh đại diện có xoay khi mở popup hay không
};

// --- Xóa logic khởi tạo cài đặt ở cấp độ cao nhất ---
// Mã cũ thực thi khởi tạo extension_settings ở đây, dẫn đến điều kiện chạy đua (race condition).
// Chúng tôi chuyển nó vào hàm initializePlugin.

function injectRocketButton() {
    const sendButton = document.getElementById('send_but');
    if (!sendButton) return null;

    let rocketButton = document.getElementById(Constants.ID_ROCKET_BUTTON);
    if (rocketButton) return rocketButton;

    rocketButton = document.createElement('div');
    rocketButton.id = Constants.ID_ROCKET_BUTTON;
    rocketButton.title = translate("Menu Phản hồi nhanh", 'qra_rocket_btn_title');
    sendButton.parentNode.insertBefore(rocketButton, sendButton);
    return rocketButton;
}

// Hàm chuyên dụng để khởi tạo/hợp nhất cài đặt
function ensureSettingsInitialized() {
    const context = window.SillyTavern.getContext();
    const OLD_DATA_KEY = "quick-reply-menu"; // Khóa dữ liệu của phiên bản cũ

    // 1. Đảm bảo không gian tên (namespace) phiên bản mới tồn tại trong bộ nhớ
    if (!context.extensionSettings[Constants.EXTENSION_NAME]) {
        context.extensionSettings[Constants.EXTENSION_NAME] = {};
    }

    const currentSettings = context.extensionSettings[Constants.EXTENSION_NAME];
    const oldSettings = context.extensionSettings[OLD_DATA_KEY];

    // 2. Logic chuyển đổi cốt lõi: Chỉ thực thi khi chưa chuyển đổi và phát hiện có dữ liệu cũ
    if (!currentSettings.migrated_from_v1) {
        Logger.info(LogCategory.SYSTEM, 'Đang khởi tạo môi trường mới và phát hiện dữ liệu phiên bản cũ...');

        if (oldSettings) {
            Logger.info(LogCategory.SYSTEM, 'Đã phát hiện dữ liệu bản cũ, bắt đầu nhân bản ẩn qua các khóa...');

            // A. Chuyển đổi trạng thái: enabled và autoShrinkEnabled
            currentSettings.enabled = oldSettings.enabled !== false;
            currentSettings.autoShrinkEnabled = oldSettings.autoShrinkEnabled === true;

            // B. Chuyển đổi Danh sách trắng: Nhân bản trực tiếp mảng (Định dạng ID đã được căn chỉnh trong api.js)
            if (Array.isArray(oldSettings.whitelist)) {
                currentSettings.whitelist = [...oldSettings.whitelist];
            }

            // Nếu là người dùng chuyển từ V1 cũ sang, coi như người dùng cũ, mặc định bỏ qua hướng dẫn thiết lập lần đầu
            // Nếu bạn muốn người dùng cũ sau khi cập nhật cũng xem qua một lần, hãy ghi chú dòng dưới đây
            // currentSettings.firstTimeSetupPending = false;

            // C. Dọn dẹp thư viện biểu tượng: Xóa các trường id và size không còn sử dụng
            if (Array.isArray(oldSettings.savedCustomIcons)) {
                currentSettings.savedCustomIcons = oldSettings.savedCustomIcons
                    .map(icon => ({
                        name: icon.name || "Biểu tượng chưa đặt tên",
                        url: icon.url || ""
                    }))
                    .filter(icon => icon.url); // Lọc bỏ dữ liệu không hợp lệ
            }

            // D. Chuyển đổi biểu tượng đang kích hoạt
            currentSettings.customIconUrl = oldSettings.customIconUrl || '';

            // Nếu bản cũ là loại fontawesome, do bản mới không hỗ trợ, buộc quay về mặc định là sao trăng
            if (oldSettings.iconType === 'fontawesome') {
                currentSettings.iconType = Constants.ICON_TYPES.STAR;
            } else {
                currentSettings.iconType = oldSettings.iconType || Constants.ICON_TYPES.STAR;
            }
        }

        // Bất kể có phát hiện dữ liệu cũ hay không, đều đánh dấu là đã chuyển đổi, tránh lặp lại logic sau này
        currentSettings.migrated_from_v1 = true;

        // 3. Bền bỉ hóa (Persist) cưỡng chế: Ghi ngay lập tức dữ liệu đã nhân bản trong bộ nhớ vào ổ cứng settings.json
        if (typeof context.saveSettingsDebounced === 'function') {
            context.saveSettingsDebounced();
            Logger.info(LogCategory.SYSTEM, 'Dữ liệu chuyển đổi đã được khóa và ghi vào ổ đĩa thành công');
        }
    }

    // 4. Tự động điền các khóa cài đặt mặc định còn thiếu
    Object.keys(DEFAULT_SETTINGS).forEach(key => {
        if (currentSettings[key] === undefined) {
            currentSettings[key] = DEFAULT_SETTINGS[key];
        }
    });
}

function initializePlugin() {
    try {
        Logger.info(LogCategory.SYSTEM, 'Tiện ích đang khởi tạo...');

        // --- Chèn từ điển i18n ---
        const currentLang = getCurrentLocale();
        const dictToLoad = dictionaries[currentLang];
        if (dictToLoad) {
            addLocaleData(currentLang, dictToLoad);
            applyLocale(); // addLocaleData được gọi sau applyLocale, cần quét lại DOM thủ công
        }
        // ----------------------

        // --- Gọi khởi tạo cài đặt ở đây ---
        // Tại thời điểm này APP_READY đã kích hoạt, window.extension_settings chắc chắn đã chứa dữ liệu đọc từ ổ cứng
        ensureSettingsInitialized();

        const rocketButton = injectRocketButton();
        if (!rocketButton) return;

        const menu = createMenuElement();

        sharedState.domElements.rocketButton = rocketButton;
        sharedState.domElements.menu = menu;

        // Tạo và chèn lớp làm mờ (backdrop)
        let backdrop = document.getElementById(Constants.ID_BACKDROP);
        if (!backdrop) {
            backdrop = document.createElement('div');
            backdrop.id = Constants.ID_BACKDROP;
            document.body.appendChild(backdrop);
        }
        sharedState.domElements.backdrop = backdrop;

        // Đóng menu khi nhấp vào vùng mờ
        backdrop.addEventListener('click', () => {
            sharedState.menuVisible = false;
            import('./ui.js').then(({ updateMenuVisibilityUI }) => updateMenuVisibilityUI());
        });

        window.quickReplyMenu = {
            handleQuickReplyClick,
            applyWhitelistDOMChanges,
            observeBarMutations,
            populateWhitelistManagementUI, // Để lộ cho whitelist.js gọi
            openSortModal, // Để lộ cho ui.js gọi
            syncCombinedCheckbox // Để lộ cho gọi toàn cục
        };

        // Chèn menu vào body
        document.body.appendChild(menu);

        // (Logic chèn popup danh sách trắng trước đây đã bị gỡ bỏ, đổi thành nhúng trực tiếp vào bảng cài đặt)

        // Chèn lớp mờ (overlay) của popup quản lý biểu tượng (Đảm bảo lớp này nằm trên tất cả các phần tử khác)
        document.body.insertAdjacentHTML('beforeend', createModalOverlayHtml());

        // Tải cài đặt và áp dụng (Dữ liệu đọc ở hiện tại chắc chắn là dữ liệu đúng)
        loadAndApplySettings();
        setupEventListeners();
        setupMenuEvents();

        applyWhitelistDOMChanges();
        observeBarMutations();

        // Chạy ngầm kiểm tra cập nhật và thông báo khi khởi động (Không làm nghẽn UI)
        setTimeout(() => {
            if (typeof refreshUpdateUI === 'function') {
                refreshUpdateUI(false).catch(e => Logger.warn(LogCategory.UPDATE, 'Kiểm tra cập nhật tự động thất bại', e));
            }
            if (typeof showAnnouncementModalIfNeeded === 'function') {
                showAnnouncementModalIfNeeded();
            }
        }, 500); 

        Logger.info(LogCategory.SYSTEM, 'Tiện ích khởi tạo hoàn tất');
    } catch (err) {
        Logger.error(LogCategory.SYSTEM, 'Tiện ích khởi tạo thất bại', err);
    }
}

let pluginInitialized = false;

function performInitialization() {
    if (pluginInitialized) return;
    initializePlugin();
    pluginInitialized = true;

    // Ảnh chụp DOM ban đầu
    setTimeout(() => {
        Logger.info(LogCategory.CORE, 'Tiện ích khởi tạo hoàn tất - Ảnh chụp DOM ban đầu:', {
            domStructure: Logger.getDomStructure('send_form')
        });
    }, 1000);

    // Thêm trình lắng nghe nhấp chuột cho ngăn cài đặt (Settings Drawer), tự động làm mới danh sách trắng khi mở bảng điều khiển
    const settingsDrawer = document.querySelector(`#${Constants.ID_SETTINGS_CONTAINER} .inline-drawer-toggle`);
    if (settingsDrawer) {
        settingsDrawer.addEventListener('click', () => {
            // Trì hoãn thực thi để đảm bảo bắt đầu hình động hoặc cập nhật trạng thái (Bảng điều khiển mở ra cần thời gian)
            setTimeout(() => {
                if (typeof populateWhitelistManagementUI === 'function') {
                    populateWhitelistManagementUI();
                }
                // Đồng bộ hóa động trạng thái mới nhất của "Nút gộp"
                if (typeof window.quickReplyMenu?.syncCombinedCheckbox === 'function') {
                    window.quickReplyMenu.syncCombinedCheckbox();
                }
                // Sau khi bảng điều khiển hiển thị, tính toán lại vị trí thanh trượt
                if (typeof updateTabGliderState === 'function') {
                    updateTabGliderState();
                }
                // Làm mới xem trước biểu tượng tích hợp, sửa lỗi hiển thị bản xem trước thành sao trăng mặc định sau khi tải lại trang
                const settings = window.SillyTavern.getContext().extensionSettings[Constants.EXTENSION_NAME];
                if (settings && settings.iconType && typeof updateBuiltinPreview === 'function') {
                    updateBuiltinPreview(settings.iconType);
                }
            }, 50);
        });
    }
}

function handleChatLoaded() {
    setTimeout(() => {
        if (window.quickReplyMenu?.applyWhitelistDOMChanges) {
            window.quickReplyMenu.applyWhitelistDOMChanges();
        }
        // Làm mới biểu tượng thẻ nhân vật khi chuyển đổi cuộc trò chuyện
        updateIconDisplay();
        // Làm mới xem trước thẻ nhân vật khi chuyển đổi cuộc trò chuyện
        updateCharacterPreview();
    }, 500);
}

(function () {
    // Chèn bảng cài đặt (Settings Drawer) - Thay đổi mục tiêu chèn thành #qr_container
    const injectSettings = () => {
        const targetContainer = document.getElementById('qr_container');
        if (targetContainer) {
            const settingsHtml = createSettingsHtml();
            targetContainer.insertAdjacentHTML('beforeend', settingsHtml);
        } else {
            // Logic dự phòng (Fallback): Nếu không tìm thấy qr_container, ghi lại cảnh báo và thử sử dụng logic cũ (tùy chọn, hoặc có thể báo lỗi trực tiếp)
            Logger.warn(LogCategory.SYSTEM, 'Không tìm thấy container đích #qr_container');

            // Để đảm bảo tính tương thích, nếu không tìm thấy container đích, vẫn thử chèn vào extensions_settings để ngăn việc cài đặt bị mất hoàn toàn
            let fallbackContainer = document.getElementById('extensions_settings');
            if (!fallbackContainer) {
                fallbackContainer = document.createElement('div');
                fallbackContainer.id = 'extensions_settings';
                fallbackContainer.style.display = 'none';
                document.body.appendChild(fallbackContainer);
            }
            const settingsHtml = createSettingsHtml();
            fallbackContainer.insertAdjacentHTML('beforeend', settingsHtml);
        }
    };
    injectSettings();

    // Chờ SillyTavern sẵn sàng
    const waitForSillyTavernContext = () => {
        if (window.SillyTavern && typeof window.SillyTavern.getContext === 'function') {
            const context = window.SillyTavern.getContext();
            if (context && context.eventSource && context.eventTypes?.APP_READY) {
                // APP_READY có nghĩa là tất cả các cài đặt của ST (bao gồm cả settings.json) đã được tải xong
                context.eventSource.once(context.eventTypes.APP_READY, performInitialization);
                if (context.eventTypes.CHAT_CHANGED) {
                    context.eventSource.on(context.eventTypes.CHAT_CHANGED, handleChatLoaded);
                }
            } else {
                setTimeout(waitForSillyTavernContext, 150);
            }
        } else {
            setTimeout(waitForSillyTavernContext, 150);
        }
    };
    waitForSillyTavernContext();
})();
